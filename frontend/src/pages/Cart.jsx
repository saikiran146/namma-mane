import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, total, clearCart } = useCart();

  if (!cart.length) return (
    <div className="container">
      <div className="empty-state" style={{ paddingTop: 80 }}>
        <div className="icon">🛒</div>
        <p>Your cart is empty.</p>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>Start Shopping</Link>
      </div>
    </div>
  );

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1 className="page-title">🛒 Your Cart</h1>
          <button className="btn btn-secondary btn-sm" onClick={clearCart}>Clear All</button>
        </div>

        <div className="cart-layout">
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.product_id} className="cart-item">
                <div className="cart-item-emoji">{item.emoji || '🌿'}</div>
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <p className="cart-item-price">₹{item.price} / {item.unit}</p>
                </div>
                <div className="quantity-controls">
                  <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>+</button>
                </div>
                <div className="cart-item-total">₹{(item.price * item.quantity).toFixed(2)}</div>
                <button className="remove-btn" onClick={() => removeFromCart(item.product_id)}>✕</button>
              </div>
            ))}
          </div>

          <div className="cart-summary card">
            <h3>Order Summary</h3>
            <div className="summary-lines">
              {cart.map(item => (
                <div key={item.product_id} className="summary-line">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="summary-total">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
            <Link to="/checkout" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>
              Proceed to Checkout →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
