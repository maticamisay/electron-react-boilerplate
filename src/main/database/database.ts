import Datastore from 'nedb';
import { app } from 'electron';
import path from 'path';

// Definir la interfaz para los productos
export interface Product {
  _id?: string;
  name: string;
  price: number;
  description?: string;
  stock: number;
  imageUrl?: string;
  category?: string;
  createdAt?: Date;
}

// Inicializar la base de datos
const dbPath = app.getPath('userData');

// Base de datos de productos
const productDb = new Datastore({
  filename: path.join(dbPath, 'products.db'),
  autoload: true,
});

// Crear índices para búsqueda más rápida
productDb.ensureIndex({ fieldName: 'name' });

export const ProductService = {
  // Obtener todos los productos
  getAllProducts(): Promise<Product[]> {
    return new Promise((resolve, reject) => {
      productDb.find({}).sort({ createdAt: -1 }).exec((err, products) => {
        if (err) reject(err);
        else resolve(products);
      });
    });
  },

  // Obtener un producto por ID
  getProductById(id: string): Promise<Product | null> {
    return new Promise((resolve, reject) => {
      productDb.findOne({ _id: id }, (err, product) => {
        if (err) reject(err);
        else resolve(product);
      });
    });
  },

  // Añadir un nuevo producto
  addProduct(product: Product): Promise<Product> {
    return new Promise((resolve, reject) => {
      const newProduct = {
        ...product,
        createdAt: new Date(),
      };
      productDb.insert(newProduct, (err, doc) => {
        if (err) reject(err);
        else resolve(doc);
      });
    });
  },

  // Actualizar un producto
  updateProduct(id: string, product: Partial<Product>): Promise<number> {
    return new Promise((resolve, reject) => {
      productDb.update({ _id: id }, { $set: product }, {}, (err, numReplaced) => {
        if (err) reject(err);
        else resolve(numReplaced);
      });
    });
  },

  // Eliminar un producto
  deleteProduct(id: string): Promise<number> {
    return new Promise((resolve, reject) => {
      productDb.remove({ _id: id }, {}, (err, numRemoved) => {
        if (err) reject(err);
        else resolve(numRemoved);
      });
    });
  },
};
