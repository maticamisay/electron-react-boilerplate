import { useState, useEffect } from 'react';
import { Product, Category, Subcategory } from '../../main/database/database';

interface AddProductProps {
  onProductAdded?: (product: Product) => void;
}

export default function AddProduct({ onProductAdded }: AddProductProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Cargar subcategorías cuando cambia la categoría
  useEffect(() => {
    const loadSubcategories = async () => {
      if (!categoryId) {
        setSubcategories([]);
        return;
      }

      try {
        const result = await window.electron.subcategoryAPI.getSubcategoriesByCategory(categoryId);
        setSubcategories(result);
        setSubcategoryId(''); // Resetear subcategoría cuando cambia la categoría
      } catch (err) {
        console.error('Error al cargar subcategorías:', err);
      }
    };

    loadSubcategories();
  }, [categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!name.trim()) {
      setError('El nombre del producto es obligatorio');
      return;
    }

    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) {
      setError('El precio debe ser un número positivo');
      return;
    }

    if (!stock.trim() || isNaN(Number(stock)) || Number(stock) < 0) {
      setError('El stock debe ser un número positivo o cero');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Obtener nombres de categoría/subcategoría para mostrar
      let categoryName = '';
      if (categoryId) {
        const category = categories.find(c => c._id === categoryId);
        if (category) categoryName = category.name;
      }

      const newProduct: Product = {
        name: name.trim(),
        price: Number(price),
        description: description.trim() || undefined,
        stock: Number(stock),
        categoryId: categoryId || undefined,
        subcategoryId: subcategoryId || undefined,
        category: categoryName || undefined,
      };

      const savedProduct = await window.electron.productAPI.addProduct(newProduct);

      // Limpiar el formulario
      setName('');
      setPrice('');
      setDescription('');
      setStock('');
      setCategoryId('');
      setSubcategoryId('');

      // Notificar que se añadió un producto
      if (onProductAdded) {
        onProductAdded(savedProduct);
      }

      alert(`Producto "${savedProduct.name}" añadido correctamente`);

    } catch (err) {
      console.error('Error al guardar producto:', err);
      setError(`Error al guardar producto: ${err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Obtener el nombre de la categoría
  const getCategoryName = (id: string) => {
    const category = categories.find(c => c._id === id);
    return category ? category.name : '';
  };

  // Obtener el nombre de la subcategoría
  const getSubcategoryName = (id: string) => {
    const subcategory = subcategories.find(s => s._id === id);
    return subcategory ? subcategory.name : '';
  };

  return (
    <div className="add-product">
      <h2>Añadir Nuevo Producto</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nombre*:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Precio*:</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
            step="0.01"
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="stock">Stock*:</label>
          <input
            type="number"
            id="stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            min="0"
            step="1"
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Categoría:</label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="">Seleccione una categoría</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {categoryId && subcategories.length > 0 && (
          <div className="form-group">
            <label htmlFor="subcategory">Subcategoría:</label>
            <select
              id="subcategory"
              value={subcategoryId}
              onChange={(e) => setSubcategoryId(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="">Seleccione una subcategoría</option>
              {subcategories.map(subcategory => (
                <option key={subcategory._id} value={subcategory._id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="description">Descripción:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="submit-btn"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
        </button>
      </form>
    </div>
  );
}
