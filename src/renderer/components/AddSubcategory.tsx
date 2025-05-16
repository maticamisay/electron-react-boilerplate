import { useState, useEffect } from 'react';
import { Category, Subcategory } from '../../main/database/database';

interface AddSubcategoryProps {
  categoryId: string;
  onSubcategoryAdded?: (subcategory: Subcategory) => void;
}

export default function AddSubcategory({ categoryId, onSubcategoryAdded }: AddSubcategoryProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const result = await window.electron.categoryAPI.getCategoryById(categoryId);
        setCategory(result);
      } catch (err) {
        console.error('Error al cargar categoría:', err);
        setError('Error al cargar información de la categoría');
      }
    };

    loadCategory();
  }, [categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!name.trim()) {
      setError('El nombre de la subcategoría es obligatorio');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const newSubcategory: Subcategory = {
        name: name.trim(),
        description: description.trim() || undefined,
        categoryId,
      };

      const savedSubcategory = await window.electron.subcategoryAPI.addSubcategory(newSubcategory);

      // Limpiar el formulario
      setName('');
      setDescription('');

      // Notificar que se añadió una subcategoría
      if (onSubcategoryAdded) {
        onSubcategoryAdded(savedSubcategory);
      }

      alert(`Subcategoría "${savedSubcategory.name}" añadida correctamente a ${category?.name || 'la categoría'}`);

    } catch (err) {
      console.error('Error al guardar subcategoría:', err);
      setError(`Error al guardar subcategoría: ${err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-subcategory">
      <h2>Añadir Nueva Subcategoría a {category?.name || 'la categoría seleccionada'}</h2>

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
          {isSubmitting ? 'Guardando...' : 'Guardar Subcategoría'}
        </button>
      </form>
    </div>
  );
}
