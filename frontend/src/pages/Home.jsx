import { Link } from 'react-router-dom';
import './Home.css';

const categories = [
  { id: 'fruits', label: 'Fresh Fruits', emoji: '🍎', desc: 'Apples, Oranges, Grapes, Strawberries' },
  { id: 'vegetables', label: 'Organic Vegetables', emoji: '🥕', desc: 'Onions, Tomatoes, Beans, Carrots' },
  { id: 'meats', label: 'Farm Meats', emoji: '🥩', desc: 'Goat, Chicken, Country Eggs' },
  { id: 'seafood', label: 'Fresh Seafood', emoji: '🐟', desc: 'Sea Fish & More' },
];

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <h1>Farm Fresh,<br />Delivered to Your Door</h1>
            <p>100% organic fruits, vegetables, meats, and seafood — sourced directly from local farms.</p>
            <Link to="/products" className="btn btn-primary">Shop Now →</Link>
          </div>
          <div className="hero-emoji">🌿🥬🍅🐔🐟</div>
        </div>
      </section>

      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">What We Offer</h2>
          <div className="categories-grid">
            {categories.map(cat => (
              <Link to={`/products?category=${cat.id}`} key={cat.id} className="category-card">
                <div className="category-emoji">{cat.emoji}</div>
                <h3>{cat.label}</h3>
                <p>{cat.desc}</p>
                <span className="category-link">Explore →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="why-section">
        <div className="container">
          <h2 className="section-title">Why Namma Mane?</h2>
          <div className="why-grid">
            <div className="why-card">
              <span>🌱</span>
              <h4>100% Organic</h4>
              <p>No pesticides, no chemicals — pure nature's best.</p>
            </div>
            <div className="why-card">
              <span>🚚</span>
              <h4>Fast Delivery</h4>
              <p>Same-day delivery for orders placed before noon.</p>
            </div>
            <div className="why-card">
              <span>🤝</span>
              <h4>Direct from Farmers</h4>
              <p>We work directly with local farmers for the freshest produce.</p>
            </div>
            <div className="why-card">
              <span>💯</span>
              <h4>Quality Guaranteed</h4>
              <p>Not happy? We'll replace or refund, no questions asked.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
