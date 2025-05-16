import { MemoryRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import ProductManager from './components/ProductManager';
import CategoryManager from './components/CategoryManager';
import SubcategoryManager from './components/SubcategoryManager';

export default function App() {
  const [activeNav, setActiveNav] = useState('products');

  return (
    <Router>
      <div className="app-container">
        <nav className="main-nav">
          <div className="nav-brand">Sistema de Gestión</div>
          <ul className="nav-links">
            <li className={activeNav === 'products' ? 'active' : ''}>
              <Link to="/" onClick={() => setActiveNav('products')}>
                Productos
              </Link>
            </li>
            <li className={activeNav === 'categories' ? 'active' : ''}>
              <Link to="/categories" onClick={() => setActiveNav('categories')}>
                Categorías
              </Link>
            </li>
            <li className={activeNav === 'subcategories' ? 'active' : ''}>
              <Link to="/subcategories" onClick={() => setActiveNav('subcategories')}>
                Subcategorías
              </Link>
            </li>
          </ul>
        </nav>

        <div className="content-container">
          <Routes>
            <Route path="/" element={<ProductManager />} />
            <Route path="/categories" element={<CategoryManager />} />
            <Route path="/subcategories" element={<SubcategoryManager />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
