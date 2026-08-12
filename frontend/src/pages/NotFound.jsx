import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
    <span className="font-mono text-6xl font-bold text-accent">404</span>
    <h1 className="mt-3 font-display text-2xl font-bold text-ink">Page not found</h1>
    <p className="mt-2 text-sm text-ink/50">The page you're looking for doesn't exist or has moved.</p>
    <Link to="/" className="mt-6 rounded-lg bg-ink px-6 py-3 font-semibold text-white hover:bg-teal">
      Back to home
    </Link>
  </div>
);

export default NotFound;
