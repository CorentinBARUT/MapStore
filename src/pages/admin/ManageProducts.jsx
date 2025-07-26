/**
 * Page pour gérer les produits dans le catalogue global (mode admin).
 * Rôle : Permet de rechercher, ajouter, modifier et supprimer des produits, avec affichage par catégorie.
 */
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getProducts, addGlobalProduct, updateGlobalProduct, deleteGlobalProduct, getCategories } from '../../data/StoreData';

function ManageProducts() {
  const [productName, setProductName] = useState('');
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [notFoundMessage, setNotFoundMessage] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    quantity: 0,
    price: 0,
  });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const location = useLocation();

  // Charger les produits, catégories, et vérifier si un produit est passé pour modification
  useEffect(() => {
    setProducts(getProducts());
    setCategories(getCategories());
    console.log('Products loaded:', getProducts());
    console.log('Categories loaded:', getCategories());
    if (location.state?.editProduct) {
      setEditProduct({ ...location.state.editProduct });
      setShowEditPopup(true);
      console.log('Edit product loaded from location state:', location.state.editProduct);
    }
  }, [location.state]);

  // Gérer la recherche de produit
  const handleSearch = (e) => {
    e.preventDefault();
    if (productName.trim()) {
      const foundProduct = products.find(
        (p) => p.name.toLowerCase() === productName.trim().toLowerCase()
      );
      if (foundProduct) {
        setEditProduct({ ...foundProduct });
        setShowEditPopup(true);
        setNotFoundMessage('');
        console.log('Product found:', foundProduct);
      } else {
        setNotFoundMessage(`Produit "${productName}" introuvable.`);
        setShowEditPopup(false);
        console.log('Product not found:', productName);
      }
      setProductName('');
    }
  };

  // Gérer l'ajout d'un produit
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (newProduct.name.trim() && newProduct.quantity >= 0 && newProduct.price >= 0) {
      addGlobalProduct({
        name: newProduct.name,
        category: newProduct.category || 'Sans catégorie',
        quantity: Number(newProduct.quantity),
        price: Number(newProduct.price),
      });
      setProducts(getProducts());
      setCategories(getCategories());
      setNewProduct({ name: '', category: '', quantity: 0, price: 0 });
      setShowAddPopup(false);
      alert(`Produit "${newProduct.name}" ajouté au catalogue !`);
      console.log('Product added:', newProduct);
    } else {
      alert('Veuillez remplir le nom, la quantité (≥ 0) et le prix (≥ 0).');
    }
  };

  // Gérer la modification d'un produit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editProduct.name.trim() && editProduct.quantity >= 0 && editProduct.price >= 0) {
      updateGlobalProduct(editProduct.id, {
        name: editProduct.name,
        category: editProduct.category || 'Sans catégorie',
        quantity: Number(editProduct.quantity),
        price: Number(editProduct.price),
      });
      setProducts(getProducts());
      setCategories(getCategories());
      setShowEditPopup(false);
      setEditProduct(null);
      alert(`Produit "${editProduct.name}" modifié !`);
      console.log('Product updated:', editProduct);
    } else {
      alert('Veuillez remplir le nom, la quantité (≥ 0) et le prix (≥ 0).');
    }
  };

  // Gérer la suppression d'un produit
  const handleDeleteProduct = (productId, productName) => {
    if (window.confirm(`Voulez-vous vraiment supprimer "${productName}" ?`)) {
      deleteGlobalProduct(productId);
      setProducts(getProducts());
      setCategories(getCategories());
      alert(`Produit "${productName}" supprimé !`);
      console.log('Product deleted:', productName);
    }
  };

  // Grouper les produits par catégorie et trier
  const groupedProducts = products.reduce((acc, product) => {
    const category = product.category || 'Sans catégorie';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});

  // Trier les catégories et les produits à l'intérieur
  const sortedCategories = Object.keys(groupedProducts).sort();
  const sortedGroupedProducts = {};
  sortedCategories.forEach((category) => {
    sortedGroupedProducts[category] = groupedProducts[category].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  });

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Gérer les produits</h2>
      {/* Barre de recherche */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="mb-2">
          <label className="block">Rechercher un produit</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Nom du produit"
            className="w-full mr-2 p-2 border rounded"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Rechercher
        </button>
      </form>
      {notFoundMessage && (
        <p className="text-red-500 mb-4">{notFoundMessage}</p>
      )}

      {/* Bouton Ajouter un produit */}
      <button
        onClick={() => setShowAddPopup(true)}
        className="bg-green-500 text-white px-4 py-2 rounded mb-4"
      >
        Ajouter un produit
      </button>

      {/* Liste des produits par catégorie */}
      <h3 className="text-xl mb-2">Liste des produits</h3>
      {sortedCategories.length === 0 ? (
        <p>Aucun produit dans le catalogue.</p>
      ) : (
        <div className="space-y-4">
          {sortedCategories.map((category) => (
            <div key={category}>
              <h4 className="text-lg font-bold">{category}</h4>
              <hr className="my-2" />
              <ul className="space-y-2">
                {sortedGroupedProducts[category].map((product) => (
                  <li key={product.id} className="flex justify-between items-center p-2 border">
                    <span>
                      {product.name} (Quantité: {product.quantity}, Prix: {product.price}€)
                    </span>
                    <button
                      onClick={() => handleDeleteProduct(product.id, product.name)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Supprimer
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Pop-up pour ajouter un produit */}
      {showAddPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">
            <h3 className="text-lg mb-2">Ajouter un produit</h3>
            <form onSubmit={handleAddSubmit} className="space-y-2">
              <div>
                <label className="block">Nom</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block">Catégorie</label>
                <input
                  type="text"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  list="categories"
                  className="w-full p-2 border rounded"
                />
                <datalist id="categories">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block">Quantité</label>
                <input
                  type="number"
                  min="0"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({ ...newProduct, quantity: Number(e.target.value) })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block">Prix (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex space-x-2">
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                  Ajouter
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddPopup(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pop-up pour modifier un produit */}
      {showEditPopup && editProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">
            <h3 className="text-lg mb-2">Modifier le produit</h3>
            <form onSubmit={handleEditSubmit} className="space-y-2">
              <div>
                <label className="block">Nom</label>
                <input
                  type="text"
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block">Catégorie</label>
                <input
                  type="text"
                  value={editProduct.category}
                  onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                  list="categories"
                  className="w-full p-2 border rounded"
                />
                <datalist id="categories">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block">Quantité</label>
                <input
                  type="number"
                  min="0"
                  value={editProduct.quantity}
                  onChange={(e) => setEditProduct({ ...editProduct, quantity: Number(e.target.value) })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block">Prix (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editProduct.price}
                  onChange={(e) => setEditProduct({ ...editProduct, price: Number(e.target.value) })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex space-x-2">
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditPopup(false);
                    setEditProduct(null);
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageProducts;