import { useState } from 'react';
import { Category } from '../../main/database/database';

interface AddCategoryProps {
  onCategoryAdded?: (category: Category) => void;
}

export default function AddCategory({ onCategoryAdded }: AddCategoryProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!name.trim()) {
      setError('El nombre de la categoría es obligatorio');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const newCategory: Category = {
        name: name.trim(),
        description: description.trim() || undefined,
      };

      const savedCategory = await window.electron.categoryAPI.addCategory(newCategory);

      // Limpiar el formulario
      setName('');
      setDescription('');

      // Notificar que se añadió una categoría
      if (onCategoryAdded) {
        onCategoryAdded(savedCategory);
      }

      alert(`Categoría "${savedCategory.name}" añadida correctamente`);

    } catch (err) {
      console.error('Error al guardar categoría:', err);
      setError(`Error al guardar categoría: ${err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-category">
      <h2>Añadir Nueva Categoría</h2>

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
          {isSubmitting ? 'Guardando...' : 'Guardar Categoría'}
        </button>
      </form>
    </div>
  );
}
