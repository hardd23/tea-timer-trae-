import TeaTimer from './components/TeaTimer';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <h1 className="text-[var(--color-accent-primary)] text-6xl leading-none" style={{ fontFamily: "'Ma Shan Zheng', cursive" }}>
        茶
      </h1>
      <p className="font-inter font-semibold text-2xl tracking-wide mt-4 mb-8 text-[var(--color-accent-primary)]">
        Tea timer
      </p>
      <div className="w-[320px] md:w-[360px] p-8 rounded-lg backdrop-blur-xl bg-[rgba(var(--color-glass-base),0.2)] shadow-lg flex flex-col items-center border border-[rgba(var(--color-glass-base),0.1)]">
        <TeaTimer />
      </div>
    </div>
  );
}
