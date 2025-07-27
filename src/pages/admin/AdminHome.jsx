/**
 * Page d'accueil pour le mode admin.
 * Rôle : Affiche la carte du magasin, les options de gestion, et les résultats de recherche de produits.
 */
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SearchBar from '../../components/SearchBar';
import StoreMap from '../../components/StoreMap';
import { clearAllData } from '../../data/StoreData';

function AdminHome() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const storeId = Number(queryParams.get('storeId')) || 1;
  const [searchResults, setSearchResults] = useState([]);
  const [highlightedProduct, setHighlightedProduct] = useState(null);

  const handleSearch = (results) => {
    setSearchResults(results);
    // Sélectionner le premier résultat pour la visualisation
    setHighlightedProduct(results.length > 0 ? results[0] : null);
    console.log('Search results set:', results, 'Highlighted product:', results.length > 0 ? results[0] : null);
  };

  const handleClearData = () => {
    if (window.confirm('Voulez-vous vraiment effacer toutes les données ? Cette action est irréversible.')) {
      clearAllData();
      window.location.reload();
      console.log('All data cleared via AdminHome');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Accueil Admin</h2>
      <SearchBar onSearch={handleSearch} />
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
      <StoreMap storeId={storeId} highlightedProduct={highlightedProduct} />
      <div className="mt-4 flex flex-col space-y-2">
        <Link to="/admin/edit-layout">Changer le plan du magasin</Link>
        <Link to={`/admin/edit-shelves?storeId=${storeId}`}>Modifier les rayons</Link>
        <Link to={`/admin/manage-shelf-products?storeId=${storeId}`}>Ajouter/Modifier un produit dans un rayon</Link>
        <Link to="/admin/manage-products">Gérer les produits du catalogue</Link>
        <Link to="/admin/add-floor">Ajouter un étage</Link>
        <Link to="/admin/add-store">Ajouter un magasin</Link>
        <button
          onClick={handleClearData}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Effacer toutes les données
        </button>
      </div>
    </div>
  );
}

export default AdminHome;