import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ProjectData, ElevSectEntity, Point2D, Storey, RoofTrussShape, RoofTrussBracing } from '../types/cad';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Plus,
  Layers,
  Sliders,
  Building,
  Ruler,
  Trash2,
  Undo2,
  Redo2,
  MousePointer2,
  Eraser,
  PenTool,
  DoorOpen,
  Square,
  TrendingUp,
  Home,
  Fence,
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Compass,
  DraftingCompass,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { CursorToolBadge } from './CursorToolBadge';

export type ElevToolType =
  | 'select'
  | 'eraser'
  | 'slab'
  | 'wall'
  | 'railing'
  | 'roof'
  | 'door'
  | 'window'
  | 'glass_partition'
  | 'level'
  | 'slope';

export interface SlopeMeasureItem {
  id: string;
  p1: Point2D;
  p2: Point2D;
  slopePercent: number; // e.g. 28.5%
  angleDeg: number; // e.g. 15.9°
}

interface ElevationSectionCanvasProps {
  project: ProjectData;
  onUpdateEntity: (entity: ElevSectEntity) => void;
  onAddEntity: (entity: ElevSectEntity) => void;
  onDeleteEntity: (id: string) => void;
  onToggleUnderlay: (active: boolean) => void;
  onUpdateUnderlayOpacity: (opacity: number) => void;
  onUpdateStorey?: (storey: Storey) => void;
  onAddStorey?: (storey: Storey) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const ElevationSectionCanvas: React.FC<ElevationSectionCanvasProps> = ({
  project,
  onUpdateEntity,
  onAddEntity,
  onDeleteEntity,
  onToggleUnderlay,
  onUpdateUnderlayOpacity,
  onUpdateStorey,
  onAddStorey,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Viewport transform
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 260, y: 560 });
  const [scale, setScale] = useState<number>(0.055); // px per mm
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Tool state
  const [activeTool, setActiveTool] = useState<ElevToolType>('select');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'elevation' | 'section'>('section');

  // Slope Measurement State (Tool đo độ dốc mái hoặc sàn bằng 2 điểm)
  const [slopeStartPoint, setSlopeStartPoint] = useState<Point2D | null>(null);
  const [slopeMeasurements, setSlopeMeasurements] = useState<SlopeMeasureItem[]>([]);

  // Configurable Roof Truss Options (Giàn thép mái tam giác, hình thang, hình chữ nhật)
  const [defaultTrussShape, setDefaultTrussShape] = useState<RoofTrussShape>('triangle');
  const [defaultTrussBracing, setDefaultTrussBracing] = useState<RoofTrussBracing>('pratt');
  const [defaultRoofSlope, setDefaultRoofSlope] = useState<number>(28);

  // Dragging cut plane handle
  const [draggingCutStoreyId, setDraggingCutStoreyId] = useState<string | null>(null);

  // Cursor Tool Badge State
  const [cursorScreenPos, setCursorScreenPos] = useState<{ x: number; y: number } | null>(null);
  const [cursorCadPos, setCursorCadPos] = useState<Point2D>({ x: 0, y: 0 });

  // Convert Screen <-> Section World (mm, Y positive goes UP)
  const screenToWorld = useCallback(
    (sx: number, sy: number): Point2D => {
      return {
        x: Math.round((sx - offset.x) / scale),
        y: Math.round((offset.y - sy) / scale),
      };
    },
    [offset, scale]
  );

  const worldToScreen = useCallback(
    (wx: number, wy: number) => {
      return {
        x: offset.x + wx * scale,
        y: offset.y - wy * scale,
      };
    },
    [offset, scale]
  );

  // Render loop
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

    // 1. Drafting background
    ctx.fillStyle = '#161920';
    ctx.fillRect(0, 0, w, h);

    // 2. Grid (1000mm major, 200mm minor)
    const gridMajor = 1000;
    const minCad = screenToWorld(0, h);
    const maxCad = screenToWorld(w, 0);

