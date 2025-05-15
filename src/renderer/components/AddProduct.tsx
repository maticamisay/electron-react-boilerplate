import { useState } from 'react';
import { Product } from '../../main/database/database';

interface AddProductProps {
  onProductAdded?: (product: Product) => void;
}

export default function AddProduct({ onProductAdded }: AddProductProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      const newProduct: Product = {
        name: name.trim(),
        price: Number(price),
        description: description.trim() || undefined,
        stock: Number(stock),
        category: category.trim() || undefined,
      };

      const savedProduct = await window.electron.productAPI.addProduct(newProduct);

      // Limpiar el formulario
      setName('');
      setPrice('');
      setDescription('');
      setStock('');
      setCategory('');

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
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

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
