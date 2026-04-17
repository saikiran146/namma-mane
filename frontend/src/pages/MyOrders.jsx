import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import './MyOrders.css';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate('/login', { state: { from: '/my-orders' } }); return; }
    ordersAPI.myOrders()
      .then(res => setOrders(res.data))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="loading">Loading your orders...</div>;

  return (
    <div className="orders-page">
      <div className="container">
        <h1 className="page-title">My Orders</h1>
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📦</div>
            <p>No orders yet.</p>
            <Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card card">
                <div className="order-card-header">
                  <div>
                    <span className="order-id">#{order.id.slice(0, 8).toUpperCase()}</span>
                    <span className="order-date">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <span className={`badge badge-${order.status}`}>{order.status.replace('_', ' ')}</span>
                </div>
                <div className="order-items-list">
                  {order.items?.map(item => (
                    <span key={item.id} className="order-item-tag">{item.product_name} × {item.quantity}</span>
                  ))}
                </div>
                <div className="order-card-footer">
                  <span className="order-address">📍 {order.delivery_address}</span>
                  <span className="order-total">₹{order.total_amount}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
