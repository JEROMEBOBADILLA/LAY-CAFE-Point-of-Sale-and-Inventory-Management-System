import { useEffect, useMemo, useState } from 'react';
import { api, put, post, remove } from '../lib/api';
import { peso } from '../utils/peso';
import { Heading, Notice, Empty, Modal } from '../Components/UI';
import Icon from '../Components/Icon';
const empty = { name: '', category: 'Iced Coffee', price: '', isActive: true };
export default function MenuPage() {
  const [products, setProducts] = useState([]),
    [stocks, setStocks] = useState([]),
    [search, setSearch] = useState(''),
    [filter, setFilter] = useState('All'),
    [form, setForm] = useState(null),
    [editing, setEditing] = useState(null),
    [recipeFor, setRecipeFor] = useState(null),
    [recipe, setRecipe] = useState([]),
    [newIngredient, setNewIngredient] = useState(''),
    [newQuantity, setNewQuantity] = useState('1'),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false);
  async function refresh() {
    try {
      const [p, i] = await Promise.all([api('/products'), api('/inventory')]);
      setProducts(p);
      setStocks(i);
      setError('');
    }
    catch (e) {
      setError(e.message);
    }
    finally {
      setLoading(false);
    }
  }
  useEffect(() => { refresh(); }, []);
  const categories = ['All', ...new Set(products.map(p => p.category))];
  const visible = useMemo(
    () => products.filter(p => (filter === 'All' || p.category === filter) && p.name.toLowerCase().includes(search.toLowerCase())),
    [filter, products, search]
  );
  const update = e => setForm(p => ({
    ...p,
    [e.target.name]: e.target.name === 'isActive' ? e.target.checked : e.target.value
  }));
  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing)
        await put(`/products/${editing}`, form);
      else
        await post('/products', form);
      setForm(null);
      setNotice(editing ? 'Product updated.' : 'Product added. Set its inventory recipe before selling it.');
      await refresh();
    }
    catch (err) {
      setError(err.message);
    }
    finally {
      setSaving(false);
    }
  }
  async function deactivate(p) {
    if (!window.confirm(`Deactivate ${p.name}? It will no longer appear in the cashier menu.`))
      return;
    try {
      await remove(`/products/${p.id}`);
      setNotice('Product deactivated.');
      await refresh();
    }
    catch (e) {
      setError(e.message);
    }
  }
  async function openRecipe(p) {
    setError('');
    setRecipeFor(p);
    try {
      const rows = await api(`/products/${p.id}/recipe`);
      setRecipe(rows.map(r => ({ inventoryId: r.inventoryId, quantityRequired: r.quantityRequired })));
      setNewIngredient('');
      setNewQuantity('1');
    }
    catch (e) {
      setError(e.message);
      setRecipeFor(null);
    }
  }
  async function saveRecipe(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await put(`/products/${recipeFor.id}/recipe`, { items: recipe });
      setRecipeFor(null);
      setNotice('Ingredient recipe saved. Future sales will deduct stock using these quantities.');
    }
    catch (err) {
      setError(err.message);
    }
    finally {
      setSaving(false);
    }
  }
  function addIngredient() {
    if (!newIngredient || recipe.some(r => String(r.inventoryId) === String(newIngredient)))
      return;
    setRecipe(r => [...r, {
      inventoryId: Number(newIngredient),
      quantityRequired: Number(newQuantity)
    }]);
    setNewIngredient('');
    setNewQuantity('1');
  }
  return <>
    <Heading
      eyebrow="ADMIN · PRODUCT CATALOG"
      title="Menu & recipes"
      description="Manage the café menu and link each product to the inventory it consumes."
      actions={<button
        className="btn btn-primary"
        onClick={() => {
          setEditing(null);
          setForm({ ...empty });
        }}
      ><Icon name="plus" size={18} /> Add product</button>}
    />
    <Notice message={error} onClose={() => setError('')} />
    <Notice message={notice} type="success" onClose={() => setNotice('')} />
    <section className="menu-info">
      <Icon name="alert" size={22} />
      <div>
        <strong>How recipe deduction works</strong>
        <p>Every completed checkout deducts the quantities listed in each product's recipe. The starter data uses demo category-based recipes—replace them with the café's actual ingredients and portion sizes.</p>
      </div>
    </section>
    <section className="surface inventory-surface">
      <div className="surface-header">
        <div>
          <div className="section-eyebrow">PRODUCT MANAGEMENT</div>
          <h2>Available menu</h2>
        </div>
        <span className="catalog-count">{products.filter(p => p.isActive).length} active products</span>
      </div>
      <div className="table-filters">
        <div className="search-field">
          <Icon name="search" />
          <input
            placeholder="Find a menu item…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-select">
          <Icon name="filter" size={16} />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            aria-label="Filter category"
          >
            {categories.map(c => <option key={c}>
              {c}
            </option>)}
          </select>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Availability</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(p => <tr key={p.id}>
              <td>
                <div className="table-name">
                  <span className="table-avatar">🍽️</span>
                  <strong>
                    {p.name}
                  </strong>
                </div>
              </td>
              <td className="subtle-label">
                {p.category}
              </td>
              <td>
                <b>
                  {peso(p.price)}
                </b>
              </td>
              <td>
                <span className={`status-badge ${p.isActive ? 'ok' : 'neutral'}`}>
                  {p.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <div className="table-actions">
                  <button className="recipe-link" onClick={() => openRecipe(p)}><Icon name="settings" size={16} /> Recipe</button>
                  <button
                    aria-label={`Edit ${p.name}`}
                    onClick={() => {
                      setEditing(p.id);
                      setForm({
                        name: p.name,
                        category: p.category,
                        price: String(p.price),
                        isActive: p.isActive
                      });
                    }}
                  >
                    <Icon name="edit" size={17} />
                  </button>
                  <button
                    disabled={!p.isActive}
                    aria-label={`Deactivate ${p.name}`}
                    onClick={() => deactivate(p)}
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              </td>
            </tr>)}
          </tbody>
        </table>
        {!loading && !visible.length && <Empty
          icon="coffee"
          title="No products found"
          description="Try another search or add a product."
        />}
      </div>
      <div className="table-footer">Showing {visible.length} menu items <span>Products are never hard-deleted from past sales.</span></div>
    </section>
    {form && <Modal
      title={editing ? 'Edit menu product' : 'Add menu product'}
      subtitle="Set the information cashiers see at checkout."
      onClose={() => setForm(null)}
    >
      <form onSubmit={save} className="modal-form">
        <label>Product name<input
          required
          autoFocus
          name="name"
          maxLength={190}
          value={form.name}
          onChange={update}
          placeholder="e.g. Iced Latte"
        /></label>
        <label>Category<input
          required
          name="category"
          maxLength={80}
          value={form.category}
          onChange={update}
          list="known-categories"
        /><datalist id="known-categories">
            {categories.filter(c => c !== 'All').map(c => <option key={c} value={c} />)}
          </datalist></label>
        <label>Price (₱)<input
          required
          name="price"
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={update}
        /></label>
        {editing && <label className="check-label"><input
          type="checkbox"
          name="isActive"
          checked={Boolean(form.isActive)}
          onChange={update}
        /> Active in cashier menu</label>}
        <div className="modal-actions">
          <button type="button" className="btn btn-outline" onClick={() => setForm(null)}>Cancel</button>
          <button className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save product'}
          </button>
        </div>
      </form>
    </Modal>}
    {recipeFor && <Modal
      title="Inventory recipe"
      subtitle={`${recipeFor.name} · ${peso(recipeFor.price)}`}
      onClose={() => setRecipeFor(null)}
      wide
    >
      <form className="modal-form" onSubmit={saveRecipe}>
        <div className="menu-info compact">
          <Icon name="box" size={20} />
          <p>Define exactly how much of each ingredient is deducted per one product sold. Use the same units shown in inventory.</p>
        </div>
        {recipe.map((r, index) => {
          const item = stocks.find(s => s.id === Number(r.inventoryId));
          return <div className="recipe-row" key={r.inventoryId}>
            <div>
              <strong>
                {item?.name || `Inventory #${r.inventoryId}`}
              </strong>
              <small>{item?.unit || ''} per product</small>
            </div>
            <input
              required
              aria-label="Quantity required"
              type="number"
              min="0.001"
              step="0.001"
              value={r.quantityRequired}
              onChange={e => setRecipe(prev => prev.map((x, i) => i === index ? { ...x, quantityRequired: e.target.value } : x))}
            />
            <button
              type="button"
              className="icon-button"
              aria-label="Remove ingredient"
              onClick={() => setRecipe(prev => prev.filter((_, i) => i !== index))}
            >
              <Icon name="trash" size={17} />
            </button>
          </div>;
        })}
        <div className="recipe-add">
          <select
            aria-label="Choose ingredient"
            value={newIngredient}
            onChange={e => setNewIngredient(e.target.value)}
          >
            <option value="">Choose ingredient / supply</option>
            {stocks.filter(s => !recipe.some(r => Number(r.inventoryId) === s.id)).map(s => <option value={s.id} key={s.id}>{s.name} ({s.unit})</option>)}
          </select>
          <input
            aria-label="Quantity needed"
            type="number"
            min="0.001"
            step="0.001"
            value={newQuantity}
            onChange={e => setNewQuantity(e.target.value)}
          />
          <button type="button" className="btn btn-outline" onClick={addIngredient}>Add</button>
        </div>
        {!recipe.length && <p className="form-hint">Add at least one ingredient. A product without a recipe cannot be sold.</p>}
        <div className="modal-actions">
          <button type="button" className="btn btn-outline" onClick={() => setRecipeFor(null)}>Cancel</button>
          <button className="btn btn-primary" disabled={saving || !recipe.length}>
            {saving ? 'Saving…' : 'Save recipe'}
          </button>
        </div>
      </form>
    </Modal>}
  </>;
}
