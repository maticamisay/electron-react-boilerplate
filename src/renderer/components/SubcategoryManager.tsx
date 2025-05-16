import { useState, useEffect } from 'react';
import { Category, Subcategory } from '../../main/database/database';
import SubcategoryList from './SubcategoryList';
import AddSubcategory from './AddSubcategory';

export default function SubcategoryManager() {
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const reloadSubcategories = () => {
    setReloadTrigger(prev => prev + 1);
  };

  const handleSubcategoryAdded = (subcategory: Subcategory) => {
    setSubcategories(prev => [subcategory, ...prev]);
    setActiveTab('list');
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await window.electron.categoryAPI.getAllCategories();
        setCategories(result);
        if (result.length > 0 && !selectedCategoryId) {
          setSelectedCategoryId(result[0]._id || null);
        }
      } catch (err) {
        console.error('Error al cargar categorías:', err);
      }
    };

    loadCategories();
  }, [selectedCategoryId]);

  useEffect(() => {
    const loadSubcategories = async () => {
      if (!selectedCategoryId) return;

      try {
        const result = await window.electron.subcategoryAPI.getSubcategoriesByCategory(selectedCategoryId);
        setSubcategories(result);
      } catch (err) {
        console.error('Error al cargar subcategorías:', err);
      }
    };

    loadSubcategories();
  }, [selectedCategoryId, reloadTrigger]);

  return (
    <div className="subcategory-manager">
      <h1>Gestión de Subcategorías</h1>

      <div className="category-selector">
        <label htmlFor="category-select">Seleccionar Categoría:</label>
        <select
          id="category-select"
          value={selectedCategoryId || ''}
          onChange={(e) => setSelectedCategoryId(e.target.value || null)}
        >
          <option value="">Seleccione una categoría</option>
          {categories.map(category => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCategoryId && (
        <>
          <div className="tabs">
            <button
              type="button"
              className={`tab ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => setActiveTab('list')}
            >
              Ver Subcategorías
            </button>
            <button
              type="button"
              className={`tab ${activeTab === 'add' ? 'active' : ''}`}
              onClick={() => setActiveTab('add')}
            >
              Añadir Subcategoría
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'list' ? (
              <SubcategoryList
                categoryId={selectedCategoryId}
                onReload={reloadSubcategories}
              />
            ) : (
              <AddSubcategory
                categoryId={selectedCategoryId}
                onSubcategoryAdded={handleSubcategoryAdded}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
