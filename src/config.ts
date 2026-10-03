// Checked against docs.php, help=1 and live filtered responses on 2026-10-02.
// The docs' "Chatbot & Assistant" differs from the live "AI Chatbot & Assistant".
export const CATEGORIES = [
  { value: 'Code & Dev Tools', label: 'Код і розробка' },
  { value: 'AI Automation & Workflows', label: 'Автоматизація' },
  { value: 'Image Generation', label: 'Зображення' },
  { value: 'Video Generation', label: 'Відео' },
  { value: 'Design & UI', label: 'Дизайн та інтерфейси' },
  { value: 'AI Chatbot & Assistant', label: 'Чатботи й асистенти' },
] as const;

export function categoryLabel(value: string): string {
  return CATEGORIES.find((category) => category.value === value)?.label ?? value;
}

export const PAGE_SIZE = 20;
export const MAX_RESULTS = 10_000;
export const MAX_PAGES = MAX_RESULTS / PAGE_SIZE;
export const DR_EXPLANATION = 'DR (Domain Rating) — показник авторитетності домену від 0 до 100 за даними FreeSerp. Це не оцінка якості продукту чи рейтинг користувачів.';
