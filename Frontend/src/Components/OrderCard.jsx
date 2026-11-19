import { Doodle } from "./Doodle";

const DOODLES = ["bread", "noodle", "berry", "bean", "clover"];

function timeAgo(timestamp, now) {
  const minutes = Math.floor((now - new Date(timestamp).getTime()) / 60000);
  if (minutes < 1) return "Just now";
  return `${minutes} min ago`;
}

export default function OrderCard({ order, now, busy, onAdvance }) {
  const isNew = order.status === "new";
  const place = order.table ? `${order.type} · ${order.table}` : order.type;

  return (
    <article className="order-card">
      <div className="order-head">
        <span className="order-number">
          <Doodle name={DOODLES[order.id % DOODLES.length]} />
          Order #{order.id}
        </span>
        <span className={`badge ${isNew ? "badge-new" : "badge-preparing"}`}>
          {isNew ? "New" : "Preparing"}
        </span>
      </div>

      <p className="order-meta">
        {place} · {timeAgo(order.createdAt, now)}
      </p>

      <ul className="order-items">
        {order.items.map((item) => (
          <li key={item.name}>
            <span>{item.name}</span>
            <span className="item-qty">x{item.qty}</span>
          </li>
        ))}
      </ul>

      <button
        className="order-action"
        disabled={busy}
        onClick={() => onAdvance(order)}
      >
        {isNew ? "Start preparing" : "Mark as done"}
      </button>
    </article>
  );
}