    ctx.strokeStyle = '#222733';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = Math.floor(minCad.x / gridMajor) * gridMajor; x <= maxCad.x; x += gridMajor) {
      const sx = worldToScreen(x, 0).x;
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, h);
    }
    for (let y = Math.floor(minCad.y / gridMajor) * gridMajor; y <= maxCad.y; y += gridMajor) {
      const sy = worldToScreen(0, y).y;
      ctx.moveTo(0, sy);
      ctx.lineTo(w, sy);
    }
    ctx.stroke();

    // 3. Ground baseline ±0.000 (Mặt đất tự nhiên)
    const gY = worldToScreen(0, 0).y;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, gY);
    ctx.lineTo(w, gY);
    ctx.stroke();

    // Earth hatch beneath ground
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, gY);
      ctx.lineTo(x - 20, gY + 25);
      ctx.stroke();
    }

    // Ground level label
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('CỐT SÂN / VỈA HÈ ±0.000', 16, gY - 8);

    // 4. UNDERLAY GHOST OF FLOOR PLAN (ĐÈ MỜ MẶT BẰNG & TRỤC DÓNG)
    if (project.underlayActive && project.walls.length > 0) {
      ctx.save();
      ctx.globalAlpha = project.underlayOpacity || 0.35;

      const underlayBaseY = -1200;
      project.walls.forEach((wall) => {
        const p1 = worldToScreen(wall.start.x, underlayBaseY - wall.start.y * 0.4);
        const p2 = worldToScreen(wall.end.x, underlayBaseY - wall.end.y * 0.4);

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // Vertical projection guide lines
        const top1 = worldToScreen(wall.start.x, 9000);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(top1.x, top1.y);
        ctx.stroke();
        ctx.stroke();
        ctx.setLineDash([]);
      });

      const ulPos = worldToScreen(0, underlayBaseY + 300);
      ctx.font = '600 11px system-ui, sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('ĐÈ MỜ MẶT BẰNG TRỤC DÓNG (ONION SKIN UNDERLAY)', ulPos.x, ulPos.y);
      ctx.restore();
    }

    // 5. Render Floor Cut Planes (MẶT PHẲNG CẮT TẦNG VỚI TAY NẮM ĐIỀU CHỈNH CAO ĐỘ)
    const storeysList =
      project.storeys && project.storeys.length > 0
        ? project.storeys
        : [
            { id: 'st_1', name: 'Tầng 1 (Trệt)', levelMm: 0, cutPlaneHeightMm: 1200, heightMm: 3600, cutDirection: 'down' as const },
            { id: 'st_2', name: 'Tầng 2', levelMm: 3600, cutPlaneHeightMm: 1200, heightMm: 3600, cutDirection: 'down' as const },
          ];

    storeysList.forEach((st) => {
      const cutY = st.levelMm + (st.cutPlaneHeightMm || 1200);
      const scY = worldToScreen(0, cutY).y;
      const isUp = st.cutDirection === 'up';

      ctx.save();
      // Dashed cut plane line
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(40, scY);
      ctx.lineTo(w - 40, scY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Cut Plane Indicator Badge
      const badgeX = 80;
      const dirText = isUp ? '▲ NHÌN LÊN (TRẦN)' : '▼ NHÌN XUỐNG (MẶT BẰNG)';
      const cutText = `MẶT PHẲNG CẮT ${st.name.toUpperCase()}: +${(cutY / 1000).toFixed(3)}m (${dirText})`;

      ctx.font = 'bold 10px monospace';
      const tw = ctx.measureText(cutText).width;

      ctx.fillStyle = 'rgba(8, 51, 68, 0.85)';
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(badgeX, scY - 18, tw + 20, 20, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#22d3ee';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(cutText, badgeX + 10, scY - 8);

      // Interactive draggable cut handle circle
      const handleX = badgeX + tw + 34;
      ctx.fillStyle = draggingCutStoreyId === st.id ? '#f59e0b' : '#06b6d4';
      ctx.beginPath();
      ctx.arc(handleX, scY, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    });

    // 6. Render Elevation & Section Entities
    project.elevSectEntities.forEach((ent) => {
      const isSelected = ent.id === selectedEntityId;
      const sp = worldToScreen(ent.x, ent.y);
      const sw = ent.width * scale;
      const sh = ent.height * scale;

      ctx.save();

      if (ent.type === 'level_marker') {
        // Architectural Level Target Marker
        const markerY = worldToScreen(0, ent.y).y;
        ctx.strokeStyle = isSelected ? '#fbbf24' : '#38bdf8';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(sp.x - 30, markerY);
        ctx.lineTo(w - 40, markerY);
        ctx.stroke();

        const triSize = 14;
        ctx.fillStyle = isSelected ? '#fbbf24' : '#0284c7';
        ctx.beginPath();
        ctx.moveTo(sp.x, markerY);
        ctx.lineTo(sp.x - triSize, markerY - triSize);
        ctx.lineTo(sp.x + triSize, markerY - triSize);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isSelected ? '#fbbf24' : '#ffffff';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(ent.levelText || `+${(ent.y / 1000).toFixed(3)}`, sp.x + triSize + 8, markerY - 4);
      } else if (ent.type === 'beam_slab') {
        // Concrete Beam & Slab (Sàn bê tông)
        ctx.fillStyle = isSelected ? 'rgba(251, 191, 36, 0.3)' : 'rgba(51, 65, 85, 0.7)';
        ctx.fillRect(sp.x, sp.y, sw, sh);
        ctx.strokeStyle = isSelected ? '#f59e0b' : '#94a3b8';
        ctx.lineWidth = 1.8;
        ctx.strokeRect(sp.x, sp.y, sw, sh);

        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 0.8;
        for (let x = sp.x; x < sp.x + sw; x += 15) {
          ctx.beginPath();
          ctx.moveTo(x, sp.y);
          ctx.lineTo(x + 10, sp.y + sh);
          ctx.stroke();
        }

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '10px sans-serif';
        ctx.fillText(`SÀN BÊ TÔNG (Dày ${ent.height}mm)`, sp.x + 8, sp.y + sh / 2 + 3);
      } else if (ent.type === 'wall') {
        // Wall (Tường xây mặt đứng/mặt cắt)
        ctx.fillStyle = isSelected ? 'rgba(251, 191, 36, 0.25)' : 'rgba(30, 41, 59, 0.85)';
        ctx.fillRect(sp.x, sp.y - sh, sw, sh);
        ctx.strokeStyle = isSelected ? '#f59e0b' : '#64748b';
        ctx.lineWidth = 2;
        ctx.strokeRect(sp.x, sp.y - sh, sw, sh);

        // Brick hatch
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
        ctx.lineWidth = 1;
        for (let y = sp.y - sh; y < sp.y; y += 12) {
          ctx.beginPath();
          ctx.moveTo(sp.x, y);
          ctx.lineTo(sp.x + sw, y);
          ctx.stroke();
        }

        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`TƯỜNG (${ent.width}x${ent.height}mm)`, sp.x + 8, sp.y - sh / 2);
      } else if (ent.type === 'railing_balcony') {
        // Balcony Railing (Lan can ban công)
        ctx.strokeStyle = isSelected ? '#f59e0b' : '#38bdf8';
        ctx.lineWidth = 1.5;

        const rHeightScreen = (ent.railingHeightMm || 1100) * scale;
        ctx.strokeRect(sp.x, sp.y - rHeightScreen, sw, rHeightScreen);

        if (ent.railingStyle === 'glass') {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
          ctx.fillRect(sp.x, sp.y - rHeightScreen, sw, rHeightScreen);
          ctx.fillStyle = '#38bdf8';
          ctx.font = '10px monospace';
          ctx.fillText(`LAN CAN KÍNH H=${ent.railingHeightMm || 1100}mm`, sp.x + 8, sp.y - rHeightScreen / 2);
        } else {
          for (let x = sp.x + 12; x < sp.x + sw; x += 14) {
            ctx.beginPath();
            ctx.moveTo(x, sp.y);
            ctx.lineTo(x, sp.y - rHeightScreen);
            ctx.stroke();
          }
        }
      } else if (ent.type === 'roof_pitched' || ent.type === 'roof_flat') {
        // Roof block with steel trusses (tam giác, hình thang, hình chữ nhật)
        ctx.fillStyle = isSelected ? 'rgba(251, 191, 36, 0.25)' : 'rgba(180, 83, 9, 0.22)';
        ctx.strokeStyle = isSelected ? '#f59e0b' : '#ea580c';
        ctx.lineWidth = 2;

        const trussShape: RoofTrussShape = ent.trussShape || (ent.type === 'roof_flat' ? 'rectangular' : 'triangle');
        const trussBracing: RoofTrussBracing = ent.trussBracing || 'pratt';

        if (trussShape === 'triangle') {
          // 1. GIÀN THÉP TAM GIÁC (A-FRAME TRUSS)
          const pA = { x: sp.x, y: sp.y };
          const pB = { x: sp.x + sw, y: sp.y };
          const pPeak = { x: sp.x + sw / 2, y: sp.y - sh };

          // Outer frame
          ctx.beginPath();
          ctx.moveTo(pA.x, pA.y);
          ctx.lineTo(pPeak.x, pPeak.y);
          ctx.lineTo(pB.x, pB.y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Steel Web Members (Thanh giằng thép kỹ thuật bên trong)
          ctx.strokeStyle = isSelected ? '#fbbf24' : '#f97316';
          ctx.lineWidth = 1.2;
          const bays = 6;
          for (let i = 1; i < bays; i++) {
            const bx = sp.x + (sw / bays) * i;
            const distFromMid = Math.abs(bx - (sp.x + sw / 2));
            const topY = sp.y - sh * (1 - distFromMid / (sw / 2));

            // Vertical strut
            ctx.beginPath();
            ctx.moveTo(bx, sp.y);
            ctx.lineTo(bx, topY);
            ctx.stroke();

            // Diagonals (Warren / Pratt)
            if (trussBracing === 'warren') {
              const prevTopY = sp.y - sh * (1 - Math.abs(bx - sw / bays - (sp.x + sw / 2)) / (sw / 2));
              ctx.beginPath();
              ctx.moveTo(bx - sw / bays, i % 2 === 0 ? prevTopY : sp.y);
              ctx.lineTo(bx, i % 2 === 0 ? sp.y : topY);
              ctx.stroke();
            } else {
              // Pratt bracing pointing toward peak
              ctx.beginPath();
              ctx.moveTo(bx, sp.y);
              ctx.lineTo(bx < sp.x + sw / 2 ? bx + sw / bays : bx - sw / bays, topY);
              ctx.stroke();
            }

            // Connection node gusset plate
            ctx.fillStyle = '#ea580c';
            ctx.beginPath();
            ctx.arc(bx, sp.y, 2.5, 0, Math.PI * 2);
            ctx.arc(bx, topY, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.fillStyle = '#f97316';
          ctx.font = 'bold 10px monospace';
          ctx.fillText(`GIÀN MÁI TAM GIÁC ${ent.roofSlopeDeg || 28}° (TCVN 5575)`, sp.x + sw / 2 - 80, sp.y - sh / 2);
        } else if (trussShape === 'trapezoid') {
          // 2. GIÀN THÉP HÌNH THANG (MANSARD TRUSS)
          const pA = { x: sp.x, y: sp.y };
          const pB = { x: sp.x + sw, y: sp.y };
          const pC1 = { x: sp.x + sw * 0.28, y: sp.y - sh };
          const pC2 = { x: sp.x + sw * 0.72, y: sp.y - sh };

          ctx.beginPath();
          ctx.moveTo(pA.x, pA.y);
          ctx.lineTo(pC1.x, pC1.y);
          ctx.lineTo(pC2.x, pC2.y);
          ctx.lineTo(pB.x, pB.y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Internal steel webbing
          ctx.strokeStyle = isSelected ? '#fbbf24' : '#f97316';
          ctx.lineWidth = 1.2;
          const bays = 6;
          for (let i = 1; i < bays; i++) {
            const bx = sp.x + (sw / bays) * i;
            let topY = sp.y - sh;
            if (bx < pC1.x) {
              topY = sp.y - (sh * (bx - pA.x)) / (pC1.x - pA.x);
            } else if (bx > pC2.x) {
              topY = sp.y - (sh * (pB.x - bx)) / (pB.x - pC2.x);
            }

            ctx.beginPath();
            ctx.moveTo(bx, sp.y);
            ctx.lineTo(bx, topY);
            ctx.stroke();

            // Diagonal bracing
            const prevX = sp.x + (sw / bays) * (i - 1);
            ctx.beginPath();
            ctx.moveTo(prevX, sp.y);
            ctx.lineTo(bx, topY);
            ctx.stroke();
          }

          ctx.fillStyle = '#f97316';
          ctx.font = 'bold 10px monospace';
          ctx.fillText('GIÀN THÉP HÌNH THANG (TCVN 5575)', sp.x + sw / 2 - 70, sp.y - sh / 2);
        } else {
          // 3. GIÀN THÉP HÌNH CHỮ NHẬT (LATTICE PRATT/WARREN TRUSS)
          ctx.fillRect(sp.x, sp.y - sh, sw, sh);
          ctx.strokeRect(sp.x, sp.y - sh, sw, sh);

          // Internal steel web lattice
          ctx.strokeStyle = isSelected ? '#fbbf24' : '#f97316';
          ctx.lineWidth = 1.2;
          const bays = Math.max(4, Math.round(sw / 45));
          const stepW = sw / bays;
          for (let i = 0; i < bays; i++) {
            const x1 = sp.x + i * stepW;
            const x2 = sp.x + (i + 1) * stepW;
            // Vertical
            ctx.beginPath();
            ctx.moveTo(x2, sp.y);
            ctx.lineTo(x2, sp.y - sh);
            ctx.stroke();
            // Diagonal
            ctx.beginPath();
            ctx.moveTo(x1, i % 2 === 0 ? sp.y : sp.y - sh);
            ctx.lineTo(x2, i % 2 === 0 ? sp.y - sh : sp.y);
            ctx.stroke();
          }

          ctx.fillStyle = '#f97316';
          ctx.font = 'bold 10px monospace';
          ctx.fillText('GIÀN THÉP PHẲNG HÌNH CHỮ NHẬT', sp.x + 10, sp.y - sh / 2);
        }
      } else if (ent.type === 'door') {
        // Door on elevation (Cửa đi)
        ctx.fillStyle = isSelected ? 'rgba(251, 191, 36, 0.3)' : 'rgba(239, 68, 68, 0.2)';
        ctx.fillRect(sp.x, sp.y - sh, sw, sh);
        ctx.strokeStyle = isSelected ? '#fbbf24' : '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(sp.x, sp.y - sh, sw, sh);

        // Frame and handle
        ctx.strokeRect(sp.x + 3, sp.y - sh + 3, sw - 6, sh - 6);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(sp.x + sw - 12, sp.y - sh / 2, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fca5a5';
        ctx.font = 'bold 9.5px monospace';
        ctx.fillText(`CỬA ĐI ${ent.width}x${ent.height}`, sp.x + 6, sp.y - sh + 14);
      } else if (ent.type === 'window') {
        // Window on elevation (Cửa sổ)
        ctx.fillStyle = isSelected ? 'rgba(251, 191, 36, 0.3)' : 'rgba(56, 189, 248, 0.2)';
        ctx.fillRect(sp.x, sp.y - sh, sw, sh);
        ctx.strokeStyle = isSelected ? '#fbbf24' : '#38bdf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(sp.x, sp.y - sh, sw, sh);

        // Mullions
        ctx.beginPath();
        ctx.moveTo(sp.x + sw / 2, sp.y - sh);
        ctx.lineTo(sp.x + sw / 2, sp.y);
        ctx.stroke();

        ctx.fillStyle = '#bae6fd';
        ctx.font = 'bold 9.5px monospace';
        ctx.fillText(`CỬA SỔ ${ent.width}x${ent.height}`, sp.x + 6, sp.y - sh + 14);
      } else if (ent.type === 'glass_partition') {
        // Glass Partition on elevation (Vách kính)
        ctx.fillStyle = isSelected ? 'rgba(251, 191, 36, 0.3)' : 'rgba(6, 182, 212, 0.25)';
        ctx.fillRect(sp.x, sp.y - sh, sw, sh);
        ctx.strokeStyle = isSelected ? '#fbbf24' : '#06b6d4';
        ctx.lineWidth = 2;
        ctx.strokeRect(sp.x, sp.y - sh, sw, sh);

        // Vertical panel splits
        const panels = 3;
        for (let i = 1; i < panels; i++) {
          const px = sp.x + (sw / panels) * i;
          ctx.beginPath();
          ctx.moveTo(px, sp.y - sh);
          ctx.lineTo(px, sp.y);
          ctx.stroke();
        }

        ctx.fillStyle = '#22d3ee';
        ctx.font = 'bold 9.5px monospace';
        ctx.fillText(`VÁCH KÍNH ${ent.width}x${ent.height}`, sp.x + 6, sp.y - sh + 14);
      }

      ctx.restore();
    });

    // 8. Draw Slope Measurements (Đo độ dốc mái hoặc sàn bằng 2 điểm)
    slopeMeasurements.forEach((sm, idx) => {
      const s1 = worldToScreen(sm.p1.x, sm.p1.y);
      const s2 = worldToScreen(sm.p2.x, sm.p2.y);

      ctx.save();
      // Main slope dimension line
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s1.x, s1.y);
      ctx.lineTo(s2.x, s2.y);
      ctx.stroke();

      // End tick marks
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(s1.x, s1.y, 4, 0, Math.PI * 2);
      ctx.arc(s2.x, s2.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Slope triangle indicator (CAD slope triangle)
      const midX = (s1.x + s2.x) / 2;
      const midY = (s1.y + s2.y) / 2;
      const triW = 32;
      const triH = Math.min(24, Math.abs(s2.y - s1.y) * 0.4 + 10);
      const signY = s2.y < s1.y ? -1 : 1;

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(midX - triW / 2, midY);
      ctx.lineTo(midX + triW / 2, midY);
      ctx.lineTo(midX + triW / 2, midY + triH * signY);
      ctx.closePath();
      ctx.stroke();

      // Dimension callout badge
      const badgeText = `📐 ĐỘ DỐC i = ${sm.slopePercent}% (${sm.angleDeg}°)`;
      ctx.font = 'bold 11px monospace';
      const textMetrics = ctx.measureText(badgeText);
      const boxW = textMetrics.width + 16;
      const boxH = 22;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(midX - boxW / 2, midY - 32, boxW, boxH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, midX, midY - 21);
      ctx.restore();
    });

    // 9. Live Slope Measurement Rubberband
    if (activeTool === 'slope' && slopeStartPoint) {
      const s1 = worldToScreen(slopeStartPoint.x, slopeStartPoint.y);
      const s2 = worldToScreen(cursorCadPos.x, cursorCadPos.y);

      ctx.save();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(s1.x, s1.y);
      ctx.lineTo(s2.x, s2.y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(s1.x, s1.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Live calculation
      const dx = cursorCadPos.x - slopeStartPoint.x;
      const dy = cursorCadPos.y - slopeStartPoint.y;
      const livePct = Math.abs(dx) > 10 ? (Math.abs(dy) / Math.abs(dx)) * 100 : 0;
      const liveDeg = Math.abs(dx) > 10 ? (Math.atan(Math.abs(dy) / Math.abs(dx)) * 180) / Math.PI : 0;

      const liveText = `Click điểm 2 đo dốc | i = ${livePct.toFixed(1)}% (${liveDeg.toFixed(1)}°)`;
      ctx.font = 'bold 11px monospace';
      const tw = ctx.measureText(liveText).width;
      const midX = (s1.x + s2.x) / 2;
      const midY = (s1.y + s2.y) / 2;

      ctx.fillStyle = 'rgba(2, 6, 23, 0.92)';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(midX - (tw + 16) / 2, midY - 30, tw + 16, 24, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(liveText, midX, midY - 18);
      ctx.restore();
    }
  }, [
    project,
    offset,
    scale,
    selectedEntityId,
    screenToWorld,
    worldToScreen,
    viewMode,
    draggingCutStoreyId,
    slopeMeasurements,
    slopeStartPoint,
    cursorCadPos,
    activeTool,
  ]);

  // Pointer interactions
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const cadPt = screenToWorld(sx, sy);

    // 0. Slope measurement tool (Đo độ dốc mái hoặc sàn bằng 2 điểm)
    if (activeTool === 'slope') {
      if (!slopeStartPoint) {
        setSlopeStartPoint(cadPt);
      } else {
        const dx = cadPt.x - slopeStartPoint.x;
        const dy = cadPt.y - slopeStartPoint.y;
        if (Math.abs(dx) > 10) {
          const slopePct = (Math.abs(dy) / Math.abs(dx)) * 100;
          const angDeg = (Math.atan(Math.abs(dy) / Math.abs(dx)) * 180) / Math.PI;
          setSlopeMeasurements((prev) => [
            ...prev,
            {
              id: 'sl_' + Date.now(),
              p1: slopeStartPoint,
              p2: cadPt,
              slopePercent: Math.round(slopePct * 10) / 10,
              angleDeg: Math.round(angDeg * 10) / 10,
            },
          ]);
        }
        setSlopeStartPoint(null);
      }
      return;
    }

    // 1. Check if clicking on cut plane drag handle
    const storeysList = project.storeys || [];
    for (const st of storeysList) {
      const cutY = st.levelMm + (st.cutPlaneHeightMm || 1200);
      const scY = worldToScreen(0, cutY).y;
      if (Math.abs(sy - scY) < 14) {
        setDraggingCutStoreyId(st.id);
        return;
      }
    }

    // 2. Eraser tool
    if (activeTool === 'eraser') {
      const hit = project.elevSectEntities.find((ent) => {
        const sw = ent.width;
        const sh = ent.height;
        return cadPt.x >= ent.x && cadPt.x <= ent.x + sw && cadPt.y >= ent.y - sh && cadPt.y <= ent.y + sh;
      });
      if (hit) {
        onDeleteEntity(hit.id);
      }
      return;
    }

    // 3. Drawing tools
    if (activeTool === 'slab') {
      const newEnt: ElevSectEntity = {
        id: 'slab_' + Date.now(),
        type: 'beam_slab',
        x: Math.round(cadPt.x / 500) * 500,
        y: Math.round(cadPt.y / 100) * 100,
        width: 6000,
        height: 350,
        material: 'Bê tông cốt thép',
      };
      onAddEntity(newEnt);
      setSelectedEntityId(newEnt.id);
      return;
    }

    if (activeTool === 'wall') {
      const newEnt: ElevSectEntity = {
        id: 'wall_' + Date.now(),
        type: 'wall',
        x: Math.round(cadPt.x / 500) * 500,
        y: Math.round(cadPt.y / 100) * 100 + 3300,
        width: 3600,
        height: 3300,
        material: 'Tường gạch xây',
      };
      onAddEntity(newEnt);
      setSelectedEntityId(newEnt.id);
      return;
    }

    if (activeTool === 'railing') {
      const newEnt: ElevSectEntity = {
        id: 'rail_' + Date.now(),
        type: 'railing_balcony',
        x: Math.round(cadPt.x / 500) * 500,
        y: Math.round(cadPt.y / 100) * 100,
        width: 2400,
        height: 1100,
        railingHeightMm: 1100,
        railingStyle: 'glass',
      };
      onAddEntity(newEnt);
      setSelectedEntityId(newEnt.id);
      return;
    }

    if (activeTool === 'roof') {
      const newEnt: ElevSectEntity = {
        id: 'roof_' + Date.now(),
        type: 'roof_pitched',
        x: Math.round(cadPt.x / 500) * 500,
        y: Math.round(cadPt.y / 100) * 100,
        width: 7200,
        height: 1800,
        roofSlopeDeg: defaultRoofSlope,
        trussShape: defaultTrussShape,
        trussBracing: defaultTrussBracing,
        name: 'Giàn Thép Mái',
      };
      onAddEntity(newEnt);
      setSelectedEntityId(newEnt.id);
      return;
    }

    if (activeTool === 'door') {
      const newEnt: ElevSectEntity = {
        id: 'door_' + Date.now(),
        type: 'door',
        x: Math.round(cadPt.x / 100) * 100,
        y: Math.round(cadPt.y / 100) * 100 + 2200,
        width: 950,
        height: 2200,
      };
      onAddEntity(newEnt);
      setSelectedEntityId(newEnt.id);
      return;
    }

    if (activeTool === 'window') {
      const newEnt: ElevSectEntity = {
        id: 'win_' + Date.now(),
        type: 'window',
        x: Math.round(cadPt.x / 100) * 100,
        y: Math.round(cadPt.y / 100) * 100 + 1600,
        width: 1800,
        height: 1400,
      };
      onAddEntity(newEnt);
      setSelectedEntityId(newEnt.id);
      return;
    }

    if (activeTool === 'glass_partition') {
      const newEnt: ElevSectEntity = {
        id: 'glass_' + Date.now(),
        type: 'glass_partition',
        x: Math.round(cadPt.x / 100) * 100,
        y: Math.round(cadPt.y / 100) * 100 + 2600,
        width: 2800,
        height: 2600,
      };
      onAddEntity(newEnt);
      setSelectedEntityId(newEnt.id);
      return;
    }

    if (activeTool === 'level') {
      const nextY = Math.round(cadPt.y / 100) * 100;
      const newEnt: ElevSectEntity = {
        id: 'lvl_' + Date.now(),
        type: 'level_marker',
        x: 200,
        y: nextY,
        width: 800,
        height: 0,
        levelText: `+${(nextY / 1000).toFixed(3)} SÀN TẦNG ${project.elevSectEntities.filter((e) => e.type === 'level_marker').length + 1}`,
        elevationValM: nextY / 1000,
      };
      onAddEntity(newEnt);
      setSelectedEntityId(newEnt.id);
      return;
    }

    // 4. Select tool / Pan
    const hit = project.elevSectEntities.find((ent) => {
      const sw = ent.width;
      const sh = ent.height || 100;
      return cadPt.x >= ent.x && cadPt.x <= ent.x + sw && cadPt.y >= ent.y - sh && cadPt.y <= ent.y + sh;
    });

    if (hit) {
      setSelectedEntityId(hit.id);
    } else {
      setSelectedEntityId(null);
      setIsPanning(true);
      setPanStart({ x: sx - offset.x, y: sy - offset.y });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const cadPt = screenToWorld(sx, sy);

    setCursorScreenPos({ x: e.clientX, y: e.clientY });
    setCursorCadPos(cadPt);

    // If dragging a cut plane
    if (draggingCutStoreyId && onUpdateStorey && project.storeys) {
      const targetStorey = project.storeys.find((s) => s.id === draggingCutStoreyId);
      if (targetStorey) {
        const newCutPlaneMm = Math.max(300, Math.min(3200, cadPt.y - targetStorey.levelMm));
        onUpdateStorey({
          ...targetStorey,
          cutPlaneHeightMm: Math.round(newCutPlaneMm / 50) * 50,
        });
      }
      return;
    }

    if (!isPanning) return;
    setOffset({
      x: sx - panStart.x,
      y: sy - panStart.y,
    });
  };

  const handlePointerUp = () => {
    setIsPanning(false);
    setDraggingCutStoreyId(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const zoom = e.deltaY < 0 ? 1.15 : 0.87;
    const newScale = Math.max(0.015, Math.min(0.4, scale * zoom));

    setOffset({
      x: sx - (sx - offset.x) * (newScale / scale),
      y: sy - (sy - offset.y) * (newScale / scale),
    });
    setScale(newScale);
  };

  const tools: { id: ElevToolType; label: string; icon: any; shortcut: string }[] = [
    { id: 'select', label: 'Chọn / Kéo', icon: MousePointer2, shortcut: 'V' },
    { id: 'eraser', label: 'Công Cụ Xóa', icon: Eraser, shortcut: 'E' },
    { id: 'slab', label: 'Vẽ Sàn Bê Tông', icon: Layers, shortcut: 'S' },
    { id: 'wall', label: 'Vẽ Tường Đứng', icon: PenTool, shortcut: 'W' },
    { id: 'railing', label: 'Lan Can Ban Công', icon: Fence, shortcut: 'R' },
    { id: 'roof', label: 'Mái Dốc / Bằng', icon: Home, shortcut: 'M' },
    { id: 'door', label: 'Đặt Cửa Đi', icon: DoorOpen, shortcut: 'D' },
    { id: 'window', label: 'Đặt Cửa Sổ', icon: Square, shortcut: 'O' },
    { id: 'glass_partition', label: 'Đặt Vách Kính', icon: Square, shortcut: 'G' },
    { id: 'slope', label: 'Đo Độ Dốc Mái/Sàn', icon: Compass, shortcut: 'P' },
    { id: 'level', label: 'Mốc Cao Độ', icon: Sliders, shortcut: 'L' },
  ];

  return (
    <div className="relative w-full h-full bg-[#161920] overflow-hidden select-none flex flex-col">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 z-10 shrink-0 text-xs">
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-amber-500" />
          <span className="font-bold text-white">Bản Vẽ Mặt Đứng &amp; Mặt Cắt</span>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('section')}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                viewMode === 'section' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mặt Cắt A-A
            </button>
            <button
              onClick={() => setViewMode('elevation')}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                viewMode === 'elevation' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mặt Đứng Chính
            </button>
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 ml-1">
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
        </div>

        {/* Top Right: Cut Plane Quick Tuner & Underlay */}
        <div className="flex items-center gap-2">
          {/* Quick Cut Plane Height info */}
          {project.storeys && project.storeys.length > 0 && onUpdateStorey && (
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-xs">
              <span className="text-cyan-400 font-bold">Mặt cắt T1:</span>
              <span className="font-mono text-white">
                +{((project.storeys[0].cutPlaneHeightMm || 1200) / 1000).toFixed(2)}m
              </span>
              <button
                onClick={() => {
                  const s = project.storeys![0];
                  const nextDir = s.cutDirection === 'up' ? 'down' : 'up';
                  onUpdateStorey({ ...s, cutDirection: nextDir });
                }}
                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer flex items-center gap-1"
                title="Đổi hướng cắt mặt bằng (nhìn xuống / nhìn lên)"
              >
                {project.storeys[0].cutDirection === 'up' ? (
                  <>
                    <ArrowUp className="w-3 h-3 text-amber-400" />
                    <span>Lên</span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="w-3 h-3 text-sky-400" />
                    <span>Xuống</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Underlay Toggle */}
          <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <button
              onClick={() => onToggleUnderlay(!project.underlayActive)}
              className={`flex items-center gap-1.5 font-medium cursor-pointer transition-colors ${
                project.underlayActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Chiếu mờ mặt bằng bên dưới để dóng trục thẳng đứng"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Đè mờ Trục Dóng</span>
            </button>
            {project.underlayActive && (
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={project.underlayOpacity}
                onChange={(e) => onUpdateUnderlayOpacity(parseFloat(e.target.value))}
                className="w-14 accent-amber-500 cursor-pointer"
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Workspace Body with Left CAD Toolbar */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex">
        {/* Left Toolbar */}
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

        {/* Center Drawing Canvas */}
        <div className="relative flex-1 w-full h-full overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-full block cursor-crosshair touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={() => {
              handlePointerUp();
              setCursorScreenPos(null);
            }}
            onWheel={handleWheel}
          />

          {/* Active Tool HUD banner */}
          {activeTool !== 'select' && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/95 border border-slate-700 px-3.5 py-1.5 rounded-xl shadow-2xl z-20 text-xs backdrop-blur pointer-events-none">
              <span className="text-amber-400 font-bold">
                {tools.find((t) => t.id === activeTool)?.label}:
              </span>
              <span className="text-slate-300">
                Click vào bản vẽ mặt đứng / mặt cắt để đặt đối tượng (hoặc kéo tay nắm mặt phẳng cắt)
              </span>
            </div>
          )}

          {/* Zoom controls bottom right */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-lg shadow-lg z-10">
            <button
              onClick={() => setScale((s) => Math.min(0.4, s * 1.25))}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setScale((s) => Math.max(0.015, s * 0.8))}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setOffset({ x: 260, y: 560 });
                setScale(0.055);
              }}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Legend bottom left */}
          <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-400 hidden sm:block">
            <span>Kéo tay nắm tròn màu xanh trên đường mặt phẳng cắt để điều chỉnh cao độ cắt nhìn mặt bằng</span>
          </div>

          {/* Floating Cursor Tool Badge */}
          <CursorToolBadge
            pos={cursorScreenPos}
            tool={activeTool}
            subType={
              activeTool === 'select'
                ? undefined
                : `X:${cursorCadPos.x} Y:${cursorCadPos.y}`
            }
          />
        </div>

        {/* Right Properties & Dimensions Inspector Panel */}
        <aside className="w-64 border-l border-slate-800 bg-[#16191f] flex flex-col p-3.5 overflow-y-auto z-20 shrink-0 text-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-500" />
              <span>Thuộc Tính Kích Thước</span>
            </h3>
            {selectedEntityId && (
              <button
                onClick={() => setSelectedEntityId(null)}
                className="text-[10px] text-slate-400 hover:text-white"
              >
                Bỏ chọn
              </button>
            )}
          </div>

          {/* 1. INSPECT SELECTED ENTITY */}
          {(() => {
            const ent = project.elevSectEntities.find((e) => e.id === selectedEntityId);
            if (!ent) return null;

            return (
              <div className="space-y-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-amber-400 text-xs uppercase">{ent.type.replace('_', ' ')}</span>
                  <button
                    onClick={() => {
                      onDeleteEntity(ent.id);
                      setSelectedEntityId(null);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-400 rounded"
                    title="Xóa đối tượng"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Rộng (mm):</label>
                    <input
                      type="number"
                      step="100"
                      value={ent.width}
                      onChange={(e) => onUpdateEntity({ ...ent, width: parseInt(e.target.value) || 100 })}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 font-mono text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Cao (mm):</label>
                    <input
                      type="number"
                      step="100"
                      value={ent.height}
                      onChange={(e) => onUpdateEntity({ ...ent, height: parseInt(e.target.value) || 100 })}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 font-mono text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Cao độ đặt Y (mm):</label>
                  <input
                    type="number"
                    step="100"
                    value={ent.y}
                    onChange={(e) => onUpdateEntity({ ...ent, y: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 font-mono text-white"
                  />
                </div>

                {/* Roof Truss Specific Properties */}
                {(ent.type === 'roof_pitched' || ent.type === 'roof_flat') && (
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <div className="text-[11px] font-semibold text-amber-400">Quy cách giàn thép kỹ thuật:</div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">Hình dạng khung thép mái:</label>
                      <select
                        value={ent.trussShape || 'triangle'}
                        onChange={(e) => onUpdateEntity({ ...ent, trussShape: e.target.value as RoofTrussShape })}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white"
                      >
                        <option value="triangle">Hình Tam Giác (Mái dốc chữ A)</option>
                        <option value="trapezoid">Hình Thang (Mansard Truss)</option>
                        <option value="rectangular">Hình Chữ Nhật (Giàn phẳng)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">Hệ giằng thép bên trong (TCVN):</label>
                      <select
                        value={ent.trussBracing || 'pratt'}
                        onChange={(e) => onUpdateEntity({ ...ent, trussBracing: e.target.value as RoofTrussBracing })}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white"
                      >
                        <option value="pratt">Hệ giằng Pratt (Thanh xiên hướng đỉnh)</option>
                        <option value="warren">Hệ giằng Warren (Ziczac đối xứng)</option>
                        <option value="howe">Hệ giằng Howe (Thanh xiên hướng gối)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">Độ dốc mái (độ °):</label>
                      <input
                        type="number"
                        step="1"
                        min="5"
                        max="60"
                        value={ent.roofSlopeDeg || 28}
                        onChange={(e) => onUpdateEntity({ ...ent, roofSlopeDeg: parseInt(e.target.value) || 28 })}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 font-mono text-white"
                      />
                    </div>
                  </div>
                )}

                {/* Railing Properties */}
                {ent.type === 'railing_balcony' && (
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">Kiểu dáng lan can:</label>
                      <select
                        value={ent.railingStyle || 'glass'}
                        onChange={(e) => onUpdateEntity({ ...ent, railingStyle: e.target.value as any })}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white"
                      >
                        <option value="glass">Kính Cường Lực Siêu Trong</option>
                        <option value="steel_bar">Thép Hộp Thanh Đứng</option>
                        <option value="masonry">Xây Gạch Đặc + Sơn</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* 2. SLOPE MEASUREMENTS LIST (Đo độ dốc mái hoặc sàn bằng 2 điểm) */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="font-bold text-sky-400 text-xs flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>Số Đo Độ Dốc Mái/Sàn ({slopeMeasurements.length})</span>
              </span>
              {slopeMeasurements.length > 0 && (
                <button
                  onClick={() => setSlopeMeasurements([])}
                  className="text-[10px] text-rose-400 hover:text-rose-300"
                >
                  Xóa hết
                </button>
              )}
            </div>

            {slopeMeasurements.length === 0 ? (
              <div className="text-[11px] text-slate-500 py-1 italic">
                Chọn công cụ "Đo Độ Dốc Mái/Sàn" và bấm 2 điểm bất kỳ trên mái hoặc sàn để đo độ dốc (%) và góc nghiêng (°).
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {slopeMeasurements.map((m, idx) => (
                  <div
                    key={m.id}
                    className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-mono font-bold text-amber-400 text-xs">
                        i = {m.slopePercent}% · {m.angleDeg}°
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        ({Math.round(m.p1.x)}, {Math.round(m.p1.y)}) → ({Math.round(m.p2.x)}, {Math.round(m.p2.y)})
                      </div>
                    </div>
                    <button
                      onClick={() => setSlopeMeasurements((prev) => prev.filter((it) => it.id !== m.id))}
                      className="p-1 text-slate-500 hover:text-rose-400"
                      title="Xóa số đo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. TOOL DEFAULT SETTINGS (Khi đang chọn công cụ vẽ) */}
          <div className="space-y-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
              <DraftingCompass className="w-3.5 h-3.5 text-amber-500" />
              <span>Cài Đặt Công Cụ Đang Chọn</span>
            </div>

            {activeTool === 'roof' && (
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Hình dạng khung thép mái:</label>
                  <select
                    value={defaultTrussShape}
                    onChange={(e) => setDefaultTrussShape(e.target.value as RoofTrussShape)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white"
                  >
                    <option value="triangle">Hình Tam Giác (Mái chữ A)</option>
                    <option value="trapezoid">Hình Thang (Mansard)</option>
                    <option value="rectangular">Hình Chữ Nhật (Giàn phẳng)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Hệ giằng thép kỹ thuật:</label>
                  <select
                    value={defaultTrussBracing}
                    onChange={(e) => setDefaultTrussBracing(e.target.value as RoofTrussBracing)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white"
                  >
                    <option value="pratt">Giằng Pratt (Xiên nén)</option>
                    <option value="warren">Giằng Warren (Ziczac)</option>
                    <option value="howe">Giằng Howe (Xiên kéo)</option>
                  </select>
                </div>
              </div>
            )}

            {activeTool === 'slab' && (
              <div className="text-[11px] text-slate-400">
                Click vào canvas để đặt bản sàn bê tông dày 350mm hoặc kéo dãn kích thước theo ý muốn.
              </div>
            )}

            {activeTool === 'slope' && (
              <div className="p-2 rounded bg-sky-500/10 border border-sky-500/30 text-[11px] text-sky-300">
                <strong>Đo Độ Dốc Mái/Sàn:</strong> Click điểm đầu, sau đó click điểm thứ 2 trên mái/sàn. Hệ thống sẽ tự động tính và hiển thị độ dốc (%) và góc nghiêng (°).
              </div>
            )}

            {activeTool === 'select' && (
              <div className="text-[11px] text-slate-500">
                Click chọn bất kỳ đối tượng nào trên bản vẽ mặt đứng / mặt cắt để xem và chỉnh sửa thông số kỹ thuật.
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
