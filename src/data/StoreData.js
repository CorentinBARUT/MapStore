/**
 * Gestion des données des magasins, rayons et produits.
 * Rôle : Centralise les données de l'application (magasins, rayons, produits, étages, catégories) avec persistance dans localStorage.
 */
const STORAGE_KEY = 'storeData';

// Initialisation des données : charger depuis localStorage ou créer un magasin par défaut
let storeData = {
  stores: [],
  products: [],
  categories: [],
  shelfTemplates: [],
};

// Charger les données depuis localStorage au démarrage
function loadFromLocalStorage() {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    try {
      storeData = JSON.parse(savedData);
      console.log('Data loaded from localStorage:', storeData);
    } catch (error) {
      console.error('Error parsing localStorage data:', error);
      // Réinitialiser à l'état par défaut en cas d'erreur
      storeData = {
        stores: [],
        products: [],
        categories: [],
        shelfTemplates: [],
      };
    }
  }
  ensureDefaultStore();
}

// Sauvegarder les données dans localStorage
function saveToLocalStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storeData));
    console.log('Data saved to localStorage:', storeData);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

// Initialiser un magasin par défaut si aucun n'existe
export function ensureDefaultStore() {
  if (storeData.stores.length === 0) {
    storeData.stores.push({
      id: 1,
      name: "Magasin par défaut",
      floors: [{ id: 1, name: "Étage 1", layout: [], shelves: [] }],
    });
    console.log('Default store initialized:', storeData.stores);
    saveToLocalStorage();
  }
}

// Charger les données au démarrage
loadFromLocalStorage();

export function addStore(store) {
  storeData.stores.push({
    id: storeData.stores.length + 1,
    name: store.name,
    floors: [{ id: 1, name: "Étage 1", layout: [], shelves: [] }],
  });
  console.log('Store added:', storeData.stores);
  saveToLocalStorage();
}

export function getStores() {
  return storeData.stores;
}

export function getShelfTemplates() {
  return storeData.shelfTemplates;
}

export function addShelf(storeId, shelf) {
  let templateId = shelf.templateId;
  
  // Ajouter un nouveau modèle uniquement si aucun templateId n'est fourni
  if (!templateId) {
    const template = {
      id: Date.now(),
      name: shelf.name,
      length: shelf.length,
      depth: shelf.depth,
      height: shelf.height,
      floors: shelf.floors || 1,
      type: shelf.type,
    };
    storeData.shelfTemplates.push(template);
    templateId = template.id;
    console.log('Shelf template added:', template);
  } else {
    console.log('Using existing shelf template:', templateId);
  }

  // Si le rayon est placé, l'ajouter aux rayons placés
  if (shelf.isPlaced) {
    const store = storeData.stores.find((s) => s.id === storeId);
    if (store) {
      let floor = store.floors.find((f) => f.id === shelf.floor);
      if (!floor) {
        floor = { id: shelf.floor, name: `Étage ${shelf.floor}`, layout: [], shelves: [] };
        store.floors.push(floor);
      }
      const newShelf = {
        id: Date.now() + Math.random(), // ID unique
        templateId: templateId,
        name: shelf.name,
        mapName: shelf.mapName || shelf.name,
        length: shelf.length,
        depth: shelf.depth,
        height: shelf.height,
        floors: shelf.floors || 1,
        type: shelf.type,
        products: shelf.products || [],
        position: shelf.position || { x: 50, y: 50 },
        rotation: shelf.rotation || 0,
        isPlaced: true,
      };
      floor.shelves.push(newShelf);
      console.log('Shelf instance added to store', storeId, 'floor', shelf.floor, ':', newShelf);
    } else {
      console.error('Store not found:', storeId);
    }
  }
  saveToLocalStorage();
}

export function updateShelf(storeId, floorId, shelfId, updatedShelf) {
  const store = storeData.stores.find((s) => s.id === storeId);
  if (store) {
    const floor = store.floors.find((f) => f.id === floorId);
    if (floor) {
      const shelfIndex = floor.shelves.findIndex((s) => s.id === shelfId);
      if (shelfIndex !== -1) {
        floor.shelves[shelfIndex] = {
          ...floor.shelves[shelfIndex],
          name: updatedShelf.name,
          mapName: updatedShelf.mapName || updatedShelf.name,
          length: updatedShelf.length,
          depth: updatedShelf.depth,
          height: updatedShelf.height,
          floors: updatedShelf.floors || 1,
          type: updatedShelf.type,
          position: updatedShelf.position || floor.shelves[shelfIndex].position,
          rotation: updatedShelf.rotation || floor.shelves[shelfIndex].rotation || 0,
          isPlaced: updatedShelf.isPlaced !== undefined ? updatedShelf.isPlaced : floor.shelves[shelfIndex].isPlaced,
          products: updatedShelf.products || floor.shelves[shelfIndex].products || [],
        };
        console.log('Shelf instance updated in store', storeId, 'floor', floorId, ':', floor.shelves[shelfIndex]);
      } else {
        console.error('Shelf instance not found:', shelfId);
      }
    } else {
      console.error('Floor not found:', floorId);
    }
  } else {
    console.error('Store not found:', storeId);
  }
  saveToLocalStorage();
}

