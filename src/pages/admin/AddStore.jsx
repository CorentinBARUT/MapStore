/**
      * Page pour ajouter un magasin (mode admin).
      * Rôle : Permet de créer un nouveau magasin avec un plan vierge.
      */
     import React, { useState } from 'react';
     import { useNavigate } from 'react-router-dom';
     import StoreMap from '../../components/StoreMap';
     import { addStore, getStores } from '../../data/StoreData';

     function AddStore() {
       const [storeName, setStoreName] = useState('');
       const navigate = useNavigate();

       const handleSubmit = (e) => {
         e.preventDefault();
         if (storeName.trim()) {
           addStore({ name: storeName });
           setStoreName('');
           const newStore = getStores().slice(-1)[0];
           alert(`Magasin "${newStore.name}" ajouté !`);
           navigate(`/admin/edit-shelves?storeId=${newStore.id}`);
         }
       };

       return (
         <div className="p-4">
           <h2 className="text-xl mb-2">Ajouter un magasin</h2>
           <form onSubmit={handleSubmit} className="mb-4">
             <input
               type="text"
               value={storeName}
               onChange={(e) => setStoreName(e.target.value)}
               placeholder="Nom du magasin"
               className="mr-2"
             />
             <button type="submit">Ajouter</button>
           </form>
           <StoreMap storeId={getStores().slice(-1)[0]?.id || 0} />
         </div>
       );
     }

     export default AddStore;