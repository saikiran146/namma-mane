import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          🌿 Namma Mane
        </Link>
        <div className="navbar-links">
          <Link to="/products">Shop</Link>
          {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
          {user && <Link to="/my-orders">My Orders</Link>}
        </div>
        <div className="navbar-actions">
          <Link to="/cart" className="cart-btn">
            🛒 Cart {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>
          {user ? (
            <div className="user-menu">
              <span className="user-name">👤 {user.name.split(' ')[0]}</span>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
