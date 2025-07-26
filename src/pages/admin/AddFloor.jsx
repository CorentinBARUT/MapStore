/**
 * Page pour ajouter un étage (mode admin).
 * Rôle : Permet d'ajouter un nouvel étage au magasin et de l'associer au plan.
 * Contenu attendu :
 * - Formulaire pour définir le nom ou numéro de l'étage.
 * - Intégration avec StoreMap pour afficher le nouvel étage.
 * - Mise à jour du sélecteur d'étage dans StoreMap.
 */
import React from 'react';
import StoreMap from '../../components/StoreMap';

function AddFloor() {
  return (
    <div>
      <h2 className="text-xl mb-2">Ajouter un étage</h2>
      <StoreMap />
      <div className="mt-4">
        <p>Placeholder pour l'ajout d'un étage</p>
      </div>
    </div>
  );
}

export default AddFloor;