export function updateTemplate(templateId, updatedTemplate, updateAllInstances = false) {
  const templateIndex = storeData.shelfTemplates.findIndex((t) => t.id === templateId);
  if (templateIndex !== -1) {
    storeData.shelfTemplates[templateIndex] = {
      ...storeData.shelfTemplates[templateIndex],
      name: updatedTemplate.name,
      length: updatedTemplate.length,
      depth: updatedTemplate.depth,
      height: updatedTemplate.height,
      floors: updatedTemplate.floors || 1,
      type: updatedTemplate.type,
    };
    console.log('Shelf template updated:', storeData.shelfTemplates[templateIndex]);
    if (updateAllInstances) {
      let updatedCount = 0;
      storeData.stores.forEach((store) => {
        store.floors.forEach((floor) => {
          floor.shelves.forEach((shelf, index) => {
            if (shelf.templateId === templateId) {
              floor.shelves[index] = {
                ...shelf,
                name: updatedTemplate.name,
                length: updatedTemplate.length,
                depth: updatedTemplate.depth,
                height: updatedTemplate.height,
                floors: updatedTemplate.floors || 1,
                type: updatedTemplate.type,
                // Conserver position, rotation, mapName et products
              };
              updatedCount++;
            }
          });
        });
      });
      console.log(`Updated ${updatedCount} shelf instances for template ${templateId}`);
    }
  } else {
    console.error('Shelf template not found:', templateId);
  }
  saveToLocalStorage();
}

export function deleteShelf(storeId, floorId, shelfId) {
  const store = storeData.stores.find((s) => s.id === storeId);
  if (store) {
    const floor = store.floors.find((f) => f.id === floorId);
    if (floor) {
      floor.shelves = floor.shelves.filter((s) => s.id !== shelfId);
      console.log('Shelf instance deleted from store', storeId, 'floor', floorId, ':', floor.shelves);
    } else {
      console.error('Floor not found:', floorId);
    }
  } else {
    console.error('Store not{MPa found:', storeId);
  }
  saveToLocalStorage();
}

export function deleteTemplate(templateId) {
  storeData.shelfTemplates = storeData.shelfTemplates.filter((t) => t.id !== templateId);
  console.log('Shelf template deleted:', storeData.shelfTemplates);
  saveToLocalStorage();
}

export function updateShelfPosition(storeId, floorId, shelfId, position) {
  const store = storeData.stores.find((s) => s.id === storeId);
  if (store) {
    const floor = store.floors.find((f) => f.id === floorId);
    if (floor) {
      const shelf = floor.shelves.find((s) => s.id === shelfId);
      if (shelf) {
        shelf.position = position;
        console.log('Shelf position updated in store', storeId, 'floor', floorId, ':', shelf);
      } else {
        console.error('Shelf not found:', shelfId);
      }
    } else {
      console.error('Floor not found:', floorId);
    }
  } else {
    console.error('Store not found:', storeId);
  }
  saveToLocalStorage();
}

export function updateShelfRotation(storeId, floorId, shelfId, rotation) {
  const store = storeData.stores.find((s) => s.id === storeId);
  if (store) {
    const floor = store.floors.find((f) => f.id === floorId);
    if (floor) {
      const shelf = floor.shelves.find((s) => s.id === shelfId);
      if (shelf) {
        shelf.rotation = rotation;
        console.log('Shelf rotation updated in store', storeId, 'floor', floorId, ':', shelf);
      } else {
        console.error('Shelf not found:', shelfId);
      }
    } else {
      console.error('Floor not found:', floorId);
    }
  } else {
    console.error('Store not found:', storeId);
  }
  saveToLocalStorage();
}

