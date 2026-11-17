
export default function InventoryTable({
  items,
  loading,
  query,
  filter,
  onQueryChange,
  onFilterChange,
  onEdit,
  onDelete,
}) {
  const isLow = (item) =>
    Number(item.quantity) <= Number(item.reorderLevel);

  return (
    <section className="lay-card lay-list">
      <div className="lay-tools">
        <input
          type="search"
          placeholder="Search items"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />

        <div className="lay-tabs">
          {["All", "Ingredient", "Supply"].map((category) => (
            <button
              key={category}
              type="button"
              className={filter === category ? "on" : ""}
              onClick={() => onFilterChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="lay-scroll">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th className="num">Quantity</th>
              <th className="num">Reorder at</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="lay-empty">
                  Loading items...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="6" className="lay-empty">
                  No items found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className={isLow(item) ? "low" : ""}
                >
                  <td className="strong">{item.name}</td>
                  <td>{item.category}</td>

                  <td className="num">
                    {Number(item.quantity)} {item.unit}

                    <span className="lay-meter">
                      <span
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(
                              100,
                              (Number(item.quantity) /
                                Math.max(
                                  Number(item.reorderLevel) * 2,
                                  1
                                )) *
                                100
                            )
                          )}%`,
                        }}
                      />
                    </span>
                  </td>

                  <td className="num">
                    {Number(item.reorderLevel)} {item.unit}
                  </td>

                  <td>
                    {isLow(item) ? (
                      <span className="lay-pill">Low stock</span>
                    ) : (
                      "In stock"
                    )}
                  </td>

                  <td className="lay-row-actions">
                    <button
                      type="button"
                      className="lay-link"
                      onClick={() => onEdit(item)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="lay-link danger"
                      onClick={() => onDelete(item)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
