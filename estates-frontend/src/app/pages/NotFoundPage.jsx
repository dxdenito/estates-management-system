import { Link } from "react-router-dom";
import { cardClass, primaryButtonClass } from "../components/ui/styles";

export default function NotFoundPage() {
  return (
    <div className={`${cardClass} mx-auto max-w-md text-center`}>
      <p className="text-5xl font-semibold text-primary">404</p>
      <h1 className="mt-3 text-xl font-semibold text-ink">Page not found</h1>
      <p className="mt-2 text-sm text-ink-muted">
        The page you are looking for does not exist or has moved.
      </p>
      <Link to="/" className={`${primaryButtonClass} mt-6`}>
        Back to home
      </Link>
    </div>
  );
}