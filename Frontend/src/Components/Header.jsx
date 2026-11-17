
import logo from "../assets/laycafe.jpg";

export default function Header({ items }) {
  const ingredients = items.filter(
    (item) => item.category === "Ingredient"
  ).length;

  const supplies = items.filter(
    (item) => item.category === "Supply"
  ).length;

  const lowStock = items.filter(
    (item) => Number(item.quantity) <= Number(item.reorderLevel)
  ).length;

  const stats = [
    { label: "All items", value: items.length },
    { label: "Ingredients", value: ingredients },
    { label: "Supplies", value: supplies },
    { label: "Low stock", value: lowStock, alert: lowStock > 0 },
  ];

  return (
    <>
      <header className="lay-header">
        <div className="lay-brandmark">
          <img className="lay-logo" src={logo} alt="Lay Café" />

          <div>
            <p className="lay-brand">LAY CAFÉ</p>
            <h1 className="lay-title">Inventory</h1>
          </div>
        </div>
      </header>

      <section className="lay-stats">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`lay-stat ${stat.alert ? "alert" : ""}`}
          >
            <span className="lay-stat-num">{stat.value}</span>
            <span className="lay-stat-label">{stat.label}</span>
          </div>
        ))}
      </section>
    </>
  );
}
