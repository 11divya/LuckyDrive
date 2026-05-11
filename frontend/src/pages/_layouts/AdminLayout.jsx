import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Avatar } from 'antd';
import {
  DashboardOutlined,
  CarOutlined,
  HistoryOutlined,
  WalletOutlined,
  SettingOutlined,
  PlusOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import Logo from '../../components/Logo';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/admin',           label: 'Dashboard',    icon: <DashboardOutlined />, end: true },
  { to: '/admin/inventory', label: 'Inventory',    icon: <CarOutlined /> },
  { to: '/admin/draws',     label: 'Draw History', icon: <HistoryOutlined /> },
  { to: '/admin/finance',   label: 'Financials',   icon: <WalletOutlined /> },
  { to: '/admin/settings',  label: 'Settings',     icon: <SettingOutlined /> },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-dark text-text">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-dark-50 border-r border-outline-variant/20 px-5 py-6">
        <div className="mb-8">
          <Logo linkTo="/admin" />
        </div>

        <div className="flex items-center gap-3 mb-8 p-3 rounded-xl bg-dark-100 border border-outline-variant/20">
          <Avatar
            size={40}
            style={{ backgroundColor: '#f0a500', color: '#12121e', fontWeight: 700 }}
          >
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </Avatar>
          <div className="min-w-0">
            <div className="font-medium truncate">{user?.name || 'Admin User'}</div>
            <div className="font-label-bold text-[10px] text-primary">LUCKYDRIVE MANAGER</div>
          </div>
        </div>

        <Button
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin/inventory?new=1')}
          className="!mb-6"
          block
        >
          New Listing
        </Button>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-text-muted hover:bg-dark-100 hover:text-text'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => logout().then(() => navigate('/login'))}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm text-text-muted hover:bg-dark-100 hover:text-text transition-colors"
        >
          <LogoutOutlined />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <header className="md:hidden border-b border-outline-variant/20 bg-dark-50 px-4 py-3 flex items-center justify-between">
          <Logo linkTo="/admin" />
          <Link to="/" className="text-sm text-text-muted">Site</Link>
        </header>
        <main className="p-6 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
