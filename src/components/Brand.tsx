import { Radar } from 'lucide-react';

export function Brand({ compact = false }: { compact?: boolean }) {
  return <span className={`brand${compact ? ' brand--compact' : ''}`}><span className="brand-mark"><Radar size={23} aria-hidden="true" /></span><span>AI <span className="brand-light">Radar</span></span></span>;
}
