import Icon from './Icon';
import { Empty } from './UI';
const number = v => Number(v).toLocaleString('en-PH', { maximumFractionDigits: 3 });
// Preserved original component: inventory search, filters, and table actions.
export default function InventoryTable({ items, allCount, loading, query, filter, onQueryChange, onFilterChange, onEdit, onDelete, onMove }) {
  return <>
    <div className="table-filters">
      <div className="search-field">
        <Icon name="search" />
        <input
          type="search"
          placeholder="Search ingredients or supplies…"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
        />
      </div>
      <div className="filter-select">
        <Icon name="filter" size={16} />
        <select
          value={filter}
          onChange={e => onFilterChange(e.target.value)}
          aria-label="Filter inventory"
        >
          <option>All</option>
          <option>Ingredient</option>
          <option>Supply</option>
          <option>Low stock</option>
        </select>
      </div>
    </div>
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Category</th>
            <th>Available</th>
            <th>Reorder at</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => <tr key={item.id}>
            <td>
              <div className="table-name">
                <span className="table-avatar">
                  {item.category === 'Ingredient' ? '☕' : '📦'}
                </span>
                <strong>
                  {item.name}
                </strong>
              </div>
            </td>
            <td className="subtle-label">
              {item.category}
            </td>
            <td>
              <b>
                {number(item.quantity)}
              </b>
              <span className="subtle-label">
                {item.unit}
              </span>
            </td>
            <td>
              {number(item.reorderLevel)}
              <span className="subtle-label">
                {item.unit}
              </span>
            </td>
            <td>
              <span className={`status-badge ${Number(item.quantity) <= Number(item.reorderLevel) ? 'danger' : 'ok'}`}>
                <span />
                {Number(item.quantity) <= Number(item.reorderLevel) ? 'Low stock' : 'Healthy'}
              </span>
            </td>
            <td>
              <div className="table-actions">
                <button type="button" title="Record stock movement" onClick={() => onMove(item)}><Icon name="plus" size={16} /> Stock</button>
                <button type="button" title="Edit inventory item" onClick={() => onEdit(item)}>
                  <Icon name="edit" size={17} />
                </button>
                <button type="button" title="Delete inventory item" onClick={() => onDelete(item)}>
                  <Icon name="trash" size={16} />
                </button>
              </div>
            </td>
          </tr>)}
        </tbody>
      </table>
      {loading && <div className="loading-skeleton">Loading inventory…</div>}
      {!loading && items.length === 0 && <Empty
        title="No matching inventory"
        description="Try clearing your filters or add a new item."
        icon="box"
      />}
    </div>
    <div className="table-footer">Showing {items.length} of {allCount} items <span>Stock updates after each successful sale.</span></div>
  </>;
}
