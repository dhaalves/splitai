import { useNavigate } from 'react-router-dom';

interface FABProps {
  to?: string;
  onClick?: () => void;
  label?: string;
}

export function FAB({ to, onClick, label = '+' }: FABProps) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => (to ? navigate(to) : onClick?.())}
      className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 w-14 h-14 rounded-full bg-button-gradient hover:brightness-110 border-none text-white text-2xl shadow-lg flex items-center justify-center"
      aria-label="Add expense"
    >
      {label}
    </button>
  );
}
