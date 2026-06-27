import { useToasts } from '../stores/toasts';

const variantStyles = {
  success: 'bg-emerald-600',
  error: 'bg-rose-600',
  info: 'bg-text-secondary/20',
};

export function Toaster() {
  const { toasts, dismiss } = useToasts();
  return (
    <div className="fixed bottom-20 sm:bottom-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 w-full max-w-sm px-4">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={`${variantStyles[t.variant]} text-white text-sm rounded-xl px-4 py-2 shadow-lg text-left`}
        >
          {t.message}
        </button>
      ))}
    </div>
  );
}
