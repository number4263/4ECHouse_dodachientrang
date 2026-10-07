import React from 'react';
import {
  Wall,
  CurvedWall,
  Opening,
  Column,
  Staircase,
  MepElement,
  LandscapeElement,
  DetailCallout,
  ProjectData,
  OpeningType,
  StructuralColumnType,
  StaircaseType,
  LandingSplitType,
  MepCategory,
  MEP_CATALOG,
} from '../types/cad';
import {
  Trash2,
  Zap,
  CheckCircle2,
  RotateCw,
  Building,
  Layers,
  Ruler,
  TrendingUp,
  Columns as ColumnIcon,
  Spline,
  DoorOpen,
  Square,
  Search,
  Leaf,
  Plus,
  Minus,
  Sliders,
  Eye,
  EyeOff,
} from 'lucide-react';

interface PropertyPanelProps {
  project: ProjectData;
  selectedWallId: string | null;
  selectedCurvedWallId?: string | null;
  selectedOpeningId: string | null;
  selectedStairId?: string | null;
  selectedColumnId?: string | null;
  selectedMepId?: string | null;
  selectedLandscapeId?: string | null;
  selectedDetailCalloutId?: string | null;
  onUpdateWall: (wall: Wall) => void;
  onDeleteWall: (wallId: string) => void;
  onUpdateCurvedWall?: (cw: CurvedWall) => void;
  onDeleteCurvedWall?: (cwId: string) => void;
  onUpdateOpening: (opening: Opening) => void;
  onDeleteOpening: (openingId: string) => void;
  onUpdateStair?: (stair: Staircase) => void;
  onDeleteStair?: (stairId: string) => void;
  onUpdateColumn?: (col: Column) => void;
  onDeleteColumn?: (colId: string) => void;
  onUpdateMep?: (mep: MepElement) => void;
  onDeleteMep?: (mepId: string) => void;
  onUpdateLandscape?: (ls: LandscapeElement) => void;
  onDeleteLandscape?: (lsId: string) => void;
  onUpdateDetailCallout?: (dt: DetailCallout) => void;
  onDeleteDetailCallout?: (dtId: string) => void;
  onDeleteAngle?: (angleId: string) => void;
  onTriggerLaserForSelected: () => void;
  onUpdateProjectDefaults: (defaults: { defaultWallThickness?: number; defaultCeilingHeight?: number }) => void;
  onToggleUnderlay?: (active: boolean) => void;
  onUpdateUnderlayOpacity?: (opacity: number) => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  project,
  selectedWallId,
  selectedCurvedWallId,
  selectedOpeningId,
  selectedStairId,
  selectedColumnId,
  selectedMepId,
  selectedLandscapeId,
  selectedDetailCalloutId,
  onUpdateWall,
  onDeleteWall,
  onUpdateCurvedWall,
  onDeleteCurvedWall,
  onUpdateOpening,
  onDeleteOpening,
  onUpdateStair,
  onDeleteStair,
  onUpdateColumn,
  onDeleteColumn,
  onUpdateMep,
  onDeleteMep,
  onUpdateLandscape,
  onDeleteLandscape,
  onUpdateDetailCallout,
  onDeleteDetailCallout,
  onDeleteAngle,
  onTriggerLaserForSelected,
  onUpdateProjectDefaults,
  onToggleUnderlay,
  onUpdateUnderlayOpacity,
}) => {
  const selectedWall = project.walls.find((w) => w.id === selectedWallId);
  const selectedCurvedWall = project.curvedWalls?.find((cw) => cw.id === selectedCurvedWallId);
  const selectedOpening = project.openings.find((op) => op.id === selectedOpeningId);
  const selectedStair = project.staircases?.find((s) => s.id === selectedStairId);
  const selectedColumn = project.columns?.find((c) => c.id === selectedColumnId);
  const selectedMep = project.mepElements?.find((m) => m.id === selectedMepId);
  const selectedLandscape = project.landscapeElements?.find((l) => l.id === selectedLandscapeId);
  const selectedDetailCallout = project.detailCallouts?.find((d) => d.id === selectedDetailCalloutId);

  // Find angles connected to selected wall
  const connectedAngles = selectedWall && project.angles
    ? project.angles.filter((a) => a.wall1Id === selectedWall.id || a.wall2Id === selectedWall.id)
    : [];

  // Project statistics
  const totalWallLengthM = project.walls.reduce((acc, w) => {
    const len = w.measuredLength || Math.hypot(w.end.x - w.start.x, w.end.y - w.start.y);
    return acc + len / 1000;
  }, 0);

  const laserMeasuredCount = project.walls.filter((w) => w.isMeasuredWithLaser).length;
  const laserPercent = project.walls.length > 0 ? Math.round((laserMeasuredCount / project.walls.length) * 100) : 0;
  const totalFloorArea = project.rooms.reduce((acc, r) => acc + r.area, 0);

  const hasAnySelection =
    selectedWall ||
    selectedCurvedWall ||
    selectedOpening ||
    selectedStair ||
    selectedColumn ||
    selectedMep ||
    selectedLandscape ||
    selectedDetailCallout;

  return (
    <aside className="w-72 sm:w-80 border-l border-slate-800 bg-[#16191f] flex flex-col h-full text-slate-200 select-none z-20 shrink-0 overflow-y-auto">
      {/* 1. INSPECT SELECTED STRAIGHT WALL */}
      {selectedWall && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <h3 className="text-sm font-bold text-white">Thuộc Tính Tường Thẳng</h3>
            </div>
            <button
              onClick={() => onDeleteWall(selectedWall.id)}
              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
              title="Xóa bức tường này"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400">Tên tường / Trục định vị:</label>
            <input
              type="text"
              value={selectedWall.name || ''}
              onChange={(e) => onUpdateWall({ ...selectedWall, name: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
              placeholder="VD: Tường trục 1, Mặt tiền..."
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Chiều dài hiện tại:</span>
              <span className="text-base font-bold font-mono text-amber-400 tabular-nums">
                {Math.round(
                  selectedWall.measuredLength ||
                    Math.hypot(selectedWall.end.x - selectedWall.start.x, selectedWall.end.y - selectedWall.start.y)
                )}{' '}
                mm
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Đơn vị mét:</span>
              <span className="font-mono text-slate-300">
                {(
                  (selectedWall.measuredLength ||
                    Math.hypot(selectedWall.end.x - selectedWall.start.x, selectedWall.end.y - selectedWall.start.y)) /
                  1000
                ).toFixed(3)}{' '}
                m
              </span>
            </div>

            {selectedWall.isMeasuredWithLaser ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 p-2 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Đã xác thực bằng Thước Laser BLE</span>
              </div>
            ) : (
              <div className="text-xs text-amber-300/80 bg-amber-950/30 p-2 rounded-lg border border-amber-900/40">
                Chưa bắn laser (đang dùng số đo vẽ CAD)
              </div>
            )}

            <button
              onClick={onTriggerLaserForSelected}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>BẮN LASER CẬP NHẬT CHIỀU DÀI</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Bề dày tường:</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[110, 150, 220].map((t) => (
                <button
                  key={t}
                  onClick={() => onUpdateWall({ ...selectedWall, thickness: t })}
                  className={`py-1.5 text-xs font-mono rounded-lg border transition-colors cursor-pointer ${
                    selectedWall.thickness === t
                      ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {t} mm
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Trục dóng tường (Alignment):</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'center', label: 'Chính giữa' },
                { id: 'interior', label: 'Mép trong' },
                { id: 'exterior', label: 'Mép ngoài' },
              ].map((al) => (
                <button
                  key={al.id}
                  onClick={() => onUpdateWall({ ...selectedWall, alignment: al.id as any })}
                  className={`py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
                    (selectedWall.alignment || 'center') === al.id
                      ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {al.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Chiều cao tường (mm):</label>
            <input
              type="number"
              step="50"
              value={selectedWall.height || project.defaultCeilingHeight}
              onChange={(e) => onUpdateWall({ ...selectedWall, height: parseInt(e.target.value) || 2800 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          {connectedAngles.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Góc giao tường ({connectedAngles.length}):</span>
                <span className="text-[10px] text-amber-400 font-mono">Tự động tính từ số đo</span>
              </div>
              <div className="space-y-1.5">
                {connectedAngles.map((ang) => {
                  const otherWallId = ang.wall1Id === selectedWall.id ? ang.wall2Id : ang.wall1Id;
                  const otherWall = project.walls.find((w) => w.id === otherWallId);
                  const isRightAngle = Math.abs(ang.deviationFrom90Deg) <= 0.4;
                  return (
                    <div
                      key={ang.id}
                      className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="text-slate-300 font-medium">Giao với: {otherWall?.name || 'Tường kề'}</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {isRightAngle ? (
                            <span className="text-emerald-400">Vuông góc 90° chuẩn</span>
                          ) : (
                            <span className="text-amber-400">
                              Lệch {ang.deviationFrom90Deg > 0 ? '+' : ''}
                              {ang.deviationFrom90Deg.toFixed(1)}°
                            </span>
                          )}
                          {ang.isCalculatedFromLaser && <span className="ml-1 text-emerald-400">· Laser BLE</span>}
                        </div>
                      </div>
                      <div className="text-sm font-bold font-mono text-white tabular-nums">
                        {ang.angleDeg.toFixed(1)}°
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. INSPECT SELECTED CURVED WALL (ĐO TƯỜNG CONG) */}
      {!selectedWall && selectedCurvedWall && onUpdateCurvedWall && onDeleteCurvedWall && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Spline className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-white">Thuộc Tính Tường Cong (Arc)</h3>
            </div>
            <button
              onClick={() => onDeleteCurvedWall(selectedCurvedWall.id)}
              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
              title="Xóa tường cong"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400">Tên vách / Tường cong:</label>
            <input
              type="text"
              value={selectedCurvedWall.name || ''}
              onChange={(e) => onUpdateCurvedWall({ ...selectedCurvedWall, name: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              placeholder="VD: Vách cong quầy bar, Tường cong mặt tiền..."
            />
          </div>

          {/* Curved Wall Geometry Parameters */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Bán kính cong (R):</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="50"
                  min="200"
                  value={Math.round(selectedCurvedWall.radius)}
                  onChange={(e) => {
                    const newR = Math.max(300, parseInt(e.target.value) || 1000);
                    const C = selectedCurvedWall.chordLength;
                    if (newR >= C / 2) {
                      const newH = newR - Math.sqrt(Math.max(0, newR * newR - (C / 2) * (C / 2)));
                      const pStart = selectedCurvedWall.start;
                      const pEnd = selectedCurvedWall.end;
                      const mx = (pStart.x + pEnd.x) / 2;
                      const my = (pStart.y + pEnd.y) / 2;
                      const dx = pEnd.x - pStart.x;
                      const dy = pEnd.y - pStart.y;
                      const len = Math.hypot(dx, dy) || 1;
                      const nx = -dy / len;
                      const ny = dx / len;
                      const dot = (selectedCurvedWall.controlPoint.x - mx) * nx + (selectedCurvedWall.controlPoint.y - my) * ny;
                      const sign = dot >= 0 ? 1 : -1;
                      const cp = { x: mx + nx * sign * newH, y: my + ny * sign * newH };
                      const arc = 2 * newR * Math.asin(Math.min(1, C / (2 * newR)));
                      onUpdateCurvedWall({
                        ...selectedCurvedWall,
                        radius: newR,
                        sagitta: newH,
                        arcLength: arc,
                        controlPoint: cp,
                      });
                    }
                  }}
                  className="w-24 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs font-mono font-bold text-amber-400 text-right"
                />
                <span className="text-[10px] text-slate-500 font-mono">mm</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Độ võng cung (Sagitta - h):</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="10"
                  min="10"
                  value={Math.round(selectedCurvedWall.sagitta)}
                  onChange={(e) => {
                    const newH = Math.max(10, parseInt(e.target.value) || 100);
                    const C = selectedCurvedWall.chordLength;
                    // R = h/2 + C^2 / (8h)
                    const newR = newH / 2 + (C * C) / (8 * newH);
                    const pStart = selectedCurvedWall.start;
                    const pEnd = selectedCurvedWall.end;
                    const mx = (pStart.x + pEnd.x) / 2;
                    const my = (pStart.y + pEnd.y) / 2;
                    const dx = pEnd.x - pStart.x;
                    const dy = pEnd.y - pStart.y;
                    const len = Math.hypot(dx, dy) || 1;
                    const nx = -dy / len;
                    const ny = dx / len;
                    const dot = (selectedCurvedWall.controlPoint.x - mx) * nx + (selectedCurvedWall.controlPoint.y - my) * ny;
                    const sign = dot >= 0 ? 1 : -1;
                    const cp = { x: mx + nx * sign * newH, y: my + ny * sign * newH };
                    const arc = 2 * newR * Math.asin(Math.min(1, C / (2 * newR)));
                    onUpdateCurvedWall({
                      ...selectedCurvedWall,
                      sagitta: newH,
                      radius: newR,
                      arcLength: arc,
                      controlPoint: cp,
                    });
                  }}
                  className="w-24 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs font-mono text-slate-200 text-right"
                />
                <span className="text-[10px] text-slate-500 font-mono">mm</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Chiều dài dây cung (Chord - C):</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="50"
                  min="200"
                  value={Math.round(selectedCurvedWall.chordLength)}
                  onChange={(e) => {
                    const newC = Math.max(200, parseInt(e.target.value) || 1000);
                    const h = selectedCurvedWall.sagitta;
                    const newR = h / 2 + (newC * newC) / (8 * h);
                    const pStart = selectedCurvedWall.start;
                    const pEnd = selectedCurvedWall.end;
                    const dx = pEnd.x - pStart.x;
                    const dy = pEnd.y - pStart.y;
                    const currentLen = Math.hypot(dx, dy) || 1;
                    const scaleFactor = newC / currentLen;
                    const newEnd = { x: pStart.x + dx * scaleFactor, y: pStart.y + dy * scaleFactor };
                    const mx = (pStart.x + newEnd.x) / 2;
                    const my = (pStart.y + newEnd.y) / 2;
                    const nx = -(newEnd.y - pStart.y) / newC;
                    const ny = (newEnd.x - pStart.x) / newC;
                    const dot = (selectedCurvedWall.controlPoint.x - mx) * nx + (selectedCurvedWall.controlPoint.y - my) * ny;
                    const sign = dot >= 0 ? 1 : -1;
                    const cp = { x: mx + nx * sign * h, y: my + ny * sign * h };
                    const arc = 2 * newR * Math.asin(Math.min(1, newC / (2 * newR)));
                    onUpdateCurvedWall({
                      ...selectedCurvedWall,
                      end: newEnd,
                      chordLength: newC,
                      radius: newR,
                      arcLength: arc,
                      controlPoint: cp,
                    });
                  }}
                  className="w-24 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs font-mono text-slate-200 text-right"
                />
                <span className="text-[10px] text-slate-500 font-mono">mm</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Chiều dài cung tròn (Arc):</span>
              <span className="font-mono text-emerald-400 font-semibold">{Math.round(selectedCurvedWall.arcLength)} mm</span>
            </div>

            <button
              onClick={onTriggerLaserForSelected}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>BẮN LASER CẬP NHẬT TƯỜNG CONG</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Bề dày vách cong:</label>
            <div className="grid grid-cols-2 gap-1.5">
              {[110, 220].map((t) => (
                <button
                  key={t}
                  onClick={() => onUpdateCurvedWall({ ...selectedCurvedWall, thickness: t })}
                  className={`py-1.5 text-xs font-mono rounded-lg border transition-colors cursor-pointer ${
                    selectedCurvedWall.thickness === t
                      ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-900 border-slate-700 text-slate-300'
                  }`}
                >
                  {t} mm
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Chiều cao tường (mm):</label>
            <input
              type="number"
              step="50"
              value={selectedCurvedWall.height}
              onChange={(e) => onUpdateCurvedWall({ ...selectedCurvedWall, height: parseInt(e.target.value) || 2800 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
            />
          </div>
        </div>
      )}

      {/* 3. INSPECT SELECTED CAU THANG (CAD STAIRCASE BLOCK) */}
      {!selectedWall && !selectedCurvedWall && selectedStair && onUpdateStair && onDeleteStair && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-white">Block CAD Cầu Thang</h3>
            </div>
            <button
              onClick={() => onDeleteStair(selectedStair.id)}
              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
              title="Xóa cầu thang"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Stair Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Kiểu hình cầu thang:</label>
            <select
              value={selectedStair.type}
              onChange={(e) => onUpdateStair({ ...selectedStair, type: e.target.value as StaircaseType })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
            >
              <option value="straight">Thang thẳng 1 vế</option>
              <option value="l_shape">Thang chữ L (1 chiếu nghỉ)</option>
              <option value="u_shape">Thang chữ U (2 chiếu nghỉ / giếng thang)</option>
              <option value="curved">Thang cong uốn lượn</option>
              <option value="spiral">Thang xoắn tròn quanh trụ</option>
            </select>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400">Rộng vế thang:</label>
              <input
                type="number"
                step="50"
                value={selectedStair.runWidth}
                onChange={(e) => onUpdateStair({ ...selectedStair, runWidth: parseInt(e.target.value) || 900 })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Chiều dài tổng:</label>
              <input
                type="number"
                step="100"
                value={selectedStair.totalLength}
                onChange={(e) => onUpdateStair({ ...selectedStair, totalLength: parseInt(e.target.value) || 3200 })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-white"
              />
            </div>
          </div>

          {/* Step Count & Step Dimensions */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">Tổng số bậc thang:</span>
              <span className="text-sm font-bold font-mono text-amber-400">{selectedStair.stepCount} bậc</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] text-slate-400">Cao bậc (Riser):</label>
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    value={selectedStair.riserHeight}
                    onChange={(e) => onUpdateStair({ ...selectedStair, riserHeight: parseInt(e.target.value) || 175 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-white"
                  />
                  <span className="text-slate-500 text-[10px]">mm</span>
                </div>
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Rộng bậc (Tread):</label>
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    value={selectedStair.treadDepth}
                    onChange={(e) => onUpdateStair({ ...selectedStair, treadDepth: parseInt(e.target.value) || 260 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-white"
                  />
                  <span className="text-slate-500 text-[10px]">mm</span>
                </div>
              </div>
            </div>

            {/* Thêm - bớt bậc trước / sau chiếu nghỉ */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="text-[11px] text-slate-400 font-medium">Bố trí số bậc các vế thang:</div>
              <div className="flex items-center justify-between text-xs">
                <span>Vế trước chiếu nghỉ:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      onUpdateStair({
                        ...selectedStair,
                        stepsBeforeLanding: Math.max(1, selectedStair.stepsBeforeLanding - 1),
                        stepCount: Math.max(3, selectedStair.stepCount - 1),
                      })
                    }
                    className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-mono font-bold text-white w-5 text-center">
                    {selectedStair.stepsBeforeLanding}
                  </span>
                  <button
                    onClick={() =>
                      onUpdateStair({
                        ...selectedStair,
                        stepsBeforeLanding: selectedStair.stepsBeforeLanding + 1,
                        stepCount: selectedStair.stepCount + 1,
                      })
                    }
                    className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span>Vế sau chiếu nghỉ:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      onUpdateStair({
                        ...selectedStair,
                        stepsAfterLanding: Math.max(1, selectedStair.stepsAfterLanding - 1),
                        stepCount: Math.max(3, selectedStair.stepCount - 1),
                      })
                    }
                    className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-mono font-bold text-white w-5 text-center">
                    {selectedStair.stepsAfterLanding}
                  </span>
                  <button
                    onClick={() =>
                      onUpdateStair({
                        ...selectedStair,
                        stepsAfterLanding: selectedStair.stepsAfterLanding + 1,
                        stepCount: selectedStair.stepCount + 1,
                      })
                    }
                    className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Thang tròn / Thang cong: Bán kính trong & ngoài */}
          {(selectedStair.type === 'spiral' || selectedStair.type === 'curved') && (
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-amber-400">Tùy chỉnh bán kính thang cong / xoắn:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400">Bán kính trong (R_in):</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="50"
                      min="100"
                      value={selectedStair.innerRadius || 300}
                      onChange={(e) =>
                        onUpdateStair({
                          ...selectedStair,
                          innerRadius: Math.max(50, parseInt(e.target.value) || 300),
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-white"
                    />
                    <span className="text-slate-500 text-[10px]">mm</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Bán kính ngoài (R_out):</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="50"
                      min="500"
                      value={selectedStair.outerRadius || 1400}
                      onChange={(e) =>
                        onUpdateStair({
                          ...selectedStair,
                          outerRadius: Math.max(300, parseInt(e.target.value) || 1400),
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-white"
                    />
                    <span className="text-slate-500 text-[10px]">mm</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Thang chữ U: Tùy chỉnh vế thang giữa 2 chiếu nghỉ (thang 3 vế) */}
          {selectedStair.type === 'u_shape' && (
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Vế thang giữa 2 chiếu nghỉ (3 vế):</span>
                <span className="font-mono text-amber-400 font-bold">{selectedStair.stepsMiddleFlight || 0} bậc</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[0, 2, 3, 4, 5].map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => onUpdateStair({ ...selectedStair, stepsMiddleFlight: cnt })}
                    className={`flex-1 py-1 text-xs rounded border transition-colors ${
                      (selectedStair.stepsMiddleFlight || 0) === cnt
                        ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-950 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {cnt === 0 ? 'Không (2 vế)' : `${cnt} bậc`}
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-slate-500 italic">
                {(selectedStair.stepsMiddleFlight || 0) > 0
                  ? 'Thang 3 vế gồm: Vế 1 -> Chiếu nghỉ 1 -> Vế thang giữa -> Chiếu nghỉ 2 -> Vế 2'
                  : 'Thang U 2 vế tiêu chuẩn với 1 chiếu nghỉ lớn trên cùng'}
              </div>
            </div>
          )}

          {/* Xẻ bậc chiếu nghỉ (xẻ 2, xẻ 3) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-400">Xẻ bậc tại chiếu nghỉ:</label>
              {selectedStair.type === 'l_shape' && (
                <span className="text-[10px] text-amber-400">Tâm xẻ từ góc trong giao 2 vế</span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                onClick={() => onUpdateStair({ ...selectedStair, landingType: 'flat' })}
                className={`py-1.5 px-1 rounded-lg border transition-colors ${
                  selectedStair.landingType === 'flat'
                    ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Chiếu phẳng
              </button>
              <button
                onClick={() => onUpdateStair({ ...selectedStair, landingType: 'split_2' })}
                className={`py-1.5 px-1 rounded-lg border transition-colors ${
                  selectedStair.landingType === 'split_2'
                    ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Xẻ 2 chéo
              </button>
              <button
                onClick={() => onUpdateStair({ ...selectedStair, landingType: 'split_3' })}
                className={`py-1.5 px-1 rounded-lg border transition-colors ${
                  selectedStair.landingType === 'split_3'
                    ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Xẻ 3 quạt
              </button>
            </div>
          </div>

          {/* Rotate Stair */}
          <button
            onClick={() => onUpdateStair({ ...selectedStair, rotation: (selectedStair.rotation + 90) % 360 })}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Xoay hướng thang (+90°) · Hiện tại: {selectedStair.rotation}°</span>
          </button>
        </div>
      )}

      {/* 4. INSPECT SELECTED STRUCTURAL COLUMN (CỘT THÉP & BTCT) */}
      {!selectedWall && !selectedCurvedWall && !selectedStair && selectedColumn && onUpdateColumn && onDeleteColumn && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ColumnIcon className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Kí Hiệu Cột Thép &amp; BTCT</h3>
            </div>
            <button
              onClick={() => onDeleteColumn(selectedColumn.id)}
              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
              title="Xóa cột"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Quy cách kết cấu cột:</label>
            <select
              value={selectedColumn.type}
              onChange={(e) => onUpdateColumn({ ...selectedColumn, type: e.target.value as StructuralColumnType })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
            >
              <option value="steel_i">Cột Thép Hình Chữ I / H</option>
              <option value="steel_u">Cột Thép Hình Chữ U</option>
              <option value="steel_box">Cột Thép Hộp Vuông (SHS)</option>
              <option value="steel_rect">Cột Thép Hộp Chữ Nhật (RHS)</option>
              <option value="concrete_rect">Cột Bê Tông Cốt Thép Vuông / CN</option>
              <option value="concrete_circle">Cột Bê Tông Cốt Thép Tròn</option>
              <option value="box_chase">Hộp Gen Kỹ Thuật (Shaft Chase)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400">Chiều rộng b (mm):</label>
              <input
                type="number"
                step="10"
                value={selectedColumn.width}
                onChange={(e) => onUpdateColumn({ ...selectedColumn, width: parseInt(e.target.value) || 200 })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Chiều cao / sâu h (mm):</label>
              <input
                type="number"
                step="10"
                value={selectedColumn.depth}
                onChange={(e) => onUpdateColumn({ ...selectedColumn, depth: parseInt(e.target.value) || 200 })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-white"
              />
            </div>
          </div>

          {(selectedColumn.type === 'steel_i' || selectedColumn.type === 'steel_u') && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400">Dày cánh tf (mm):</label>
                <input
                  type="number"
                  step="1"
                  value={selectedColumn.flangeThickness || 10}
                  onChange={(e) => onUpdateColumn({ ...selectedColumn, flangeThickness: parseInt(e.target.value) || 10 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">Dày bụng tw (mm):</label>
                <input
                  type="number"
                  step="1"
                  value={selectedColumn.webThickness || 6}
                  onChange={(e) => onUpdateColumn({ ...selectedColumn, webThickness: parseInt(e.target.value) || 6 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-white"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-slate-400">Mã hiệu quy cách cột:</label>
            <input
              type="text"
              value={selectedColumn.profileName || ''}
              onChange={(e) => onUpdateColumn({ ...selectedColumn, profileName: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              placeholder="VD: I200x100x5.5x8, Thép hộp 150x150..."
            />
          </div>

          <button
            onClick={() => onUpdateColumn({ ...selectedColumn, rotation: (selectedColumn.rotation + 90) % 360 })}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Xoay cột 90° (Hiện tại: {selectedColumn.rotation}°)</span>
          </button>
        </div>
      )}

      {/* 5. INSPECT SELECTED MEP ELEMENT (KÍ HIỆU CƠ ĐIỆN) */}
      {!selectedWall &&
        !selectedCurvedWall &&
        !selectedStair &&
        !selectedColumn &&
        selectedMep &&
        onUpdateMep &&
        onDeleteMep && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Kí Hiệu Cơ Điện MEP</h3>
              </div>
              <button
                onClick={() => onDeleteMep(selectedMep.id)}
                className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                title="Xóa thiết bị"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Loại thiết bị cơ điện:</label>
              <select
                value={selectedMep.category}
                onChange={(e) => {
                  const cat = e.target.value as MepCategory;
                  const item = MEP_CATALOG.find((m) => m.category === cat);
                  onUpdateMep({
                    ...selectedMep,
                    category: cat,
                    label: selectedMep.label || item?.tag || '',
                  });
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                {MEP_CATALOG.map((item) => (
                  <option key={item.category} value={item.category}>
                    {item.name} [{item.tag}]
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Cao độ lắp đặt (Elevation - mm):</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="50"
                  value={selectedMep.elevationMm}
                  onChange={(e) => onUpdateMep({ ...selectedMep, elevationMm: parseInt(e.target.value) || 300 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                />
                <span className="text-xs text-slate-500 font-mono">mm</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Nhãn thiết bị / Ghi chú kỹ thuật:</label>
              <input
                type="text"
                value={selectedMep.label || ''}
                onChange={(e) => onUpdateMep({ ...selectedMep, label: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                placeholder="VD: Ổ cắm đảo bếp, D110 chờ, Tủ DB tầng 1..."
              />
            </div>

            <button
              onClick={() => onUpdateMep({ ...selectedMep, rotation: (selectedMep.rotation + 90) % 360 })}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Xoay góc ký hiệu MEP (+90°)</span>
            </button>
          </div>
        )}

      {/* 6. INSPECT SELECTED OPENING (CỬA ĐI, CỬA SỔ, VÁCH KÍNH) */}
      {!selectedWall &&
        !selectedCurvedWall &&
        !selectedStair &&
        !selectedColumn &&
        !selectedMep &&
        selectedOpening && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <DoorOpen className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Thuộc Tính Cửa &amp; Vách Kính</h3>
              </div>
              <button
                onClick={() => onDeleteOpening(selectedOpening.id)}
                className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Tên cửa / Vách:</label>
              <input
                type="text"
                value={selectedOpening.name || ''}
                onChange={(e) => onUpdateOpening({ ...selectedOpening, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Kiểu cửa kiến trúc:</label>
              <select
                value={selectedOpening.type}
                onChange={(e) => onUpdateOpening({ ...selectedOpening, type: e.target.value as OpeningType })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="door_single">Cửa đi 1 cánh mở quay</option>
                <option value="door_double">Cửa đi 2 cánh</option>
                <option value="door_4leaf">Cửa đi 4 cánh xếp trượt</option>
                <option value="door_sliding">Cửa lùa / trượt</option>
                <option value="window_standard">Cửa sổ 2 cánh tiêu chuẩn</option>
                <option value="window_1leaf">Cửa sổ 1 cánh mở hất</option>
                <option value="window_3leaf">Cửa sổ 3 cánh</option>
                <option value="window_4leaf">Cửa sổ 4 cánh</option>
                <option value="window_sliding">Cửa sổ lùa 2 cánh</option>
                <option value="glass_partition">Vách kính cố định</option>
              </select>
            </div>

            {/* Số lượng cánh tùy chỉnh */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Số lượng cánh cửa:</label>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => onUpdateOpening({ ...selectedOpening, leafCount: n })}
                    className={`py-1.5 font-mono rounded-lg border transition-colors ${
                      (selectedOpening.leafCount || 1) === n
                        ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-900 border-slate-700 text-slate-300'
                    }`}
                  >
                    {n} cánh
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400">Chiều rộng (mm):</label>
                <input
                  type="number"
                  step="50"
                  value={selectedOpening.width}
                  onChange={(e) => onUpdateOpening({ ...selectedOpening, width: parseInt(e.target.value) || 900 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">Chiều cao (mm):</label>
                <input
                  type="number"
                  step="50"
                  value={selectedOpening.height}
                  onChange={(e) => onUpdateOpening({ ...selectedOpening, height: parseInt(e.target.value) || 2200 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-white"
                />
              </div>
            </div>

            {selectedOpening.type.startsWith('window') && (
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Cao độ bậu cửa (Sill height - mm):</label>
                <input
                  type="number"
                  step="50"
                  value={selectedOpening.sillHeight}
                  onChange={(e) => onUpdateOpening({ ...selectedOpening, sillHeight: parseInt(e.target.value) || 900 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Bề dày khung bao (Frame thickness - mm):</label>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {[45, 50, 60, 80].map((th) => (
                  <button
                    key={th}
                    onClick={() => onUpdateOpening({ ...selectedOpening, frameThickness: th })}
                    className={`py-1 font-mono rounded-lg border transition-colors ${
                      (selectedOpening.frameThickness || 50) === th
                        ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-900 border-slate-700 text-slate-300'
                    }`}
                  >
                    {th}mm
                  </button>
                ))}
              </div>
              <input
                type="number"
                step="5"
                min="20"
                max="200"
                value={selectedOpening.frameThickness || 50}
                onChange={(e) => onUpdateOpening({ ...selectedOpening, frameThickness: parseInt(e.target.value) || 50 })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-white mt-1"
                placeholder="Nhập bề dày khung (mm)..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Khoảng cách từ góc tường (mm):</label>
              <input
                type="number"
                step="50"
                value={selectedOpening.distanceFromStart}
                onChange={(e) => onUpdateOpening({ ...selectedOpening, distanceFromStart: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
              />
            </div>

            {selectedOpening.type.startsWith('door') && (
              <button
                onClick={() => onUpdateOpening({ ...selectedOpening, swingInside: !selectedOpening.swingInside })}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Đổi hướng mở ({selectedOpening.swingInside ? 'Mở vào trong' : 'Mở ra ngoài'})</span>
              </button>
            )}
          </div>
        )}

      {/* 7. INSPECT SELECTED LANDSCAPE (CÂY XANH) */}
      {!selectedWall &&
        !selectedCurvedWall &&
        !selectedStair &&
        !selectedColumn &&
        !selectedMep &&
        !selectedOpening &&
        selectedLandscape &&
        onUpdateLandscape &&
        onDeleteLandscape && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Kí Hiệu Cây Xanh</h3>
              </div>
              <button
                onClick={() => onDeleteLandscape(selectedLandscape.id)}
                className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Loại cây:</label>
              <select
                value={selectedLandscape.type}
                onChange={(e) => onUpdateLandscape({ ...selectedLandscape, type: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="shrub">Cây bụi nhỏ / Bồn hoa ban công</option>
                <option value="tree_large">Cây lớn tán rộng sân vườn</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Bán kính tán lá (mm):</label>
              <input
                type="number"
                step="50"
                value={selectedLandscape.radius}
                onChange={(e) => onUpdateLandscape({ ...selectedLandscape, radius: parseInt(e.target.value) || 500 })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Tên bồn cây / Chủng loại:</label>
              <input
                type="text"
                value={selectedLandscape.name || ''}
                onChange={(e) => onUpdateLandscape({ ...selectedLandscape, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>
        )}

      {/* 8. INSPECT SELECTED DETAIL CALLOUT (TRÍCH CHI TIẾT) */}
      {!selectedWall &&
        !selectedCurvedWall &&
        !selectedStair &&
        !selectedColumn &&
        !selectedMep &&
        !selectedOpening &&
        !selectedLandscape &&
        selectedDetailCallout &&
        onUpdateDetailCallout &&
        onDeleteDetailCallout && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-white">Kí Hiệu Trích Chi Tiết</h3>
              </div>
              <button
                onClick={() => onDeleteDetailCallout(selectedDetailCallout.id)}
                className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Tên trích chi tiết:</label>
              <input
                type="text"
                value={selectedDetailCallout.label}
                onChange={(e) => onUpdateDetailCallout({ ...selectedDetailCallout, label: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Tỷ lệ phóng to:</label>
              <select
                value={selectedDetailCallout.scale}
                onChange={(e) => onUpdateDetailCallout({ ...selectedDetailCallout, scale: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="TỶ LỆ 1/5">TỶ LỆ 1/5</option>
                <option value="TỶ LỆ 1/10">TỶ LỆ 1/10</option>
                <option value="TỶ LỆ 1/20">TỶ LỆ 1/20</option>
                <option value="TỶ LỆ 1/25">TỶ LỆ 1/25</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Mô tả cấu tạo chi tiết:</label>
              <textarea
                rows={3}
                value={selectedDetailCallout.description}
                onChange={(e) => onUpdateDetailCallout({ ...selectedDetailCallout, description: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>
        )}

      {/* 9. NO ELEMENT SELECTED: GENERAL SUMMARY & UNDERLAY CONTROLS */}
      {!hasAnySelection && (
        <div className="p-4 space-y-5">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-500" />
              <span>Tổng Quan Hiện Trạng</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click vào đối tượng trên bản vẽ để chỉnh sửa thông số hoặc đo Laser
            </p>
          </div>

          {/* TÍNH NĂNG ĐÈ MỜ MẶT BẰNG (UNDERLAY ONION-SKINNING) */}
          {onToggleUnderlay && onUpdateUnderlayOpacity && (
            <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-sky-200">Đè Mờ Mặt Bằng (Underlay)</span>
                </div>
                <button
                  onClick={() => onToggleUnderlay(!project.underlayActive)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    project.underlayActive
                      ? 'bg-sky-500 text-slate-950 shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {project.underlayActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{project.underlayActive ? 'Đang Bật' : 'Đang Tắt'}</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tận dụng mặt bằng Tầng 1 làm mờ để đo vẽ chính xác Tầng 2, Tầng Lửng hoặc gối trục cột vách.
              </p>

              {project.underlayActive && (
                <div className="space-y-1.5 pt-1 border-t border-sky-900/40">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Độ mờ lớp lót:</span>
                    <span className="font-mono text-sky-400 font-bold">
                      {Math.round((project.underlayOpacity || 0.35) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.05"
                    value={project.underlayOpacity || 0.35}
                    onChange={(e) => onUpdateUnderlayOpacity(parseFloat(e.target.value))}
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                </div>
              )}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-slate-400">Tổng dài tường</div>
              <div className="text-base font-bold font-mono text-white tabular-nums">
                {totalWallLengthM.toFixed(1)} m
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-slate-400">Diện tích sàn</div>
              <div className="text-base font-bold font-mono text-amber-400 tabular-nums">
                {totalFloorArea > 0 ? `${totalFloorArea.toFixed(1)} m²` : 'Đang tính'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-slate-400">Số lượng tường</div>
              <div className="text-base font-bold font-mono text-white tabular-nums">
                {project.walls.length + (project.curvedWalls?.length || 0)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-slate-400">Đã bắn Laser</div>
              <div className="text-base font-bold font-mono text-emerald-400 tabular-nums">
                {laserPercent}% ({laserMeasuredCount})
              </div>
            </div>
          </div>

          {/* Default Survey Settings */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-slate-300">Quy cách kiến trúc mặc định:</div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-400">Độ dày tường mặc định:</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[110, 220].map((th) => (
                  <button
                    key={th}
                    onClick={() => onUpdateProjectDefaults({ defaultWallThickness: th })}
                    className={`py-1.5 text-xs font-mono rounded-lg border transition-colors cursor-pointer ${
                      project.defaultWallThickness === th
                        ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Tường {th} mm
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-400">Cao độ trần hiện trạng (mm):</label>
              <input
                type="number"
                step="50"
                value={project.defaultCeilingHeight}
                onChange={(e) => onUpdateProjectDefaults({ defaultCeilingHeight: parseInt(e.target.value) || 2800 })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
              />
            </div>
          </div>

          {/* Room Area Schedule list */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300">Danh sách phòng ({project.rooms.length}):</div>
            {project.rooms.map((r) => (
              <div
                key={r.id}
                className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
              >
                <span className="font-medium text-slate-200">{r.name}</span>
                <span className="font-mono text-amber-400 font-semibold">{r.area.toFixed(1)} m²</span>
              </div>
            ))}
          </div>

          {/* Measured Corner Angles list */}
          {project.angles && project.angles.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Góc tường đã đo ({project.angles.length}):</span>
                <span className="text-[10px] text-amber-400 font-mono">Đo góc (A)</span>
              </div>
              <div className="space-y-1.5">
                {project.angles.map((ang) => {
                  const w1 = project.walls.find((w) => w.id === ang.wall1Id);
                  const w2 = project.walls.find((w) => w.id === ang.wall2Id);
                  const isRightAngle = Math.abs(ang.deviationFrom90Deg) <= 0.4;
                  return (
                    <div
                      key={ang.id}
                      className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="text-slate-200 font-medium">
                          {w1?.name || 'Tường 1'} &times; {w2?.name || 'Tường 2'}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {isRightAngle ? (
                            <span className="text-emerald-400">Vuông 90° chuẩn</span>
                          ) : (
                            <span className="text-amber-400">
                              Lệch {ang.deviationFrom90Deg > 0 ? '+' : ''}
                              {ang.deviationFrom90Deg.toFixed(1)}°
                            </span>
                          )}
                          {ang.isCalculatedFromLaser && <span className="ml-1 text-emerald-400">· Laser</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold font-mono text-white tabular-nums">
                          {ang.angleDeg.toFixed(1)}°
                        </span>
                        {onDeleteAngle && (
                          <button
                            onClick={() => onDeleteAngle(ang.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            title="Xóa góc này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
