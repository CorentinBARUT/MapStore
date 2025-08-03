/**
 * Fichier principal de l'application React.
 * Rôle : Gère le routage entre les modes utilisateur et admin, ainsi que le sélecteur de magasin.
 */
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { getStores } from './data/StoreData';
import Home from './pages/user/Home';
import AdminHome from './pages/admin/AdminHome';
import AddStore from './pages/admin/AddStore';
import EditShelves from './pages/admin/EditShelves';
import ManageShelfProducts from './pages/admin/ManageShelfProducts';
import ManageProducts from './pages/admin/ManageProducts';

function App() {
  const [selectedStore, setSelectedStore] = useState('');
  const stores = getStores();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen">
      <header className="header-container">
        <div className="main-menu">
          <h1>Navigation en Magasin</h1>
          <div className="menu-actions">
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="">Sélectionner un magasin</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
            <nav className="flex space-x-2">
              <Link to="/" className="menu-button">Utilisateur</Link>
              <Link to="/admin" className="menu-button">Admin</Link>
            </nav>
          </div>
        </div>
        {isAdminRoute && (
          <div className="sub-menu">
            <Link to="/admin/edit-layout" className="sub-menu-button">Changer le plan du magasin</Link>
            <Link to={`/admin/edit-shelves?storeId=${selectedStore}`} className="sub-menu-button">Modifier les rayons</Link>
            <Link to={`/admin/manage-shelf-products?storeId=${selectedStore}`} className="sub-menu-button">Ajouter/Modifier un produit dans un rayon</Link>
            <Link to="/admin/manage-products" className="sub-menu-button">Gérer les produits du catalogue</Link>
            <Link to="/admin/add-floor" className="sub-menu-button">Ajouter un étage</Link>
            <Link to="/admin/add-store" className="sub-menu-button">Ajouter un magasin</Link>
            <button
              onClick={() => {
                if (window.confirm('Voulez-vous vraiment effacer toutes les données ? Cette action est irréversible.')) {
                  clearAllData();
                  window.location.reload();
                  console.log('All data cleared via App');
                }
              }}
              className="sub-menu-button bg-red-500 hover:bg-red-600"
            >
              Effacer toutes les données
            </button>
          </div>
        )}
      </header>
      <main className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminHome />} />
          <Route path="/admin/add-store" element={<AddStore />} />
          <Route path="/admin/edit-shelves" element={<EditShelves />} />
          <Route path="/admin/manage-shelf-products" element={<ManageShelfProducts />} />
          <Route path="/admin/manage-products" element={<ManageProducts />} />
        </Routes>
      </main>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
