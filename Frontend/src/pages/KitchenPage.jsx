import { useEffect, useMemo, useState } from "react";

import { Doodle, DoodleSprite } from "../Components/Doodle";
import FilterBar from "../Components/FilterBar";
import OrderCard from "../Components/OrderCard";

const API = `${
  import.meta.env.VITE_API_URL || "http://localhost:3000"
}/orders`;

const REFRESH_MS = 30000;

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data =
    response.status === 204
      ? null
      : await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || "Something went wrong. Please try again."
    );
  }

  return data;
}

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now()); // para sa "x min ago"

  // kuha ng orders sa backend, tapos refresh kada 30 seconds
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await request(API);
        setOrders(data.filter((o) => o.status !== "done"));
        setNow(Date.now());
        setError("");
      } catch (err) {
        setError(
          err.message === "Failed to fetch"
            ? "Cannot reach the server. Check that the backend is running."
            : err.message
        );
      } finally {
        setLoading(false);
      }
    };

    const first = setTimeout(loadOrders, 0);
    const timer = setInterval(loadOrders, REFRESH_MS);

    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);

  const visible = useMemo(
    () =>
      orders
        .filter((o) => filter === "all" || o.status === filter)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)), // pinakamatagal una
    [orders, filter]
  );

  async function advanceOrder(order) {
    const nextStatus = order.status === "new" ? "preparing" : "done";

    setBusyId(order.id);
    setError("");

    try {
      await request(`${API}/${order.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: nextStatus }),
      });

      setOrders((current) =>
        nextStatus === "done"
          ? current.filter((o) => o.id !== order.id) // done = alisin sa list
          : current.map((o) =>
              o.id === order.id ? { ...o, status: nextStatus } : o
            )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="kitchen-page">
      <DoodleSprite />
      <div className="page">
        <header className="brand">
          <Doodle name="clover" large />
          <h1>LAY CAFÉ</h1>
          <p className="tagline">kitchen display · since 2021</p>
          <span className="count">{orders.length} active orders</span>
        </header>

        <FilterBar filter={filter} onChange={setFilter} />

        {error && (
          <p className="kitchen-error" role="alert">
            {error}
          </p>
        )}

        <main className="orders" aria-live="polite">
          {visible.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              now={now}
              busy={busyId === order.id}
              onAdvance={advanceOrder}
            />
          ))}
        </main>

        {loading && <p className="empty">Loading orders...</p>}

        {!loading && visible.length === 0 && (
          <p className="empty">No incoming orders. New orders show up here.</p>
        )}

        <footer className="foot">
          <Doodle name="bean" />
          <p>please enjoy your happiness</p>
        </footer>
      </div>
    </div>
  );
}
