import { useState, useEffect } from 'react';
import { Category } from '../../main/database/database';

interface CategoryListProps {
  onReload?: () => void;
}

export default function CategoryList({ onReload }: CategoryListProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Category>>({});

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const result = await window.electron.categoryAPI.getAllCategories();
        setCategories(result);
        setError(null);
      } catch (err) {
        setError('Error al cargar categorías: ' + err);
        console.error('Error al cargar categorías:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar la categoría "${name}"?`)) {
      try {
        await window.electron.categoryAPI.deleteCategory(id);
        setCategories(categories.filter(c => c._id !== id));
        if (onReload) onReload();
      } catch (err) {
        console.error('Error al eliminar categoría:', err);
        alert('Error al eliminar la categoría');
      }
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category._id || null);
    setEditForm({
      name: category.name,
      description: category.description,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editForm.name) return;

    try {
      await window.electron.categoryAPI.updateCategory(editingId, editForm);

      // Actualizar la lista local
      setCategories(
        categories.map(cat =>
          cat._id === editingId
            ? { ...cat, ...editForm }
            : cat
        )
      );

      setEditingId(null);
      setEditForm({});
      if (onReload) onReload();
    } catch (err) {
      console.error('Error al actualizar categoría:', err);
      alert('Error al guardar los cambios');
    }
  };

  if (loading) return <div>Cargando categorías...</div>;
  if (error) return <div>Error: {error}</div>;
  if (categories.length === 0) return <div>No hay categorías. ¡Añade algunas!</div>;

  return (
    <div className="category-list">
      <h2>Lista de Categorías</h2>
      <table className="category-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category._id}>
              <td>
                {editingId === category._id ? (
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                ) : (
                  category.name
                )}
              </td>
              <td>
                {editingId === category._id ? (
                  <input
                    type="text"
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                ) : (
                  category.description || '-'
                )}
              </td>
              <td>
                {editingId === category._id ? (
                  <>
                    <button className="save-btn" onClick={handleSaveEdit}>Guardar</button>
                    <button className="cancel-btn" onClick={handleCancelEdit}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(category)}
                    >
                      Editar
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(category._id!, category.name)}
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
