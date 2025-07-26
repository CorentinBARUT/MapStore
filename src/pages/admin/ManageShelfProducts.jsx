/**
 * Page pour ajouter un produit à un rayon (mode admin).
 * Rôle : Permet d'assigner un produit existant à un rayon existant avec des paramètres (étage du rayon, position, quantité).
 */
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import StoreMap from '../../components/StoreMap';
import { addProduct, getStores, getProducts } from '../../data/StoreData';

function ManageShelfProducts() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const storeId = Number(queryParams.get('storeId')) || 1;
  const floorId = Number(queryParams.get('floorId')) || 1; // Étage du magasin

  const [product, setProduct] = useState({
    name: '',
    shelfId: '',
    shelfFloor: 1, // Étage du rayon
    position: 1,
    quantity: 0,
  });
  const [stores, setStores] = useState(getStores());
  const [products, setProducts] = useState(getProducts());
  const store = stores.find((s) => s.id === storeId) || { floors: [{ id: 1, name: 'Étage 1', shelves: [] }] };
  const floor = store.floors.find((f) => f.id === floorId) || { shelves: [] };
  const shelves = floor.shelves || [];
  const selectedShelf = shelves.find((s) => s.id === Number(product.shelfId)) || { floors: 1 };
  const shelfFloors = Array.from({ length: selectedShelf.floors || 1 }, (_, i) => i + 1); // Liste des étages du rayon

  // Recharger les données si elles changent
  useEffect(() => {
    setStores(getStores());
    setProducts(getProducts());
    console.log('Stores loaded:', stores);
    console.log('Products loaded:', products);
  }, []);

  useEffect(() => {
    console.log('Selected shelf:', selectedShelf, 'Shelf floors:', shelfFloors);
  }, [selectedShelf]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (product.name && product.shelfId && product.quantity >= 0 && product.position > 0 && product.shelfFloor > 0) {
      const selectedProduct = products.find((p) => p.name === product.name);
      if (selectedProduct) {
        const productToAdd = {
          id: selectedProduct.id,
          name: product.name,
          category: selectedProduct.category || 'Sans catégorie',
          shelfId: Number(product.shelfId),
          floor: Number(product.shelfFloor), // Étage du rayon
          position: Number(product.position),
          quantity: Number(product.quantity),
          price: selectedProduct.price || 0,
        };
        console.log('Submitting product:', JSON.stringify(productToAdd, null, 2));
        addProduct(storeId, floorId, productToAdd);
        alert(`Produit "${product.name}" ajouté au rayon !`);
        setProduct({
          name: '',
          shelfId: '',
          shelfFloor: 1,
          position: 1,
          quantity: 0,
        });
        setStores(getStores());
      } else {
        alert('Produit non trouvé dans le catalogue global.');
      }
    } else {
      alert('Veuillez sélectionner un produit, un rayon, un étage du rayon (≥ 1), une position (≥ 1) et une quantité (≥ 0).');
    }
  };

  const handleSelectProduct = (e) => {
    const selectedProduct = products.find((p) => p.name === e.target.value);
    if (selectedProduct) {
      setProduct({
        ...product,
        name: selectedProduct.name,
        price: selectedProduct.price || 0,
      });
    } else {
      setProduct({
        ...product,
        name: '',
        price: 0,
      });
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Ajouter un produit à un rayon</h2>
      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <div>
          <label className="block">Produit</label>
          <select
            value={product.name}
            onChange={handleSelectProduct}
            className="w-full p-2 border rounded"
          >
            <option value="">Sélectionner un produit</option>
            {products.map((prod) => (
              <option key={prod.id} value={prod.name}>
                {prod.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block">Rayon</label>
          <select
            value={product.shelfId}
            onChange={(e) => setProduct({ ...product, shelfId: Number(e.target.value), shelfFloor: 1 })}
            className="w-full p-2 border rounded"
          >
            <option value="">Sélectionner un rayon</option>
            {shelves.map((shelf) => (
              <option key={shelf.id} value={shelf.id}>
                {shelf.name} ({shelf.length}m x {shelf.depth}m x {shelf.height}m, {shelf.floors} étage{shelf.floors > 1 ? 's' : ''})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block">Étage du rayon</label>
          <select
            value={product.shelfFloor}
            onChange={(e) => setProduct({ ...product, shelfFloor: Number(e.target.value) })}
            className="w-full p-2 border rounded"
            disabled={!product.shelfId}
          >
            <option value="">Sélectionner un étage</option>
            {shelfFloors.map((f) => (
              <option key={f} value={f}>
                Étage {f}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block">Position (à partir de la gauche)</label>
          <input
            type="number"
            min="1"
            value={product.position}
            onChange={(e) => setProduct({ ...product, position: Number(e.target.value) })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block">Quantité</label>
          <input
            type="number"
            min="0"
            value={product.quantity}
            onChange={(e) => setProduct({ ...product, quantity: Number(e.target.value) })}
            className="w-full p-2 border rounded"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Ajouter Produit
        </button>
      </form>
      <StoreMap storeId={storeId} floorId={floorId} />
    </div>
  );
}

export default ManageShelfProducts;