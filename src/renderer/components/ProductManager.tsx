import { useState, useEffect } from 'react';
import ProductList from './ProductList';
import AddProduct from './AddProduct';
import { Product } from '../../main/database/database';

export default function ProductManager() {
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [products, setProducts] = useState<Product[]>([]);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const reloadProducts = () => {
    setReloadTrigger(prev => prev + 1);
  };

  const handleProductAdded = (product: Product) => {
    setProducts(prev => [product, ...prev]);
    setActiveTab('list');
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const result = await window.electron.productAPI.getAllProducts();
        setProducts(result);
      } catch (err) {
        console.error('Error al cargar productos:', err);
      }
    };

    loadProducts();
  }, [reloadTrigger]);

  return (
    <div className="product-manager">
      <h1>Gestión de Productos</h1>

      <div className="tabs">
        <button
          type="button"
          className={`tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          Ver Productos
        </button>
        <button
          type="button"
          className={`tab ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          Añadir Producto
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'list' ? (
          <ProductList />
        ) : (
          <AddProduct onProductAdded={handleProductAdded} />
        )}
      </div>
    </div>
  );
}
