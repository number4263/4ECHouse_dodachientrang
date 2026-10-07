import React, { useState } from 'react';
import {
  ProjectData,
  Wall,
  CurvedWall,
  Opening,
  Column,
  Staircase,
  MepElement,
  LandscapeElement,
  DetailCallout,
  OpeningType,
  StructuralColumnType,
  StaircaseType,
  LandingSplitType,
  MepCategory,
  MEP_CATALOG,
} from '../types/cad';
import { OperatingSystem } from '../types/device';
import {
  ChevronUp,
  ChevronDown,
  X,
  Trash2,
  Zap,
  Layers,
  Ruler,
  Maximize2,
  TrendingUp,
  Columns,
  DoorOpen,
  Square,
  Leaf,
  Search,
} from 'lucide-react';

interface MobilePropertySheetProps {
  project: ProjectData;
  selectedWallId: string | null;
  selectedCurvedWallId: string | null;
  selectedOpeningId: string | null;
  selectedStairId: string | null;
  selectedColumnId: string | null;
  selectedMepId: string | null;
  selectedLandscapeId: string | null;
  selectedDetailCalloutId: string | null;
  onUpdateWall: (wall: Wall) => void;
  onDeleteWall: (id: string) => void;
  onUpdateCurvedWall?: (cw: CurvedWall) => void;
  onDeleteCurvedWall?: (id: string) => void;
  onUpdateOpening: (opening: Opening) => void;
  onDeleteOpening: (id: string) => void;
  onUpdateColumn?: (column: Column) => void;
  onDeleteColumn?: (id: string) => void;
  onUpdateStaircase?: (stair: Staircase) => void;
  onDeleteStaircase?: (id: string) => void;
  onUpdateMepElement?: (mep: MepElement) => void;
  onDeleteMepElement?: (id: string) => void;
  onUpdateLandscape?: (ls: LandscapeElement) => void;
  onDeleteLandscape?: (id: string) => void;
  onUpdateDetailCallout?: (dt: DetailCallout) => void;
  onDeleteDetailCallout?: (id: string) => void;
  onTriggerLaser: () => void;
  onDeselectAll: () => void;
  osType: OperatingSystem;
}

