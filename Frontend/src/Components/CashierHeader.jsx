export default function CashierHeader() {
  return (
    <header className="pos-header">
      <img className="logo" src="/lay-cafe-logo.png" alt="Lay Café" />
      <div>
        <h1>Point of Sale</h1>
        <p className="tagline">please enjoy your happiness</p>
      </div>
      <span className="since">
        since
        <br />
        2021
      </span>
    </header>
  );
}