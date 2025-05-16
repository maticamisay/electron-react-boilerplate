/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import {
  ProductService, Product,
  CategoryService, Category,
  SubcategoryService, Subcategory
} from './database/database';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

// Handler para obtener todos los productos
ipcMain.handle('get-all-products', async () => {
  try {
    const products = await ProductService.getAllProducts();
    return products;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }
});

// Handler para obtener un producto por ID
ipcMain.handle('get-product-by-id', async (_, id: string) => {
  try {
    const product = await ProductService.getProductById(id);
    return product;
  } catch (error) {
    console.error('Error al obtener producto por ID:', error);
    throw error;
  }
});

// Handler para añadir un nuevo producto
ipcMain.handle('add-product', async (_, product: Product) => {
  try {
    const newProduct = await ProductService.addProduct(product);
    return newProduct;
  } catch (error) {
    console.error('Error al añadir producto:', error);
    throw error;
  }
});

// Handler para actualizar un producto
ipcMain.handle('update-product', async (_, id: string, product: Partial<Product>) => {
  try {
    const updated = await ProductService.updateProduct(id, product);
    return updated;
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    throw error;
  }
});

// Handler para eliminar un producto
ipcMain.handle('delete-product', async (_, id: string) => {
  try {
    const deleted = await ProductService.deleteProduct(id);
    return deleted;
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    throw error;
  }
});

// Handlers para Categorías
ipcMain.handle('get-all-categories', async () => {
  try {
    const categories = await CategoryService.getAllCategories();
    return categories;
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    throw error;
  }
});

ipcMain.handle('get-category-by-id', async (_, id: string) => {
  try {
    const category = await CategoryService.getCategoryById(id);
    return category;
  } catch (error) {
    console.error('Error al obtener categoría por ID:', error);
    throw error;
  }
});

ipcMain.handle('add-category', async (_, category: Category) => {
  try {
    const newCategory = await CategoryService.addCategory(category);
    return newCategory;
  } catch (error) {
    console.error('Error al añadir categoría:', error);
    throw error;
  }
});

ipcMain.handle('update-category', async (_, id: string, category: Partial<Category>) => {
  try {
    const updated = await CategoryService.updateCategory(id, category);
    return updated;
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    throw error;
  }
});

ipcMain.handle('delete-category', async (_, id: string) => {
  try {
    const deleted = await CategoryService.deleteCategory(id);
    return deleted;
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    throw error;
  }
});

// Handlers para Subcategorías
ipcMain.handle('get-all-subcategories', async () => {
  try {
    const subcategories = await SubcategoryService.getAllSubcategories();
    return subcategories;
  } catch (error) {
    console.error('Error al obtener subcategorías:', error);
    throw error;
  }
});

ipcMain.handle('get-subcategories-by-category', async (_, categoryId: string) => {
  try {
    const subcategories = await SubcategoryService.getSubcategoriesByCategory(categoryId);
    return subcategories;
  } catch (error) {
    console.error('Error al obtener subcategorías por categoría:', error);
    throw error;
  }
});

ipcMain.handle('get-subcategory-by-id', async (_, id: string) => {
  try {
    const subcategory = await SubcategoryService.getSubcategoryById(id);
    return subcategory;
  } catch (error) {
    console.error('Error al obtener subcategoría por ID:', error);
    throw error;
  }
});

ipcMain.handle('add-subcategory', async (_, subcategory: Subcategory) => {
  try {
    const newSubcategory = await SubcategoryService.addSubcategory(subcategory);
    return newSubcategory;
  } catch (error) {
    console.error('Error al añadir subcategoría:', error);
    throw error;
  }
});

ipcMain.handle('update-subcategory', async (_, id: string, subcategory: Partial<Subcategory>) => {
  try {
    const updated = await SubcategoryService.updateSubcategory(id, subcategory);
    return updated;
  } catch (error) {
    console.error('Error al actualizar subcategoría:', error);
    throw error;
  }
});

ipcMain.handle('delete-subcategory', async (_, id: string) => {
  try {
    const deleted = await SubcategoryService.deleteSubcategory(id);
    return deleted;
  } catch (error) {
    console.error('Error al eliminar subcategoría:', error);
    throw error;
  }
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug').default();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
