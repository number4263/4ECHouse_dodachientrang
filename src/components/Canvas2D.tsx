import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ProjectData,
  Wall,
  Opening,
  Column,
  Point2D,
  DiagonalCheck,
  SurveyNote,
  WallAngle,
  CurvedWall,
  Staircase,
  MepElement,
  LandscapeElement,
  FreehandStroke,
  DetailCallout,
  MepCategory,
  WallAlignment,
  Storey,
  MEP_CATALOG,
  ElevSectEntity,
  RoofTrussShape,
} from '../types/cad';
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  Zap,
  Crosshair,
  DraftingCompass,
  Spline,
  TrendingUp,
  Pencil,
  Search,
  Check,
  Eye,
  EyeOff,
  Undo2,
  Redo2,
  Eraser,
  Layers,
  Plus,
  Sliders,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';
import { AngleCalculator } from '../services/angleCalculator';
import { CadSymbolRenderer } from '../services/cadSymbolRenderer';
import { CadToolType } from './SidebarTools';
import { CursorToolBadge } from './CursorToolBadge';
import { StoreyManagerModal } from './StoreyManagerModal';

interface Canvas2DProps {
  project: ProjectData;
  activeTool: CadToolType;
  selectedWallId: string | null;
  onSelectWall: (wallId: string | null) => void;
  selectedCurvedWallId?: string | null;
  onSelectCurvedWall?: (id: string | null) => void;
  selectedOpeningId: string | null;
  onSelectOpening: (openingId: string | null) => void;
  selectedStairId?: string | null;
  onSelectStair?: (stairId: string | null) => void;
  selectedColumnId?: string | null;
  onSelectColumn?: (id: string | null) => void;
  selectedMepId?: string | null;
  onSelectMep?: (mepId: string | null) => void;
  selectedLandscapeId?: string | null;
  onSelectLandscape?: (id: string | null) => void;
  selectedDetailCalloutId?: string | null;
  onSelectDetailCallout?: (id: string | null) => void;
  onUpdateWall: (wall: Wall) => void;
  onAddWall: (start: Point2D, end: Point2D, alignment?: WallAlignment, thickness?: number) => void;
  onSelectStorey?: (storeyId: string) => void;
  onAddStorey?: (storey: Storey) => void;
  onUpdateStorey?: (storey: Storey) => void;
  onDeleteStorey?: (storeyId: string) => void;
  onAddCurvedWall: (start: Point2D, end: Point2D, ctrl: Point2D) => void;
  onAddAngle: (wall1Id: string, wall2Id: string) => void;
  onAddOpening: (wallId: string, type: any, distMm: number) => void;
  onAddColumn: (pt: Point2D) => void;
  onAddStaircase: (pt: Point2D) => void;
  onAddMepElement: (pt: Point2D, category: MepCategory) => void;
  onAddLandscape: (pt: Point2D, type: 'shrub' | 'tree_large') => void;
  onAddFreehandStroke: (stroke: FreehandStroke) => void;
  onAddDetailCallout: (callout: DetailCallout) => void;
  onAddDiagonal: (p1: Point2D, p2: Point2D) => void;
  onAddNote: (pt: Point2D, text: string) => void;
  onTriggerLaserForSelected: () => void;
  onToggleUnderlay?: (active: boolean) => void;
  onUpdateUnderlayOpacity?: (opacity: number) => void;
  onDeleteWall?: (id: string) => void;
  onDeleteCurvedWall?: (id: string) => void;
  onDeleteOpening?: (id: string) => void;
  onDeleteColumn?: (id: string) => void;
  onDeleteStair?: (id: string) => void;
  onDeleteMep?: (id: string) => void;
  onDeleteLandscape?: (id: string) => void;
  onDeleteDetailCallout?: (id: string) => void;
  onDeleteFreehandStroke?: (id: string) => void;
  onDeleteDiagonal?: (id: string) => void;
  onDeleteAngle?: (id: string) => void;
  onAddElevSectEntity?: (entity: ElevSectEntity) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const Canvas2D: React.FC<Canvas2DProps> = ({
  project,
  activeTool,
  selectedWallId,
  onSelectWall,
  selectedCurvedWallId,
  onSelectCurvedWall,
  selectedOpeningId,
  onSelectOpening,
  selectedStairId,
  onSelectStair,
  selectedColumnId,
  onSelectColumn,
  selectedMepId,
  onSelectMep,
  selectedLandscapeId,
  onSelectLandscape,
  selectedDetailCalloutId,
  onSelectDetailCallout,
  onUpdateWall,
  onAddWall,
  onAddCurvedWall,
  onAddAngle,
  onAddOpening,
  onAddColumn,
  onAddStaircase,
  onAddMepElement,
  onAddLandscape,
  onAddFreehandStroke,
  onAddDetailCallout,
  onAddDiagonal,
  onAddNote,
  onTriggerLaserForSelected,
  onToggleUnderlay,
  onUpdateUnderlayOpacity,
  onDeleteWall,
  onDeleteCurvedWall,
  onDeleteOpening,
  onDeleteColumn,
  onDeleteStair,
  onDeleteMep,
  onDeleteLandscape,
  onDeleteDetailCallout,
  onDeleteFreehandStroke,
  onDeleteDiagonal,
  onDeleteAngle,
  onSelectStorey,
  onAddStorey,
  onUpdateStorey,
  onDeleteStorey,
  onAddElevSectEntity,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Viewport transform: pan (offset in px) and scale (px per mm)
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 300, y: 350 });
  const [scale, setScale] = useState<number>(0.07); // ~70px per meter
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Drawing state
  const [wallStartPoint, setWallStartPoint] = useState<Point2D | null>(null);
  const [cursorCadPos, setCursorCadPos] = useState<Point2D>({ x: 0, y: 0 });
  const [diagonalStartPoint, setDiagonalStartPoint] = useState<Point2D | null>(null);
  const [hoveredWallId, setHoveredWallId] = useState<string | null>(null);
  const [firstAngleWallId, setFirstAngleWallId] = useState<string | null>(null);

  // Curved Wall 3-point placement state
  const [curvedStart, setCurvedStart] = useState<Point2D | null>(null);
  const [curvedEnd, setCurvedEnd] = useState<Point2D | null>(null);

  // Railing & Roof placement state
  const [railingStartPoint, setRailingStartPoint] = useState<Point2D | null>(null);
  const [roofStartPoint, setRoofStartPoint] = useState<Point2D | null>(null);
  const [railingStylePlan, setRailingStylePlan] = useState<'glass' | 'steel_bar' | 'masonry'>('glass');
  const [roofTrussShapePlan, setRoofTrussShapePlan] = useState<RoofTrussShape>('triangle');
  const [roofSlopeDegPlan, setRoofSlopeDegPlan] = useState<number>(28);

  // Magnetic Snapping Marker state (20px threshold to endpoints and midpoints)
  const [magneticSnapMarker, setMagneticSnapMarker] = useState<{
    pt: Point2D;
    type: 'endpoint' | 'midpoint';
  } | null>(null);

  // Freehand Pen Drawing state
  const [isDrawingStroke, setIsDrawingStroke] = useState<boolean>(false);
  const [activeStrokePts, setActiveStrokePts] = useState<Point2D[]>([]);
  const [penColor, setPenColor] = useState<string>('#f59e0b');
  const [penType, setPenType] = useState<'pen' | 'highlighter'>('pen');

  // MEP Category Selector
  const [mepCategory, setMepCategory] = useState<MepCategory>('socket_double');

  // Wall Drawing Options (Trục dóng & bề dày)
  const [wallAlignment, setWallAlignment] = useState<WallAlignment>(project.defaultWallAlignment || 'center');
  const [wallThickness, setWallThickness] = useState<number>(project.defaultWallThickness || 110);
  const [gridSnap, setGridSnap] = useState<0 | 100 | 500>(0); // 0 = tắt, 100 = 100mm, 500 = 500mm
  const [isStoreyModalOpen, setIsStoreyModalOpen] = useState<boolean>(false);

  // Floating Cursor Tool Badge State
  const [cursorScreenPos, setCursorScreenPos] = useState<{ x: number; y: number } | null>(null);
  const [liveMeasureHint, setLiveMeasureHint] = useState<string | undefined>(undefined);

  // Multi-touch tracking for iPad & iPhone pinch to zoom
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartScaleRef = useRef<number>(scale);
  const [isStylusActive, setIsStylusActive] = useState<boolean>(false);

  // Selection & Eraser Tool state
  const [hoveredSelectTarget, setHoveredSelectTarget] = useState<{
    type: 'wall' | 'curved_wall' | 'opening' | 'column' | 'stair' | 'mep' | 'landscape' | 'callout' | 'stroke' | 'diagonal' | 'angle';
    id: string;
    label?: string;
  } | null>(null);
  const [hoveredDeleteTarget, setHoveredDeleteTarget] = useState<{
    type: 'wall' | 'curved_wall' | 'opening' | 'column' | 'stair' | 'mep' | 'landscape' | 'callout' | 'stroke' | 'diagonal' | 'angle';
    id: string;
    label?: string;
  } | null>(null);
  const [isErasingMouseDown, setIsErasingMouseDown] = useState<boolean>(false);

  // Convert Screen (Canvas px) <-> CAD (mm)
  const screenToCad = useCallback(
    (sx: number, sy: number): Point2D => {
      return {
        x: Math.round((sx - offset.x) / scale),
        y: Math.round((sy - offset.y) / scale),
      };
    },
    [offset, scale]
  );

  const cadToScreen = useCallback(
    (cx: number, cy: number): Point2D => {
      return {
        x: offset.x + cx * scale,
        y: offset.y + cy * scale,
      };
    },
    [offset, scale]
  );

