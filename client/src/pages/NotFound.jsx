import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <p className="text-7xl">🥀</p>
        <h1 className="mt-4 text-3xl font-extrabold">Page not found</h1>
        <p className="mt-2 text-slate-500">This page has gone the way of unrescued leftovers.</p>
        <Link to="/" className="btn-primary mt-6">Back to home</Link>
      </div>
    </div>
  );
}
