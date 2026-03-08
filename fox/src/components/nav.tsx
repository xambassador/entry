import { Link } from "@tanstack/react-router";

export function Nav() {
  return (
    <header className="max-w-6xl mx-auto">
      <nav className="h-(--nav-height) flex items-center border-b border-border justify-between">
        <Link to="/">
          <h1 className="text-2xl font-bold">Entry</h1>
        </Link>
        <ul className="flex items-center gap-1 bg-journal-surface/60 backdrop-blur-sm rounded-full p-1 border border-border">
          <li>
            <Link
              to="/entries"
              className="relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-(family-name:--font-body) tracking-wide transition-colors duration-300 cursor-pointer data-[status=active]:text-ink text-ink-muted hover:text-ink-secondary"
            >
              Entries
            </Link>
          </li>
          <li>
            <Link
              to="/write"
              className="relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-(family-name:--font-body) tracking-wide transition-colors duration-300 cursor-pointer data-[status=active]:text-ink text-ink-muted hover:text-ink-secondary"
            >
              Write
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
