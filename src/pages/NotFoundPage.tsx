import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="text-8xl mb-4">🧭</div>
      <h1 className="text-4xl font-bold font-display mb-2">404</h1>
      <p className="text-text-secondary mb-6">This page doesn't exist.</p>
      <Link to="/" className="text-accent hover:underline font-semibold">Go home →</Link>
    </div>
  );
}