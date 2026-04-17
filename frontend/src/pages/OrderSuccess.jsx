import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersAPI } from '../api';
import './OrderSuccess.css';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    ordersAPI.getOne(id).then(res => setOrder(res.data)).catch(() => {});
  }, [id]);

  return (
    <div className="success-page">
      <div className="success-card card">
        <div className="success-icon">✅</div>
        <h2>Order Placed!</h2>
        <p>Thank you for your order. We'll deliver your fresh organics soon.</p>
        {order && (
          <div className="order-detail">
            <div className="order-detail-row"><span>Order ID</span><strong>#{order.id.slice(0, 8).toUpperCase()}</strong></div>
            <div className="order-detail-row"><span>Total</span><strong>₹{order.total_amount}</strong></div>
            <div className="order-detail-row"><span>Status</span><span className={`badge badge-${order.status}`}>{order.status}</span></div>
            <div className="order-detail-row"><span>Deliver to</span><span>{order.delivery_address}</span></div>
          </div>
        )}
        <div className="success-actions">
          <Link to="/products" className="btn btn-primary">Continue Shopping</Link>
          <Link to="/my-orders" className="btn btn-secondary">View My Orders</Link>
        </div>
      </div>
    </div>
  );
}
