/**
 * Page d'accueil pour le mode utilisateur.
 * Rôle : Affiche la carte du magasin sélectionné, une barre de recherche, et les résultats de recherche avec visualisation sur la carte.
 */
import React, { useState } from 'react';
import StoreMap from '../../components/StoreMap';
import SearchBar from '../../components/SearchBar';

function Home() {
  const [searchResults, setSearchResults] = useState([]);
  const [highlightedProduct, setHighlightedProduct] = useState(null);

  const handleSearch = (results) => {
    setSearchResults(results);
    // Sélectionner le premier résultat pour la visualisation
    setHighlightedProduct(results.length > 0 ? results[0] : null);
    console.log('Search results set:', results, 'Highlighted product:', results.length > 0 ? results[0] : null);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Accueil Utilisateur</h2>
      <SearchBar onSearch={handleSearch} mode="user" />
      <StoreMap storeId={1} highlightedProduct={highlightedProduct} />
      {searchResults.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg mb-2">Résultats de la recherche</h3>
          <ul className="space-y-2">
            {searchResults.map((result, index) => (
              <li key={index} className="p-2 border">
                {result.product.name} - Magasin: {result.storeName}, Étage: {result.floorId}, Rayon: {result.shelfName}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Home;