  // Magnetic Snapping to endpoints and midpoints within 20px threshold
  const snapToVertex = useCallback(
    (pos: Point2D, snapThresholdPx = 20): Point2D => {
      const snapRadiusMm = snapThresholdPx / scale;
      let nearest: Point2D | null = null;
      let minDist = snapRadiusMm;
      let snapType: 'endpoint' | 'midpoint' = 'endpoint';

      project.walls.forEach((w) => {
        // 1. Check endpoints
        [w.start, w.end].forEach((pt) => {
          const d = Math.hypot(pt.x - pos.x, pt.y - pos.y);
          if (d < minDist) {
            minDist = d;
            nearest = pt;
            snapType = 'endpoint';
          }
        });

        // 2. Check midpoints
        const mid = { x: (w.start.x + w.end.x) / 2, y: (w.start.y + w.end.y) / 2 };
        const dMid = Math.hypot(mid.x - pos.x, mid.y - pos.y);
        if (dMid < minDist) {
          minDist = dMid;
          nearest = mid;
          snapType = 'midpoint';
        }
      });

      if (nearest) {
        setMagneticSnapMarker({ pt: nearest, type: snapType });
        return nearest;
      } else {
        setMagneticSnapMarker(null);
        if (gridSnap > 0) {
          return {
            x: Math.round(pos.x / gridSnap) * gridSnap,
            y: Math.round(pos.y / gridSnap) * gridSnap,
          };
        }
        return pos;
      }
    },
    [project.walls, scale, gridSnap]
  );

  // Ortho lock
  const snapOrtho = useCallback((start: Point2D, current: Point2D): Point2D => {
    const dx = current.x - start.x;
    const dy = current.y - start.y;
    const angle = (Math.atan2(Math.abs(dy), Math.abs(dx)) * 180) / Math.PI;

    if (angle < 12) return { x: current.x, y: start.y };
    if (angle > 78) return { x: start.x, y: current.y };
    return current;
  }, []);

  // Zoom Extents
  const handleZoomExtents = useCallback(() => {
    if (!canvasRef.current || project.walls.length === 0) return;
    const canvas = canvasRef.current;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    project.walls.forEach((w) => {
      minX = Math.min(minX, w.start.x, w.end.x);
      minY = Math.min(minY, w.start.y, w.end.y);
      maxX = Math.max(maxX, w.start.x, w.end.x);
      maxY = Math.max(maxY, w.start.y, w.end.y);
    });

    const pad = 1200;
    minX -= pad;
    minY -= pad;
    maxX += pad;
    maxY += pad;

    const widthMm = maxX - minX || 5000;
    const heightMm = maxY - minY || 5000;

    const scaleX = canvas.width / widthMm;
    const scaleY = canvas.height / heightMm;
    const newScale = Math.min(scaleX, scaleY) * 0.9;

    setScale(newScale);
    setOffset({
      x: canvas.width / 2 - ((minX + maxX) / 2) * newScale,
      y: canvas.height / 2 - ((minY + maxY) / 2) * newScale,
    });
  }, [project.walls]);

  // Helper to find entity under cursor for selection or deletion
  const findEntityAtPoint = useCallback(
    (
      cadRaw: Point2D,
      clickTolMm: number
    ): {
      type: 'wall' | 'curved_wall' | 'opening' | 'column' | 'stair' | 'mep' | 'landscape' | 'callout' | 'stroke' | 'diagonal' | 'angle';
      id: string;
      label?: string;
    } | null => {
      // 1. Check Openings
      for (const op of project.openings) {
        const wall = project.walls.find((w) => w.id === op.wallId);
        if (wall) {
          const dx = wall.end.x - wall.start.x;
          const dy = wall.end.y - wall.start.y;
          const wLen = Math.hypot(dx, dy);
          if (wLen > 0) {
            const ux = dx / wLen;
            const uy = dy / wLen;
            const midOpX = wall.start.x + ux * (op.distanceFromStart + op.width / 2);
            const midOpY = wall.start.y + uy * (op.distanceFromStart + op.width / 2);
            if (Math.hypot(cadRaw.x - midOpX, cadRaw.y - midOpY) < Math.max(op.width / 2, clickTolMm)) {
              return { type: 'opening', id: op.id, label: op.name || (op.type.startsWith('door') ? 'Cửa đi' : 'Cửa sổ') };
            }
          }
        }
      }

      // 2. Check MEP Elements
      if (project.mepElements) {
        const mep = project.mepElements.find(
          (m) => Math.hypot(cadRaw.x - m.position.x, cadRaw.y - m.position.y) < clickTolMm + 250
        );
        if (mep) {
          return { type: 'mep', id: mep.id, label: mep.label || 'Thiết bị MEP' };
        }
      }

      // 3. Check Columns
      if (project.columns) {
        const col = project.columns.find(
          (c) =>
            Math.abs(cadRaw.x - c.x) <= c.width / 2 + clickTolMm &&
            Math.abs(cadRaw.y - c.y) <= c.depth / 2 + clickTolMm
        );
        if (col) {
          return { type: 'column', id: col.id, label: col.profileName || 'Cột kết cấu' };
        }
      }

      // 4. Check Staircases
      if (project.staircases) {
        const stair = project.staircases.find(
          (s) =>
            Math.hypot(cadRaw.x - s.position.x, cadRaw.y - s.position.y) <
            Math.max(s.runWidth, s.totalLength / 2) + clickTolMm
        );
        if (stair) {
          return { type: 'stair', id: stair.id, label: stair.name || 'Cầu thang' };
        }
      }

      // 5. Check Landscape
      if (project.landscapeElements) {
        const ls = project.landscapeElements.find(
          (l) => Math.hypot(cadRaw.x - l.position.x, cadRaw.y - l.position.y) < l.radius + clickTolMm
        );
        if (ls) {
          return { type: 'landscape', id: ls.id, label: ls.name || 'Cây xanh' };
        }
      }

      // 6. Check Detail Callouts
      if (project.detailCallouts) {
        const dt = project.detailCallouts.find(
          (d) => Math.hypot(cadRaw.x - d.center.x, cadRaw.y - d.center.y) < d.radius + clickTolMm
        );
        if (dt) {
          return { type: 'callout', id: dt.id, label: dt.label || 'Trích chi tiết' };
        }
      }

      // 7. Check Curved Walls
      if (project.curvedWalls) {
        const cw = project.curvedWalls.find((item) => {
          const midX = (item.start.x + 2 * item.controlPoint.x + item.end.x) / 4;
          const midY = (item.start.y + 2 * item.controlPoint.y + item.end.y) / 4;
          return (
            Math.hypot(cadRaw.x - midX, cadRaw.y - midY) < clickTolMm * 1.5 ||
            distancePointToSegment(cadRaw, item.start, item.controlPoint) < clickTolMm ||
            distancePointToSegment(cadRaw, item.controlPoint, item.end) < clickTolMm
          );
        });
        if (cw) {
          return { type: 'curved_wall', id: cw.id, label: cw.name || 'Tường cong (Arc)' };
        }
      }

      // 8. Check Straight Walls
      let closestWall: Wall | null = null;
      let minWallDist = clickTolMm;
      project.walls.forEach((wall) => {
        const d = distancePointToSegment(cadRaw, wall.start, wall.end);
        if (d < minWallDist) {
          minWallDist = d;
          closestWall = wall;
        }
      });
      if (closestWall) {
        return { type: 'wall', id: (closestWall as Wall).id, label: (closestWall as Wall).name || 'Tường thẳng' };
      }

      // 9. Check Freehand Strokes
      if (project.freehandStrokes) {
        for (const stroke of project.freehandStrokes) {
          for (let i = 0; i < stroke.points.length - 1; i++) {
            const d = distancePointToSegment(cadRaw, stroke.points[i], stroke.points[i + 1]);
            if (d < clickTolMm * 1.5) {
              return { type: 'stroke', id: stroke.id, label: 'Nét vẽ tay note' };
            }
          }
        }
      }

      // 10. Check Diagonals
      if (project.diagonalChecks) {
        for (const diag of project.diagonalChecks) {
          const d = distancePointToSegment(cadRaw, diag.p1, diag.p2);
          if (d < clickTolMm) {
            return { type: 'diagonal', id: diag.id, label: diag.name || 'Đo chéo góc' };
          }
        }
      }

      return null;
    },
    [project]
  );

  // Delete entity dispatcher
  const deleteEntity = useCallback(
    (target: { type: string; id: string; label?: string }) => {
      switch (target.type) {
        case 'wall':
          if (onDeleteWall) onDeleteWall(target.id);
          break;
        case 'curved_wall':
          if (onDeleteCurvedWall) onDeleteCurvedWall(target.id);
          break;
        case 'opening':
          if (onDeleteOpening) onDeleteOpening(target.id);
          break;
        case 'column':
          if (onDeleteColumn) onDeleteColumn(target.id);
          break;
        case 'stair':
          if (onDeleteStair) onDeleteStair(target.id);
          break;
        case 'mep':
          if (onDeleteMep) onDeleteMep(target.id);
          break;
        case 'landscape':
          if (onDeleteLandscape) onDeleteLandscape(target.id);
          break;
        case 'callout':
          if (onDeleteDetailCallout) onDeleteDetailCallout(target.id);
          break;
        case 'stroke':
          if (onDeleteFreehandStroke) onDeleteFreehandStroke(target.id);
          break;
        case 'diagonal':
          if (onDeleteDiagonal) onDeleteDiagonal(target.id);
          break;
        case 'angle':
          if (onDeleteAngle) onDeleteAngle(target.id);
          break;
      }

      if (selectedWallId === target.id) onSelectWall(null);
      if (selectedCurvedWallId === target.id && onSelectCurvedWall) onSelectCurvedWall(null);
      if (selectedOpeningId === target.id) onSelectOpening(null);
      if (selectedColumnId === target.id && onSelectColumn) onSelectColumn(null);
      if (selectedStairId === target.id && onSelectStair) onSelectStair(null);
      if (selectedMepId === target.id && onSelectMep) onSelectMep(null);
      if (selectedLandscapeId === target.id && onSelectLandscape) onSelectLandscape(null);
      if (selectedDetailCalloutId === target.id && onSelectDetailCallout) onSelectDetailCallout(null);
      setHoveredDeleteTarget(null);
    },
    [
      onDeleteWall,
      onDeleteCurvedWall,
      onDeleteOpening,
      onDeleteColumn,
      onDeleteStair,
      onDeleteMep,
      onDeleteLandscape,
      onDeleteDetailCallout,
      onDeleteFreehandStroke,
      onDeleteDiagonal,
      onDeleteAngle,
      selectedWallId,
      selectedCurvedWallId,
      selectedOpeningId,
      selectedColumnId,
      selectedStairId,
      selectedMepId,
      selectedLandscapeId,
      selectedDetailCalloutId,
      onSelectWall,
      onSelectCurvedWall,
      onSelectOpening,
      onSelectColumn,
      onSelectStair,
      onSelectMep,
      onSelectLandscape,
      onSelectDetailCallout,
    ]
  );

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    // 1. Charcoal CAD Canvas
    ctx.fillStyle = '#181b20';
    ctx.fillRect(0, 0, w, h);

