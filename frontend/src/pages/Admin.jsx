import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

const STATUS_OPTIONS = ['pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'];
const CATEGORIES = ['fruits', 'vegetables', 'meats', 'seafood'];
const EMPTY_PRODUCT = { name: '', category: 'fruits', price: '', unit: 'kg', description: '', emoji: '', in_stock: true };

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) navigate('/');
  }, [user, authLoading]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    Promise.all([adminAPI.stats(), adminAPI.orders(), adminAPI.products()])
      .then(([s, o, p]) => { setStats(s.data); setOrders(o.data); setProducts(p.data); })
      .finally(() => setLoading(false));
  }, [user]);

  const updateStatus = async (orderId, status) => {
    try {
      const res = await adminAPI.updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: res.data.status } : o));
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const openEdit = (product) => { setForm({ ...product }); setEditProduct(product.id); setShowForm(true); };
  const openAdd = () => { setForm(EMPTY_PRODUCT); setEditProduct(null); setShowForm(true); };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editProduct) {
        const res = await adminAPI.updateProduct(editProduct, form);
        setProducts(prev => prev.map(p => p.id === editProduct ? res.data : p));
      } else {
        const res = await adminAPI.addProduct(form);
        setProducts(prev => [...prev, res.data]);
      }
      setShowForm(false);
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
    finally { setFormLoading(false); }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await adminAPI.deleteProduct(id); setProducts(prev => prev.filter(p => p.id !== id)); }
    catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  if (loading) return <div className="loading">Loading admin panel...</div>;

  return (
    <div className="admin-page">
      <div className="container">
        <h1 className="page-title">⚙️ Admin Panel</h1>

        {stats && (
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-value">{stats.totalOrders}</div><div className="stat-label">Total Orders</div></div>
            <div className="stat-card"><div className="stat-value">{stats.totalCustomers}</div><div className="stat-label">Customers</div></div>
            <div className="stat-card"><div className="stat-value">{stats.totalProducts}</div><div className="stat-label">Products</div></div>
            <div className="stat-card green"><div className="stat-value">₹{stats.totalRevenue.toFixed(0)}</div><div className="stat-label">Revenue</div></div>
          </div>
        )}

        <div className="admin-tabs">
          <button className={`admin-tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>📦 Orders ({orders.length})</button>
          <button className={`admin-tab ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>🌿 Products ({products.length})</button>
        </div>

        {tab === 'orders' && (
          <div className="admin-orders">
            {orders.length === 0 ? <div className="empty-state"><div className="icon">📦</div><p>No orders yet.</p></div> :
              orders.map(order => (
                <div key={order.id} className="admin-order-card card">
                  <div className="admin-order-header">
                    <div>
                      <span className="order-id">#{order.id.slice(0, 8).toUpperCase()}</span>
                      <span className="order-date">{new Date(order.created_at).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="admin-order-meta">
                      <span className={`badge badge-${order.status}`}>{order.status.replace('_', ' ')}</span>
                      <span className="order-total">₹{order.total_amount}</span>
                    </div>
                  </div>
                  <div className="admin-order-info">
                    <span>👤 {order.guest_name || 'Registered User'} · {order.guest_phone || order.guest_email || ''}</span>
                    <span>📍 {order.delivery_address}</span>
                  </div>
                  <div className="order-items-list" style={{ marginBottom: 12 }}>
                    {order.items?.map(item => (
                      <span key={item.id} className="order-item-tag">{item.product_name} × {item.quantity}</span>
                    ))}
                  </div>
                  <div className="status-update">
                    <label>Update Status:</label>
                    <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {tab === 'products' && (
          <div className="admin-products">
            <div className="admin-products-header">
              <h3>Products</h3>
              <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add Product</button>
            </div>

            {showForm && (
              <div className="product-form-overlay">
                <div className="product-form card">
                  <h3>{editProduct ? 'Edit Product' : 'Add Product'}</h3>
                  <form onSubmit={handleProductSubmit}>
                    <div className="form-row">
                      <div className="form-group"><label>Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
                      <div className="form-group"><label>Emoji</label><input value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} placeholder="🌿" /></div>
                    </div>
                    <div className="form-row">
                      <div className="form-group"><label>Category *</label>
                        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="form-group"><label>Unit</label>
                        <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                          {['kg', 'dozen', 'piece', 'litre', 'bundle'].map(u => <option key={u}>{u}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group"><label>Price (₹) *</label><input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required /></div>
                      <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 28 }}>
                          <input type="checkbox" style={{ width: 'auto' }} checked={form.in_stock} onChange={e => setForm(f => ({ ...f, in_stock: e.target.checked }))} />
                          In Stock
                        </label>
                      </div>
                    </div>
                    <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary" disabled={formLoading}>{formLoading ? 'Saving...' : 'Save'}</button>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="products-table">
              <table>
                <thead>
                  <tr><th>Product</th><th>Category</th><th>Price</th><th>Unit</th><th>Stock</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td><span>{p.emoji}</span> {p.name}</td>
                      <td><span className="badge badge-confirmed">{p.category}</span></td>
                      <td>₹{p.price}</td>
                      <td>{p.unit}</td>
                      <td>{p.in_stock ? '✅' : '❌'}</td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)} style={{ marginRight: 8 }}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteProduct(p.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
