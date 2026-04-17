import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI } from '../api';
import { useCart } from '../context/CartContext';
import './Products.css';

const CATEGORIES = [
  { id: '', label: 'All' },
  { id: 'fruits', label: '🍎 Fruits' },
  { id: 'vegetables', label: '🥕 Vegetables' },
  { id: 'meats', label: '🥩 Meats' },
  { id: 'seafood', label: '🐟 Seafood' },
];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const activeCategory = searchParams.get('category') || '';

  useEffect(() => {
    setLoading(true);
    productsAPI.getAll(activeCategory || undefined)
      .then(res => setProducts(res.data))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const handleAdd = (product) => {
    addToCart(product);
    setAdded(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAdded(prev => ({ ...prev, [product.id]: false })), 1200);
  };

  return (
    <div className="products-page">
      <div className="container">
        <h1 className="page-title">🛒 Shop Organic</h1>
        <div className="category-tabs">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`cat-tab ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSearchParams(cat.id ? { category: cat.id } : {})}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="empty-state"><div className="icon">🌿</div><p>No products found.</p></div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-emoji">{product.emoji || '🌿'}</div>
                <div className="product-info">
                  <div className="product-category">{product.category}</div>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-desc">{product.description}</p>
                  <div className="product-footer">
                    <div className="product-price">
                      ₹{product.price} <span className="unit">/ {product.unit}</span>
                    </div>
                    <button
                      className={`btn btn-sm ${added[product.id] ? 'btn-added' : 'btn-primary'}`}
                      onClick={() => handleAdd(product)}
                    >
                      {added[product.id] ? '✓ Added' : '+ Add'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
