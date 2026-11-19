const FILTERS = [
  { key: "all", label: "all" },
  { key: "new", label: "new" },
  { key: "preparing", label: "preparing" },
];

export default function FilterBar({ filter, onChange }) {
  return (
    <nav className="filters" aria-label="Filter orders">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          className={`filter${filter === f.key ? " is-active" : ""}`}
          onClick={() => onChange(f.key)}
        >
          {f.label}
        </button>
      ))}
    </nav>
  );
}
