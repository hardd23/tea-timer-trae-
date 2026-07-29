import TeaTimer from './components/TeaTimer';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg-primary)] px-6 text-[var(--color-text-primary)]">
      <header className="mb-8 flex items-center justify-center gap-4 sm:gap-6">
        <span
          className="text-xl font-light lowercase tracking-[0.28em] sm:text-2xl"
          style={{ color: 'rgba(255, 255, 255, 0.7)' }}
        >
          tea
        </span>
        <h1
          className="text-5xl leading-none sm:text-6xl"
          style={{
            color: 'var(--color-accent-secondary)',
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}
        >
          茶
        </h1>
        <span
          className="text-xl font-light lowercase tracking-[0.28em] sm:text-2xl"
          style={{ color: 'rgba(255, 255, 255, 0.7)' }}
        >
          timer
        </span>
      </header>
      <div className="flex w-[320px] flex-col items-center rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-10 shadow-lg backdrop-blur-[16px] md:w-[360px]">
        <TeaTimer />
      </div>
    </div>
  );
}
