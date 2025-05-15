import { ElectronHandler } from '../main/preload';
import { Product } from '../main/database/database';

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    electron: ElectronHandler & {
      productAPI: {
        getAllProducts(): Promise<Product[]>;
        getProductById(id: string): Promise<Product | null>;
        addProduct(product: Product): Promise<Product>;
        updateProduct(id: string, product: Partial<Product>): Promise<number>;
        deleteProduct(id: string): Promise<number>;
      };
    };
  }
}

export {};
