// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import type { Product, Category, Subcategory } from './database/database';

export type Channels = 'ipc-example';

interface ProductAPI {
  getAllProducts: () => Promise<Product[]>;
  getProductById: (id: string) => Promise<Product | null>;
  addProduct: (product: Product) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<number>;
  deleteProduct: (id: string) => Promise<number>;
}

interface CategoryAPI {
  getAllCategories: () => Promise<Category[]>;
  getCategoryById: (id: string) => Promise<Category | null>;
  addCategory: (category: Category) => Promise<Category>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<number>;
  deleteCategory: (id: string) => Promise<number>;
}

interface SubcategoryAPI {
  getAllSubcategories: () => Promise<Subcategory[]>;
  getSubcategoriesByCategory: (categoryId: string) => Promise<Subcategory[]>;
  getSubcategoryById: (id: string) => Promise<Subcategory | null>;
  addSubcategory: (subcategory: Subcategory) => Promise<Subcategory>;
  updateSubcategory: (id: string, subcategory: Partial<Subcategory>) => Promise<number>;
  deleteSubcategory: (id: string) => Promise<number>;
}

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  // Añadir API para productos
  productAPI: {
    getAllProducts(): Promise<Product[]> {
      return ipcRenderer.invoke('get-all-products');
    },
    getProductById(id: string): Promise<Product | null> {
      return ipcRenderer.invoke('get-product-by-id', id);
    },
    addProduct(product: Product): Promise<Product> {
      return ipcRenderer.invoke('add-product', product);
    },
    updateProduct(id: string, product: Partial<Product>): Promise<number> {
      return ipcRenderer.invoke('update-product', id, product);
    },
    deleteProduct(id: string): Promise<number> {
      return ipcRenderer.invoke('delete-product', id);
    },
  },
  // API para categorías
  categoryAPI: {
    getAllCategories(): Promise<Category[]> {
      return ipcRenderer.invoke('get-all-categories');
    },
    getCategoryById(id: string): Promise<Category | null> {
      return ipcRenderer.invoke('get-category-by-id', id);
    },
    addCategory(category: Category): Promise<Category> {
      return ipcRenderer.invoke('add-category', category);
    },
    updateCategory(id: string, category: Partial<Category>): Promise<number> {
      return ipcRenderer.invoke('update-category', id, category);
    },
    deleteCategory(id: string): Promise<number> {
      return ipcRenderer.invoke('delete-category', id);
    },
  },
  // API para subcategorías
  subcategoryAPI: {
    getAllSubcategories(): Promise<Subcategory[]> {
      return ipcRenderer.invoke('get-all-subcategories');
    },
    getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
      return ipcRenderer.invoke('get-subcategories-by-category', categoryId);
    },
    getSubcategoryById(id: string): Promise<Subcategory | null> {
      return ipcRenderer.invoke('get-subcategory-by-id', id);
    },
    addSubcategory(subcategory: Subcategory): Promise<Subcategory> {
      return ipcRenderer.invoke('add-subcategory', subcategory);
    },
    updateSubcategory(id: string, subcategory: Partial<Subcategory>): Promise<number> {
      return ipcRenderer.invoke('update-subcategory', id, subcategory);
    },
    deleteSubcategory(id: string): Promise<number> {
      return ipcRenderer.invoke('delete-subcategory', id);
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