export const MobilePropertySheet: React.FC<MobilePropertySheetProps> = ({
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
  onUpdateColumn,
  onDeleteColumn,
  onUpdateStaircase,
  onDeleteStaircase,
  onUpdateMepElement,
  onDeleteMepElement,
  onUpdateLandscape,
  onDeleteLandscape,
  onUpdateDetailCallout,
  onDeleteDetailCallout,
  onTriggerLaser,
  onDeselectAll,
  osType,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const selectedWall = selectedWallId ? project.walls.find((w) => w.id === selectedWallId) : null;
  const selectedCurvedWall = selectedCurvedWallId && project.curvedWalls ? project.curvedWalls.find((w) => w.id === selectedCurvedWallId) : null;
  const selectedOpening = selectedOpeningId ? project.openings.find((op) => op.id === selectedOpeningId) : null;
  const selectedStair = selectedStairId && project.staircases ? project.staircases.find((s) => s.id === selectedStairId) : null;
  const selectedColumn = selectedColumnId && project.columns ? project.columns.find((c) => c.id === selectedColumnId) : null;
  const selectedMep = selectedMepId && project.mepElements ? project.mepElements.find((m) => m.id === selectedMepId) : null;
  const selectedLandscape = selectedLandscapeId && project.landscapeElements ? project.landscapeElements.find((l) => l.id === selectedLandscapeId) : null;
  const selectedDetailCallout = selectedDetailCalloutId && project.detailCallouts ? project.detailCallouts.find((d) => d.id === selectedDetailCalloutId) : null;

  const hasSelection = Boolean(
    selectedWall ||
    selectedCurvedWall ||
    selectedOpening ||
    selectedStair ||
    selectedColumn ||
    selectedMep ||
    selectedLandscape ||
    selectedDetailCallout
  );

  if (!hasSelection) return null;

  // Title and subtitle extraction
  let title = 'Thuộc tính';
  let subtitle = '';
  let Icon = Ruler;
  let canMeasureLaser = false;

  if (selectedWall) {
    title = selectedWall.name || 'Tường thẳng';
    const len = selectedWall.measuredLength || Math.round(Math.hypot(selectedWall.end.x - selectedWall.start.x, selectedWall.end.y - selectedWall.start.y));
    subtitle = `Dài: ${len} mm · Dày: ${selectedWall.thickness} mm`;
    Icon = Ruler;
    canMeasureLaser = true;
  } else if (selectedCurvedWall) {
    title = selectedCurvedWall.name || 'Tường cong (Arc)';
    subtitle = `Bán kính R: ${selectedCurvedWall.radius} mm · Cung: ${selectedCurvedWall.arcLength} mm`;
    Icon = Ruler;
    canMeasureLaser = true;
  } else if (selectedOpening) {
    title = selectedOpening.name || (selectedOpening.type.startsWith('door') ? 'Cửa đi' : 'Cửa sổ');
    subtitle = `Rộng: ${selectedOpening.width} mm · Cao: ${selectedOpening.height} mm · ${selectedOpening.leafCount || 1} cánh`;
    Icon = selectedOpening.type.startsWith('door') ? DoorOpen : Square;
  } else if (selectedStair) {
    title = selectedStair.name || 'Cầu thang';
    subtitle = `${selectedStair.stepCount} bậc · Cao bậc: ${selectedStair.riserHeight} mm · Rộng vế: ${selectedStair.runWidth} mm`;
    Icon = TrendingUp;
  } else if (selectedColumn) {
    title = selectedColumn.profileName || `Cột ${selectedColumn.width}x${selectedColumn.depth}`;
    subtitle = `Cột: ${selectedColumn.width}x${selectedColumn.depth} mm`;
    Icon = Columns;
  } else if (selectedMep) {
    title = selectedMep.label || 'Thiết bị MEP';
    subtitle = `Cao độ lắp đặt: +${selectedMep.elevationMm} mm`;
    Icon = Zap;
  } else if (selectedLandscape) {
    title = selectedLandscape.name || 'Cây xanh / Cảnh quan';
    subtitle = `Bán kính tán lá: R${selectedLandscape.radius} mm`;
    Icon = Leaf;
  } else if (selectedDetailCallout) {
    title = selectedDetailCallout.label || 'Trích chi tiết';
    subtitle = selectedDetailCallout.scale;
    Icon = Search;
  }

  return (
    <div
      className={`fixed bottom-16 left-2 right-2 z-40 max-w-md mx-auto rounded-2xl shadow-2xl transition-all duration-200 overflow-hidden ${
        osType === 'ios'
          ? 'bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 text-white'
          : 'bg-[#181b22] border border-slate-700 text-slate-100'
      }`}
    >
      {/* Peek Summary Bar */}
      <div className="flex items-center justify-between p-3">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
        >
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold truncate text-white">{title}</h4>
              <span className="text-[10px] text-amber-400 font-mono">
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5 inline" /> : <ChevronUp className="w-3.5 h-3.5 inline" />}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {canMeasureLaser && (
            <button
              onClick={onTriggerLaser}
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer transition-transform active:scale-95"
              title="Đo Laser cho đối tượng này"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Bắn Laser</span>
            </button>
          )}

          <button
            onClick={onDeselectAll}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Đóng chọn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Details Body */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-800 space-y-3 max-h-[50vh] overflow-y-auto text-xs">
          {/* 1. Straight Wall */}
          {selectedWall && (
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">Chiều dài (mm)</label>
                  <input
                    type="number"
                    value={selectedWall.measuredLength || 3000}
                    onChange={(e) =>
                      onUpdateWall({ ...selectedWall, measuredLength: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Độ dày tường (mm)</label>
                  <select
                    value={selectedWall.thickness}
                    onChange={(e) =>
                      onUpdateWall({ ...selectedWall, thickness: parseInt(e.target.value) || 220 })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  >
                    <option value={110}>110 mm (Tường 10)</option>
                    <option value={220}>220 mm (Tường 20)</option>
                    <option value={330}>330 mm (Tường 30)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400">Trục dóng tường</label>
                <div className="grid grid-cols-3 gap-1 mt-1">
                  {[
                    { id: 'center', label: 'Chính giữa' },
                    { id: 'interior', label: 'Mép trong' },
                    { id: 'exterior', label: 'Mép ngoài' },
                  ].map((al) => (
                    <button
                      key={al.id}
                      onClick={() => onUpdateWall({ ...selectedWall, alignment: al.id as any })}
                      className={`py-1 text-[11px] rounded border transition-colors ${
                        (selectedWall.alignment || 'center') === al.id
                          ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                          : 'bg-slate-950 border-slate-700 text-slate-300'
                      }`}
                    >
                      {al.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => onDeleteWall(selectedWall.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa Tường</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. Curved Wall */}
          {selectedCurvedWall && onUpdateCurvedWall && onDeleteCurvedWall && (
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">Bán kính R (mm)</label>
                  <input
                    type="number"
                    value={selectedCurvedWall.radius}
                    onChange={(e) =>
                      onUpdateCurvedWall({ ...selectedCurvedWall, radius: parseInt(e.target.value) || 1000 })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Độ võng tên cung (mm)</label>
                  <input
                    type="number"
                    value={selectedCurvedWall.sagitta}
                    onChange={(e) =>
                      onUpdateCurvedWall({ ...selectedCurvedWall, sagitta: parseInt(e.target.value) || 200 })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => onDeleteCurvedWall(selectedCurvedWall.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa Tường Cong</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. Opening (Cửa) */}
          {selectedOpening && (
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">Chiều rộng lọt lòng (mm)</label>
                  <input
                    type="number"
                    value={selectedOpening.width}
                    onChange={(e) =>
                      onUpdateOpening({ ...selectedOpening, width: parseInt(e.target.value) || 900 })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Số cánh cửa</label>
                  <select
                    value={selectedOpening.leafCount || 1}
                    onChange={(e) =>
                      onUpdateOpening({ ...selectedOpening, leafCount: parseInt(e.target.value) || 1 })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  >
                    <option value={1}>1 cánh</option>
                    <option value={2}>2 cánh</option>
                    <option value={3}>3 cánh</option>
                    <option value={4}>4 cánh</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => onDeleteOpening(selectedOpening.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa Cửa</span>
                </button>
              </div>
            </div>
          )}

          {/* 4. Staircase (Cầu thang) */}
          {selectedStair && onUpdateStaircase && onDeleteStaircase && (
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">Loại cầu thang</label>
                  <select
                    value={selectedStair.type}
                    onChange={(e) =>
                      onUpdateStaircase({ ...selectedStair, type: e.target.value as StaircaseType })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white"
                  >
                    <option value="straight">Thang thẳng</option>
                    <option value="l_shape">Thang chữ L (1 chiếu nghỉ)</option>
                    <option value="u_shape">Thang chữ U (2 chiếu nghỉ)</option>
                    <option value="curved">Thang cong uốn lượn</option>
                    <option value="spiral">Thang xoắn tròn</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Xẻ bậc chiếu nghỉ</label>
                  <select
                    value={selectedStair.landingType}
                    onChange={(e) =>
                      onUpdateStaircase({ ...selectedStair, landingType: e.target.value as LandingSplitType })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white"
                  >
                    <option value="flat">Chiếu nghỉ phẳng</option>
                    <option value="split_2">Xẻ 2 bậc chéo</option>
                    <option value="split_3">Xẻ 3 bậc quạt</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">Tổng số bậc</label>
                  <input
                    type="number"
                    value={selectedStair.stepCount}
                    onChange={(e) =>
                      onUpdateStaircase({ ...selectedStair, stepCount: parseInt(e.target.value) || 19 })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Rộng vế (mm)</label>
                  <input
                    type="number"
                    value={selectedStair.runWidth}
                    onChange={(e) =>
                      onUpdateStaircase({ ...selectedStair, runWidth: parseInt(e.target.value) || 950 })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Chiều cao bậc</label>
                  <input
                    type="number"
                    value={selectedStair.riserHeight}
                    onChange={(e) =>
                      onUpdateStaircase({ ...selectedStair, riserHeight: parseInt(e.target.value) || 175 })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => onDeleteStaircase(selectedStair.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa Cầu Thang</span>
                </button>
              </div>
            </div>
          )}

          {/* 5. MEP Element */}
          {selectedMep && onUpdateMepElement && onDeleteMepElement && (
            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] text-slate-400">Loại thiết bị cơ điện:</label>
                <select
                  value={selectedMep.category}
                  onChange={(e) => {
                    const cat = e.target.value as any;
                    const item = MEP_CATALOG.find((m) => m.category === cat);
                    onUpdateMepElement({
                      ...selectedMep,
                      category: cat,
                      label: selectedMep.label || item?.tag || '',
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-xs mt-1"
                >
                  {MEP_CATALOG.map((item) => (
                    <option key={item.category} value={item.category}>
                      {item.name} [{item.tag}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">Cao độ lắp đặt (mm)</label>
                  <input
                    type="number"
                    value={selectedMep.elevationMm}
                    onChange={(e) =>
                      onUpdateMepElement({ ...selectedMep, elevationMm: parseInt(e.target.value) || 300 })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Tên nhãn thiết bị</label>
                  <input
                    type="text"
                    value={selectedMep.label}
                    onChange={(e) =>
                      onUpdateMepElement({ ...selectedMep, label: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => onDeleteMepElement(selectedMep.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa Thiết Bị MEP</span>
                </button>
              </div>
            </div>
          )}

          {/* 6. Column */}
          {selectedColumn && onUpdateColumn && onDeleteColumn && (
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">Rộng x Sâu (mm)</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={selectedColumn.width}
                      onChange={(e) =>
                        onUpdateColumn({ ...selectedColumn, width: parseInt(e.target.value) || 200 })
                      }
                      className="w-1/2 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                    />
                    <input
                      type="number"
                      value={selectedColumn.depth}
                      onChange={(e) =>
                        onUpdateColumn({ ...selectedColumn, depth: parseInt(e.target.value) || 200 })
                      }
                      className="w-1/2 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Loại cấu hình cột</label>
                  <select
                    value={selectedColumn.type}
                    onChange={(e) =>
                      onUpdateColumn({ ...selectedColumn, type: e.target.value as StructuralColumnType })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white"
                  >
                    <option value="steel_i">Cột Thép hình I</option>
                    <option value="steel_u">Cột Thép hình U</option>
                    <option value="steel_box">Cột Hộp vuông</option>
                    <option value="steel_rect">Cột Hộp chữ nhật</option>
                    <option value="concrete_square">Cột BTCT vuông</option>
                    <option value="concrete_round">Cột BTCT tròn</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => onDeleteColumn(selectedColumn.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa Cột</span>
                </button>
              </div>
            </div>
          )}

          {/* 7. Landscape */}
          {selectedLandscape && onUpdateLandscape && onDeleteLandscape && (
            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] text-slate-400">Bán kính tán lá (mm)</label>
                <input
                  type="number"
                  value={selectedLandscape.radius}
                  onChange={(e) =>
                    onUpdateLandscape({ ...selectedLandscape, radius: parseInt(e.target.value) || 500 })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => onDeleteLandscape(selectedLandscape.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa Cây Xanh</span>
                </button>
              </div>
            </div>
          )}

          {/* 8. Detail Callout */}
          {selectedDetailCallout && onUpdateDetailCallout && onDeleteDetailCallout && (
            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] text-slate-400">Tiêu đề trích chi tiết</label>
                <input
                  type="text"
                  value={selectedDetailCallout.label}
                  onChange={(e) =>
                    onUpdateDetailCallout({ ...selectedDetailCallout, label: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => onDeleteDetailCallout(selectedDetailCallout.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa Trích Chi Tiết</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
