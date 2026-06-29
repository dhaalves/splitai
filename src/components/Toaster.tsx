import { useToasts } from '../stores/toasts';

const variantStyles = {
  success: 'bg-bg-dark border-accent text-text-primary',
  error: 'bg-bg-dark border-accent-danger text-text-primary',
  info: 'bg-bg-dark border-accent-secondary text-text-primary',
};

const variantIcon = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

export function Toaster() {
  const { toasts, dismiss } = useToasts();
  return (
    <div className="fixed bottom-20 sm:bottom-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 w-full max-w-sm px-4">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={`${variantStyles[t.variant]} border-l-4 text-sm rounded-xl px-4 py-3 shadow-lg text-left flex items-center gap-2.5 animate-slide-in-right backdrop-blur-md`}
        >
          <span className="text-base">{variantIcon[t.variant]}</span>
          {t.message}
        </button>
      ))}
    </div>
  );
}
