/**
 * Page pour la liste de courses (mode utilisateur).
 * Rôle : Permet d'ajouter, supprimer et sélectionner des produits dans une liste de courses.
 * Contenu attendu :
 * - Une interface pour ajouter des produits à la liste (via recherche ou saisie).
 * - Une liste affichant les produits ajoutés, avec possibilité de cliquer pour localiser sur la carte.
 * - Intégration avec le composant StoreMap pour afficher la localisation des produits.
 */
import React from 'react';
import StoreMap from '../../components/StoreMap';

function ShoppingList() {
  return (
    <div>
      <h2 className="text-xl mb-2">Liste de courses</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Ajouter un produit..."
          className="p-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <p>Placeholder pour la liste des produits</p>
      </div>
      <StoreMap />
    </div>
  );
}

export default ShoppingList;