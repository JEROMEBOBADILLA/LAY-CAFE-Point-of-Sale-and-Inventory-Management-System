import Icon from "./Icon";
import { peso } from "../utils/peso";

export default function OrderPanel({
  lines,
  itemCount,
  total,
  customer,
  onCustomerChange,
  notice,
  onSetQty,
  onClear,
  onSave,
}) {
  return (
    <aside className="panel order" aria-label="Current order">
      <h2>
        <Icon name="Clover" size={22} /> Current order
      </h2>

      <label className="field">
        Customer
        <input
          type="text"
          placeholder="Walk-in"
          value={customer}
          onChange={(e) => onCustomerChange(e.target.value)}
        />
      </label>

      {lines.length === 0 ? (
        <p className="empty">Wala pang laman. Pindutin ang item sa menu para magsimula.</p>
      ) : (
        <ul className="lines">
          {lines.map((l) => (
            <li key={l.id} className="line">
              <div className="line-top">
                <span className="line-name">{l.name}</span>
                <span className="line-sub">{peso(l.subtotal)}</span>
              </div>
              <div className="line-bottom">
                <div className="stepper">
                  <button aria-label={`Bawasan ${l.name}`} onClick={() => onSetQty(l, l.qty - 1)}>
                    −
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={l.qty}
                    onChange={(e) => onSetQty(l, e.target.value)}
                    aria-label={`Quantity of ${l.name}`}
                  />
                  <button aria-label={`Dagdagan ${l.name}`} onClick={() => onSetQty(l, l.qty + 1)}>
                    +
                  </button>
                </div>
                <span className="line-unit">{peso(l.price)} each</span>
                <button className="link" onClick={() => onSetQty(l, 0)}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="totals">
        <span>
          {itemCount} item{itemCount === 1 ? "" : "s"}
        </span>
        <strong>{peso(total)}</strong>
      </div>

      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}

      <div className="actions">
        <button className="btn ghost" onClick={onClear} disabled={lines.length === 0}>
          Clear order
        </button>
        <button className="btn primary" onClick={onSave} disabled={lines.length === 0}>
          Save order
        </button>
      </div>
    </aside>
  );
}