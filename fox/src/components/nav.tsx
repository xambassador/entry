import { Link } from "@tanstack/react-router";

export function Nav() {
  return (
    <header className="header">
      <nav className="nav">
        <Link to="/" className="logo">
          <h1 className="text-2xl font-bold">Entry</h1>
        </Link>
        <ul className="flex items-center gap-1 bg-journal-surface/60 backdrop-blur-sm rounded-full p-1 border border-border">
          <li>
            <Link
              to="/entries"
              className="relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-(family-name:--font-body) tracking-wide cursor-pointer data-[status=active]:text-ink text-ink-muted hover:text-ink-secondary active:scale-[0.96] transition-all duration-200 ease-active"
            >
              Entries
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
