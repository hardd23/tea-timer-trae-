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
      <div className="w-[320px] md:w-[360px] p-8 rounded-lg backdrop-blur-xl bg-[rgba(var(--color-glass-base),0.2)] shadow-lg flex flex-col items-center border border-[rgba(var(--color-glass-base),0.1)]">
        <TeaTimer />
      </div>
    </div>
  );
}
