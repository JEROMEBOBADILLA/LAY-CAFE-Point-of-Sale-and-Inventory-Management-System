// Preserved original component: inventory add/edit form.
export default function FormContainer({ form, editingId, saving, error, onChange, onSubmit, onCancel }) {
  return <form className="modal-form" onSubmit={onSubmit}>
    <label>Item name<input
      autoFocus
      required
      name="name"
      maxLength={160}
      value={form.name}
      onChange={onChange}
      placeholder="e.g. Coffee beans"
    /></label>
    <label>Category<select name="category" value={form.category} onChange={onChange}>
      <option>Ingredient</option>
      <option>Supply</option>
    </select></label>
    <div className="form-two">
      <label>Current quantity<input
        required
        type="number"
        name="quantity"
        min="0"
        step="0.001"
        value={form.quantity}
        onChange={onChange}
      /></label>
      <label>Unit<input
        required
        name="unit"
        maxLength={24}
        value={form.unit}
        onChange={onChange}
        placeholder="pcs / kg / L"
      /></label>
    </div>
    <label>Minimum stock / reorder level<input
      required
      type="number"
      name="reorderLevel"
      min="0"
      step="0.001"
      value={form.reorderLevel}
      onChange={onChange}
    /></label>
    <p className="form-hint">Quantity changes to an existing item are tracked as stock adjustments.</p>
    {error && <p className="form-error" role="alert">
      {error}
    </p>}
    <div className="modal-actions">
      <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? 'Saving…' : editingId !== null ? 'Save changes' : 'Create item'}
      </button>
    </div>
  </form>;
}
