
export default function FormContainer({
  form,
  editingId,
  saving,
  error,
  notice,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <form className="lay-card lay-form" onSubmit={onSubmit}>
      <h2>{editingId !== null ? "Edit item" : "Add item"}</h2>

      <label>
        Item name
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="Espresso beans"
          required
        />
      </label>

      <label>
        Category
        <select
          name="category"
          value={form.category}
          onChange={onChange}
        >
          <option value="Ingredient">Ingredient</option>
          <option value="Supply">Supply</option>
        </select>
      </label>

      <div className="lay-row">
        <label>
          Quantity
          <input
            type="number"
            name="quantity"
            min="0"
            step="any"
            value={form.quantity}
            onChange={onChange}
            required
          />
        </label>

        <label>
          Unit
          <input
            type="text"
            name="unit"
            value={form.unit}
            onChange={onChange}
            placeholder="kg, L, pcs"
            required
          />
        </label>
      </div>

      <label>
        Reorder level
        <input
          type="number"
          name="reorderLevel"
          min="0"
          step="any"
          value={form.reorderLevel}
          onChange={onChange}
          placeholder="0"
        />
      </label>

      {error && (
        <p className="lay-msg lay-error" role="alert">
          {error}
        </p>
      )}

      {notice && (
        <p className="lay-msg lay-ok" role="status">
          {notice}
        </p>
      )}

      <div className="lay-actions">
        <button
          type="submit"
          className="lay-btn lay-primary"
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : editingId !== null
              ? "Save changes"
              : "Add item"}
        </button>

        {editingId !== null && (
          <button
            type="button"
            className="lay-btn"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