    // 2. CAD Grid
    const gridMajorMm = 1000;
    const gridMinorMm = 200;

    const topLeftCad = screenToCad(0, 0);
    const bottomRightCad = screenToCad(w, h);

    const startX = Math.floor(topLeftCad.x / gridMinorMm) * gridMinorMm;
    const endX = Math.ceil(bottomRightCad.x / gridMinorMm) * gridMinorMm;
    const startY = Math.floor(topLeftCad.y / gridMinorMm) * gridMinorMm;
    const endY = Math.ceil(bottomRightCad.y / gridMinorMm) * gridMinorMm;

    if (scale > 0.04) {
      ctx.strokeStyle = '#232730';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = startX; x <= endX; x += gridMinorMm) {
        const sx = cadToScreen(x, 0).x;
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, h);
      }
      for (let y = startY; y <= endY; y += gridMinorMm) {
        const sy = cadToScreen(0, y).y;
        ctx.moveTo(0, sy);
        ctx.lineTo(w, sy);
      }
      ctx.stroke();
    }

    // Major grid
    ctx.strokeStyle = '#2d3340';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = Math.floor(topLeftCad.x / gridMajorMm) * gridMajorMm; x <= endX; x += gridMajorMm) {
      const sx = cadToScreen(x, 0).x;
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, h);
    }
    for (let y = Math.floor(topLeftCad.y / gridMajorMm) * gridMajorMm; y <= endY; y += gridMajorMm) {
      const sy = cadToScreen(0, y).y;
      ctx.moveTo(0, sy);
      ctx.lineTo(w, sy);
    }
    ctx.stroke();

    // Origin (0,0)
    const origin = cadToScreen(0, 0);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(origin.x - 15, origin.y);
    ctx.lineTo(origin.x + 15, origin.y);
    ctx.moveTo(origin.x, origin.y - 15);
    ctx.lineTo(origin.x, origin.y + 15);
    ctx.stroke();

    // 3. TÍNH NĂNG ĐÈ MỜ MẶT BẰNG (UNDERLAY ONION SKIN)
    if (project.underlayActive) {
      ctx.save();
      ctx.globalAlpha = project.underlayOpacity || 0.35;
      project.walls.forEach((wall) => {
        const p1 = cadToScreen(wall.start.x, wall.start.y);
        const p2 = cadToScreen(wall.end.x, wall.end.y);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });
      ctx.restore();
    }

    // 4. Draw Rooms Background & Area
    project.rooms.forEach((room) => {
      const pts: Point2D[] = [];
      room.wallIds.forEach((wid) => {
        const wall = project.walls.find((item) => item.id === wid);
        if (wall) pts.push(wall.start, wall.end);
      });
      if (pts.length > 0) {
        const cx = pts.reduce((acc, p) => acc + p.x, 0) / pts.length;
        const cy = pts.reduce((acc, p) => acc + p.y, 0) / pts.length;
        const sp = cadToScreen(cx, cy);

        ctx.font = '600 13px system-ui, sans-serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(room.name.toUpperCase(), sp.x, sp.y - 10);

        ctx.font = '500 12px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`S = ${room.area.toFixed(1)} m²`, sp.x, sp.y + 10);
      }
    });

    // 5. Draw Diagonals
    project.diagonalChecks.forEach((diag) => {
      const p1 = cadToScreen(diag.p1.x, diag.p1.y);
      const p2 = cadToScreen(diag.p2.x, diag.p2.y);

      ctx.save();
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(midX, midY, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '600 11px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`CHÉO: ${Math.round(diag.measuredLength)}mm`, midX, midY - 10);
      ctx.restore();
    });

    // 6. Draw Measured Wall Angles
    if (project.angles && project.angles.length > 0) {
      project.angles.forEach((ang) => {
        const w1 = project.walls.find((w) => w.id === ang.wall1Id);
        const w2 = project.walls.find((w) => w.id === ang.wall2Id);
        if (!w1 || !w2) return;

        const corner = AngleCalculator.analyzeWallCorner(w1, w2);
        if (!corner) return;

        const vScr = cadToScreen(corner.vertex.x, corner.vertex.y);
        const o1Scr = cadToScreen(corner.outer1.x, corner.outer1.y);
        const o2Scr = cadToScreen(corner.outer2.x, corner.outer2.y);

        const a1 = Math.atan2(o1Scr.y - vScr.y, o1Scr.x - vScr.x);
        const a2 = Math.atan2(o2Scr.y - vScr.y, o2Scr.x - vScr.x);

        let diff = a2 - a1;
        while (diff < -Math.PI) diff += 2 * Math.PI;
        while (diff > Math.PI) diff -= 2 * Math.PI;

        const arcRadius = Math.max(20, Math.min(38, 360 * scale));
        const isRightAngle = Math.abs(ang.deviationFrom90Deg) <= 0.4;

        ctx.save();
        if (isRightAngle) {
          const sqSize = arcRadius * 0.72;
          const u1x = Math.cos(a1) * sqSize;
          const u1y = Math.sin(a1) * sqSize;
          const u2x = Math.cos(a2) * sqSize;
          const u2y = Math.sin(a2) * sqSize;

          ctx.strokeStyle = ang.isCalculatedFromLaser ? '#22c55e' : '#38bdf8';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(vScr.x + u1x, vScr.y + u1y);
          ctx.lineTo(vScr.x + u1x + u2x, vScr.y + u1y + u2y);
          ctx.lineTo(vScr.x + u2x, vScr.y + u2y);
          ctx.stroke();
        } else {
          ctx.strokeStyle = ang.isCalculatedFromLaser ? '#22c55e' : '#f59e0b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(vScr.x, vScr.y, arcRadius, a1, a1 + diff, diff < 0);
          ctx.stroke();
        }

        const midA = a1 + diff / 2;
        const badgeDist = arcRadius + 20;
        const bx = vScr.x + Math.cos(midA) * badgeDist;
        const by = vScr.y + Math.sin(midA) * badgeDist;

        const degStr = `${ang.angleDeg.toFixed(1)}°`;
        ctx.font = '600 11px monospace';
        const tm = ctx.measureText(degStr);

        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = ang.isCalculatedFromLaser ? '#10b981' : isRightAngle ? '#38bdf8' : '#f59e0b';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(bx - tm.width / 2 - 5, by - 8, tm.width + 10, 16, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = ang.isCalculatedFromLaser ? '#4ade80' : isRightAngle ? '#e2e8f0' : '#fbbf24';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(degStr, bx, by);
        ctx.restore();
      });
    }

    // 7. Draw Straight Walls - STEP 1: Fill all straight wall interiors
    project.walls.forEach((wall) => {
      const isSelected = wall.id === selectedWallId;
      const dx = wall.end.x - wall.start.x;
      const dy = wall.end.y - wall.start.y;
      const lenMm = Math.hypot(dx, dy);
      if (lenMm < 1) return;

      const thick = wall.thickness || 220;
      let offL = thick / 2;
      let offR = -thick / 2;
      if (wall.alignment === 'interior') {
        offL = thick;
        offR = 0;
      } else if (wall.alignment === 'exterior') {
        offL = 0;
        offR = -thick;
      }

      const ux = dx / lenMm;
      const uy = dy / lenMm;
      const nx = -uy;
      const ny = ux;

      // Openings on this wall
      const wallOpenings = project.openings
        ? project.openings.filter((o) => o.wallId === wall.id)
        : [];

      const slices: { startDist: number; endDist: number }[] = [];
      let curDist = 0;
      const validOps = wallOpenings
        .map((op) => ({
          ...op,
          sDist: Math.max(0, Math.min(lenMm, op.distanceFromStart)),
          eDist: Math.max(0, Math.min(lenMm, op.distanceFromStart + op.width)),
        }))
        .filter((op) => op.eDist > op.sDist)
        .sort((a, b) => a.sDist - b.sDist);

      validOps.forEach((op) => {
        if (op.sDist > curDist + 5) {
          slices.push({ startDist: curDist, endDist: op.sDist });
        }
        curDist = Math.max(curDist, op.eDist);
      });
      if (curDist < lenMm - 5) {
        slices.push({ startDist: curDist, endDist: lenMm });
      }
      if (slices.length === 0 && validOps.length === 0) {
        slices.push({ startDist: 0, endDist: lenMm });
      }

      ctx.fillStyle = isSelected ? '#fbbf24' : wall.isMeasuredWithLaser ? '#334155' : '#1e293b';

      slices.forEach((sl) => {
        const pStart = { x: wall.start.x + ux * sl.startDist, y: wall.start.y + uy * sl.startDist };
        const pEnd = { x: wall.start.x + ux * sl.endDist, y: wall.start.y + uy * sl.endDist };
        const c1 = cadToScreen(pStart.x + nx * offL, pStart.y + ny * offL);
        const c2 = cadToScreen(pEnd.x + nx * offL, pEnd.y + ny * offL);
        const c3 = cadToScreen(pEnd.x + nx * offR, pEnd.y + ny * offR);
        const c4 = cadToScreen(pStart.x + nx * offR, pStart.y + ny * offR);

        ctx.beginPath();
        ctx.moveTo(c1.x, c1.y);
        ctx.lineTo(c2.x, c2.y);
        ctx.lineTo(c3.x, c3.y);
        ctx.lineTo(c4.x, c4.y);
        ctx.closePath();
        ctx.fill();
      });
    });

    // 7.1 Fill Corner Joins (Lấp đầy đoạn tường ở khu vực kết nối 2 đoạn tường)
    for (let i = 0; i < project.walls.length; i++) {
      for (let j = i + 1; j < project.walls.length; j++) {
        const w1 = project.walls[i];
        const w2 = project.walls[j];
        const endpoints1 = [w1.start, w1.end];
        const endpoints2 = [w2.start, w2.end];
        for (const ep1 of endpoints1) {
          for (const ep2 of endpoints2) {
            if (Math.hypot(ep1.x - ep2.x, ep1.y - ep2.y) < 50) {
              const mx = (ep1.x + ep2.x) / 2;
              const my = (ep1.y + ep2.y) / 2;
              const sp = cadToScreen(mx, my);
              const maxT = Math.max(w1.thickness || 220, w2.thickness || 220);
              const rScr = (maxT / 2) * scale;
              ctx.fillStyle =
                w1.id === selectedWallId || w2.id === selectedWallId
                  ? '#fbbf24'
                  : w1.isMeasuredWithLaser && w2.isMeasuredWithLaser
                  ? '#334155'
                  : '#1e293b';
              ctx.beginPath();
              ctx.arc(sp.x, sp.y, rScr * 0.98, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }
    }

    // 7.2 Draw Straight Walls - STEP 2: Draw outline strokes and dimensions
    project.walls.forEach((wall) => {
      const isSelected = wall.id === selectedWallId;
      const isHovered = wall.id === hoveredWallId;

      const p1 = cadToScreen(wall.start.x, wall.start.y);
      const p2 = cadToScreen(wall.end.x, wall.end.y);

      const dx = wall.end.x - wall.start.x;
      const dy = wall.end.y - wall.start.y;
      const lenMm = Math.hypot(dx, dy);
      if (lenMm < 1) return;

      const thick = wall.thickness || 220;
      let offL = thick / 2;
      let offR = -thick / 2;
      if (wall.alignment === 'interior') {
        offL = thick;
        offR = 0;
      } else if (wall.alignment === 'exterior') {
        offL = 0;
        offR = -thick;
      }

      const ux = dx / lenMm;
      const uy = dy / lenMm;
      const nx = -uy;
      const ny = ux;

      const isStartConnected = project.walls.some(other => 
        other.id !== wall.id && 
        (Math.hypot(other.start.x - wall.start.x, other.start.y - wall.start.y) < 50 ||
         Math.hypot(other.end.x - wall.start.x, other.end.y - wall.start.y) < 50)
      );

      const isEndConnected = project.walls.some(other => 
        other.id !== wall.id && 
        (Math.hypot(other.start.x - wall.end.x, other.start.y - wall.end.y) < 50 ||
         Math.hypot(other.end.x - wall.end.x, other.end.y - wall.end.y) < 50)
      );

      // Openings on this wall
      const wallOpenings = project.openings
        ? project.openings.filter((o) => o.wallId === wall.id)
        : [];

      const slices: { startDist: number; endDist: number }[] = [];
      let curDist = 0;
      const validOps = wallOpenings
        .map((op) => ({
          ...op,
          sDist: Math.max(0, Math.min(lenMm, op.distanceFromStart)),
          eDist: Math.max(0, Math.min(lenMm, op.distanceFromStart + op.width)),
        }))
        .filter((op) => op.eDist > op.sDist)
        .sort((a, b) => a.sDist - b.sDist);

      validOps.forEach((op) => {
        if (op.sDist > curDist + 5) {
          slices.push({ startDist: curDist, endDist: op.sDist });
        }
        curDist = Math.max(curDist, op.eDist);
      });
      if (curDist < lenMm - 5) {
        slices.push({ startDist: curDist, endDist: lenMm });
      }
      if (slices.length === 0 && validOps.length === 0) {
        slices.push({ startDist: 0, endDist: lenMm });
      }

      ctx.strokeStyle = isSelected ? '#f59e0b' : isHovered ? '#60a5fa' : '#f8fafc';
      ctx.lineWidth = isSelected ? 2.5 : 1.8;

      slices.forEach((sl) => {
        const pStart = { x: wall.start.x + ux * sl.startDist, y: wall.start.y + uy * sl.startDist };
        const pEnd = { x: wall.start.x + ux * sl.endDist, y: wall.start.y + uy * sl.endDist };
        const c1 = cadToScreen(pStart.x + nx * offL, pStart.y + ny * offL);
        const c2 = cadToScreen(pEnd.x + nx * offL, pEnd.y + ny * offL);
        const c3 = cadToScreen(pEnd.x + nx * offR, pEnd.y + ny * offR);
        const c4 = cadToScreen(pStart.x + nx * offR, pStart.y + ny * offR);

        ctx.beginPath();
        // Long edge 1
        ctx.moveTo(c1.x, c1.y);
        ctx.lineTo(c2.x, c2.y);

        // End endcap
        if (Math.abs(sl.endDist - lenMm) > 5 || !isEndConnected) {
          ctx.lineTo(c3.x, c3.y);
        } else {
          ctx.moveTo(c3.x, c3.y);
        }

        // Long edge 2
        ctx.lineTo(c4.x, c4.y);

        // Start endcap
        if (Math.abs(sl.startDist) > 5 || !isStartConnected) {
          ctx.lineTo(c1.x, c1.y);
        }
        ctx.stroke();
      });

      // Jamb reveal lines at opening cuts
      validOps.forEach((op) => {
        const pJ1 = { x: wall.start.x + ux * op.sDist, y: wall.start.y + uy * op.sDist };
        const pJ2 = { x: wall.start.x + ux * op.eDist, y: wall.start.y + uy * op.eDist };
        const j1a = cadToScreen(pJ1.x + nx * offL, pJ1.y + ny * offL);
        const j1b = cadToScreen(pJ1.x + nx * offR, pJ1.y + ny * offR);
        const j2a = cadToScreen(pJ2.x + nx * offL, pJ2.y + ny * offL);
        const j2b = cadToScreen(pJ2.x + nx * offR, pJ2.y + ny * offR);

        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(j1a.x, j1a.y);
        ctx.lineTo(j1b.x, j1b.y);
        ctx.moveTo(j2a.x, j2a.y);
        ctx.lineTo(j2b.x, j2b.y);
        ctx.stroke();

        // If window: draw thin sill threshold lines
        if (op.type.startsWith('window')) {
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(j1a.x, j1a.y);
          ctx.lineTo(j2a.x, j2a.y);
          ctx.moveTo(j1b.x, j1b.y);
          ctx.lineTo(j2b.x, j2b.y);
          ctx.stroke();
        }
      });

      // Dimension Line
      const offsetDimScreen = 28;
      const snx = (-dy / lenMm) * offsetDimScreen;
      const sny = (dx / lenMm) * offsetDimScreen;

      const dimP1 = { x: p1.x + snx, y: p1.y + sny };
      const dimP2 = { x: p2.x + snx, y: p2.y + sny };

      ctx.strokeStyle = isSelected ? '#fbbf24' : '#94a3b8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(dimP1.x, dimP1.y);
      ctx.lineTo(dimP2.x, dimP2.y);
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(dimP1.x, dimP1.y);
      ctx.moveTo(p2.x, p2.y);
      ctx.lineTo(dimP2.x, dimP2.y);
      ctx.stroke();

      // Text
      const midDimX = (dimP1.x + dimP2.x) / 2;
      const midDimY = (dimP1.y + dimP2.y) / 2;
      const displayVal = Math.round(wall.measuredLength || lenMm);

      ctx.save();
      ctx.translate(midDimX, midDimY);
      let angle = Math.atan2(dy, dx);
      if (angle > Math.PI / 2 || angle < -Math.PI / 2) angle += Math.PI;
      ctx.rotate(angle);

      ctx.fillStyle = '#181b20';
      const textStr = `${displayVal} mm`;
      ctx.font = '600 11px monospace';
      const textMetrics = ctx.measureText(textStr);
      ctx.fillRect(-textMetrics.width / 2 - 3, -12, textMetrics.width + 6, 14);

      ctx.fillStyle = isSelected ? '#fbbf24' : wall.isMeasuredWithLaser ? '#4ade80' : '#e2e8f0';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(textStr, 0, -5);
      ctx.restore();
    });

    // 8. Draw Curved Walls (Tường cong)
    if (project.curvedWalls) {
      project.curvedWalls.forEach((cw) => {
        const sS = cadToScreen(cw.start.x, cw.start.y);
        const sE = cadToScreen(cw.end.x, cw.end.y);
        const sC = cadToScreen(cw.controlPoint.x, cw.controlPoint.y);
        CadSymbolRenderer.drawCurvedWall(ctx, cw, sS, sE, sC, scale, cw.id === selectedCurvedWallId);
      });
    }

    // 9. Draw Openings (Standard Architectural Door & Window Cad Symbols)
    project.openings.forEach((op) => {
      const isSelected = op.id === selectedOpeningId;
      const wall = project.walls.find((w) => w.id === op.wallId);
      if (!wall) return;

      const dx = wall.end.x - wall.start.x;
      const dy = wall.end.y - wall.start.y;
      const wallLen = Math.hypot(dx, dy);
      if (wallLen < 1) return;

      const ux = dx / wallLen;
      const uy = dy / wallLen;

      const osx = wall.start.x + ux * op.distanceFromStart;
      const osy = wall.start.y + uy * op.distanceFromStart;
      const oex = wall.start.x + ux * (op.distanceFromStart + op.width);
      const oey = wall.start.y + uy * (op.distanceFromStart + op.width);

      const sStart = cadToScreen(osx, osy);
      const sEnd = cadToScreen(oex, oey);

      CadSymbolRenderer.drawStandardOpening(ctx, op, wall, sStart, sEnd, scale, isSelected);
    });

    // 10. Draw Structural Columns (Cột thép I, U, hộp & Cột bê tông)
    project.columns.forEach((col) => {
      const sc = cadToScreen(col.x, col.y);
      CadSymbolRenderer.drawStructuralColumn(ctx, col, sc, scale, col.id === selectedColumnId);
    });

    // 11. Draw Staircases CAD Blocks
    if (project.staircases) {
      project.staircases.forEach((stair) => {
        const sc = cadToScreen(stair.position.x, stair.position.y);
        CadSymbolRenderer.drawStaircase(ctx, stair, sc, scale, stair.id === selectedStairId);
      });
    }

    // 12. Draw MEP Elements (Ổ cắm, công tắc, tủ điện, nước, PCCC)
    if (project.mepElements) {
      project.mepElements.forEach((mep) => {
        const sc = cadToScreen(mep.position.x, mep.position.y);
        CadSymbolRenderer.drawMepElement(ctx, mep, sc, scale, mep.id === selectedMepId);
      });
    }

    // 13. Draw Landscape Elements (Cây bụi, cây lớn)
    if (project.landscapeElements) {
      project.landscapeElements.forEach((ls) => {
        const sc = cadToScreen(ls.position.x, ls.position.y);
        CadSymbolRenderer.drawLandscape(ctx, ls, sc, scale);
        if (ls.id === selectedLandscapeId) {
          ctx.save();
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(sc.x, sc.y, Math.max(ls.radius * scale + 6, 18), 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      });
    }

    // 14. Draw Freehand Strokes (Bút vẽ tay Note)
    if (project.freehandStrokes) {
      project.freehandStrokes.forEach((stk) => {
        CadSymbolRenderer.drawFreehandStroke(ctx, stk, cadToScreen);
      });
    }

    // Active drawing stroke in progress
    if (isDrawingStroke && activeStrokePts.length > 1) {
      CadSymbolRenderer.drawFreehandStroke(
        ctx,
        {
          id: 'temp',
          points: activeStrokePts,
          color: penColor,
          strokeWidth: penType === 'pen' ? 2.5 : 8,
          toolType: penType,
        },
        cadToScreen
      );
    }

    // 15. Draw Detail Callout Bubbles (Đo trích chi tiết)
    if (project.detailCallouts) {
      project.detailCallouts.forEach((dt) => {
        const sc = cadToScreen(dt.center.x, dt.center.y);
        CadSymbolRenderer.drawDetailCallout(ctx, dt, sc, scale);
        if (dt.id === selectedDetailCalloutId) {
          ctx.save();
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.arc(sc.x, sc.y, dt.radius * scale + 10, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      });
    }

    // 15.1 Draw Railings (Lan can ban công trên mặt bằng)
    project.elevSectEntities?.filter((e) => e.type === 'railing_balcony').forEach((rail) => {
      const sp = cadToScreen(rail.x, rail.y || 2800);
      const sw = rail.width * scale;

      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      // Parallel CAD railing symbol
      ctx.beginPath();
      ctx.moveTo(sp.x, sp.y - 5);
      ctx.lineTo(sp.x + sw, sp.y - 5);
      ctx.moveTo(sp.x, sp.y + 5);
      ctx.lineTo(sp.x + sw, sp.y + 5);
      ctx.stroke();

      // Posts
      const postStep = Math.max(20, 350 * scale);
      ctx.fillStyle = '#0284c7';
      for (let px = sp.x; px <= sp.x + sw; px += postStep) {
        ctx.fillRect(px - 2.5, sp.y - 6, 5, 12);
      }

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`LAN CAN H=${rail.railingHeightMm || 1100}mm`, sp.x + 6, sp.y - 10);
      ctx.restore();
    });

    // 15.2 Draw Roofs & Steel Trusses (Mái & Giàn thép trên mặt bằng)
    project.elevSectEntities?.filter((e) => e.type === 'roof_pitched' || e.type === 'roof_flat').forEach((rf) => {
      const sp = cadToScreen(rf.x, rf.y || 3200);
      const sw = rf.width * scale;
      const sh = (rf.height || 1200) * scale * 1.4;

      ctx.save();
      // Outer eaves overhang (dashed line)
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([5, 4]);
      ctx.strokeRect(sp.x - 12, sp.y - sh / 2, sw + 24, sh);
      ctx.setLineDash([]);

      // Ridge line
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(sp.x, sp.y);
      ctx.lineTo(sp.x + sw, sp.y);
      ctx.stroke();

      // Slope direction label
      ctx.fillStyle = '#f97316';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`MÁI i = ${rf.roofSlopeDeg || 28}° (${rf.trussShape === 'triangle' ? 'TAM GIÁC' : rf.trussShape === 'trapezoid' ? 'HÌNH THANG' : 'HÌNH CHỮ NHẬT'})`, sp.x + sw / 2 - 80, sp.y - 8);
      ctx.restore();
    });

    // 16. Interactive Guides
    if (activeTool === 'wall' && wallStartPoint) {
      const p1 = cadToScreen(wallStartPoint.x, wallStartPoint.y);
      const p2 = cadToScreen(cursorCadPos.x, cursorCadPos.y);
      const lenMm = Math.hypot(cursorCadPos.x - wallStartPoint.x, cursorCadPos.y - wallStartPoint.y);

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.setLineDash([]);

      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(midX - 35, midY - 24, 70, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(lenMm)} mm`, midX, midY - 10);
    }

    if (activeTool === 'curved_wall' && curvedStart) {
      const p1 = cadToScreen(curvedStart.x, curvedStart.y);
      const p2 = cadToScreen(cursorCadPos.x, cursorCadPos.y);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // Railing Rubberband
    if (activeTool === 'railing' && railingStartPoint) {
      const p1 = cadToScreen(railingStartPoint.x, railingStartPoint.y);
      const p2 = cadToScreen(cursorCadPos.x, cursorCadPos.y);
      const lenMm = Math.hypot(cursorCadPos.x - railingStartPoint.x, cursorCadPos.y - railingStartPoint.y);

      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(mx - 40, my - 24, 80, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`LAN CAN: ${Math.round(lenMm)}mm`, mx, my - 10);
      ctx.restore();
    }

    // Roof Rubberband
    if (activeTool === 'roof' && roofStartPoint) {
      const p1 = cadToScreen(roofStartPoint.x, roofStartPoint.y);
      const p2 = cadToScreen(cursorCadPos.x, cursorCadPos.y);
      const minX = Math.min(p1.x, p2.x);
      const minY = Math.min(p1.y, p2.y);
      const rw = Math.abs(p2.x - p1.x);
      const rh = Math.abs(p2.y - p1.y);

      ctx.save();
      ctx.fillStyle = 'rgba(234, 88, 12, 0.15)';
      ctx.fillRect(minX, minY, rw, rh);
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(minX, minY, rw, rh);
      ctx.setLineDash([]);

      // Ridge line preview
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(minX, minY + rh / 2);
      ctx.lineTo(minX + rw, minY + rh / 2);
      ctx.stroke();

      ctx.fillStyle = '#ea580c';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      const cW = Math.round(Math.abs(cursorCadPos.x - roofStartPoint.x));
      const cH = Math.round(Math.abs(cursorCadPos.y - roofStartPoint.y));
      ctx.fillText(`MÁI GIÀN THÉP: ${cW} x ${cH} mm`, minX + rw / 2, minY + rh / 2 - 8);
      ctx.restore();
    }

    // 17. Eraser Tool Hover Highlight & Deletion Preview
    if (activeTool === 'eraser' && hoveredDeleteTarget) {
      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.fillStyle = 'rgba(239, 68, 68, 0.28)';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);

      if (hoveredDeleteTarget.type === 'wall') {
        const wall = project.walls.find((w) => w.id === hoveredDeleteTarget.id);
        if (wall) {
          const p1 = cadToScreen(wall.start.x, wall.start.y);
          const p2 = cadToScreen(wall.end.x, wall.end.y);
          ctx.lineWidth = Math.max(6, (wall.thickness || 220) * scale + 10);
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      } else if (hoveredDeleteTarget.type === 'curved_wall') {
        const cw = project.curvedWalls?.find((w) => w.id === hoveredDeleteTarget.id);
        if (cw) {
          const p1 = cadToScreen(cw.start.x, cw.start.y);
          const cp = cadToScreen(cw.controlPoint.x, cw.controlPoint.y);
          const p2 = cadToScreen(cw.end.x, cw.end.y);
          ctx.lineWidth = 14;
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.quadraticCurveTo(cp.x, cp.y, p2.x, p2.y);
          ctx.stroke();
        }
      } else if (hoveredDeleteTarget.type === 'column') {
        const col = project.columns?.find((c) => c.id === hoveredDeleteTarget.id);
        if (col) {
          const sc = cadToScreen(col.x, col.y);
          const cw = col.width * scale + 14;
          const cd = col.depth * scale + 14;
          ctx.strokeRect(sc.x - cw / 2, sc.y - cd / 2, cw, cd);
          ctx.fillRect(sc.x - cw / 2, sc.y - cd / 2, cw, cd);
        }
      } else if (hoveredDeleteTarget.type === 'mep') {
        const mep = project.mepElements?.find((m) => m.id === hoveredDeleteTarget.id);
        if (mep) {
          const sc = cadToScreen(mep.position.x, mep.position.y);
          ctx.beginPath();
          ctx.arc(sc.x, sc.y, 22, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fill();
        }
      } else if (hoveredDeleteTarget.type === 'stair') {
        const stair = project.staircases?.find((s) => s.id === hoveredDeleteTarget.id);
        if (stair) {
          const sc = cadToScreen(stair.position.x, stair.position.y);
          ctx.strokeRect(sc.x - 10, sc.y - 10, (stair.totalLength || 3000) * scale + 20, (stair.runWidth * 2) * scale + 20);
          ctx.fillRect(sc.x - 10, sc.y - 10, (stair.totalLength || 3000) * scale + 20, (stair.runWidth * 2) * scale + 20);
        }
      } else if (hoveredDeleteTarget.type === 'landscape') {
        const ls = project.landscapeElements?.find((l) => l.id === hoveredDeleteTarget.id);
        if (ls) {
          const sc = cadToScreen(ls.position.x, ls.position.y);
          ctx.beginPath();
          ctx.arc(sc.x, sc.y, ls.radius * scale + 8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fill();
        }
      } else if (hoveredDeleteTarget.type === 'callout') {
        const dt = project.detailCallouts?.find((d) => d.id === hoveredDeleteTarget.id);
        if (dt) {
          const sc = cadToScreen(dt.center.x, dt.center.y);
          ctx.beginPath();
          ctx.arc(sc.x, sc.y, dt.radius * scale + 8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fill();
        }
      }

      // Floating Eraser Indicator near cursor
      const cursorSc = cadToScreen(cursorCadPos.x, cursorCadPos.y);
      const tagX = Math.min(cursorSc.x + 14, rect.width - 120);
      const tagY = Math.max(cursorSc.y - 16, 24);
      ctx.setLineDash([]);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(tagX, tagY - 14, 105, 22, 5);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10.5px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('✕ BẤM ĐỂ XÓA', tagX + 8, tagY + 1);

      ctx.restore();
    }
  }, [
    project,
    activeTool,
    selectedWallId,
    selectedOpeningId,
    selectedStairId,
    selectedMepId,
    hoveredWallId,
    hoveredDeleteTarget,
    wallStartPoint,
    curvedStart,
    isDrawingStroke,
    activeStrokePts,
    cursorCadPos,
    offset,
    scale,
    screenToCad,
    cadToScreen,
  ]);

  // Pointer Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    activePointersRef.current.set(e.pointerId, { x: sx, y: sy });
    if (e.pointerType === 'pen') {
      setIsStylusActive(true);
    }
    if (activePointersRef.current.size >= 2) {
      setIsDrawingStroke(false);
      setIsPanning(false);
      const pts = Array.from(activePointersRef.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchStartDistRef.current = Math.max(10, dist);
      pinchStartScaleRef.current = scale;
      return;
    }

    if (e.button === 1 || e.buttons === 4 || (activeTool === 'select' && e.altKey)) {
      setIsPanning(true);
      setPanStart({ x: sx - offset.x, y: sy - offset.y });
      return;
    }

    const cadRaw = screenToCad(sx, sy);
    const cadSnapped = snapToVertex(cadRaw);

    if (activeTool === 'eraser') {
      setIsErasingMouseDown(true);
      const clickTolMm = 280 / scale;
      const target = findEntityAtPoint(cadRaw, clickTolMm);
      if (target) {
        deleteEntity(target);
      }
      return;
    }

    if (activeTool === 'pen_draw') {
      setIsDrawingStroke(true);
      setActiveStrokePts([cadRaw]);
      return;
    }

    if (activeTool === 'select') {
      const clickTolMm = 280 / scale;

      // 1. Check Openings (doors, windows, glass partition)
      let clickedOp: Opening | null = null;
      for (const op of project.openings) {
        const wall = project.walls.find((w) => w.id === op.wallId);
        if (wall) {
          const dx = wall.end.x - wall.start.x;
          const dy = wall.end.y - wall.start.y;
          const wLen = Math.hypot(dx, dy);
          if (wLen > 0) {
            const ux = dx / wLen;
            const uy = dy / wLen;
            const midOpX = wall.start.x + ux * (op.distanceFromStart + op.width / 2);
            const midOpY = wall.start.y + uy * (op.distanceFromStart + op.width / 2);
            if (Math.hypot(cadRaw.x - midOpX, cadRaw.y - midOpY) < Math.max(op.width / 2, clickTolMm)) {
              clickedOp = op;
              break;
            }
          }
        }
      }
      if (clickedOp) {
        onSelectOpening(clickedOp.id);
        onSelectWall(null);
        if (onSelectCurvedWall) onSelectCurvedWall(null);
        if (onSelectStair) onSelectStair(null);
        if (onSelectColumn) onSelectColumn(null);
        if (onSelectMep) onSelectMep(null);
        if (onSelectLandscape) onSelectLandscape(null);
        if (onSelectDetailCallout) onSelectDetailCallout(null);
        return;
      }

      // 2. Check MEP Elements
      if (project.mepElements) {
        const clickedMep = project.mepElements.find(
          (m) => Math.hypot(cadRaw.x - m.position.x, cadRaw.y - m.position.y) < clickTolMm + 200
        );
        if (clickedMep) {
          if (onSelectMep) onSelectMep(clickedMep.id);
          onSelectWall(null);
          onSelectOpening(null);
          if (onSelectCurvedWall) onSelectCurvedWall(null);
          if (onSelectStair) onSelectStair(null);
          if (onSelectColumn) onSelectColumn(null);
          if (onSelectLandscape) onSelectLandscape(null);
          if (onSelectDetailCallout) onSelectDetailCallout(null);
          return;
        }
      }

      // 3. Check Structural Columns
      const clickedCol = project.columns.find(
        (c) =>
          Math.abs(cadRaw.x - c.x) <= c.width / 2 + clickTolMm &&
          Math.abs(cadRaw.y - c.y) <= c.depth / 2 + clickTolMm
      );
      if (clickedCol) {
        if (onSelectColumn) onSelectColumn(clickedCol.id);
        onSelectWall(null);
        onSelectOpening(null);
        if (onSelectCurvedWall) onSelectCurvedWall(null);
        if (onSelectStair) onSelectStair(null);
        if (onSelectMep) onSelectMep(null);
        if (onSelectLandscape) onSelectLandscape(null);
        if (onSelectDetailCallout) onSelectDetailCallout(null);
        return;
      }

      // 4. Check Staircases
      if (project.staircases) {
        const clickedStair = project.staircases.find(
          (s) =>
            Math.hypot(cadRaw.x - s.position.x, cadRaw.y - s.position.y) <
            Math.max(s.runWidth, s.totalLength / 2) + clickTolMm
        );
        if (clickedStair) {
          if (onSelectStair) onSelectStair(clickedStair.id);
          onSelectWall(null);
          onSelectOpening(null);
          if (onSelectCurvedWall) onSelectCurvedWall(null);
          if (onSelectColumn) onSelectColumn(null);
          if (onSelectMep) onSelectMep(null);
          if (onSelectLandscape) onSelectLandscape(null);
          if (onSelectDetailCallout) onSelectDetailCallout(null);
          return;
        }
      }

      // 5. Check Landscape Elements
      if (project.landscapeElements) {
        const clickedLs = project.landscapeElements.find(
          (l) => Math.hypot(cadRaw.x - l.position.x, cadRaw.y - l.position.y) < l.radius + clickTolMm
        );
        if (clickedLs) {
          if (onSelectLandscape) onSelectLandscape(clickedLs.id);
          onSelectWall(null);
          onSelectOpening(null);
          if (onSelectCurvedWall) onSelectCurvedWall(null);
          if (onSelectStair) onSelectStair(null);
          if (onSelectColumn) onSelectColumn(null);
          if (onSelectMep) onSelectMep(null);
          if (onSelectDetailCallout) onSelectDetailCallout(null);
          return;
        }
      }

      // 6. Check Detail Callouts
      if (project.detailCallouts) {
        const clickedDt = project.detailCallouts.find(
          (d) => Math.hypot(cadRaw.x - d.center.x, cadRaw.y - d.center.y) < d.radius + clickTolMm
        );
        if (clickedDt) {
          if (onSelectDetailCallout) onSelectDetailCallout(clickedDt.id);
          onSelectWall(null);
          onSelectOpening(null);
          if (onSelectCurvedWall) onSelectCurvedWall(null);
          if (onSelectStair) onSelectStair(null);
          if (onSelectColumn) onSelectColumn(null);
          if (onSelectMep) onSelectMep(null);
          if (onSelectLandscape) onSelectLandscape(null);
          return;
        }
      }

      // 7. Check Curved Walls
      if (project.curvedWalls) {
        const clickedCw = project.curvedWalls.find((cw) => {
          const midX = (cw.start.x + 2 * cw.controlPoint.x + cw.end.x) / 4;
          const midY = (cw.start.y + 2 * cw.controlPoint.y + cw.end.y) / 4;
          return (
            Math.hypot(cadRaw.x - midX, cadRaw.y - midY) < clickTolMm * 1.5 ||
            distancePointToSegment(cadRaw, cw.start, cw.controlPoint) < clickTolMm ||
            distancePointToSegment(cadRaw, cw.controlPoint, cw.end) < clickTolMm
          );
        });
        if (clickedCw) {
          if (onSelectCurvedWall) onSelectCurvedWall(clickedCw.id);
          onSelectWall(null);
          onSelectOpening(null);
          if (onSelectStair) onSelectStair(null);
          if (onSelectColumn) onSelectColumn(null);
          if (onSelectMep) onSelectMep(null);
          if (onSelectLandscape) onSelectLandscape(null);
          if (onSelectDetailCallout) onSelectDetailCallout(null);
          return;
        }
      }

      // 8. Check Straight Walls
      let clickedWall: Wall | null = null;
      let minDistance = clickTolMm;
      project.walls.forEach((wall) => {
        const d = distancePointToSegment(cadRaw, wall.start, wall.end);
        if (d < minDistance) {
          minDistance = d;
          clickedWall = wall;
        }
      });

      if (clickedWall) {
        onSelectWall((clickedWall as Wall).id);
        onSelectOpening(null);
        if (onSelectCurvedWall) onSelectCurvedWall(null);
        if (onSelectStair) onSelectStair(null);
        if (onSelectColumn) onSelectColumn(null);
        if (onSelectMep) onSelectMep(null);
        if (onSelectLandscape) onSelectLandscape(null);
        if (onSelectDetailCallout) onSelectDetailCallout(null);
      } else {
        onSelectWall(null);
        onSelectOpening(null);
        if (onSelectCurvedWall) onSelectCurvedWall(null);
        if (onSelectStair) onSelectStair(null);
        if (onSelectColumn) onSelectColumn(null);
        if (onSelectMep) onSelectMep(null);
        if (onSelectLandscape) onSelectLandscape(null);
        if (onSelectDetailCallout) onSelectDetailCallout(null);
        setIsPanning(true);
        setPanStart({ x: sx - offset.x, y: sy - offset.y });
      }
    } else if (activeTool === 'wall') {
      if (!wallStartPoint) {
        setWallStartPoint(cadSnapped);
      } else {
        const orthoPoint = snapOrtho(wallStartPoint, cadSnapped);
        const finalPoint = snapToVertex(orthoPoint);
        const len = Math.hypot(finalPoint.x - wallStartPoint.x, finalPoint.y - wallStartPoint.y);
        if (len > 50) {
          onAddWall(wallStartPoint, finalPoint, wallAlignment, wallThickness);
          setWallStartPoint(finalPoint);
        }
      }
    } else if (activeTool === 'curved_wall') {
      if (!curvedStart) {
        setCurvedStart(cadSnapped);
      } else if (!curvedEnd) {
        setCurvedEnd(cadSnapped);
      } else {
        onAddCurvedWall(curvedStart, curvedEnd, cadSnapped);
        setCurvedStart(null);
        setCurvedEnd(null);
      }
    } else if (activeTool === 'stair') {
      onAddStaircase(cadSnapped);
    } else if (activeTool === 'mep') {
      onAddMepElement(cadSnapped, mepCategory);
    } else if (activeTool === 'landscape') {
      onAddLandscape(cadSnapped, 'tree_large');
    } else if (activeTool === 'detail_callout') {
      onAddDetailCallout({
        id: 'dt_' + Date.now(),
        center: cadSnapped,
        radius: 650,
        label: `TRÍCH CHI TIẾT ${String.fromCharCode(65 + project.detailCallouts.length)}`,
        scale: 'TỶ LỆ 1/10',
        description: 'Chi tiết trích đo hiện trạng',
      });
    } else if (activeTool === 'door' || activeTool === 'window') {
      let targetWall: Wall | null = null;
      let minDist = 350;
      project.walls.forEach((wall) => {
        const d = distancePointToSegment(cadRaw, wall.start, wall.end);
        if (d < minDist) {
          minDist = d;
          targetWall = wall;
        }
      });

      if (targetWall) {
        const tw = targetWall as Wall;
        const dx = tw.end.x - tw.start.x;
        const dy = tw.end.y - tw.start.y;
        const wLen = Math.hypot(dx, dy);
        const u = ((cadRaw.x - tw.start.x) * dx + (cadRaw.y - tw.start.y) * dy) / (wLen * wLen);
        const distMm = Math.max(100, Math.min(wLen - 900, Math.round(u * wLen)));
        onAddOpening(tw.id, activeTool === 'door' ? 'door_single' : 'window_standard', distMm);
      }
    } else if (activeTool === 'column') {
      onAddColumn(cadSnapped);
    } else if (activeTool === 'diagonal') {
      if (!diagonalStartPoint) {
        setDiagonalStartPoint(cadSnapped);
      } else {
        onAddDiagonal(diagonalStartPoint, cadSnapped);
        setDiagonalStartPoint(null);
      }
    } else if (activeTool === 'angle') {
      let clickedWall: Wall | null = null;
      let minDistance = 350 / scale;
      project.walls.forEach((wall) => {
        const d = distancePointToSegment(cadRaw, wall.start, wall.end);
        if (d < minDistance) {
          minDistance = d;
          clickedWall = wall;
        }
      });

      if (clickedWall) {
        const wId = (clickedWall as Wall).id;
        if (!firstAngleWallId) {
          setFirstAngleWallId(wId);
        } else if (firstAngleWallId !== wId) {
          onAddAngle(firstAngleWallId, wId);
          setFirstAngleWallId(null);
        }
      }
    } else if (activeTool === 'railing') {
      if (!railingStartPoint) {
        setRailingStartPoint(cadSnapped);
      } else {
        const len = Math.hypot(cadSnapped.x - railingStartPoint.x, cadSnapped.y - railingStartPoint.y);
        if (len > 100 && onAddElevSectEntity) {
          onAddElevSectEntity({
            id: 'es_rail_' + Date.now(),
            type: 'railing_balcony',
            x: Math.min(railingStartPoint.x, cadSnapped.x),
            y: project.defaultCeilingHeight || 2800,
            width: Math.max(500, Math.round(len)),
            height: 1100,
            railingHeightMm: 1100,
            railingStyle: railingStylePlan,
            name: 'Lan can ban công',
          });
        }
        setRailingStartPoint(null);
      }
    } else if (activeTool === 'roof') {
      if (!roofStartPoint) {
        setRoofStartPoint(cadSnapped);
      } else {
        const w = Math.abs(cadSnapped.x - roofStartPoint.x);
        const h = Math.abs(cadSnapped.y - roofStartPoint.y);
        if ((w > 200 || h > 200) && onAddElevSectEntity) {
          onAddElevSectEntity({
            id: 'es_roof_' + Date.now(),
            type: 'roof_pitched',
            x: Math.min(roofStartPoint.x, cadSnapped.x),
            y: (project.defaultCeilingHeight || 2800) + 400,
            width: Math.max(1200, Math.round(w)),
            height: Math.max(800, Math.round(h * 0.35)),
            roofSlopeDeg: roofSlopeDegPlan,
            trussShape: roofTrussShapePlan,
            trussBracing: 'pratt',
            name: 'Khung giàn thép mái TCVN',
          });
        }
        setRoofStartPoint(null);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    if (activePointersRef.current.has(e.pointerId)) {
      activePointersRef.current.set(e.pointerId, { x: sx, y: sy });
    }

    // Process pinch-to-zoom if 2 fingers are touching
    if (activePointersRef.current.size >= 2 && pinchStartDistRef.current) {
      const pts = Array.from(activePointersRef.current.values());
      const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const ratio = currentDist / pinchStartDistRef.current;
      const newScale = Math.max(0.015, Math.min(0.5, pinchStartScaleRef.current * ratio));
      setScale(newScale);
      return;
    }

    if (isPanning) {
      setOffset({
        x: sx - panStart.x,
        y: sy - panStart.y,
      });
      return;
    }

    const cadRaw = screenToCad(sx, sy);

    if (activeTool === 'eraser') {
      const clickTolMm = 280 / scale;
      const target = findEntityAtPoint(cadRaw, clickTolMm);
      setHoveredDeleteTarget(target);
      if (isErasingMouseDown && target) {
        deleteEntity(target);
      }
    }

    if (isDrawingStroke) {
      setActiveStrokePts((pts) => [...pts, cadRaw]);
      return;
    }

    let finalCad = snapToVertex(cadRaw);
    if (activeTool === 'wall' && wallStartPoint) {
      finalCad = snapOrtho(wallStartPoint, finalCad);
    }
    setCursorCadPos(finalCad);

    setCursorScreenPos({ x: e.clientX, y: e.clientY });
    if (activeTool === 'wall' && wallStartPoint) {
      const len = Math.hypot(finalCad.x - wallStartPoint.x, finalCad.y - wallStartPoint.y);
      setLiveMeasureHint(`${Math.round(len)}mm`);
    } else {
      setLiveMeasureHint(undefined);
    }
  };

  const handlePointerUp = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    if (e && e.pointerId) {
      activePointersRef.current.delete(e.pointerId);
    } else {
      activePointersRef.current.clear();
    }
    if (activePointersRef.current.size < 2) {
      pinchStartDistRef.current = null;
    }

    if (isPanning) setIsPanning(false);
    if (activeTool === 'eraser') setIsErasingMouseDown(false);

    if (isDrawingStroke) {
      setIsDrawingStroke(false);
      if (activeStrokePts.length > 2) {
        onAddFreehandStroke({
          id: 'sk_' + Date.now(),
          points: activeStrokePts,
          color: penColor,
          strokeWidth: penType === 'pen' ? 2.5 : 8,
          toolType: penType,
        });
      }
      setActiveStrokePts([]);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const newScale = Math.max(0.015, Math.min(0.5, scale * zoomFactor));

    setOffset({
      x: sx - (sx - offset.x) * (newScale / scale),
      y: sy - (sy - offset.y) * (newScale / scale),
    });
    setScale(newScale);
  };

  return (
    <div className="relative w-full h-full bg-[#181b20] overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-crosshair touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={(e) => {
          handlePointerUp(e);
          setCursorScreenPos(null);
          setLiveMeasureHint(undefined);
        }}
        onWheel={handleWheel}
        onContextMenu={(e) => {
          e.preventDefault();
          if (wallStartPoint) setWallStartPoint(null);
          if (firstAngleWallId) setFirstAngleWallId(null);
          if (curvedStart) {
            setCurvedStart(null);
            setCurvedEnd(null);
          }
        }}
      />

      {/* Floating CAD HUD top right */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2 bg-slate-900/90 backdrop-blur border border-slate-700/80 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg shadow-lg text-[10px] sm:text-xs text-slate-300 pointer-events-auto">
        {isStylusActive && (
          <span className="text-amber-400 font-semibold flex items-center gap-1 border-r border-slate-700 pr-2">
            <span>✏️</span>
            <span className="hidden sm:inline">Pencil</span>
          </span>
        )}
        <span className="font-mono tabular-nums text-slate-400 hidden xs:inline">
          X: {cursorCadPos.x} · Y: {cursorCadPos.y}
        </span>
        <span className="text-slate-600 hidden xs:inline">|</span>
        <span className="font-mono tabular-nums text-amber-400">
          1:{Math.round(1 / scale)}
        </span>
      </div>

      {/* Top Left: Storey Selector & Underlay Controls */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-wrap items-center gap-2 z-20 pointer-events-auto">
        {/* Storey Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/95 backdrop-blur border border-slate-700/80 p-1 rounded-xl shadow-lg text-xs">
          <Layers className="w-3.5 h-3.5 text-amber-400 ml-1.5" />
          <span className="font-bold text-white text-[11px] pr-1 hidden md:inline">Mặt Bằng:</span>
          <div className="flex items-center gap-1">
            {(project.storeys && project.storeys.length > 0
              ? project.storeys
              : [
                  { id: 'st_1', name: 'Tầng 1 (Trệt)', levelMm: 0, cutPlaneHeightMm: 1200, heightMm: 3600, cutDirection: 'down' as const },
                  { id: 'st_2', name: 'Tầng 2', levelMm: 3600, cutPlaneHeightMm: 1200, heightMm: 3600, cutDirection: 'down' as const },
                ]
            ).map((st) => {
              const isActive = (project.activeStoreyId || 'st_1') === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => onSelectStorey && onSelectStorey(st.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer text-xs ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                  title={`${st.name} - Cao độ ${st.levelMm >= 0 ? '+' : ''}${(st.levelMm / 1000).toFixed(2)}m`}
                >
                  {st.name.split(' ')[0]} {st.name.split(' ')[1] || ''}
                </button>
              );
            })}
            <button
              onClick={() => setIsStoreyModalOpen(true)}
              className="p-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
              title="Quản lý cao độ các tầng & thiết lập mặt phẳng cắt nhìn"
            >
              <Plus className="w-3 h-3" />
              <span className="text-[11px]">Thêm Tầng</span>
            </button>
          </div>
        </div>

        {/* Floating Quick Underlay Bar */}
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur border border-slate-700/80 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-lg text-xs">
          <button
            onClick={() => onToggleUnderlay && onToggleUnderlay(!project.underlayActive)}
            className={`flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              project.underlayActive ? 'bg-sky-500 text-slate-950 shadow-sm font-bold' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Bật/Tắt đè mờ mặt bằng dóng trục"
          >
            {project.underlayActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Đè Mờ Trục</span>
          </button>
          {project.underlayActive && onUpdateUnderlayOpacity && (
            <div className="flex items-center gap-1.5 border-l border-slate-700 pl-2">
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={project.underlayOpacity || 0.35}
                onChange={(e) => onUpdateUnderlayOpacity(parseFloat(e.target.value))}
                className="w-16 accent-sky-400 cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      {/* Wall Drawing Options Bar (Trục tường & Bề dày) */}
      {activeTool === 'wall' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-900/95 border border-slate-700/90 px-3.5 py-1.5 rounded-xl shadow-2xl z-20 text-xs backdrop-blur pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 font-bold">Trục tường:</span>
            <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
              {[
                { id: 'center', label: 'Chính giữa' },
                { id: 'interior', label: 'Mép trong' },
                { id: 'exterior', label: 'Mép ngoài' },
              ].map((al) => (
                <button
                  key={al.id}
                  onClick={() => setWallAlignment(al.id as any)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    wallAlignment === al.id
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {al.label}
                </button>
              ))}
            </div>
          </div>

          <div className="w-px h-4 bg-slate-800" />

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Bề dày:</span>
            <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 font-mono text-[11px]">
              {[110, 150, 220].map((t) => (
                <button
                  key={t}
                  onClick={() => setWallThickness(t)}
                  className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                    wallThickness === t
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="w-px h-4 bg-slate-800" />

          <button
            type="button"
            onClick={() => {
              if (gridSnap === 0) setGridSnap(100);
              else if (gridSnap === 100) setGridSnap(500);
              else setGridSnap(0);
            }}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
              gridSnap > 0
                ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold shadow-[0_0_8px_rgba(14,165,233,0.4)]'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            <span>🌐</span>
            <span>Bắt điểm lưới: {gridSnap === 0 ? 'Tắt' : `${gridSnap}mm`}</span>
          </button>
        </div>
      )}

      {/* Eraser Active HUD Banner */}
      {activeTool === 'eraser' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2.5 bg-rose-600/95 text-white font-medium px-4 py-2 rounded-xl shadow-2xl z-20 animate-in fade-in slide-in-from-top-2 duration-150 border border-rose-400/50">
          <Eraser className="w-4 h-4 animate-bounce shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">
            CÔNG CỤ XÓA: Bấm hoặc quét vào đối tượng để xóa
          </span>
          {hoveredDeleteTarget && (
            <span className="text-[11px] bg-rose-950/80 px-2 py-0.5 rounded text-rose-200 font-mono font-bold border border-rose-500/40">
              {hoveredDeleteTarget.label || hoveredDeleteTarget.type}
            </span>
          )}
        </div>
      )}

      {/* Pen Draw Palette Toolbar */}
      {activeTool === 'pen_draw' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl shadow-xl z-20 text-xs">
          <Pencil className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-white">Vẽ Tay Note:</span>
          <div className="flex items-center gap-1.5 ml-2">
            {['#f59e0b', '#ef4444', '#38bdf8', '#22c55e', '#ffffff'].map((c) => (
              <button
                key={c}
                onClick={() => setPenColor(c)}
                className={`w-4 h-4 rounded-full border cursor-pointer ${
                  penColor === c ? 'scale-125 border-white' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex items-center gap-1 ml-3 border-l border-slate-700 pl-2">
            <button
              onClick={() => setPenType('pen')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                penType === 'pen' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
              }`}
            >
              Bút Nét
            </button>
            <button
              onClick={() => setPenType('highlighter')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                penType === 'highlighter' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
              }`}
            >
              Dạ Quang
            </button>
          </div>
        </div>
      )}

      {/* MEP Element Selector Toolbar - SYNCED WITH MEP_CATALOG */}
      {activeTool === 'mep' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/95 border border-slate-700 px-3.5 py-1.5 rounded-xl shadow-2xl z-20 text-xs backdrop-blur pointer-events-auto">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-white">Chọn Thiết Bị MEP:</span>
          <select
            value={mepCategory}
            onChange={(e) => setMepCategory(e.target.value as MepCategory)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
          >
            {MEP_CATALOG.map((item) => (
              <option key={item.category} value={item.category}>
                {item.name} [{item.tag}]
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Railing Tool Option Bar */}
      {activeTool === 'railing' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2.5 bg-slate-900/95 border border-slate-700 px-3.5 py-1.5 rounded-xl shadow-2xl z-20 text-xs backdrop-blur pointer-events-auto">
          <span className="font-bold text-sky-400">Kiểu Lan Can:</span>
          <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
            {[
              { id: 'glass', label: 'Kính Cường Lực' },
              { id: 'steel_bar', label: 'Thanh Thép Hộp' },
              { id: 'masonry', label: 'Xây Gạch' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setRailingStylePlan(st.id as any)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  railingStylePlan === st.id
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-slate-400 border-l border-slate-800 pl-2">
            {railingStartPoint ? 'Click điểm kết thúc lan can' : 'Click 2 điểm để vẽ lan can ban công (Cao 1100mm)'}
          </span>
        </div>
      )}

      {/* Roof Tool Option Bar */}
      {activeTool === 'roof' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2.5 bg-slate-900/95 border border-slate-700 px-3.5 py-1.5 rounded-xl shadow-2xl z-20 text-xs backdrop-blur pointer-events-auto">
          <span className="font-bold text-orange-400">Giàn Thép Mái:</span>
          <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
            {[
              { id: 'triangle', label: 'Tam Giác' },
              { id: 'trapezoid', label: 'Hình Thang' },
              { id: 'rectangular', label: 'Hình Chữ Nhật' },
            ].map((ts) => (
              <button
                key={ts.id}
                onClick={() => setRoofTrussShapePlan(ts.id as any)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  roofTrussShapePlan === ts.id
                    ? 'bg-orange-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {ts.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
            <span className="text-[11px] text-slate-400">Độ dốc:</span>
            {[25, 28, 35].map((sl) => (
              <button
                key={sl}
                onClick={() => setRoofSlopeDegPlan(sl)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer ${
                  roofSlopeDegPlan === sl
                    ? 'bg-orange-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sl}°
              </button>
            ))}
          </div>
          <span className="text-[11px] text-slate-400 border-l border-slate-800 pl-2">
            {roofStartPoint ? 'Click góc đối diện để đặt mái' : 'Click 2 điểm góc chéo để vẽ mái'}
          </span>
        </div>
      )}

      {/* Selected Wall Laser Trigger Banner */}
      {activeTool !== 'angle' && activeTool !== 'pen_draw' && selectedWallId && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-amber-500/95 text-slate-950 font-medium px-4 py-2 rounded-xl shadow-xl z-20 animate-in fade-in slide-in-from-top-2 duration-150">
          <Crosshair className="w-4 h-4 text-slate-950 animate-spin" />
          <span className="text-xs sm:text-sm">
            Tường đang chọn: <strong>{project.walls.find((w) => w.id === selectedWallId)?.name || 'Tường'}</strong>
          </span>
          <button
            onClick={onTriggerLaserForSelected}
            className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 text-amber-400 text-xs font-semibold px-3 py-1 rounded-lg transition-colors cursor-pointer shadow"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>BẮN LASER CẬP NHẬT</span>
          </button>
        </div>
      )}

      {/* Canvas Zoom & View Controls bottom right */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-lg shadow-lg z-10">
        {onUndo && onRedo && (
          <>
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded transition-colors ${
                canUndo ? 'text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer' : 'text-slate-600 cursor-not-allowed'
              }`}
              title="Hoàn tác (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-1.5 rounded transition-colors ${
                canRedo ? 'text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer' : 'text-slate-600 cursor-not-allowed'
              }`}
              title="Làm lại (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-700 mx-0.5" />
          </>
        )}
        <button
          onClick={() => setScale((s) => Math.min(0.5, s * 1.25))}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Phóng to"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setScale((s) => Math.max(0.015, s * 0.8))}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Thu nhỏ"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomExtents}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Zoom Extents (Thu phóng toàn bộ)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Tool Helper Bar */}
      <div className="absolute bottom-4 left-4 hidden sm:flex items-center gap-2 bg-slate-900/80 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-400">
        {activeTool === 'wall' && (
          <span>{wallStartPoint ? 'Click điểm kết thúc tường (Chuột phải để dừng)' : 'Click điểm bắt đầu để vẽ tường hiện trạng'}</span>
        )}
        {activeTool === 'curved_wall' && (
          <span>{!curvedStart ? 'Click điểm đầu tường cong' : !curvedEnd ? 'Click điểm cuối tường cong' : 'Click chọn độ võng cung tròn'}</span>
        )}
        {activeTool === 'stair' && <span>Click vào vị trí trên mặt bằng để đặt cầu thang</span>}
        {activeTool === 'mep' && <span>Click để đặt thiết bị cơ điện MEP</span>}
        {activeTool === 'pen_draw' && <span>Kéo chuột hoặc ngón tay để vẽ tay ghi chú hiện trường</span>}
        {activeTool === 'detail_callout' && <span>Click để khoanh vùng trích chi tiết (Detail Callout)</span>}
        {activeTool === 'select' && <span>Click vào tường để đo Laser hoặc kéo chuột để di chuyển bản vẽ</span>}
      </div>

      {/* Floating Tool Cursor Indicator */}
      <CursorToolBadge
        pos={cursorScreenPos}
        tool={activeTool}
        subType={
          activeTool === 'wall'
            ? wallAlignment === 'center'
              ? 'Trục tâm'
              : wallAlignment === 'interior'
              ? 'Mép trong'
              : 'Mép ngoài'
            : activeTool === 'mep'
            ? MEP_CATALOG.find((m) => m.category === mepCategory)?.tag
            : undefined
        }
        measureHint={liveMeasureHint}
      />

      {/* Storey Manager Modal */}
      <StoreyManagerModal
        isOpen={isStoreyModalOpen}
        onClose={() => setIsStoreyModalOpen(false)}
        storeys={
          project.storeys && project.storeys.length > 0
            ? project.storeys
            : [
                { id: 'st_1', name: 'Tầng 1 (Trệt)', levelMm: 0, cutPlaneHeightMm: 1200, heightMm: 3600, cutDirection: 'down' as const },
                { id: 'st_2', name: 'Tầng 2', levelMm: 3600, cutPlaneHeightMm: 1200, heightMm: 3600, cutDirection: 'down' as const },
              ]
        }
        activeStoreyId={project.activeStoreyId || 'st_1'}
        onSelectStorey={(id) => onSelectStorey && onSelectStorey(id)}
        onAddStorey={(st) => onAddStorey && onAddStorey(st)}
        onUpdateStorey={(st) => onUpdateStorey && onUpdateStorey(st)}
        onDeleteStorey={onDeleteStorey}
      />
    </div>
  );
};

function distancePointToSegment(p: Point2D, a: Point2D, b: Point2D): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}
