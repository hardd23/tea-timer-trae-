import TeaTimer from './components/TeaTimer';

const footerLinks = [
  { label: 'Telegram', href: 'https://t.me/hardd_lab' },
  { label: 'GitHub', href: 'https://github.com/hardd23' },
];

export default function Home() {
  return (
    <main className="min-h-dvh overflow-x-hidden bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <div className="page-frame mx-auto flex min-h-dvh w-full max-w-[420px] flex-col px-4 sm:px-6">
        <header className="brand-header flex items-center justify-center gap-4" aria-label="Tea Timer">
          <span className="brand-word">tea</span>
          <h1 className="brand-kanji">茶</h1>
          <span className="brand-word">timer</span>
        </header>

        <TeaTimer />

        <footer id="footer" className="app-footer">
          <a
            href="https://hardd-lab.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-brand"
            aria-label="HARDD LAB website"
          >
            HARDD LAB
          </a>
          <div className="flex items-center justify-center gap-3">
            {footerLinks.map((link, index) => (
              <span key={link.label} className="contents">
                {index > 0 && <span aria-hidden="true">·</span>}
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${link.label} link`}
                >
                  {link.label}
                </a>
              </span>
            ))}
          </div>
          <a
            href="https://web.tribute.tg/d/OyG"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-support"
            aria-label="Support via Tribute"
          >
            Support via Tribute
          </a>
        </footer>
      </div>
    </main>
  );
}
