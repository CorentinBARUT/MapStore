/**
 * Composant pour afficher la carte du magasin (2D) avec visualisation 3D du rayon.
 * Rôle : Affiche une carte interactive avec drag-and-drop, rotation, zoom, menu contextuel, point pour un produit, et modale 3D.
 */
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.min.js';
import { getStores, updateShelf } from '../data/StoreData';

function StoreMap({ storeId, floorId = 1, tempShelf, onEditShelf, highlightedProduct }) {
  const canvasRef = useRef(null);
  const threeCanvasRef = useRef(null);
  const [selectedFloor, setSelectedFloor] = useState(floorId);
  const [draggingShelf, setDraggingShelf] = useState(null);
  const [rotatingShelf, setRotatingShelf] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [tempShelfData, setTempShelfData] = useState(tempShelf);
  const [editingShelf, setEditingShelf] = useState(null);
  const [initialShelfState, setInitialShelfState] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [mode, setMode] = useState('none'); // none, move, rotate
  const [showProductsPopup, setShowProductsPopup] = useState(null);
  const [shelves, setShelves] = useState([]);
  const [show3DModal, setShow3DModal] = useState(null);
  const [productPoint, setProductPoint] = useState(null);

  // Mettre à jour tempShelfData lorsque la prop tempShelf change
  useEffect(() => {
    setTempShelfData(tempShelf);
    console.log('Temp shelf updated:', tempShelf);
  }, [tempShelf]);

  // Mettre à jour les rayons placés
  useEffect(() => {
    const stores = getStores();
    const store = stores.find((s) => s.id === storeId) || { floors: [{ id: 1, shelves: [] }] };
    const floor = store.floors.find((f) => f.id === selectedFloor) || { shelves: [] };
    setShelves([...(floor.shelves || [])]);
    console.log('Shelves updated in StoreMap:', floor.shelves);
  }, [storeId, selectedFloor]);

  // Rendu de la carte 2D
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const canvasWidth = canvas.width / zoom;
    const canvasHeight = canvas.height / zoom;

    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(offset.x, offset.y);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(-offset.x, -offset.y, canvasWidth, canvasHeight);

    // Dessiner la grille
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1 / zoom;
    ctx.beginPath();
    for (let x = 0; x <= canvasWidth; x += 50) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
    }
    for (let y = 0; y <= canvasHeight; y += 50) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
    }
    ctx.stroke();

    // Dessiner les rayons placés
    shelves
      .filter((shelf) => shelf.isPlaced && shelf.id !== editingShelf?.id)
      .forEach((shelf) => {
        ctx.save();
        ctx.translate(shelf.position.x + (shelf.length * 10) / 2, shelf.position.y + (shelf.depth * 10) / 2);
        ctx.rotate((shelf.rotation || 0) * Math.PI / 180);
        ctx.fillStyle = '#4b9cd3';
        ctx.fillRect(-(shelf.length * 10) / 2, -(shelf.depth * 10) / 2, shelf.length * 10, shelf.depth * 10);
        const screenWidth = shelf.length * 10 * zoom;
        if (screenWidth > 50) {
          ctx.fillStyle = '#fff';
          ctx.font = `${12 / zoom}px Arial`;
          ctx.fillText(shelf.mapName || shelf.name, -(shelf.length * 10) / 2 + 5, -(shelf.depth * 10) / 2 + 15);
        }
        ctx.restore();
      });

    // Dessiner le rayon temporaire
    if (tempShelfData && !tempShelfData.isPlaced && tempShelfData.position) {
      ctx.save();
      ctx.translate(
        tempShelfData.position.x + (tempShelfData.length * 10) / 2,
        tempShelfData.position.y + (tempShelfData.depth * 10) / 2
      );
      ctx.rotate((tempShelfData.rotation || 0) * Math.PI / 180);
      ctx.fillStyle = '#4b9cd3';
      ctx.globalAlpha = 0.5;
      ctx.fillRect(
        -(tempShelfData.length * 10) / 2,
        -(tempShelfData.depth * 10) / 2,
        tempShelfData.length * 10,
        tempShelfData.depth * 10
      );
      ctx.fillStyle = 'green';
      ctx.beginPath();
      ctx.arc((tempShelfData.length * 10) / 2 - 5, -(tempShelfData.depth * 10) / 2 + 5, 5 / zoom, 0, 2 * Math.PI);
      ctx.fill();
      ctx.globalAlpha = 1;
      const screenWidth = tempShelfData.length * 10 * zoom;
      if (screenWidth > 50) {
        ctx.fillStyle = '#fff';
        ctx.font = `${12 / zoom}px Arial`;
        ctx.fillText(
          tempShelfData.mapName || tempShelfData.name,
          -(tempShelfData.length * 10) / 2 + 5,
          -(tempShelfData.depth * 10) / 2 + 15
        );
      }
      ctx.restore();
    }

    // Dessiner le rayon en cours d'édition
    if (editingShelf) {
      ctx.save();
      ctx.translate(
        editingShelf.position.x + (editingShelf.length * 10) / 2,
        editingShelf.position.y + (editingShelf.depth * 10) / 2
      );
      ctx.rotate((editingShelf.rotation || 0) * Math.PI / 180);
      ctx.fillStyle = '#ff9800';
      ctx.fillRect(
        -(editingShelf.length * 10) / 2,
        -(editingShelf.depth * 10) / 2,
        editingShelf.length * 10,
        shelf.depth * 10
      );
      const screenWidth = editingShelf.length * 10 * zoom;
      if (screenWidth > 50) {
        ctx.fillStyle = '#fff';
        ctx.font = `${12 / zoom}px Arial`;
        ctx.fillText(
          editingShelf.mapName || editingShelf.name,
          -(editingShelf.length * 10) / 2 + 5,
          -(editingShelf.depth * 10) / 2 + 15
        );
      }
      ctx.restore();
    }

    // Dessiner le point pour le produit sélectionné
    let newProductPoint = null;
    if (highlightedProduct && highlightedProduct.storeId === storeId && highlightedProduct.floorId === selectedFloor) {
      const shelf = shelves.find((s) => s.id === highlightedProduct.shelfId);
      if (shelf) {
        const productsOnFloor = shelf.products.filter((p) => p.floor === highlightedProduct.product.floor);
        const n = productsOnFloor.length;
        const i = productsOnFloor.findIndex((p) => p.id === highlightedProduct.product.id) + 1; // Position 1-based
        if (n > 0 && i > 0) {
          const fraction = (i + 1) / (n + 1);
          const pointX = shelf.position.x + fraction * shelf.length * 10;
          const pointY = shelf.position.y + (shelf.depth * 10) / 2;
          newProductPoint = { x: pointX, y: pointY, shelf, product: highlightedProduct.product };
          ctx.save();
          ctx.translate(pointX, pointY);
          ctx.rotate((shelf.rotation || 0) * Math.PI / 180);
          ctx.fillStyle = 'red';
          ctx.beginPath();
          ctx.arc(0, 0, 5 / zoom, 0, 2 * Math.PI);
          ctx.fill();
          ctx.restore();
          console.log('Highlighted product point drawn:', {
            product: highlightedProduct.product.name,
            shelfId: shelf.id,
            fraction,
            pointX,
            pointY,
          });
        }
      }
    }

    setProductPoint(newProductPoint);
    ctx.restore();
    console.log('Map rendered with shelves:', shelves, 'tempShelf:', tempShelfData, 'editingShelf:', editingShelf, 'highlightedProduct:', highlightedProduct);
  }, [storeId, selectedFloor, zoom, offset, tempShelfData, editingShelf, shelves, highlightedProduct]);

  // Rendu 3D du rayon
  useEffect(() => {
    if (!show3DModal || !threeCanvasRef.current) return;

    const canvas = threeCanvasRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff); // Fond blanc pour meilleure visibilité
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    const { shelf, product } = show3DModal;
    const shelfHeight = shelf.floors * 2; // Hauteur proportionnelle au nombre d'étages
    const shelfLength = shelf.length * 10;

    // Contour du rectangle du rayon
    const planeGeometry = new THREE.PlaneGeometry(shelfLength, shelfHeight);
    const edges = new THREE.EdgesGeometry(planeGeometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
    const outline = new THREE.LineSegments(edges, lineMaterial);
    outline.position.set(0, 0, 0);
    scene.add(outline);

    // Segments pour les étages (n-1 segments)
    const n = shelf.floors;
    const lineGeometries = [];
    const lineMaterials = [];
    for (let i = 1; i < n; i++) {
      const y = (i * shelfHeight) / n - shelfHeight / 2; // Position à i*h/n depuis le bas
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-shelfLength / 2, y, 0),
        new THREE.Vector3(shelfLength / 2, y, 0),
      ]);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(line);
      lineGeometries.push(lineGeometry);
      lineMaterials.push(lineMaterial);
    }

    // Point rouge pour le produit
    let sphereGeometry, sphereMaterial;
    const productsOnFloor = shelf.products.filter((p) => p.floor === product.floor);
    const numProducts = productsOnFloor.length;
    const productIndex = productsOnFloor.findIndex((p) => p.id === product.id) + 1; // 1-based
    if (numProducts > 0 && productIndex > 0) {
      const fractionX = (productIndex + 1) / (numProducts + 1);
      const x = fractionX * shelfLength - shelfLength / 2;
      let y;
      if (product.floor === 1) {
        y = (-shelfHeight / 2) + (0.5 / n) * shelfHeight; // Entre le bas et le premier segment
      } else {
        y = ((product.floor - 1) / n) * shelfHeight - shelfHeight / 2 + (0.5 / n) * shelfHeight; // Entre segment k-1 et k
      }
      sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);
      sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(x, y, 0);
      scene.add(sphere);
      console.log('3D product point drawn:', {
        product: product.name,
        shelfId: shelf.id,
        x,
        y,
        floor: product.floor,
        fractionX,
      });
    }

    // Positionner la caméra
    camera.position.z = Math.max(shelfLength, shelfHeight) * 0.75;
    camera.lookAt(0, 0, 0);

    // Animation avec gestion d'erreurs
    const animate = () => {
      try {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      } catch (error) {
        console.error('Error in Three.js render loop:', error);
      }
    };
    animate();

    // Nettoyage
    return () => {
      scene.remove(outline);
      planeGeometry.dispose();
      edges.dispose();
      lineMaterial.dispose();
      lineGeometries.forEach((geo) => geo.dispose());
      lineMaterials.forEach((mat) => mat.dispose());
      if (sphereGeometry) sphereGeometry.dispose();
      if (sphereMaterial) sphereMaterial.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, [show3DModal]);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;

    setContextMenu(null);
    setShowProductsPopup(null);

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x * zoom) / zoom;
    const y = (e.clientY - rect.top - offset.y * zoom) / zoom;

    // Vérifier si le clic est sur le point rouge
    if (productPoint) {
      const distance = Math.sqrt((x - productPoint.x) ** 2 + (y - productPoint.y) ** 2);
      if (distance < 10 / zoom) {
        setShow3DModal({ shelf: productPoint.shelf, product: productPoint.product });
        console.log('Clicked on product point, opening 3D modal:', productPoint.product.name);
        return;
      }
    }

    let selectedPlacedShelf = null;
    for (const shelf of shelves.filter((s) => s.isPlaced)) {
      const centerX = shelf.position.x + (shelf.length * 10) / 2;
      const centerY = shelf.position.y + (shelf.depth * 10) / 2;
      const rotatedX =
        Math.cos(-(shelf.rotation || 0) * Math.PI / 180) * (x - centerX) +
        Math.sin(-(shelf.rotation || 0) * Math.PI / 180) * (y - centerY) +
        centerX;
      const rotatedY =
        -Math.sin(-(shelf.rotation || 0) * Math.PI / 180) * (x - centerX) +
        Math.cos(-(shelf.rotation || 0) * Math.PI / 180) * (y - centerY) +
        centerY;
      if (
        rotatedX >= shelf.position.x &&
        rotatedX <= shelf.position.x + shelf.length * 10 &&
        rotatedY >= shelf.position.y &&
        rotatedY <= shelf.position.y + shelf.depth * 10
      ) {
        selectedPlacedShelf = shelf;
        break;
      }
    }

    if (selectedPlacedShelf && mode === 'none') {
      setContextMenu({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        shelf: selectedPlacedShelf,
      });
      setEditingShelf({ ...selectedPlacedShelf });
      setInitialShelfState({ ...selectedPlacedShelf });
      console.log('Context menu opened for shelf:', selectedPlacedShelf);
      return;
    }

    if (tempShelfData && !tempShelfData.isPlaced && tempShelfData.position) {
      const centerX = tempShelfData.position.x + (tempShelfData.length * 10) / 2;
      const centerY = tempShelfData.position.y + (tempShelfData.depth * 10) / 2;
      const rotatedX =
        Math.cos(-(tempShelfData.rotation || 0) * Math.PI / 180) * (x - centerX) +
        Math.sin(-(tempShelfData.rotation || 0) * Math.PI / 180) * (y - centerY) +
        centerX;
      const rotatedY =
        -Math.sin(-(tempShelfData.rotation || 0) * Math.PI / 180) * (x - centerX) +
        Math.cos(-(tempShelfData.rotation || 0) * Math.PI / 180) * (y - centerY) +
        centerY;
      const circleX = tempShelfData.position.x + (tempShelfData.length * 10) - 5;
      const circleY = tempShelfData.position.y + 5;
      const distance = Math.sqrt((x - circleX) ** 2 + (y - circleY) ** 2);
      if (distance < 5 / zoom) {
        setRotatingShelf({ id: tempShelfData.id });
        return;
      } else if (
        rotatedX >= tempShelfData.position.x &&
        rotatedX <= tempShelfData.position.x + tempShelfData.length * 10 &&
        rotatedY >= tempShelfData.position.y &&
        rotatedY <= tempShelfData.position.y + tempShelfData.depth * 10
      ) {
        setDraggingShelf({
          id: tempShelfData.id,
          offsetX: x - tempShelfData.position.x,
          offsetY: y - tempShelfData.position.y,
        });
        return;
      }
    }

    if (editingShelf && mode === 'move') {
      const centerX = editingShelf.position.x + (editingShelf.length * 10) / 2;
      const centerY = editingShelf.position.y + (editingShelf.depth * 10) / 2;
      const rotatedX =
        Math.cos(-(editingShelf.rotation || 0) * Math.PI / 180) * (x - centerX) +
        Math.sin(-(shelf.rotation || 0) * Math.PI / 180) * (y - centerY) +
        centerX;
      const rotatedY =
        -Math.sin(-(editingShelf.rotation || 0) * Math.PI / 180) * (x - centerX) +
        Math.cos(-(editingShelf.rotation || 0) * Math.PI / 180) * (y - centerY) +
        centerY;
      if (
        rotatedX >= editingShelf.position.x &&
        rotatedX <= editingShelf.position.x + editingShelf.length * 10 &&
        rotatedY >= editingShelf.position.y &&
        rotatedY <= editingShelf.position.y + editingShelf.depth * 10
      ) {
        setDraggingShelf({
          id: editingShelf.id,
          offsetX: x - editingShelf.position.x,
          offsetY: y - editingShelf.position.y,
        });
        return;
      }
    }

    if (editingShelf && mode === 'rotate') {
      setRotatingShelf({ id: editingShelf.id });
      return;
    }

    if (mode === 'none') {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      console.log('Panning started:', { x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x * zoom) / zoom;
    const y = (e.clientY - rect.top - offset.y * zoom) / zoom;

    if (isPanning && mode === 'none') {
      const dx = (e.clientX - panStart.x) / zoom;
      const dy = (e.clientY - panStart.y) / zoom;
      setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      setPanStart({ x: e.clientX, y: e.clientY });
      console.log('Panning:', { dx, dy, offset: { x: offset.x + dx, y: offset.y + dy } });
    } else if (draggingShelf && editingShelf && mode === 'move') {
      const newX = x - draggingShelf.offsetX;
      const newY = y - draggingShelf.offsetY;
      setEditingShelf((prev) => ({ ...prev, position: { x: newX, y: newY } }));
      console.log('Dragging shelf:', { id: editingShelf.id, x: newX, y: newY });
    } else if (rotatingShelf && editingShelf && mode === 'rotate') {
      const centerX = editingShelf.position.x + (editingShelf.length * 10) / 2;
      const centerY = editingShelf.position.y + (editingShelf.depth * 10) / 2;
      const rotation = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
      setEditingShelf((prev) => ({ ...prev, rotation }));
      console.log('Rotating shelf:', { id: editingShelf.id, rotation });
    } else if (draggingShelf && tempShelfData) {
      const newX = x - draggingShelf.offsetX;
      const newY = y - draggingShelf.offsetY;
      setTempShelfData((prev) => ({ ...prev, position: { x: newX, y: newY } }));
      console.log('Dragging temp shelf:', { id: tempShelfData.id, x: newX, y: newY });
    } else if (rotatingShelf && tempShelfData) {
      const centerX = tempShelfData.position.x + (tempShelfData.length * 10) / 2;
      const centerY = tempShelfData.position.y + (tempShelfData.depth * 10) / 2;
      const rotation = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
      setTempShelfData((prev) => ({ ...prev, rotation }));
      console.log('Rotating temp shelf:', { id: tempShelfData.id, rotation });
    }
  };

  const handleMouseUp = (e) => {
    if (draggingShelf && editingShelf && mode === 'move') {
      updateShelf(storeId, selectedFloor, editingShelf.id, { ...editingShelf });
      console.log('Shelf position saved:', editingShelf);
    } else if (rotatingShelf && editingShelf && mode === 'rotate') {
      updateShelf(storeId, selectedFloor, editingShelf.id, { ...editingShelf });
      console.log('Shelf rotation saved:', editingShelf);
    }
    setDraggingShelf(null);
    setRotatingShelf(null);
    setIsPanning(false);
    console.log('Mouse up, panning stopped');
  };

  const handleContextMenuClick = (action) => {
    if (!contextMenu) return;
    if (action === 'edit') {
      onEditShelf(contextMenu.shelf.id);
      setMode('none');
      setEditingShelf(null);
      setInitialShelfState(null);
    } else if (action === 'move') {
      setMode('move');
      setDraggingShelf({
        id: contextMenu.shelf.id,
        offsetX: 0,
        offsetY: 0,
      });
    } else if (action === 'rotate') {
      setMode('rotate');
      setRotatingShelf({ id: contextMenu.shelf.id });
    } else if (action === 'viewProducts') {
      const groupedProducts = contextMenu.shelf.products.reduce((acc, product) => {
        const floor = product.floor;
        if (!floor || floor < 1 || floor > contextMenu.shelf.floors) {
          console.warn('Invalid floor for product:', product.name, 'floor:', floor, 'max floors:', contextMenu.shelf.floors);
          return acc;
        }
        if (!acc[floor]) {
          acc[floor] = [];
        }
        acc[floor].push(product);
        return acc;
      }, {});
      const sortedGroupedProducts = {};
      for (let i = 1; i <= contextMenu.shelf.floors; i++) {
        sortedGroupedProducts[i] = groupedProducts[i] ? groupedProducts[i].sort((a, b) => a.position - b.position) : [];
      }
      setShowProductsPopup({
        shelf: contextMenu.shelf,
        groupedProducts: sortedGroupedProducts,
      });
    }
    setContextMenu(null);
    console.log('Context menu action:', action, 'for shelf:', contextMenu.shelf);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.1, 3));
    console.log('Zoom in:', zoom);
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.1, 0.5));
    console.log('Zoom out:', zoom);
  };

  const handleConfirm = () => {
    if (editingShelf) {
      updateShelf(storeId, selectedFloor, editingShelf.id, { ...editingShelf });
      setEditingShelf(null);
      setInitialShelfState(null);
      setMode('none');
      const stores = getStores();
      const store = stores.find((s) => s.id === storeId) || { floors: [{ id: 1, shelves: [] }] };
      const floor = store.floors.find((f) => f.id === selectedFloor) || { shelves: [] };
      setShelves([...(floor.shelves || [])]);
      console.log('Placed shelf edit confirmed:', editingShelf);
    }
  };

  const handleCancel = () => {
    if (tempShelfData && !tempShelfData.isPlaced) {
      setTempShelfData(null);
      console.log('Shelf placement cancelled');
    } else if (editingShelf && initialShelfState) {
      setEditingShelf({ ...initialShelfState });
      updateShelf(storeId, selectedFloor, editingShelf.id, { ...initialShelfState });
      setEditingShelf(null);
      setInitialShelfState(null);
      setMode('none');
      const stores = getStores();
      const store = stores.find((s) => s.id === storeId) || { floors: [{ id: 1, shelves: [] }] };
      const floor = store.floors.find((f) => f.id === selectedFloor) || { shelves: [] };
      setShelves([...(floor.shelves || [])]);
      console.log('Placed shelf edit cancelled, restored to:', initialShelfState);
    }
  };

  const handleFloorChange = (e) => {
    setSelectedFloor(Number(e.target.value));
  };

  const stores = getStores();
  const store = stores.find((s) => s.id === storeId) || { floors: [{ id: 1, name: "Étage 1", shelves: [] }] };
  const floors = store.floors || [];

  return (
    <div className="border p-4 bg-white flex relative">
      <div>
        <h2 className="text-xl mb-2">Carte du magasin</h2>
        <canvas
          ref={canvasRef}
          width="400"
          height="400"
          className="border"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onContextMenu={(e) => e.preventDefault()}
        />
        {(tempShelfData && !tempShelfData.isPlaced) || editingShelf ? (
          <div className="mt-4 flex space-x-2">
            <button
              onClick={handleConfirm}
              className="bg-green-500 text-white px-2 py-1 rounded flex items-center"
            >
              ✓ Valider
            </button>
            <button
              onClick={handleCancel}
              className="bg-red-500 text-white px-2 py-1 rounded flex items-center"
            >
              ✗ Annuler
            </button>
          </div>
        ) : null}
        <div className="mt-4">
          <select value={selectedFloor} onChange={handleFloorChange} className="ml-2">
            {floors.map((floor) => (
              <option key={floor.id} value={floor.id}>
                {floor.name}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-2">
          Astuce : Clic gauche sur un rayon pour ouvrir le menu, clic gauche ailleurs pour déplacer la carte, boutons +/- pour zoomer, clic sur le point rouge pour voir le rayon en 3D.
        </p>
      </div>
      <div className="ml-4 flex flex-col space-y-2">
        <button
          onClick={handleZoomIn}
          className="bg-blue-500 text-white px-2 py-1 rounded w-10 h-10 flex items-center justify-center"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-blue-500 text-white px-2 py-1 rounded w-10 h-10 flex items-center justify-center"
        >
          −
        </button>
      </div>
      {contextMenu && (
        <div
          className="absolute bg-white border shadow-lg rounded"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={() => handleContextMenuClick('edit')}
            className="block px-4 py-2 text-left hover:bg-gray-100 w-full"
          >
            Modifier
          </button>
          <button
            onClick={() => handleContextMenuClick('move')}
            className="block px-4 py-2 text-left hover:bg-gray-100 w-full"
          >
            Déplacer
          </button>
          <button
            onClick={() => handleContextMenuClick('rotate')}
            className="block px-4 py-2 text-left hover:bg-gray-100 w-full"
          >
            Pivoter
          </button>
          <button
            onClick={() => handleContextMenuClick('viewProducts')}
            className="block px-4 py-2 text-left hover:bg-gray-100 w-full"
          >
            Voir les produits
          </button>
        </div>
      )}
      {showProductsPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded max-w-lg w-full">
            <h3 className="text-lg mb-2">Produits du rayon {showProductsPopup.shelf.name}</h3>
            {Object.keys(showProductsPopup.groupedProducts).length === 0 ? (
              <p>Aucun produit dans ce rayon.</p>
            ) : (
              <div className="space-y-4">
                {Object.keys(showProductsPopup.groupedProducts)
                  .sort((a, b) => Number(a) - Number(b))
                  .map((floor) => (
                    <div key={floor}>
                      <h4 className="text-md font-bold">Étage du rayon {floor}</h4>
                      <hr className="my-2" />
                      {showProductsPopup.groupedProducts[floor].length === 0 ? (
                        <p>Aucun produit à cet étage.</p>
                      ) : (
                        <ul className="space-y-2">
                          {showProductsPopup.groupedProducts[floor].map((product) => (
                            <li key={product.id} className="p-2 border">
                              {product.name} (Position: {product.position}, Quantité: {product.quantity}, Prix: {product.price}€)
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
              </div>
            )}
            <button
              onClick={() => setShowProductsPopup(null)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
      {show3DModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded max-w-lg w-full">
            <h3 className="text-lg mb-2">Visualisation 3D du rayon {show3DModal.shelf.name}</h3>
            <canvas
              ref={threeCanvasRef}
              style={{ width: '400px', height: '400px' }}
              className="border"
            />
            <button
              onClick={() => setShow3DModal(null)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StoreMap;