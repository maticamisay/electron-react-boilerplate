import { useState, useEffect } from 'react';
import { Product, Category, Subcategory } from '../../main/database/database';

interface ProductListProps {
  onReload?: () => void;
}

export default function ProductList({ onReload }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [productSubcategories, setProductSubcategories] = useState<Subcategory[]>([]);

  // Cargar productos
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const result = await window.electron.productAPI.getAllProducts();
        setProducts(result);
        setError(null);
      } catch (err) {
        setError('Error al cargar productos: ' + err);
        console.error('Error al cargar productos:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Cargar categorías
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
  }, []);

  // Cargar todas las subcategorías
  useEffect(() => {
    const loadSubcategories = async () => {
      try {
        const result = await window.electron.subcategoryAPI.getAllSubcategories();
        setSubcategories(result);
      } catch (err) {
        console.error('Error al cargar subcategorías:', err);
      }
    };

    loadSubcategories();
  }, []);

  // Cargar subcategorías específicas para el producto en edición
  useEffect(() => {
    const loadProductSubcategories = async () => {
      if (!editForm.categoryId) {
        setProductSubcategories([]);
        return;
      }

      try {
        const result = await window.electron.subcategoryAPI.getSubcategoriesByCategory(editForm.categoryId);
        setProductSubcategories(result);
      } catch (err) {
        console.error('Error al cargar subcategorías del producto:', err);
      }
    };

    loadProductSubcategories();
  }, [editForm.categoryId]);

  const handleEdit = (product: Product) => {
    setEditingId(product._id || null);
    setEditForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description,
      categoryId: product.categoryId || '',
      subcategoryId: product.subcategoryId || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editForm.name || !editForm.price) return;

    try {
      // Obtener nombre de categoría seleccionada
      let categoryName = '';
      if (editForm.categoryId) {
        const category = categories.find(c => c._id === editForm.categoryId);
        if (category) categoryName = category.name;
      }

      const productToUpdate = {
        ...editForm,
        category: categoryName || undefined,
      };

      await window.electron.productAPI.updateProduct(editingId, productToUpdate);

      // Actualizar la lista local
      setProducts(
        products.map(prod =>
          prod._id === editingId
            ? { ...prod, ...productToUpdate }
            : prod
        )
      );

      setEditingId(null);
      setEditForm({});
      if (onReload) onReload();
    } catch (err) {
      console.error('Error al actualizar producto:', err);
      alert('Error al guardar los cambios');
    }
  };

  // Obtener el nombre de la categoría
  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'Sin categoría';
    const category = categories.find(c => c._id === categoryId);
    return category ? category.name : 'Sin categoría';
  };

  // Obtener el nombre de la subcategoría
  const getSubcategoryName = (subcategoryId?: string) => {
    if (!subcategoryId) return '';
    const subcategory = subcategories.find(s => s._id === subcategoryId);
    return subcategory ? subcategory.name : '';
  };

  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div>Error: {error}</div>;
  if (products.length === 0) return <div>No hay productos. ¡Añade algunos!</div>;

  return (
    <div className="product-list">
      <h2>Lista de Productos</h2>
      <table className="product-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Categoría</th>
            <th>Subcategoría</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>
                {editingId === product._id ? (
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                ) : (
                  product.name
                )}
              </td>
              <td>
                {editingId === product._id ? (
                  <input
                    type="number"
                    value={editForm.price || ''}
                    onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                    min="0"
                    step="0.01"
                    required
                  />
                ) : (
                  `$${product.price.toFixed(2)}`
                )}
              </td>
              <td>
                {editingId === product._id ? (
                  <input
                    type="number"
                    value={editForm.stock || ''}
                    onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })}
                    min="0"
                    step="1"
                    required
                  />
                ) : (
                  product.stock
                )}
              </td>
              <td>
                {editingId === product._id ? (
                  <select
                    value={editForm.categoryId || ''}
                    onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value, subcategoryId: '' })}
                  >
                    <option value="">Sin categoría</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  getCategoryName(product.categoryId)
                )}
              </td>
              <td>
                {editingId === product._id ? (
                  editForm.categoryId ? (
                    <select
                      value={editForm.subcategoryId || ''}
                      onChange={(e) => setEditForm({ ...editForm, subcategoryId: e.target.value })}
                    >
                      <option value="">Sin subcategoría</option>
                      {productSubcategories.map(subcategory => (
                        <option key={subcategory._id} value={subcategory._id}>
                          {subcategory.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span>Seleccione una categoría primero</span>
                  )
                ) : (
                  getSubcategoryName(product.subcategoryId)
                )}
              </td>
              <td>
                {editingId === product._id ? (
                  <>
                    <button className="save-btn" onClick={handleSaveEdit}>Guardar</button>
                    <button className="cancel-btn" onClick={handleCancelEdit}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(product)}
                    >
                      Editar
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => {
                        if (window.confirm(`¿Estás seguro de eliminar ${product.name}?`)) {
                          window.electron.productAPI
                            .deleteProduct(product._id!)
                            .then(() => {
                              setProducts(products.filter(p => p._id !== product._id));
                              if (onReload) onReload();
                            })
                            .catch(err => {
                              console.error('Error al eliminar:', err);
                              alert('Error al eliminar producto');
                            });
                        }
                      }}
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
