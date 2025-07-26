/**
 * Page pour le guidage (mode utilisateur).
 * Rôle : Affiche le chemin le plus rapide pour récupérer tous les produits de la liste de courses.
 * Contenu attendu :
 * - Calcul du chemin optimal basé sur les emplacements des produits dans le magasin.
 * - Intégration avec StoreMap pour afficher le chemin sur la carte.
 * - Instructions textuelles pour guider l'utilisateur.
 */
import React from 'react';
import StoreMap from '../../components/StoreMap';

function Guidance() {
  return (
    <div>
      <h2 className="text-xl mb-2">Guidage</h2>
      <StoreMap />
      <div className="mt-4">
        <p>Placeholder pour les instructions de guidage</p>
      </div>
    </div>
  );
}

export default Guidance;