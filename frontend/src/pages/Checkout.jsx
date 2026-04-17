import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../api';
import './Checkout.css';

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    delivery_address: '',
    notes: '',
    guest_name: user?.name || '',
    guest_email: user?.email || '',
    guest_phone: user?.phone || '',
  });

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  if (!cart.length) return (
    <div className="container">
      <div className="empty-state" style={{ paddingTop: 80 }}>
        <div className="icon">🛒</div>
        <p>Your cart is empty. <Link to="/products">Shop now</Link></p>
      </div>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
        delivery_address: form.delivery_address,
        notes: form.notes,
        ...((!user) && { guest_name: form.guest_name, guest_email: form.guest_email, guest_phone: form.guest_phone }),
      };
      const res = await ordersAPI.place(payload);
      clearCart();
      navigate(`/order-success/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="page-title">Checkout</h1>
        <div className="checkout-layout">
          <form onSubmit={handleSubmit} className="checkout-form">
            {!user && (
              <div className="card checkout-section">
                <h3>Your Details</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input value={form.guest_name} onChange={set('guest_name')} placeholder="Your name" required />
                  </div>
                  <div className="form-group">
                    <label>Phone *</label>
                    <input value={form.guest_phone} onChange={set('guest_phone')} placeholder="+91 9876543210" required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" value={form.guest_email} onChange={set('guest_email')} placeholder="you@example.com" required />
                </div>
                <p className="checkout-login-note">
                  Have an account? <Link to="/login" state={{ from: '/checkout' }}>Login for faster checkout</Link>
                </p>
              </div>
            )}

            {user && (
              <div className="card checkout-section checkout-user-info">
                <span>👤</span>
                <div>
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
              </div>
            )}

            <div className="card checkout-section">
              <h3>Delivery Details</h3>
              <div className="form-group">
                <label>Delivery Address *</label>
                <textarea value={form.delivery_address} onChange={set('delivery_address')}
                  placeholder="Enter your full delivery address..." rows={3} required />
              </div>
              <div className="form-group">
                <label>Order Notes (optional)</label>
                <textarea value={form.notes} onChange={set('notes')}
                  placeholder="Any special instructions..." rows={2} />
              </div>
            </div>

            {error && <div className="error-msg">{error}</div>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} disabled={loading}>
              {loading ? 'Placing Order...' : `Place Order · ₹${total.toFixed(2)}`}
            </button>
          </form>

          <div className="checkout-summary card">
            <h3>Order Summary ({cart.length} items)</h3>
            <div className="checkout-items">
              {cart.map(item => (
                <div key={item.product_id} className="checkout-item">
                  <span className="checkout-emoji">{item.emoji}</span>
                  <span className="checkout-name">{item.name} × {item.quantity}</span>
                  <span className="checkout-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="checkout-total">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
