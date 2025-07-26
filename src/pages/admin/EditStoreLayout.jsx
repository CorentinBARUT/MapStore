/**
 * Page pour modifier le plan du magasin (mode admin).
 * Rôle : Permet de déplacer ou ajouter des éléments comme les caisses, l'entrée, les escaliers.
 * Contenu attendu :
 * - Une interface drag-and-drop pour déplacer les éléments sur la carte.
 * - Options pour ajouter de nouveaux éléments (caisses, entrée, escaliers, etc.).
 * - Intégration avec StoreMap pour refléter les modifications en temps réel.
 */
import React from 'react';
import StoreMap from '../../components/StoreMap';

function EditStoreLayout() {
  return (
    <div>
      <h2 className="text-xl mb-2">Modifier le plan du magasin</h2>
      <StoreMap />
      <div className="mt-4">
        <p>Placeholder pour les outils de modification du plan</p>
      </div>
    </div>
  );
}

export default EditStoreLayout;