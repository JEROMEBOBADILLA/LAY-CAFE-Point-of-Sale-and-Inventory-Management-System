
import { useEffect, useMemo, useState } from "react";
import "../style.css";

import Header from "../Components/Header";
import FormContainer from "../Components/FormContainer";
import InventoryTable from "../Components/InventoryTable";

const API = `${
  import.meta.env.VITE_API_URL || "http://localhost:3000"
}/inventory`;

const EMPTY_FORM = {
  name: "",
  category: "Ingredient",
  quantity: "",
  unit: "",
  reorderLevel: "",
};

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

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadItems = async () => {
    try {
      const data = await request(API);
      setItems(data);
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

  useEffect(() => {
    loadItems();
  }, []);

  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        filter === "All" || item.category === filter;

      const matchesSearch = item.name
        .toLowerCase()
        .includes(query.trim().toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [items, query, filter]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const isEditing = editingId !== null;

      await request(isEditing ? `${API}/${editingId}` : API, {
        method: isEditing ? "PUT" : "POST",
        body: JSON.stringify(form),
      });

      setNotice(isEditing ? "Item updated." : "Item added.");

      resetForm();
      await loadItems();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);

    setForm({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      reorderLevel: item.reorderLevel,
    });

    setError("");
    setNotice("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Delete ${item.name}? This cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await request(`${API}/${item.id}`, {
        method: "DELETE",
      });

      if (editingId === item.id) {
        resetForm();
      }

      setNotice("Item deleted.");
      await loadItems();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="lay">
      <Header items={items} />

      <main className="lay-main">
        <FormContainer
          form={form}
          editingId={editingId}
          saving={saving}
          error={error}
          notice={notice}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />

        <InventoryTable
          items={visibleItems}
          loading={loading}
          query={query}
          filter={filter}
          onQueryChange={setQuery}
          onFilterChange={setFilter}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>
    </div>
  );
}
