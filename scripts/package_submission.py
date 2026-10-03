"""Create a submission archive from an explicit allowlist; never include local/private files."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parent.parent
destination = root / "ai-radar-submission.zip"
files = [
    "package.json", "package-lock.json", "index.html", "vite.config.ts",
    "tsconfig.json", "eslint.config.js", "netlify.toml", ".nvmrc", ".gitignore",
    "README.md", "Semalt_AI_Radar_Codex_TZ.md",
]
folders = ["src", "public", "docs", "scripts"]
if (root / "dist/index.html").is_file():
    folders.append("dist")

members = [root / name for name in files]
for folder in folders:
    members.extend(path for path in (root / folder).rglob("*") if path.is_file())
members = sorted(set(members))
for path in members:
    if not path.is_file() or path.is_symlink():
        raise RuntimeError(f"Missing or unsafe submission file: {path.name}")
    relative = path.relative_to(root)
    if any(part in {"node_modules", ".git", "__pycache__", ".idea"} for part in relative.parts) or path.name.startswith(".env") or path.suffix == ".zip":
        raise RuntimeError(f"Excluded file encountered: {relative}")

with ZipFile(destination, "w", ZIP_DEFLATED) as archive:
    for path in members:
        archive.write(path, Path("ai-radar") / path.relative_to(root))

with ZipFile(destination) as archive:
    bad = archive.testzip()
    if bad:
        raise RuntimeError(f"Archive integrity error: {bad}")
    print(f"Created {destination.name}: {len(archive.namelist())} files, {destination.stat().st_size:,} bytes")
    print("Includes source, configuration, lockfile, docs, public resources and the available dist build.")
