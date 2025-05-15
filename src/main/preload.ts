// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import type { Product } from './database/database';

export type Channels = 'ipc-example';

interface ProductAPI {
  getAllProducts: () => Promise<Product[]>;
  getProductById: (id: string) => Promise<Product | null>;
  addProduct: (product: Product) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<number>;
  deleteProduct: (id: string) => Promise<number>;
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
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
