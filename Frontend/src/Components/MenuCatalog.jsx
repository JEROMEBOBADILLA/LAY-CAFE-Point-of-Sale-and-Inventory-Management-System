import Icon from "./Icon";
import { peso } from "../utils/peso";
import { CATEGORY_ICON } from "../data/menu";

export default function MenuCatalog({
  products,
  categories,
  category,
  onCategoryChange,
  query,
  onQueryChange,
  order,
  onAdd,
}) {
  return (
    <section className="panel catalog" aria-label="Menu">
      <div className="toolbar">
        <input
          type="search"
          className="search"
          placeholder="Hanapin sa menu"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label="Search menu"
        />
        <div className="tabs" role="tablist">
          {categories.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={category === c}
              className={category === c ? "tab active" : "tab"}
              onClick={() => onCategoryChange(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <p className="empty">Walang nakitang item. Subukan ang ibang salita o category.</p>
      ) : (
        <ul className="grid">
          {products.map((p) => {
            const inOrder = order[p.id] || 0;
            return (
              <li key={p.id}>
                <button
                  className={inOrder ? "tile picked" : "tile"}
                  onClick={() => onAdd(p)}
                >
                  <Icon name={CATEGORY_ICON[p.category]} />
                  <span className="tile-name">{p.name}</span>
                  <span className="tile-price">{peso(p.price)}</span>
                  {inOrder > 0 && <span className="badge">{inOrder}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}