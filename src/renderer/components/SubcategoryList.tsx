import { useState, useEffect } from 'react';
import { Subcategory, Category } from '../../main/database/database';

interface SubcategoryListProps {
  categoryId: string;
  onReload?: () => void;
}

export default function SubcategoryList({ categoryId, onReload }: SubcategoryListProps) {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Subcategory>>({});

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const result = await window.electron.categoryAPI.getCategoryById(categoryId);
        setCategory(result);
      } catch (err) {
        console.error('Error al cargar categoría:', err);
      }
    };

    const loadSubcategories = async () => {
      try {
        setLoading(true);
        const result = await window.electron.subcategoryAPI.getSubcategoriesByCategory(categoryId);
        setSubcategories(result);
        setError(null);
      } catch (err) {
        setError('Error al cargar subcategorías: ' + err);
        console.error('Error al cargar subcategorías:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCategory();
    loadSubcategories();
  }, [categoryId]);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar la subcategoría "${name}"?`)) {
      try {
        await window.electron.subcategoryAPI.deleteSubcategory(id);
        setSubcategories(subcategories.filter(s => s._id !== id));
        if (onReload) onReload();
      } catch (err) {
        console.error('Error al eliminar subcategoría:', err);
        alert('Error al eliminar la subcategoría');
      }
    }
  };

  const handleEdit = (subcategory: Subcategory) => {
    setEditingId(subcategory._id || null);
    setEditForm({
      name: subcategory.name,
      description: subcategory.description,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editForm.name) return;

    try {
      await window.electron.subcategoryAPI.updateSubcategory(editingId, {
        ...editForm,
        categoryId, // Mantener la misma categoría
      });

      // Actualizar la lista local
      setSubcategories(
        subcategories.map(sub =>
          sub._id === editingId
            ? { ...sub, ...editForm }
            : sub
        )
      );

      setEditingId(null);
      setEditForm({});
      if (onReload) onReload();
    } catch (err) {
      console.error('Error al actualizar subcategoría:', err);
      alert('Error al guardar los cambios');
    }
  };

  if (loading) return <div>Cargando subcategorías...</div>;
  if (error) return <div>Error: {error}</div>;
  if (subcategories.length === 0) return (
    <div>
      No hay subcategorías para {category?.name || 'esta categoría'}. ¡Añade algunas!
    </div>
  );

  return (
    <div className="subcategory-list">
      <h2>Subcategorías de {category?.name || 'la categoría seleccionada'}</h2>
      <table className="subcategory-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {subcategories.map((subcategory) => (
            <tr key={subcategory._id}>
              <td>
                {editingId === subcategory._id ? (
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                ) : (
                  subcategory.name
                )}
              </td>
              <td>
                {editingId === subcategory._id ? (
                  <input
                    type="text"
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                ) : (
                  subcategory.description || '-'
                )}
              </td>
              <td>
                {editingId === subcategory._id ? (
                  <>
                    <button className="save-btn" onClick={handleSaveEdit}>Guardar</button>
                    <button className="cancel-btn" onClick={handleCancelEdit}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(subcategory)}
                    >
                      Editar
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(subcategory._id!, subcategory.name)}
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
