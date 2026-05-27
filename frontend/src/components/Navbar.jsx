import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Avatar, Dropdown } from 'antd';
import Logo from './Logo';
import Button from './Button';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Browse Cars', end: true },
  { to: '/winners', label: 'Winners' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userMenu = {
    items: [
      ...(user?.role === 'admin'
        ? [{ key: 'admin', label: <Link to="/admin">Admin Panel</Link> }]
        : []),
      { key: 'dashboard', label: <Link to="/dashboard">My Dashboard</Link> },
      { type: 'divider' },
      { key: 'logout', label: 'Logout', onClick: () => logout().then(() => navigate('/')) },
    ],
  };

  return (
    <header className="border-b border-outline-variant/20 bg-dark/80 backdrop-blur sticky top-0 z-30">
      <div className="ld-container flex items-center justify-between gap-6 py-4">
        <div className="flex items-center gap-10">
          <Logo />
          <nav className="hidden md:flex items-center gap-7">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `text-body-md font-medium transition-colors ${
                    isActive ? 'text-primary' : 'text-text-muted hover:text-text'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Dropdown menu={userMenu} placement="bottomRight">
              <Avatar
                size={36}
                style={{ backgroundColor: '#f0a500', color: '#12121e', cursor: 'pointer', fontWeight: 700 }}
              >
                {user.name?.[0]?.toUpperCase() || 'U'}
              </Avatar>
            </Dropdown>
          ) : (
            <Button onClick={() => navigate('/login')}>Get Tickets</Button>
          )}
        </div>
      </div>
    </header>
  );
}
