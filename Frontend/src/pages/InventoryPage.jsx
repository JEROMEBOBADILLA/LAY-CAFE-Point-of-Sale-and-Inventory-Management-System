import { useEffect, useMemo, useState } from 'react';
import { api, post, put, remove } from '../lib/api';
import { Heading, Notice, Empty, Modal } from '../Components/UI';
import Icon from '../Components/Icon';
import Header from '../Components/Header';
import FormContainer from '../Components/FormContainer';
import InventoryTable from '../Components/InventoryTable';
const empty = {
  name: '',
  category: 'Ingredient',
  quantity: '0',
  unit: 'pcs',
  reorderLevel: '5'
};
const number = v => Number(v).toLocaleString('en-PH', { maximumFractionDigits: 3 });
export default function InventoryPage() {
  const [items, setItems] = useState([]),
    [movements, setMovements] = useState([]),
    [search, setSearch] = useState(''),
    [filter, setFilter] = useState('All');
  const [form, setForm] = useState(null),
    [editing, setEditing] = useState(null),
    [movement, setMovement] = useState(null),
    [moveAmount, setMoveAmount] = useState(''),
    [moveType, setMoveType] = useState('restock'),
    [moveNote, setMoveNote] = useState('');
  const [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [view, setView] = useState('stock');
  async function refresh() {
    try {
      const [stocks, history] = await Promise.all([api('/inventory'), api('/inventory/movements/recent')]);
      setItems(stocks);
      setMovements(history);
      setError('');
    }
    catch (e) {
      setError(e.message);
    }
    finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 10000);
    return () => clearInterval(timer);
  }, []);
  const visible = useMemo(
    () => items.filter(i => (filter === 'All' || (filter === 'Low stock' ? Number(i.quantity) <= Number(i.reorderLevel) : i.category === filter)) && i.name.toLowerCase().includes(search.toLowerCase())),
    [items, filter, search]
  );
  function editItem(item) {
    setEditing(item?.id ?? null);
    setForm(item ? {
      name: item.name,
      category: item.category,
      quantity: String(item.quantity),
      unit: item.unit,
      reorderLevel: String(item.reorderLevel)
    } : { ...empty });
    setError('');
  }
  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing !== null)
        await put(`/inventory/${editing}`, form);
      else
        await post('/inventory', form);
      setForm(null);
      setNotice(editing !== null ? 'Inventory item updated.' : 'New inventory item created.');
      await refresh();
    }
    catch (err) {
      setError(err.message);
    }
    finally {
      setSaving(false);
    }
  }
  async function del(item) {
    if (!window.confirm(`Delete ${item.name}? Product recipes may prevent deletion. Stock history is preserved.`))
      return;
    try {
      await remove(`/inventory/${item.id}`);
      setNotice('Item archived; stock history preserved.');
      await refresh();
    }
    catch (e) {
      setError(e.message);
    }
  }
  function startMove(item) {
    setMovement(item);
    setMoveType('restock');
    setMoveAmount('');
    setMoveNote('');
  }
  async function saveMove(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await post(`/inventory/${movement.id}/movements`, { type: moveType, amount: Number(moveAmount), note: moveNote });
      setNotice(`Stock updated for ${movement.name}.`);
      setMovement(null);
      setMoveAmount('');
      setMoveNote('');
      await refresh();
    }
    catch (e) {
      setError(e.message);
    }
    finally {
      setSaving(false);
    }
  }
  return <>
    <Heading
      eyebrow="ADMIN · INVENTORY CONTROL"
      title="Inventory management"
      description="Track ingredients, manage supplies and monitor stock movements."
      actions={<button className="btn btn-primary" onClick={() => editItem(null)}><Icon name="plus" size={18} /> Add inventory item</button>}
    />
    <Notice message={error} onClose={() => setError('')} />
    <Notice message={notice} type="success" onClose={() => setNotice('')} />
    <Header items={items} />
    <section className="surface inventory-surface">
      <div className="surface-header">
        <div>
          <div className="section-eyebrow">STOCK CONTROL</div>
          <h2>Inventory records</h2>
        </div>
        <div className="segmented">
          <button className={view === 'stock' ? 'active' : ''} onClick={() => setView('stock')}>Stock levels</button>
          <button className={view === 'history' ? 'active' : ''} onClick={() => setView('history')}>Movement history</button>
        </div>
      </div>
      {view === 'stock' ? <InventoryTable
        items={visible}
        allCount={items.length}
        loading={loading}
        query={search}
        filter={filter}
        onQueryChange={setSearch}
        onFilterChange={setFilter}
        onEdit={editItem}
        onDelete={del}
        onMove={startMove}
      /> : <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Item</th>
              <th>Movement</th>
              <th>Change</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {movements.map(m => <tr key={m.id}>
              <td className="subtle-label">
                {new Date(m.createdAt).toLocaleString('en-PH')}
              </td>
              <td>
                <b>
                  {m.itemName}
                </b>
              </td>
              <td>
                <span className={`status-badge ${m.type === 'sale' ? 'neutral' : 'ok'}`}>
                  {m.type}
                </span>
              </td>
              <td className={Number(m.changeAmount) < 0 ? 'negative' : 'positive'}>
                {Number(m.changeAmount) > 0 ? '+' : ''}
                {number(m.changeAmount)}
                {m.unit}
              </td>
              <td className="subtle-label">
                {m.note}
              </td>
            </tr>)}
          </tbody>
        </table>
        {!movements.length && <Empty
          icon="list"
          title="No stock movement yet"
          description="Restocks, adjustments and sales will be recorded here."
        />}
      </div>}
    </section>
    {form && <Modal
      title={editing !== null ? 'Edit inventory item' : 'Add inventory item'}
      subtitle="Set item details and a minimum stock level."
      onClose={() => setForm(null)}
    >
      <FormContainer
        form={form}
        editingId={editing}
        saving={saving}
        error={error}
        onChange={e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))}
        onSubmit={save}
        onCancel={() => setForm(null)}
      />
    </Modal>}
    {movement && <Modal
      title={`Update ${movement.name}`}
      subtitle={`Current stock: ${number(movement.quantity)} ${movement.unit}`}
      onClose={() => setMovement(null)}
    >
      <form className="modal-form" onSubmit={saveMove}>
        <label>Movement type<select value={moveType} onChange={e => setMoveType(e.target.value)}>
          <option value="restock">Restock (add)</option>
          <option value="adjustment">Adjustment (+ or −)</option>
        </select></label>
        <label>Quantity change ({movement.unit})<input
          required
          autoFocus
          type="number"
          step="0.001"
          value={moveAmount}
          onChange={e => setMoveAmount(e.target.value)}
          placeholder="e.g. 10 or -2"
        /></label>
        <label>Note (optional)<input
          value={moveNote}
          onChange={e => setMoveNote(e.target.value)}
          maxLength={255}
          placeholder="Delivery received / spoiled stock"
        /></label>
        <p className="form-hint">Stock cannot go below zero. Every change is recorded in movement history.</p>
        <div className="modal-actions">
          <button type="button" className="btn btn-outline" onClick={() => setMovement(null)}>Cancel</button>
          <button className="btn btn-primary" disabled={saving}>
            {saving ? 'Updating…' : 'Record movement'}
          </button>
        </div>
      </form>
    </Modal>}
  </>;
}
