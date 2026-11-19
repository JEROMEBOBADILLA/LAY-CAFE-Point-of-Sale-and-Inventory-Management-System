import { useMemo, useState } from "react";
import "../cashierstyle.css";

import CashierHeader from "../Components/CashierHeader";
import MenuCatalog from "../Components/MenuCatalog";
import OrderPanel from "../Components/OrderPanel";
import { PRODUCTS } from "../data/menu";
import { peso } from "../utils/peso";

export default function CashierPage() {
  const [order, setOrder] = useState({}); // { [productId]: quantity }
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [customer, setCustomer] = useState("");
  const [notice, setNotice] = useState("");

  const categories = useMemo(
    () => ["All", ...new Set(PRODUCTS.map((p) => p.category))],
    []
  );

  const visible = PRODUCTS.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      p.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  const lines = PRODUCTS.filter((p) => order[p.id] > 0).map((p) => ({
    ...p,
    qty: order[p.id],
    subtotal: p.price * order[p.id],
  }));

  const total = lines.reduce((sum, l) => sum + l.subtotal, 0);
  const itemCount = lines.reduce((sum, l) => sum + l.qty, 0);

  function setQty(product, value) {
    const qty = Math.max(0, Math.floor(Number(value)) || 0);
    setNotice("");
    setOrder((prev) => {
      const next = { ...prev };
      if (qty === 0) delete next[product.id];
      else next[product.id] = qty;
      return next;
    });
  }

  function addProduct(product) {
    setQty(product, (order[product.id] || 0) + 1);
  }

  function clearOrder() {
    setOrder({});
    setCustomer("");
  }

  function placeOrder() {
    // TODO (backend): i-POST ito sa /api/orders
    const payload = {
      customer: customer.trim() || "Walk-in",
      items: lines.map((l) => ({
        productId: l.id,
        quantity: l.qty,
        unitPrice: l.price,
      })),
      total,
    };
    console.log("Order saved:", payload);

    setNotice(`Order saved for ${payload.customer}: ${peso(total)}`);
    clearOrder();
  }

  return (
    <div className="pos">
      <CashierHeader />
      <main className="pos-main">
        <MenuCatalog
          products={visible}
          categories={categories}
          category={category}
          onCategoryChange={setCategory}
          query={query}
          onQueryChange={setQuery}
          order={order}
          onAdd={addProduct}
        />
        <OrderPanel
          lines={lines}
          itemCount={itemCount}
          total={total}
          customer={customer}
          onCustomerChange={setCustomer}
          notice={notice}
          onSetQty={setQty}
          onClear={clearOrder}
          onSave={placeOrder}
        />
      </main>
    </div>
  );
}