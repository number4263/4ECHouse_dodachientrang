import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ProjectData, Point2D, ElevSectEntity } from '../types/cad';
import {
  RotateCcw,
  Box,
  Layers,
  MousePointer2,
  PenTool,
  DoorOpen,
  Square,
  Fence,
  Home,
  Eraser,
  Undo2,
  Redo2,
  Sliders,
} from 'lucide-react';
import { CursorToolBadge } from './CursorToolBadge';

export type Tool3DType =
  | 'select'
  | 'eraser'
  | 'wall'
  | 'slab'
  | 'railing'
  | 'roof'
  | 'door'
  | 'window'
  | 'glass_partition';

interface Viewer3DProps {
  project: ProjectData;
  onAddWall?: (start: Point2D, end: Point2D) => void;
  onAddOpening?: (wallId: string, type: any, distMm: number) => void;
  onAddElevSectEntity?: (entity: ElevSectEntity) => void;
  onDeleteWall?: (id: string) => void;
  onDeleteOpening?: (id: string) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const Viewer3D: React.FC<Viewer3DProps> = ({
  project,
  onAddWall,
  onAddOpening,
  onAddElevSectEntity,
  onDeleteWall,
  onDeleteOpening,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [showCeiling, setShowCeiling] = useState<boolean>(false);
  const [ceilingHeight, setCeilingHeight] = useState<number>(project.defaultCeilingHeight || 2800);
  const [activeTool, setActiveTool] = useState<Tool3DType>('select');

  // 3D Tool Dimension Configuration State (Bảng thuộc tính công cụ 3D)
  const [wallThickness3D, setWallThickness3D] = useState<number>(project.defaultWallThickness || 220);
  const [wallHeight3D, setWallHeight3D] = useState<number>(project.defaultCeilingHeight || 2800);
  const [wallAlignment3D, setWallAlignment3D] = useState<'center' | 'interior' | 'exterior'>('center');
  const [slabThickness3D, setSlabThickness3D] = useState<number>(150);
  const [slabMaterial3D, setSlabMaterial3D] = useState<string>('Gạch men cao cấp');
  const [railingHeight3D, setRailingHeight3D] = useState<number>(1100);
  const [railingStyle3D, setRailingStyle3D] = useState<'glass' | 'steel_bar' | 'masonry'>('glass');
  const [roofTrussShape3D, setRoofTrussShape3D] = useState<'triangle' | 'trapezoid' | 'rectangular'>('triangle');
  const [roofSlopeDeg3D, setRoofSlopeDeg3D] = useState<number>(28);
  const [doorWidth3D, setDoorWidth3D] = useState<number>(950);
  const [doorHeight3D, setDoorHeight3D] = useState<number>(2200);
  const [windowWidth3D, setWindowWidth3D] = useState<number>(1600);
  const [windowHeight3D, setWindowHeight3D] = useState<number>(1400);

  // Floating Cursor Badge State
  const [cursorScreenPos, setCursorScreenPos] = useState<{ x: number; y: number } | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const buildingGroupRef = useRef<THREE.Group | null>(null);

  // Mouse interaction state for Orbit controls
  const isDraggingRef = useRef<boolean>(false);
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const prevMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraAngleRef = useRef<{ theta: number; phi: number; radius: number }>({
    theta: Math.PI / 4,
    phi: Math.PI / 3,
    radius: 14,
  });
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.2, 0));

