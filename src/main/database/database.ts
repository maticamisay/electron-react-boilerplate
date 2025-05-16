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
  categoryId?: string;
  subcategoryId?: string;
  createdAt?: Date;
}

// Definir interfaz para categorías
export interface Category {
  _id?: string;
  name: string;
  description?: string;
  createdAt?: Date;
}

// Definir interfaz para subcategorías
export interface Subcategory {
  _id?: string;
  name: string;
  description?: string;
  categoryId: string;
  createdAt?: Date;
}

// Inicializar la base de datos
const dbPath = app.getPath('userData');

// Base de datos de productos
const productDb = new Datastore({
  filename: path.join(dbPath, 'products.db'),
  autoload: true,
});

// Base de datos de categorías
const categoryDb = new Datastore({
  filename: path.join(dbPath, 'categories.db'),
  autoload: true,
});

// Base de datos de subcategorías
const subcategoryDb = new Datastore({
  filename: path.join(dbPath, 'subcategories.db'),
  autoload: true,
});

// Crear índices para búsqueda más rápida
productDb.ensureIndex({ fieldName: 'name' });
categoryDb.ensureIndex({ fieldName: 'name' });
subcategoryDb.ensureIndex({ fieldName: 'name' });
subcategoryDb.ensureIndex({ fieldName: 'categoryId' });

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

export const CategoryService = {
  // Obtener todas las categorías
  getAllCategories(): Promise<Category[]> {
    return new Promise((resolve, reject) => {
      categoryDb.find({}).sort({ name: 1 }).exec((err, categories) => {
        if (err) reject(err);
        else resolve(categories);
      });
    });
  },

  // Obtener una categoría por ID
  getCategoryById(id: string): Promise<Category | null> {
    return new Promise((resolve, reject) => {
      categoryDb.findOne({ _id: id }, (err, category) => {
        if (err) reject(err);
        else resolve(category);
      });
    });
  },

  // Añadir una nueva categoría
  addCategory(category: Category): Promise<Category> {
    return new Promise((resolve, reject) => {
      const newCategory = {
        ...category,
        createdAt: new Date(),
      };
      categoryDb.insert(newCategory, (err, doc) => {
        if (err) reject(err);
        else resolve(doc);
      });
    });
  },

  // Actualizar una categoría
  updateCategory(id: string, category: Partial<Category>): Promise<number> {
    return new Promise((resolve, reject) => {
      categoryDb.update({ _id: id }, { $set: category }, {}, (err, numReplaced) => {
        if (err) reject(err);
        else resolve(numReplaced);
      });
    });
  },

  // Eliminar una categoría
  deleteCategory(id: string): Promise<number> {
    return new Promise((resolve, reject) => {
      categoryDb.remove({ _id: id }, {}, (err, numRemoved) => {
        if (err) reject(err);
        else resolve(numRemoved);
      });
    });
  },
};

export const SubcategoryService = {
  // Obtener todas las subcategorías
  getAllSubcategories(): Promise<Subcategory[]> {
    return new Promise((resolve, reject) => {
      subcategoryDb.find({}).sort({ name: 1 }).exec((err, subcategories) => {
        if (err) reject(err);
        else resolve(subcategories);
      });
    });
  },

  // Obtener subcategorías por categoría
  getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
    return new Promise((resolve, reject) => {
      subcategoryDb.find({ categoryId }).sort({ name: 1 }).exec((err, subcategories) => {
        if (err) reject(err);
        else resolve(subcategories);
      });
    });
  },

  // Obtener una subcategoría por ID
  getSubcategoryById(id: string): Promise<Subcategory | null> {
    return new Promise((resolve, reject) => {
      subcategoryDb.findOne({ _id: id }, (err, subcategory) => {
        if (err) reject(err);
        else resolve(subcategory);
      });
    });
  },

  // Añadir una nueva subcategoría
  addSubcategory(subcategory: Subcategory): Promise<Subcategory> {
    return new Promise((resolve, reject) => {
      const newSubcategory = {
        ...subcategory,
        createdAt: new Date(),
      };
      subcategoryDb.insert(newSubcategory, (err, doc) => {
        if (err) reject(err);
        else resolve(doc);
      });
    });
  },

  // Actualizar una subcategoría
  updateSubcategory(id: string, subcategory: Partial<Subcategory>): Promise<number> {
    return new Promise((resolve, reject) => {
      subcategoryDb.update({ _id: id }, { $set: subcategory }, {}, (err, numReplaced) => {
        if (err) reject(err);
        else resolve(numReplaced);
      });
    });
  },

  // Eliminar una subcategoría
  deleteSubcategory(id: string): Promise<number> {
    return new Promise((resolve, reject) => {
      subcategoryDb.remove({ _id: id }, {}, (err, numRemoved) => {
        if (err) reject(err);
        else resolve(numRemoved);
      });
    });
  },
}
