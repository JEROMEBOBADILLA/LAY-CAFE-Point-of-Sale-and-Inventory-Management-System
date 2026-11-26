import Icon from '../Components/Icon';
import logo from '../assets/laycafe.jpg';
const navigation = {
  admin: [
    ['overview', 'Overview', 'grid'],
    ['inventory', 'Inventory', 'box'],
    ['menu', 'Menu & recipes', 'coffee'],
    ['sales', 'Sales history', 'receipt']
  ],
  cashier: [['pos', 'Point of sale', 'cart'], ['sales', 'Sales history', 'receipt']],
  kitchen: [['kitchen', 'Kitchen board', 'kitchen']],
};
export default function Shell({ session, tab, onTab, onLogout, children }) {
  const today = new Intl.DateTimeFormat('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src={logo} alt="Lay Cafe logo" />
        <div>
          <b>LAY CAFÉ</b>
          <span>Management system</span>
        </div>
      </div>
      <div className="side-section">WORKSPACE</div>
      <nav className="side-nav" aria-label="Main navigation">
        {navigation[session.user.role].map(([key, title, icon]) => <button
          key={key}
          className={`nav-item ${tab === key ? 'active' : ''}`}
          onClick={() => onTab(key)}
        >
          <Icon name={icon} />
          <span>
            {title}
          </span>
          {tab === key && <span className="nav-indicator" />}
        </button>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="brand-quote">
          <span>✦</span>
          <p>Good food.<br />Good mood.<br /><em>Every day.</em></p>
        </div>
        <div className="sidebar-profile">
          <div className="profile-avatar">
            {session.user.name.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <strong>
              {session.user.name}
            </strong>
            <span>{session.user.role} account</span>
          </div>
        </div>
        <button className="sidebar-logout" onClick={onLogout}><Icon name="logout" size={17} /> Sign out</button>
      </div>
    </aside>
    <div className="main-area">
      <header className="topbar">
        <div className="topbar-date">
          <Icon name="clock" size={17} />
          {today}
        </div>
        <div className="topbar-right">
          <span className="system-online"><span /> Local café workspace</span>
          <span className="role-pill">
            {session.user.role}
          </span>
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
      <footer className="app-footer">© {new Date().getFullYear()} Lay Café <span>·</span> Point of Sale & Inventory Management</footer>
    </div>
  </div>;
}