export function addProduct(storeId, floorId, product) {
  const store = storeData.stores.find((s) => s.id === storeId);
  if (store) {
    const floor = store.floors.find((f) => f.id === floorId);
    if (floor) {
      const shelf = floor.shelves.find((s) => s.id === product.shelfId);
      if (shelf) {
        const globalProduct = storeData.products.find((p) => p.name === product.name);
        if (!globalProduct) {
          console.error('Global product not found:', product.name);
          return;
        }
        console.log('Adding product to shelf:', shelf.id, 'store floor:', floorId, 'shelf floors:', shelf.floors, 'product shelf floor:', product.floor);
        if (!product.floor || product.floor < 1 || product.floor > shelf.floors) {
          console.error('Invalid shelf floor:', product.floor, 'Max floors:', shelf.floors);
          return;
        }
        shelf.products.forEach((p) => {
          if (p.floor === product.floor && p.position >= product.position) {
            p.position += 1;
          }
        });
        shelf.products.push({
          id: globalProduct.id,
          name: product.name,
          category: globalProduct.category || 'Sans catégorie',
          quantity: product.quantity,
          price: product.price,
          position: product.position,
          floor: product.floor,
        });
        const totalQuantity = shelf.products.reduce((sum, p) => sum + p.quantity, 0);
        shelf.products.forEach((p) => {
          p.space = totalQuantity > 0 ? p.quantity / totalQuantity : 0;
        });
        console.log('Product added to shelf', shelf.id, 'in store', storeId, 'store floor', floorId, 'shelf floor', product.floor, ':', shelf.products);
      } else {
        console.error('Shelf not found:', product.shelfId);
      }
    } else {
      console.error('Store floor not found:', floorId);
    }
  } else {
    console.error('Store not found:', storeId);
  }
  saveToLocalStorage();
}

export function addGlobalProduct(product) {
  if (product.category && !storeData.categories.includes(product.category)) {
    storeData.categories.push(product.category);
    storeData.categories.sort();
    console.log('New category added:', product.category, 'Categories:', storeData.categories);
  }
  storeData.products.push({
    id: Date.now(),
    name: product.name,
    category: product.category || 'Sans catégorie',
    quantity: product.quantity || 0,
    price: product.price || 0,
  });
  console.log('Global product added:', storeData.products);
  saveToLocalStorage();
}

export function updateGlobalProduct(productId, updatedProduct) {
  const productIndex = storeData.products.findIndex((p) => p.id === productId);
  if (productIndex !== -1) {
    if (updatedProduct.category && !storeData.categories.includes(updatedProduct.category)) {
      storeData.categories.push(updatedProduct.category);
      storeData.categories.sort();
      console.log('New category added:', updatedProduct.category, 'Categories:', storeData.categories);
    }
    storeData.products[productIndex] = {
      ...storeData.products[productIndex],
      name: updatedProduct.name,
      category: updatedProduct.category || 'Sans catégorie',
      quantity: updatedProduct.quantity || 0,
      price: updatedProduct.price || 0,
    };
    storeData.stores.forEach((store) => {
      store.floors.forEach((floor) => {
        floor.shelves.forEach((shelf) => {
          const shelfProduct = shelf.products.find((p) => p.id === productId);
          if (shelfProduct) {
            shelfProduct.name = updatedProduct.name;
            shelfProduct.category = updatedProduct.category || 'Sans catégorie';
            shelfProduct.quantity = updatedProduct.quantity || 0;
            shelfProduct.price = updatedProduct.price || 0;
            const totalQuantity = shelf.products.reduce((sum, p) => sum + p.quantity, 0);
            shelf.products.forEach((p) => {
              p.space = totalQuantity > 0 ? p.quantity / totalQuantity : 0;
            });
          }
        });
      });
    });
    console.log('Global product updated:', storeData.products[productIndex]);
  } else {
    console.error('Product not found:', productId);
  }
  saveToLocalStorage();
}

export function deleteGlobalProduct(productId) {
  storeData.products = storeData.products.filter((p) => p.id !== productId);
  storeData.stores.forEach((store) => {
    store.floors.forEach((floor) => {
      floor.shelves.forEach((shelf) => {
        shelf.products = shelf.products.filter((p) => p.id !== productId);
        const totalQuantity = shelf.products.reduce((sum, p) => sum + p.quantity, 0);
        shelf.products.forEach((p) => {
          p.space = totalQuantity > 0 ? p.quantity / totalQuantity : 0;
        });
      });
    });
  });
  console.log('Global product deleted:', storeData.products);
  saveToLocalStorage();
}

export function getProducts() {
  return storeData.products;
}

export function getCategories() {
  return storeData.categories;
}

// Nouvelle fonction pour réinitialiser toutes les données
export function clearAllData() {
  storeData.stores = [];
  storeData.products = [];
  storeData.categories = [];
  storeData.shelfTemplates = [];
  localStorage.removeItem(STORAGE_KEY);
  ensureDefaultStore();
  console.log('All data cleared and default store initialized:', storeData);
}