import { useState, useEffect } from 'react';
import { Category } from '../../main/database/database';
import CategoryList from './CategoryList';
import AddCategory from './AddCategory';

export default function CategoryManager() {
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [categories, setCategories] = useState<Category[]>([]);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const reloadCategories = () => {
    setReloadTrigger(prev => prev + 1);
  };

  const handleCategoryAdded = (category: Category) => {
    setCategories(prev => [category, ...prev]);
    setActiveTab('list');
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await window.electron.categoryAPI.getAllCategories();
        setCategories(result);
      } catch (err) {
        console.error('Error al cargar categorías:', err);
      }
    };

    loadCategories();
  }, [reloadTrigger]);

  return (
    <div className="category-manager">
      <h1>Gestión de Categorías</h1>

      <div className="tabs">
        <button
          type="button"
          className={`tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          Ver Categorías
        </button>
        <button
          type="button"
          className={`tab ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          Añadir Categoría
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'list' ? (
          <CategoryList onReload={reloadCategories} />
        ) : (
          <AddCategory onCategoryAdded={handleCategoryAdded} />
        )}
      </div>
    </div>
  );
}
