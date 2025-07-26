/**
 * Page pour modifier les rayons (mode admin).
 * Rôle : Permet d'ajouter, modifier, supprimer ou placer des rayons via une liste de modèles, une liste de rayons placés, un menu contextuel et des pop-ups.
 */
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import StoreMap from '../../components/StoreMap';
import { getStores, getShelfTemplates, addShelf, updateTemplate, deleteTemplate, deleteShelf, updateShelf } from '../../data/StoreData';

function EditShelves() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const storeId = Number(queryParams.get('storeId')) || 1;

  const [shelfTemplates, setShelfTemplates] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showMapPopup, setShowMapPopup] = useState(false);
  const [showShelfActionsPopup, setShowShelfActionsPopup] = useState(false);
  const [shelf, setShelf] = useState({
    name: '',
    length: 0,
    depth: 0,
    height: 0,
    floors: 1,
    type: 'étagère',
    floor: 1,
  });
  const [editShelf, setEditShelf] = useState(null);
  const [mapShelf, setMapShelf] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [selectedShelfId, setSelectedShelfId] = useState(null);
  const [updateAllInstances, setUpdateAllInstances] = useState(false);
  const [shelfPosition, setShelfPosition] = useState({ x: 50, y: 50 });
  const [shelfRotation, setShelfRotation] = useState(0);
  const [forceMapUpdate, setForceMapUpdate] = useState(0); // Forcer la mise à jour de la carte

  // Charger les modèles et les rayons placés
  useEffect(() => {
    setShelfTemplates(getShelfTemplates());
    const stores = getStores();
    const store = stores.find((s) => s.id === storeId) || { floors: [{ id: 1, shelves: [] }] };
    const floor = store.floors.find((f) => f.id === selectedFloor) || { shelves: [] };
    setShelves([...(floor.shelves || [])]);
    console.log('Shelf templates loaded:', getShelfTemplates());
    console.log('Shelves loaded for store', storeId, 'floor', selectedFloor, ':', floor.shelves);
  }, [storeId, selectedFloor, forceMapUpdate]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (shelf.name.trim() && shelf.length > 0 && shelf.depth > 0 && shelf.height > 0) {
      const newShelf = {
        ...shelf,
        id: Date.now(),
        floor: selectedFloor,
        position: { x: 50, y: 50 },
        rotation: 0,
        isPlaced: false,
      };
      addShelf(storeId, newShelf);
      setShelfTemplates(getShelfTemplates());
      setShelf({ name: '', length: 0, depth: 0, height: 0, floors: 1, type: 'étagère', floor: selectedFloor });
      setShowAddPopup(false);
      setForceMapUpdate((prev) => prev + 1); // Forcer la mise à jour de la carte
      alert('Modèle de rayon ajouté !');
      console.log('Shelf templates after add:', getShelfTemplates());
    } else {
      alert('Veuillez remplir le nom, la longueur, la profondeur et la hauteur.');
    }
  };

  const handleEditShelf = (shelfId) => {
    const shelf = shelves.find((s) => s.id === shelfId);
    setEditShelf({ ...shelf });
    setShowEditPopup(true);
    setSelectedTemplateId(null);
    console.log('Editing shelf instance:', shelf);
  };

  const handleEditTemplate = (templateId) => {
    const template = shelfTemplates.find((t) => t.id === templateId);
    setEditShelf({ ...template });
    setShowEditPopup(true);
    setSelectedTemplateId(templateId);
    console.log('Editing shelf template:', template);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editShelf.name.trim() && editShelf.length > 0 && editShelf.depth > 0 && editShelf.height > 0) {
      if (selectedTemplateId) {
        // Modification d'un modèle
        updateTemplate(selectedTemplateId, editShelf, updateAllInstances);
        setShelfTemplates(getShelfTemplates());
        const stores = getStores();
        const store = stores.find((s) => s.id === storeId);
        const floor = store?.floors.find((f) => f.id === selectedFloor) || { shelves: [] };
        setShelves([...floor.shelves]);
        setForceMapUpdate((prev) => prev + 1); // Forcer la mise à jour de la carte
        console.log('Shelf templates after edit:', getShelfTemplates());
        console.log('Shelves after edit:', floor.shelves);
      } else {
        // Modification d'une instance
        updateShelf(storeId, selectedFloor, editShelf.id, editShelf);
        const stores = getStores();
        const store = stores.find((s) => s.id === storeId);
        const floor = store?.floors.find((f) => f.id === selectedFloor) || { shelves: [] };
        setShelves([...floor.shelves]);
        setForceMapUpdate((prev) => prev + 1); // Forcer la mise à jour de la carte
        console.log('Shelf instance after edit:', floor.shelves);
      }
      setShowEditPopup(false);
      setEditShelf(null);
      setSelectedTemplateId(null);
      setUpdateAllInstances(false);
      alert('Rayon modifié !');
    } else {
      alert('Veuillez remplir le nom, la longueur, la profondeur et la hauteur.');
    }
  };

  const handleDeleteTemplate = (templateId) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce modèle de rayon ?')) {
      deleteTemplate(templateId);
      setShelfTemplates(getShelfTemplates());
      setSelectedTemplateId(null);
      setForceMapUpdate((prev) => prev + 1); // Forcer la mise à jour de la carte
      alert('Modèle de rayon supprimé !');
      console.log('Shelf templates after delete:', getShelfTemplates());
    }
  };

  const handleDelete = (shelfId, floorId) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce rayon placé ?')) {
      deleteShelf(storeId, floorId, shelfId);
      const stores = getStores();
      const store = stores.find((s) => s.id === storeId);
      const floor = store?.floors.find((f) => f.id === selectedFloor) || { shelves: [] };
      setShelves([...floor.shelves]);
      setSelectedTemplateId(null);
      setForceMapUpdate((prev) => prev + 1); // Forcer la mise à jour de la carte
      alert('Rayon placé supprimé !');
      console.log('Shelves after delete:', floor.shelves);
    }
  };

  const handleMapSubmit = (e) => {
    e.preventDefault();
    if (mapShelf && mapShelf.mapName.trim()) {
      const updatedShelf = {
        ...mapShelf,
        isPlaced: true,
        floor: selectedFloor,
        position: mapShelf.position || { x: 50, y: 50 },
        rotation: mapShelf.rotation || 0,
      };
      addShelf(storeId, updatedShelf);
      const stores = getStores();
      const store = stores.find((s) => s.id === storeId);
      const floor = store?.floors.find((f) => f.id === selectedFloor) || { shelves: [] };
      setShelves([...floor.shelves]);
      setMapShelf(null);
      setShowMapPopup(false);
      setSelectedTemplateId(null);
      setForceMapUpdate((prev) => prev + 1); // Forcer la mise à jour de la carte
      alert('Rayon ajouté à la carte !');
      console.log('Shelves after map add:', floor.shelves);
    } else {
      alert('Veuillez entrer un nom pour la carte.');
    }
  };

  const handleSelectTemplate = (templateId) => {
    setSelectedTemplateId(templateId);
  };

  const handleFloorChange = (e) => {
    setSelectedFloor(Number(e.target.value));
    setSelectedTemplateId(null);
  };

  const handleShelfActions = (shelfId) => {
    const shelf = shelves.find((s) => s.id === shelfId);
    setSelectedShelfId(shelfId);
    setEditShelf({ ...shelf });
    setShelfPosition(shelf.position || { x: 50, y: 50 });
    setShelfRotation(shelf.rotation || 0);
    setShowShelfActionsPopup(true);
    console.log('Selected shelf for actions:', shelf);
  };

  const handleShelfActionsSubmit = (e) => {
    e.preventDefault();
    if (editShelf.name.trim() && editShelf.length > 0 && editShelf.depth > 0 && editShelf.height > 0) {
      const updatedShelf = {
        ...editShelf,
        position: shelfPosition,
        rotation: shelfRotation,
        isPlaced: true,
      };
      updateShelf(storeId, selectedFloor, selectedShelfId, updatedShelf);
      const stores = getStores();
      const store = stores.find((s) => s.id === storeId);
      const floor = store?.floors.find((f) => f.id === selectedFloor) || { shelves: [] };
      setShelves([...floor.shelves]);
      setShowShelfActionsPopup(false);
      setSelectedShelfId(null);
      setEditShelf(null);
      setShelfPosition({ x: 50, y: 50 });
      setShelfRotation(0);
      setForceMapUpdate((prev) => prev + 1); // Forcer la mise à jour de la carte
      alert('Rayon mis à jour !');
      console.log('Shelf updated:', updatedShelf);
    } else {
      alert('Veuillez remplir le nom, la longueur, la profondeur et la hauteur.');
    }
  };

  const stores = getStores();
  const store = stores.find((s) => s.id === storeId) || { floors: [{ id: 1, name: "Étage 1", shelves: [] }] };
  const floors = store.floors || [];

  return (
    <div className="p-4 flex">
      {/* Liste des modèles de rayons */}
      <div className="w-1/3 pr-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl">Modèles de rayons</h2>
          <button
            onClick={() => setShowAddPopup(true)}
            className="text-2xl bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center"
          >
            +
          </button>
        </div>
        <div className="mb-4">
          <select value={selectedFloor} onChange={handleFloorChange} className="w-full">
            {floors.map((floor) => (
              <option key={floor.id} value={floor.id}>
                {floor.name}
              </option>
            ))}
          </select>
        </div>
        {shelfTemplates.length === 0 ? (
          <p>Aucun modèle de rayon.</p>
        ) : (
          <ul className="space-y-2">
            {shelfTemplates.map((template) => (
              <li
                key={template.id}
                className={`p-2 border cursor-pointer ${
                  selectedTemplateId === template.id ? 'bg-blue-100' : ''
                }`}
                onClick={() => handleSelectTemplate(template.id)}
              >
                {template.name} - {template.length}m x {template.depth}m x {template.height}m, {template.floors} étage(s), {template.type}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Menu contextuel et carte */}
      <div className="w-2/3 flex flex-col">
        {selectedTemplateId && (
          <div className="w-1/4 p-4 bg-gray-100 border-l">
            <h3 className="text-lg mb-2">Actions</h3>
            <button
              onClick={() => handleEditTemplate(selectedTemplateId)}
              className="w-full mb-2 bg-blue-500 text-white px-2 py-1 rounded"
            >
              Modifier
            </button>
            <button
              onClick={() => handleDeleteTemplate(selectedTemplateId)}
              className="w-full mb-2 bg-red-500 text-white px-2 py-1 rounded"
            >
              Supprimer
            </button>
            <button
              onClick={() => {
                const template = shelfTemplates.find((t) => t.id === selectedTemplateId);
                setMapShelf({ 
                  ...template, 
                  mapName: template.name, 
                  templateId: template.id, 
                  position: { x: 50, y: 50 }, 
                  rotation: 0 
                });
                setShowMapPopup(true);
              }}
              className="w-full bg-green-500 text-white px-2 py-1 rounded"
            >
              Ajouter à la carte
            </button>
          </div>
        )}

        {/* Carte */}
        <StoreMap storeId={storeId} floorId={selectedFloor} tempShelf={mapShelf} onEditShelf={handleEditShelf} key={forceMapUpdate} />

        {/* Liste des rayons placés */}
        <div className="mt-4">
          <h3 className="text-lg mb-2">Rayons placés sur la carte</h3>
          {shelves.filter((s) => s.isPlaced).length === 0 ? (
            <p>Aucun rayon placé.</p>
          ) : (
            <ul className="space-y-2">
              {shelves
                .filter((s) => s.isPlaced)
                .map((shelf) => (
                  <li
                    key={shelf.id}
                    className="p-2 border cursor-pointer hover:bg-gray-100"
                    onClick={() => handleShelfActions(shelf.id)}
                  >
                    {shelf.mapName} ({shelf.name})
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>

      {/* Pop-up pour ajouter un modèle de rayon */}
      {showAddPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">
            <h3 className="text-lg mb-2">Ajouter un modèle de rayon</h3>
            <form onSubmit={handleAddSubmit} className="space-y-2">
              <div>
                <label className="block">Nom/Numéro</label>
                <input
                  type="text"
                  value={shelf.name}
                  onChange={(e) => setShelf({ ...shelf, name: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block">Longueur (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={shelf.length}
                  onChange={(e) => setShelf({ ...shelf, length: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block">Profondeur (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={shelf.depth}
                  onChange={(e) => setShelf({ ...shelf, depth: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block">Hauteur (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={shelf.height}
                  onChange={(e) => setShelf({ ...shelf, height: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block">Nombre d'étages</label>
                <input
                  type="number"
                  value={shelf.floors}
                  onChange={(e) => setShelf({ ...shelf, floors: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block">Type</label>
                <select
                  value={shelf.type}
                  onChange={(e) => setShelf({ ...shelf, type: e.target.value })}
                  className="w-full"
                >
                  <option value="étagère">Étagère</option>
                  <option value="gondole">Gondole</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <button type="submit" className="bg-blue-500 text-white px-2 py-1 rounded">
                  Ajouter
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddPopup(false)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pop-up pour modifier un modèle ou une instance */}
      {showEditPopup && editShelf && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">
            <h3 className="text-lg mb-2">{selectedTemplateId ? 'Modifier le modèle de rayon' : 'Modifier le rayon placé'}</h3>
            <form onSubmit={handleEditSubmit} className="space-y-2">
              <div>
                <label className="block">Nom/Numéro</label>
                <input
                  type="text"
                  value={editShelf.name}
                  onChange={(e) => setEditShelf({ ...editShelf, name: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block">Longueur (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editShelf.length}
                  onChange={(e) => setEditShelf({ ...editShelf, length: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block">Profondeur (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editShelf.depth}
                  onChange={(e) => setEditShelf({ ...editShelf, depth: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block">Hauteur (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editShelf.height}
                  onChange={(e) => setEditShelf({ ...editShelf, height: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block">Nombre d'étages</label>
                <input
                  type="number"
                  value={editShelf.floors}
                  onChange={(e) => setEditShelf({ ...editShelf, floors: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block">Type</label>
                <select
                  value={editShelf.type}
                  onChange={(e) => setEditShelf({ ...editShelf, type: e.target.value })}
                  className="w-full"
                >
                  <option value="étagère">Étagère</option>
                  <option value="gondole">Gondole</option>
                </select>
              </div>
              {!selectedTemplateId && (
                <div>
                  <label className="block">Nom sur la carte</label>
                  <input
                    type="text"
                    value={editShelf.mapName || ''}
                    onChange={(e) => setEditShelf({ ...editShelf, mapName: e.target.value })}
                    className="w-full"
                  />
                </div>
              )}
              {selectedTemplateId && (
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={updateAllInstances}
                      onChange={(e) => setUpdateAllInstances(e.target.checked)}
                      className="mr-2"
                    />
                    Modifier pour tous les rayons actifs
                  </label>
                </div>
              )}
              <div className="flex space-x-2">
                <button type="submit" className="bg-blue-500 text-white px-2 py-1 rounded">
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditPopup(false);
                    setEditShelf(null);
                    setUpdateAllInstances(false);
                  }}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pop-up pour ajouter à la carte */}
      {showMapPopup && mapShelf && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">
            <h3 className="text-lg mb-2">Ajouter le rayon à la carte</h3>
            <form onSubmit={handleMapSubmit} className="space-y-2">
              <div>
                <label className="block">Nom sur la carte</label>
                <input
                  type="text"
                  value={mapShelf.mapName}
                  onChange={(e) => setMapShelf({ ...mapShelf, mapName: e.target.value })}
                  className="w-full"
                />
              </div>
              <div className="flex space-x-2">
                <button type="submit" className="bg-blue-500 text-white px-2 py-1 rounded">
                  Ajouter
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMapPopup(false);
                    setMapShelf(null);
                  }}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pop-up pour les actions sur un rayon placé */}
      {showShelfActionsPopup && selectedShelfId && editShelf && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-96">
            <h3 className="text-lg mb-2">Actions sur le rayon</h3>
            <form onSubmit={handleShelfActionsSubmit} className="space-y-2">
              {/* Afficher les produits */}
              <div>
                <h4 className="text-md mb-1">Produits</h4>
                {shelves.find((s) => s.id === selectedShelfId)?.products.length === 0 ? (
                  <p>Aucun produit sur ce rayon.</p>
                ) : (
                  <ul className="space-y-1">
                    {shelves.find((s) => s.id === selectedShelfId)?.products.map((product) => (
                      <li key={product.id} className="p-1 border">
                        {product.name} (Étage: {product.floor}, Quantité: {product.quantity})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {/* Modifier les paramètres */}
              <div>
                <h4 className="text-md mb-1">Paramètres</h4>
                <div>
                  <label className="block">Nom/Numéro</label>
                  <input
                    type="text"
                    value={editShelf.name}
                    onChange={(e) => setEditShelf({ ...editShelf, name: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block">Longueur (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editShelf.length}
                    onChange={(e) => setEditShelf({ ...editShelf, length: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block">Profondeur (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editShelf.depth}
                    onChange={(e) => setEditShelf({ ...editShelf, depth: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block">Hauteur (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editShelf.height}
                    onChange={(e) => setEditShelf({ ...editShelf, height: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block">Nombre d'étages</label>
                  <input
                    type="number"
                    value={editShelf.floors}
                    onChange={(e) => setEditShelf({ ...editShelf, floors: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block">Type</label>
                  <select
                    value={editShelf.type}
                    onChange={(e) => setEditShelf({ ...editShelf, type: e.target.value })}
                    className="w-full"
                  >
                    <option value="étagère">Étagère</option>
                    <option value="gondole">Gondole</option>
                  </select>
                </div>
                <div>
                  <label className="block">Nom sur la carte</label>
                  <input
                    type="text"
                    value={editShelf.mapName || ''}
                    onChange={(e) => setEditShelf({ ...editShelf, mapName: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>
              {/* Modifier la position */}
              <div>
                <h4 className="text-md mb-1">Position</h4>
                <label className="block">X (pixels)</label>
                <input
                  type="number"
                  value={shelfPosition.x}
                  onChange={(e) => setShelfPosition({ ...shelfPosition, x: Number(e.target.value) })}
                  className="w-full mb-2"
                />
                <label className="block">Y (pixels)</label>
                <input
                  type="number"
                  value={shelfPosition.y}
                  onChange={(e) => setShelfPosition({ ...shelfPosition, y: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
              {/* Modifier la rotation */}
              <div>
                <h4 className="text-md mb-1">Rotation (degrés)</h4>
                <input
                  type="number"
                  value={shelfRotation}
                  onChange={(e) => setShelfRotation(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="flex space-x-2 mt-4">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowShelfActionsPopup(false);
                    setSelectedShelfId(null);
                    setEditShelf(null);
                    setShelfPosition({ x: 50, y: 50 });
                    setShelfRotation(0);
                  }}
                  className="bg-red-500 text-white px-2 py-1 rounded"
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

export default EditShelves;