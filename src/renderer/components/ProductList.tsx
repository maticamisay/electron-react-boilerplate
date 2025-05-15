import { useState, useEffect } from 'react';
import { Product } from '../../main/database/database';

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>{product.name}</td>
              <td>${product.price.toFixed(2)}</td>
              <td>{product.stock}</td>
              <td>{product.category || 'Sin categoría'}</td>
              <td>
                <button className="view-btn">Ver</button>
                <button className="edit-btn">Editar</button>
                <button
                  className="delete-btn"
                  onClick={() => {
                    if (window.confirm(`¿Estás seguro de eliminar ${product.name}?`)) {
                      window.electron.productAPI
                        .deleteProduct(product._id!)
                        .then(() => {
                          setProducts(products.filter(p => p._id !== product._id));
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
