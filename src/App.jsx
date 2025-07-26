/**
 * Fichier principal de l'application React.
 * Rôle : Gère le routage entre les modes utilisateur et admin, ainsi que le sélecteur de magasin.
 */
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
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

  return (
    <Router>
      <div className="min-h-screen">
        <header>
          <h1>Navigation en Magasin</h1>
          <div className="mt-4">
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="mr-2"
            >
              <option value="">Sélectionner un magasin</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
            <nav className="flex space-x-4">
              <Link to="/">Utilisateur</Link>
              <Link to="/admin">Admin</Link>
            </nav>
          </div>
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
    </Router>
  );
}

export default App;