  // Center CAD coordinates ref
  const centerCadRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x13161c);
    scene.fog = new THREE.FogExp2(0x13161c, 0.025);
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mount.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.2);
    dirLight.position.set(15, 25, 18);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.4);
    fillLight.position.set(-15, 10, -15);
    scene.add(fillLight);

    // 5. Ground grid plane
    const gridHelper = new THREE.GridHelper(30, 30, 0x334155, 0x1e293b);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // 6. Group for surveyed building
    const buildingGroup = new THREE.Group();
    scene.add(buildingGroup);
    buildingGroupRef.current = buildingGroup;

    // Animation render loop
    let animId: number;
    const renderScene = () => {
      animId = requestAnimationFrame(renderScene);

      const { theta, phi, radius } = cameraAngleRef.current;
      const target = cameraTargetRef.current;

      camera.position.x = target.x + radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = target.y + radius * Math.cos(phi);
      camera.position.z = target.z + radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(target);

      renderer.render(scene, camera);
    };
    renderScene();

    const handleResize = () => {
      if (!mount || !renderer || !camera) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Rebuild 3D building meshes when project changes
  useEffect(() => {
    const buildingGroup = buildingGroupRef.current;
    if (!buildingGroup) return;

    // Clear old meshes
    while (buildingGroup.children.length > 0) {
      const obj = buildingGroup.children[0];
      buildingGroup.remove(obj);
    }

    // Calculate center CAD
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    if (project.walls.length === 0) {
      minX = 0;
      maxX = 6000;
      minY = 0;
      maxY = 6000;
    } else {
      project.walls.forEach((w) => {
        minX = Math.min(minX, w.start.x, w.end.x);
        minY = Math.min(minY, w.start.y, w.end.y);
        maxX = Math.max(maxX, w.start.x, w.end.x);
        maxY = Math.max(maxY, w.start.y, w.end.y);
      });
    }

    const centerCadX = (minX + maxX) / 2;
    const centerCadY = (minY + maxY) / 2;
    centerCadRef.current = { x: centerCadX, y: centerCadY };

    cameraTargetRef.current.set(0, ceilingHeight / 1000 / 2, 0);

    // Materials
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      roughness: 0.6,
      metalness: 0.05,
      wireframe: wireframe,
    });

    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x242832,
      roughness: 0.4,
      metalness: 0.1,
    });

    const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.4,
      transparent: true,
      opacity: 0.85,
    });

    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.45,
    });

    const colMaterial = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.7,
      metalness: 0.1,
      wireframe: wireframe,
    });

    const roofMaterial = new THREE.MeshStandardMaterial({
      color: 0xea580c,
      roughness: 0.5,
      metalness: 0.1,
    });

    const railingMaterial = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.2,
      metalness: 0.7,
      transparent: true,
      opacity: 0.6,
    });

    // 1. Build Walls in 3D WITH CUTOUT FOR OPENINGS (Khoét thủng đoạn tường khi đặt cửa)
    project.walls.forEach((wall) => {
      const dx = wall.end.x - wall.start.x;
      const dy = wall.end.y - wall.start.y;
      const lenMm = Math.hypot(dx, dy);
      if (lenMm < 50) return;

      const thickM = wall.thickness / 1000;
      const heightM = (wall.height || ceilingHeight) / 1000;
      const angle = -Math.atan2(dy, dx);
      const ux = dx / lenMm;
      const uy = dy / lenMm;

      // Openings on this wall
      const wallOps = project.openings.filter((o) => o.wallId === wall.id);

      if (wallOps.length === 0) {
        // No openings: full solid wall box
        const lenM = lenMm / 1000;
        const midCadX = (wall.start.x + wall.end.x) / 2 - centerCadX;
        const midCadY = (wall.start.y + wall.end.y) / 2 - centerCadY;

        const wallGeom = new THREE.BoxGeometry(lenM, heightM, thickM);
        const wallMesh = new THREE.Mesh(wallGeom, wallMaterial);
        wallMesh.position.set(midCadX / 1000, heightM / 2, -midCadY / 1000);
        wallMesh.rotation.y = angle;
        wallMesh.castShadow = true;
        wallMesh.receiveShadow = true;
        wallMesh.userData = { type: 'wall', id: wall.id };
        buildingGroup.add(wallMesh);
      } else {
        // Wall has openings: Cut out solid segments horizontally and vertically!
        const validOps = wallOps
          .map((op) => ({
            ...op,
            sDist: Math.max(0, Math.min(lenMm, op.distanceFromStart)),
            eDist: Math.max(0, Math.min(lenMm, op.distanceFromStart + op.width)),
          }))
          .sort((a, b) => a.sDist - b.sDist);

        let curDist = 0;
        validOps.forEach((op) => {
          // Solid wall slice before opening
          if (op.sDist > curDist + 10) {
            const sliceLenMm = op.sDist - curDist;
            const sliceMidDist = curDist + sliceLenMm / 2;
            const midX = wall.start.x + ux * sliceMidDist - centerCadX;
            const midY = wall.start.y + uy * sliceMidDist - centerCadY;

            const sliceGeom = new THREE.BoxGeometry(sliceLenMm / 1000, heightM, thickM);
            const sliceMesh = new THREE.Mesh(sliceGeom, wallMaterial);
            sliceMesh.position.set(midX / 1000, heightM / 2, -midY / 1000);
            sliceMesh.rotation.y = angle;
            sliceMesh.castShadow = true;
            sliceMesh.receiveShadow = true;
            sliceMesh.userData = { type: 'wall', id: wall.id };
            buildingGroup.add(sliceMesh);
          }

          // At opening: Sill wall (under window) and Lintel wall (above door/window)
          const opLenMm = op.eDist - op.sDist;
          const opMidDist = (op.sDist + op.eDist) / 2;
          const opMidX = wall.start.x + ux * opMidDist - centerCadX;
          const opMidY = wall.start.y + uy * opMidDist - centerCadY;

          const sillM = (op.sillHeight || 0) / 1000;
          const opHM = (op.height || 2200) / 1000;
          const topM = sillM + opHM;

          // 1.1 Bottom Sill wall (bậu tường dưới cửa sổ)
          if (sillM > 0.05) {
            const sillGeom = new THREE.BoxGeometry(opLenMm / 1000, sillM, thickM);
            const sillMesh = new THREE.Mesh(sillGeom, wallMaterial);
            sillMesh.position.set(opMidX / 1000, sillM / 2, -opMidY / 1000);
            sillMesh.rotation.y = angle;
            sillMesh.castShadow = true;
            sillMesh.receiveShadow = true;
            sillMesh.userData = { type: 'wall', id: wall.id };
            buildingGroup.add(sillMesh);
          }

          // 1.2 Top Lintel wall (lanh-tô tường trên cửa)
          if (topM < heightM - 0.05) {
            const lintelHM = heightM - topM;
            const lintelGeom = new THREE.BoxGeometry(opLenMm / 1000, lintelHM, thickM);
            const lintelMesh = new THREE.Mesh(lintelGeom, wallMaterial);
            lintelMesh.position.set(opMidX / 1000, topM + lintelHM / 2, -opMidY / 1000);
            lintelMesh.rotation.y = angle;
            lintelMesh.castShadow = true;
            lintelMesh.receiveShadow = true;
            lintelMesh.userData = { type: 'wall', id: wall.id };
            buildingGroup.add(lintelMesh);
          }

          curDist = Math.max(curDist, op.eDist);
        });

        // Remaining wall slice after last opening
        if (curDist < lenMm - 10) {
          const sliceLenMm = lenMm - curDist;
          const sliceMidDist = curDist + sliceLenMm / 2;
          const midX = wall.start.x + ux * sliceMidDist - centerCadX;
          const midY = wall.start.y + uy * sliceMidDist - centerCadY;

          const sliceGeom = new THREE.BoxGeometry(sliceLenMm / 1000, heightM, thickM);
          const sliceMesh = new THREE.Mesh(sliceGeom, wallMaterial);
          sliceMesh.position.set(midX / 1000, heightM / 2, -midY / 1000);
          sliceMesh.rotation.y = angle;
          sliceMesh.castShadow = true;
          sliceMesh.receiveShadow = true;
          sliceMesh.userData = { type: 'wall', id: wall.id };
          buildingGroup.add(sliceMesh);
        }
      }
    });

    // 2. Build Openings (Khung bao và cánh cửa lọt vào khoảng khoét thủng)
    project.openings.forEach((op) => {
      const wall = project.walls.find((w) => w.id === op.wallId);
      if (!wall) return;

      const dx = wall.end.x - wall.start.x;
      const dy = wall.end.y - wall.start.y;
      const wLen = Math.hypot(dx, dy);
      if (wLen < 1) return;

      const ux = dx / wLen;
      const uy = dy / wLen;
      const centerDistMm = op.distanceFromStart + op.width / 2;

      const opCadX = wall.start.x + ux * centerDistMm - centerCadX;
      const opCadY = wall.start.y + uy * centerDistMm - centerCadY;
      const posX = opCadX / 1000;
      const posZ = -opCadY / 1000;
      const angle = -Math.atan2(dy, dx);

      const opWidthM = op.width / 1000;
      const opHeightM = op.height / 1000;
      const opSillM = op.sillHeight / 1000;
      const opThickM = (wall.thickness + 20) / 1000;

      const geom = new THREE.BoxGeometry(opWidthM, opHeightM, opThickM);
      const mesh = new THREE.Mesh(geom, op.type.startsWith('door') ? doorMaterial : glassMaterial);
      mesh.position.set(posX, opSillM + opHeightM / 2, posZ);
      mesh.rotation.y = angle;
      mesh.userData = { type: 'opening', id: op.id };
      buildingGroup.add(mesh);
    });

    // 3. Build Columns
    project.columns.forEach((col) => {
      const posX = (col.x - centerCadX) / 1000;
      const posZ = -(col.y - centerCadY) / 1000;
      const colHeightM = ceilingHeight / 1000;

      const geom = new THREE.BoxGeometry(col.width / 1000, colHeightM, col.depth / 1000);
      const mesh = new THREE.Mesh(geom, colMaterial);
      mesh.position.set(posX, colHeightM / 2, posZ);
      mesh.rotation.y = -(col.rotation * Math.PI) / 180;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { type: 'column', id: col.id };
      buildingGroup.add(mesh);
    });

    // 4. Build Floor Slab
    const floorW = (maxX - minX + 2400) / 1000;
    const floorD = (maxY - minY + 2400) / 1000;
    const floorGeom = new THREE.BoxGeometry(floorW, 0.15, floorD);
    const floorMesh = new THREE.Mesh(floorGeom, floorMaterial);
    floorMesh.position.set(0, -0.075, 0);
    floorMesh.receiveShadow = true;
    floorMesh.userData = { type: 'floor' };
    buildingGroup.add(floorMesh);

    // 5. Build Slabs, Railings, and Roofs from elevSectEntities
    project.elevSectEntities?.forEach((ent) => {
      const entMidX = (ent.x + ent.width / 2 - centerCadX) / 1000;
      const entY = ent.y / 1000;

      if (ent.type === 'beam_slab') {
        const slabGeom = new THREE.BoxGeometry(ent.width / 1000, ent.height / 1000, floorD * 0.85);
        const slabMesh = new THREE.Mesh(slabGeom, floorMaterial);
        slabMesh.position.set(entMidX, entY - (ent.height / 1000) / 2, 0);
        slabMesh.userData = { type: 'slab', id: ent.id };
        buildingGroup.add(slabMesh);
      } else if (ent.type === 'railing_balcony') {
        const rH = (ent.railingHeightMm || 1100) / 1000;
        const railGeom = new THREE.BoxGeometry(ent.width / 1000, rH, 0.05);
        const railMesh = new THREE.Mesh(railGeom, railingMaterial);
        railMesh.position.set(entMidX, entY + rH / 2, floorD / 2 - 0.2);
        railMesh.userData = { type: 'railing', id: ent.id };
        buildingGroup.add(railMesh);
      } else if (ent.type === 'roof_pitched' || ent.type === 'roof_flat') {
        const rW = ent.width / 1000;
        const rH = (ent.height || 1200) / 1000;
        const roofGeom = new THREE.ConeGeometry(rW * 0.65, rH, 4);
        const roofMesh = new THREE.Mesh(roofGeom, roofMaterial);
        roofMesh.position.set(entMidX, entY + rH / 2, 0);
        roofMesh.rotation.y = Math.PI / 4;
        roofMesh.userData = { type: 'roof', id: ent.id };
        buildingGroup.add(roofMesh);
      }
    });

    // Optional Ceiling Slab
    if (showCeiling) {
      const ceilGeom = new THREE.BoxGeometry(floorW, 0.1, floorD);
      const ceilMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
      });
      const ceilMesh = new THREE.Mesh(ceilGeom, ceilMat);
      ceilMesh.position.set(0, ceilingHeight / 1000 + 0.05, 0);
      buildingGroup.add(ceilMesh);
    }
  }, [project, wireframe, showCeiling, ceilingHeight]);

  // Pointer interactions
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    setCursorScreenPos({ x: e.clientX, y: e.clientY });

    if (!isDraggingRef.current) return;
    const dx = e.clientX - prevMouseRef.current.x;
    const dy = e.clientY - prevMouseRef.current.y;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };

    if (e.buttons === 1) {
      cameraAngleRef.current.theta -= dx * 0.008;
      cameraAngleRef.current.phi = Math.max(
        0.1,
        Math.min(Math.PI / 2 - 0.05, cameraAngleRef.current.phi - dy * 0.008)
      );
    } else if (e.buttons === 2 || e.buttons === 4) {
      const sinT = Math.sin(cameraAngleRef.current.theta);
      const cosT = Math.cos(cameraAngleRef.current.theta);
      cameraTargetRef.current.x -= (cosT * dx + sinT * dy) * 0.01;
      cameraTargetRef.current.z += (sinT * dx - cosT * dy) * 0.01;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const totalDist = Math.hypot(
      e.clientX - dragStartPosRef.current.x,
      e.clientY - dragStartPosRef.current.y
    );
    isDraggingRef.current = false;

    // If it was a quick click and not a drag, execute 3D tool action!
    if (totalDist < 6 && activeTool !== 'select') {
      executeToolClick(e);
    }
  };

  const executeToolClick = (e: React.PointerEvent) => {
    const mount = mountRef.current;
    const camera = cameraRef.current;
    const scene = sceneRef.current;
    if (!mount || !camera || !scene) return;

    const rect = mount.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

    // Raycast on ground plane y=0
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersectPoint);

    if (intersectPoint) {
      const cadX = Math.round(intersectPoint.x * 1000 + centerCadRef.current.x);
      const cadY = Math.round(-intersectPoint.z * 1000 + centerCadRef.current.y);

      if (activeTool === 'wall' && onAddWall) {
        onAddWall({ x: cadX - 1500, y: cadY }, { x: cadX + 1500, y: cadY });
      } else if (activeTool === 'slab' && onAddElevSectEntity) {
        onAddElevSectEntity({
          id: 'slab_' + Date.now(),
          type: 'beam_slab',
          x: cadX - 2500,
          y: 0,
          width: 5000,
          height: 350,
        });
      } else if (activeTool === 'railing' && onAddElevSectEntity) {
        onAddElevSectEntity({
          id: 'rail_' + Date.now(),
          type: 'railing_balcony',
          x: cadX - 1500,
          y: 0,
          width: 3000,
          height: 1100,
          railingHeightMm: 1100,
        });
      } else if (activeTool === 'roof' && onAddElevSectEntity) {
        onAddElevSectEntity({
          id: 'roof_' + Date.now(),
          type: 'roof_pitched',
          x: cadX - 3000,
          y: ceilingHeight,
          width: 6000,
          height: 1800,
          roofSlopeDeg: 28,
        });
      } else if ((activeTool === 'door' || activeTool === 'window' || activeTool === 'glass_partition') && onAddOpening) {
        // Place opening on the closest wall
        if (project.walls.length > 0) {
          const closestWall = project.walls[0];
          const type =
            activeTool === 'door'
              ? 'door_single'
              : activeTool === 'window'
              ? 'window_standard'
              : 'glass_partition';
          onAddOpening(closestWall.id, type, 800);
        }
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    cameraAngleRef.current.radius = Math.max(
      3,
      Math.min(45, cameraAngleRef.current.radius + e.deltaY * 0.015)
    );
  };

  const resetCamera = () => {
    cameraAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 3, radius: 14 };
    cameraTargetRef.current.set(0, ceilingHeight / 1000 / 2, 0);
  };

  const tools: { id: Tool3DType; label: string; icon: any; shortcut: string }[] = [
    { id: 'select', label: 'Xoay Mô Hình 3D', icon: MousePointer2, shortcut: 'V' },
    { id: 'wall', label: 'Đặt Tường 3D', icon: PenTool, shortcut: 'W' },
    { id: 'slab', label: 'Đặt Sàn 3D', icon: Layers, shortcut: 'S' },
    { id: 'railing', label: 'Đặt Lan Can 3D', icon: Fence, shortcut: 'R' },
    { id: 'roof', label: 'Đặt Mái Nhà 3D', icon: Home, shortcut: 'M' },
    { id: 'door', label: 'Đặt Cửa Đi 3D', icon: DoorOpen, shortcut: 'D' },
    { id: 'window', label: 'Đặt Cửa Sổ 3D', icon: Square, shortcut: 'O' },
    { id: 'glass_partition', label: 'Đặt Vách Kính 3D', icon: Square, shortcut: 'G' },
    { id: 'eraser', label: 'Xóa Đối Tượng 3D', icon: Eraser, shortcut: 'E' },
  ];

  return (
    <div className="relative w-full h-full bg-[#13161c] overflow-hidden select-none flex">
      {/* Left 3D Tools Bar */}
      <aside className="w-14 sm:w-16 border-r border-slate-800 bg-[#16191f] flex flex-col items-center py-2 select-none z-20 shrink-0 overflow-y-auto">
        <div className="flex flex-col items-center gap-1.5 w-full px-2">
          {tools.map((t) => {
            const Icon = t.icon;
            const isActive = activeTool === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTool(t.id)}
                className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center p-1 transition-all cursor-pointer group relative ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
                title={`${t.label} (${t.shortcut})`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
                <span className="text-[8px] sm:text-[9px] font-medium tracking-tight text-center leading-none hidden sm:block truncate max-w-full">
                  {t.label.split(' ')[0]}
                </span>

                <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] rounded shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-slate-700">
                  <span className="font-semibold text-amber-400">{t.label}</span>
                  <span className="ml-1 text-slate-400 font-mono">[{t.shortcut}]</span>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main 3D Canvas Viewport */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <div
          ref={mountRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => setCursorScreenPos(null)}
          onWheel={handleWheel}
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* Top Controls Bar */}
        <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-xl text-xs text-slate-300 z-10">
          <div className="flex items-center gap-1.5 mr-1">
            <Box className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-white">3D SketchUp</span>
          </div>

          <button
            onClick={() => setWireframe((w) => !w)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              wireframe
                ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Khung dây
          </button>

          <button
            onClick={() => setShowCeiling((c) => !c)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              showCeiling
                ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Trần nhà
          </button>

          <button
            onClick={resetCamera}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
            title="Đặt lại góc nhìn (Reset View)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Undo / Redo */}
          {onUndo && (
            <div className="flex items-center border-l border-slate-700 pl-2">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className={`p-1.5 rounded transition-all cursor-pointer ${
                  canUndo ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-600 cursor-not-allowed'
                }`}
                title="Hoàn tác (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className={`p-1.5 rounded transition-all cursor-pointer ${
                  canRedo ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-600 cursor-not-allowed'
                }`}
                title="Làm lại (Ctrl+Y)"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Active Tool HUD banner */}
        {activeTool !== 'select' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/95 border border-slate-700 px-3.5 py-1.5 rounded-xl shadow-2xl z-20 text-xs backdrop-blur pointer-events-none">
            <span className="text-amber-400 font-bold">
              {tools.find((t) => t.id === activeTool)?.label}:
            </span>
            <span className="text-slate-300">Click trên mô hình 3D để đặt đối tượng</span>
          </div>
        )}

        {/* 3D Model Stats bottom left */}
        <div className="absolute bottom-4 left-4 bg-slate-900/85 backdrop-blur border border-slate-800 px-3 py-2 rounded-lg text-xs text-slate-400 flex items-center gap-3">
          <span>Tường: <strong className="text-white font-mono">{project.walls.length}</strong></span>
          <span>·</span>
          <span>Cửa khoét thủng: <strong className="text-emerald-400 font-mono">{project.openings.length}</strong></span>
          <span>·</span>
          <span>Cao độ trần: <strong className="text-amber-400 font-mono">{ceilingHeight}mm</strong></span>
        </div>

        {/* Floating Cursor Tool Badge */}
        <CursorToolBadge
          pos={cursorScreenPos}
          tool={activeTool}
        />
      </div>

      {/* Right 3D Tool Properties & Dimensions Inspector Panel */}
      <aside className="w-64 border-l border-slate-800 bg-[#16191f] flex flex-col p-3.5 overflow-y-auto z-20 shrink-0 text-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-500" />
            <span>Thuộc Tính Công Cụ 3D</span>
          </h3>
          <span className="text-[10px] text-amber-400 font-mono font-bold uppercase">
            {activeTool}
          </span>
        </div>

        {/* 1. WALL 3D OPTIONS */}
        {activeTool === 'wall' && (
          <div className="space-y-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="font-bold text-amber-400 text-xs">Thông Số Tường 3D</div>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400">Bề dày tường (mm):</label>
              <div className="grid grid-cols-3 gap-1.5 font-mono">
                {[110, 150, 220].map((t) => (
                  <button
                    key={t}
                    onClick={() => setWallThickness3D(t)}
                    className={`py-1 rounded border text-center transition-colors ${
                      wallThickness3D === t
                        ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-950 border-slate-700 text-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-400">Chiều cao tường (mm):</label>
              <input
                type="number"
                step="100"
                value={wallHeight3D}
                onChange={(e) => setWallHeight3D(parseInt(e.target.value) || 2800)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-400">Trục dóng tường:</label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'interior', label: 'Trong' },
                  { id: 'center', label: 'Giữa' },
                  { id: 'exterior', label: 'Ngoài' },
                ].map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setWallAlignment3D(a.id as any)}
                    className={`py-1 rounded border text-center text-[10px] ${
                      wallAlignment3D === a.id
                        ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-950 border-slate-700 text-slate-300'
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. SLAB 3D OPTIONS */}
        {activeTool === 'slab' && (
          <div className="space-y-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="font-bold text-amber-400 text-xs">Thông Số Bản Sàn 3D</div>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400">Chiều dày sàn (mm):</label>
              <div className="grid grid-cols-3 gap-1.5 font-mono">
                {[100, 120, 150].map((th) => (
                  <button
                    key={th}
                    onClick={() => setSlabThickness3D(th)}
                    className={`py-1 rounded border text-center ${
                      slabThickness3D === th
                        ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-950 border-slate-700 text-slate-300'
                    }`}
                  >
                    {th}mm
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-400">Vật liệu hoàn thiện mặt sàn:</label>
              <select
                value={slabMaterial3D}
                onChange={(e) => setSlabMaterial3D(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white"
              >
                <option value="Gạch men cao cấp">Gạch men 600x600</option>
                <option value="Sàn gỗ sồi">Sàn gỗ sồi tự nhiên</option>
                <option value="Bê tông mài bóng">Bê tông mài bóng</option>
                <option value="Đá marble trắng">Đá Marble Calacatta</option>
              </select>
            </div>
          </div>
        )}

        {/* 3. RAILING 3D OPTIONS */}
        {activeTool === 'railing' && (
          <div className="space-y-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="font-bold text-amber-400 text-xs">Thông Số Lan Can 3D</div>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400">Chiều cao lan can (mm):</label>
              <div className="grid grid-cols-2 gap-2">
                {[900, 1100].map((h) => (
                  <button
                    key={h}
                    onClick={() => setRailingHeight3D(h)}
                    className={`py-1 rounded border text-center font-mono ${
                      railingHeight3D === h
                        ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-950 border-slate-700 text-slate-300'
                    }`}
                  >
                    {h}mm
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-400">Kiểu dáng kiến trúc:</label>
              <select
                value={railingStyle3D}
                onChange={(e) => setRailingStyle3D(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white"
              >
                <option value="glass">Kính Cường Lực Không Trụ</option>
                <option value="steel_bar">Thanh Thép Hộp Sơn Tĩnh Điện</option>
                <option value="masonry">Xây Gạch Sơn Trắng</option>
              </select>
            </div>
          </div>
        )}

        {/* 4. ROOF 3D OPTIONS WITH STEEL TRUSSES */}
        {activeTool === 'roof' && (
          <div className="space-y-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="font-bold text-amber-400 text-xs">Khung Thép Mái 3D (TCVN)</div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-400">Hình dạng khung thép mái:</label>
              <select
                value={roofTrussShape3D}
                onChange={(e) => setRoofTrussShape3D(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white"
              >
                <option value="triangle">Hình Tam Giác (Mái dốc chữ A)</option>
                <option value="trapezoid">Hình Thang (Mansard Truss)</option>
                <option value="rectangular">Hình Chữ Nhật (Giàn phẳng)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-400">Độ dốc mái (độ °):</label>
              <input
                type="number"
                step="1"
                min="5"
                max="60"
                value={roofSlopeDeg3D}
                onChange={(e) => setRoofSlopeDeg3D(parseInt(e.target.value) || 28)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 font-mono text-white"
              />
            </div>
          </div>
        )}

        {/* 5. DOOR & WINDOW 3D OPTIONS */}
        {(activeTool === 'door' || activeTool === 'window' || activeTool === 'glass_partition') && (
          <div className="space-y-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="font-bold text-amber-400 text-xs">Kích Thước Cửa &amp; Khoét Tường</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Rộng (mm):</label>
                <input
                  type="number"
                  step="50"
                  value={activeTool === 'door' ? doorWidth3D : windowWidth3D}
                  onChange={(e) => {
                    const v = parseInt(e.target.value) || 900;
                    if (activeTool === 'door') setDoorWidth3D(v);
                    else setWindowWidth3D(v);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 font-mono text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Cao (mm):</label>
                <input
                  type="number"
                  step="50"
                  value={activeTool === 'door' ? doorHeight3D : windowHeight3D}
                  onChange={(e) => {
                    const v = parseInt(e.target.value) || 2200;
                    if (activeTool === 'door') setDoorHeight3D(v);
                    else setWindowHeight3D(v);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 font-mono text-white"
                />
              </div>
            </div>
            <div className="text-[10px] text-emerald-400">
              ✓ Khi đặt cửa vào tường, hệ thống sẽ tự động khoét thủng đoạn tường tương ứng.
            </div>
          </div>
        )}

        {/* DEFAULT VIEW INFO */}
        {activeTool === 'select' && (
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 space-y-2">
            <div className="font-bold text-white text-xs">Thao Tác Điều Khiển 3D:</div>
            <ul className="space-y-1 list-disc list-inside text-[11px]">
              <li>Giữ chuột trái &amp; kéo: Xoay góc nhìn 3D</li>
              <li>Lăn chuột: Phóng to / Thu nhỏ mô hình</li>
              <li>Chọn một công cụ trên thanh bên trái để trực tiếp thêm tường, sàn, lan can, mái vào 3D.</li>
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
};
