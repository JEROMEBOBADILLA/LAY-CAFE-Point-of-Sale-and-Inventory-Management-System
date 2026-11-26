import { useEffect, useState } from 'react';
import { api, getSession, saveSession, clearSession } from './lib/api';
import Shell from './layout/Shell';
import LoginPage from './pages/LoginPage';
import CashierPage from './pages/CashierPage';
import InventoryPage from './pages/InventoryPage';
import KitchenPage from './pages/KitchenPage';
import OverviewPage from './pages/OverviewPage';
import MenuPage from './pages/MenuPage';
import SalesPage from './pages/SalesPage';
import './style.css';
const defaults = { admin: 'overview', cashier: 'pos', kitchen: 'kitchen' };
export default function App() {
  const [session, setSession] = useState(getSession);
  const [tab, setTab] = useState(() => defaults[getSession()?.user?.role] || 'overview');
  useEffect(
    () => {
      const logout = () => {
        clearSession();
        setSession(null);
      };
      window.addEventListener('laycafe-logout', logout);
      return () => window.removeEventListener('laycafe-logout', logout);
    },
    []
  );
  useEffect(() => {
    if (session?.token)
      api('/auth/me').catch(() => {
        clearSession();
        setSession(null);
      });
  }, [session?.token]);
  function onLogin(next) {
    saveSession(next);
    setSession(next);
    setTab(defaults[next.user.role]);
  }
  function logout() {
    clearSession();
    setSession(null);
  }
  if (!session?.token)
    return <LoginPage onLogin={onLogin} />;
  const page = {
    overview: <OverviewPage onNavigate={setTab} />,
    inventory: <InventoryPage />,
    menu: <MenuPage />,
    pos: <CashierPage />,
    kitchen: <KitchenPage />,
    sales: <SalesPage role={session.user.role} />
  }[tab];
  return <Shell session={session} tab={tab} onTab={setTab} onLogout={logout}>
    {page}
  </Shell>;
}
