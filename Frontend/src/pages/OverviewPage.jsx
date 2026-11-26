import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { peso } from '../utils/peso';
import { Heading, Stat, Notice, Empty } from '../Components/UI';
import Icon from '../Components/Icon';
export default function OverviewPage({ onNavigate }) {
  const [summary, setSummary] = useState(null),
    [items, setItems] = useState([]),
    [sales, setSales] = useState([]),
    [error, setError] = useState('');
  useEffect(
    () => {
      const load = () => Promise.all([api('/sales/summary/today'), api('/inventory'), api('/sales')]).then(([s, i, t]) => {
        setSummary(s);
        setItems(i);
        setSales(t.slice(0, 5));
      }).catch(e => setError(e.message));
      load();
      const timer = setInterval(load, 15000);
      return () => clearInterval(timer);
    },
    []
  );
  const low = items.filter(i => Number(i.quantity) <= Number(i.reorderLevel));
  return <>
    <Heading
      eyebrow="CAFÉ AT A GLANCE"
      title="Good day, team! ☕"
      description="Here's what's happening around the café today."
    />
    <Notice message={error} />
    <div className="stats-grid">
      <Stat
        icon="trend"
        label="Today's sales"
        value={peso(summary?.totalSales || 0)}
        sub="Revenue today"
      />
      <Stat
        icon="receipt"
        label="Transactions"
        value={summary?.transactions ?? '—'}
        sub="Orders processed today"
      />
      <Stat
        icon="clock"
        label="In preparation"
        value={summary?.pendingOrders ?? '—'}
        sub="Pending + preparing orders"
        tone="accent"
      />
      <Stat
        icon="alert"
        label="Low-stock items"
        value={low.length}
        sub="At or below reorder level"
        tone={low.length ? 'warning' : ''}
      />
    </div>
    <div className="overview-grid">
      <section className="surface">
        <div className="surface-header">
          <div>
            <div className="section-eyebrow">INVENTORY HEALTH</div>
            <h2>Stock that needs attention</h2>
          </div>
          <button className="text-action" onClick={() => onNavigate('inventory')}>Manage inventory <Icon name="arrow" size={16} /></button>
        </div>
        {low.length ? <div className="short-list">
          {low.slice(0, 6).map(item => <div className="short-row" key={item.id}>
            <span className="item-dot orange" />
            <div>
              <strong>
                {item.name}
              </strong>
              <small>Reorder at {item.reorderLevel} {item.unit}</small>
            </div>
            <span className="stock-chip low">
              {item.quantity}
              {item.unit}
            </span>
          </div>)}
        </div> : <Empty
          title="All stocked up!"
          description="No low-stock ingredients right now."
          icon="check"
        />}
      </section>
      <section className="surface">
        <div className="surface-header">
          <div>
            <div className="section-eyebrow">RECENT ACTIVITY</div>
            <h2>Latest transactions</h2>
          </div>
          <button className="text-action" onClick={() => onNavigate('sales')}>All sales <Icon name="arrow" size={16} /></button>
        </div>
        {sales.length ? <div className="short-list">
          {sales.map(s => <div key={s.id} className="short-row">
            <span className="item-dot brown" />
            <div>
              <strong>Order #{String(s.id).padStart(4, '0')}</strong>
              <small>{s.customer} · {new Date(s.createdAt).toLocaleString('en-PH')}</small>
            </div>
            <strong>
              {peso(s.total)}
            </strong>
          </div>)}
        </div> : <Empty
          title="No sales yet"
          description="Completed checkouts appear here."
          icon="receipt"
        />}
      </section>
    </div>
    <div className="welcome-strip">
      <span>✦ A smoother day begins with a well-organized café.</span>
      <button onClick={() => onNavigate('menu')}>Check menu recipes <Icon name="arrow" size={17} /></button>
    </div>
  </>;
}
