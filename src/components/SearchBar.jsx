/**
 * Composant de barre de recherche.
 * Rôle : Permet de rechercher un produit avec suggestions en temps réel, proposant des options selon le mode (admin ou user).
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStores, getProducts } from '../data/StoreData';

function SearchBar({ onSearch, mode = 'admin' }) {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const navigate = useNavigate();

  // Mettre à jour les suggestions en temps réel
  useEffect(() => {
    if (search.trim()) {
      const filteredProducts = getProducts().filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase())
      );
      setSuggestions(filteredProducts);
      console.log('Suggestions updated:', filteredProducts);
    } else {
      setSuggestions([]);
      setSelectedSuggestion(null);
    }
  }, [search]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      const stores = getStores();
      const results = stores.flatMap((store) =>
        store.floors.flatMap((floor) =>
          floor.shelves.flatMap((shelf) =>
            shelf.products
              .filter((product) =>
                product.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((product) => ({
                storeId: store.id,
                storeName: store.name,
                floorId: floor.id,
                shelfId: shelf.id,
                shelfName: shelf.name,
                product,
              }))
          )
        )
      );
      onSearch(results);
      console.log('Search submitted:', search, 'Results:', results);
      setSuggestions([]);
      setSelectedSuggestion(null);
    }
  };

  const handleSuggestionClick = (product) => {
    setSelectedSuggestion(selectedSuggestion?.id === product.id ? null : product);
    console.log('Suggestion clicked:', product.name);
  };

  const handleModify = (product) => {
    navigate('/admin/manage-products', { state: { editProduct: product } });
    setSuggestions([]);
    setSelectedSuggestion(null);
    setSearch('');
    console.log('Navigating to modify product:', product);
  };

  const handleVisualize = (product) => {
    const stores = getStores();
    const results = stores.flatMap((store) =>
      store.floors.flatMap((floor) =>
        floor.shelves.flatMap((shelf) =>
          shelf.products
            .filter((p) => p.id === product.id)
            .map((p) => ({
              storeId: store.id,
              storeName: store.name,
              floorId: floor.id,
              shelfId: shelf.id,
              shelfName: shelf.name,
              product: p,
            }))
        )
      )
    );
    if (results.length > 0) {
      onSearch(results); // Passer les résultats pour affichage
      console.log('Visualizing product:', product.name, 'Results:', results);
    } else {
      console.log('Product not found in any shelf:', product.name);
    }
    setSuggestions([]);
    setSelectedSuggestion(null);
    setSearch(product.name);
  };

  return (
    <div className="relative mb-2 max-w-[400px]">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un produit"
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mt-2">
          Rechercher
        </button>
      </form>
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border rounded shadow-lg mt-1 max-h-60 overflow-y-auto">
          {suggestions.map((product) => (
            <li key={product.id} className="p-2">
              <div
                className="flex justify-between items-center hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSuggestionClick(product)}
              >
                <span>{product.name}</span>
                <span className="text-gray-500">{product.category || 'Sans catégorie'}</span>
              </div>
              {selectedSuggestion?.id === product.id && (
                <div className="flex justify-end space-x-2 mt-1">
                  {mode === 'admin' && (
                    <button
                      onClick={() => handleModify(product)}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                    >
                      Modifier
                    </button>
                  )}
                  <button
                    onClick={() => handleVisualize(product)}
                    className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Visualiser
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;