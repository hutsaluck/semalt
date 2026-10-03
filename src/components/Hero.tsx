import { Code2, Layers, Sparkles, Workflow, Radar } from 'lucide-react';

export function Hero() {
  return <section className="hero">
    <div className="hero-copy">
      <div className="eyebrow"><span className="small-dot" /> КАТАЛОГ AI-ІНСТРУМЕНТІВ</div>
      <h1>Знайди AI-інструмент<br className="desktop-break" /> <span>під свою задачу</span></h1>
      <p>Менше пошуку — більше можливостей. Відкривай сервіси<br className="desktop-break" /> для роботи й творчості та збирай власну добірку.</p>
      <div className="hero-note"><Sparkles size={15} aria-hidden="true" /> Реальні дані FreeSerp · Обране без реєстрації</div>
    </div>
    <div className="radar-art" aria-hidden="true">
      <div className="radar-orbit orbit-outer" /><div className="radar-orbit orbit-middle" /><div className="radar-orbit orbit-inner" />
      <div className="radar-axis axis-h" /><div className="radar-axis axis-v" />
      <div className="radar-center"><Radar size={35} /></div>
      <div className="radar-label label-code"><span><Code2 size={17} /></span>Код і розробка</div>
      <div className="radar-label label-design"><span><Layers size={17} /></span>Дизайн</div>
      <div className="radar-label label-workflow"><span><Workflow size={17} /></span>Автоматизація</div>
      <i className="radar-dot dot-one" /><i className="radar-dot dot-two" /><i className="radar-dot dot-three" />
    </div>
  </section>;
}
