import { Stat } from './UI';
// Preserves the original inventory Header component and its stock breakdown.
export default function Header({ items = [] }) {
  const low = items.filter(i => Number(i.quantity) <= Number(i.reorderLevel)).length;
  return <div className="stats-grid" aria-label="Inventory overview">
    <Stat
      icon="box"
      label="Total inventory items"
      value={items.length}
      sub="Ingredients & supplies"
    />
    <Stat
      icon="coffee"
      label="Ingredients"
      value={items.filter(i => i.category === 'Ingredient').length}
      sub="Ingredient types"
    />
    <Stat
      icon="box"
      label="Supplies"
      value={items.filter(i => i.category === 'Supply').length}
      sub="Café essentials"
    />
    <Stat
      icon="alert"
      label="Need restocking"
      value={low}
      sub="At or below minimum"
      tone={low ? 'warning' : ''}
    />
  </div>;
}
