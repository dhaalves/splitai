import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-2">404</h1>
      <p className="text-text-secondary mb-4">This page doesn't exist.</p>
      <Link to="/" className="text-accent hover:underline">Go home</Link>
    </div>
  );
}
