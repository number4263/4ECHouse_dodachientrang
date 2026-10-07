import React from 'react';
import { OperatingSystem } from '../types/device';
import { CadToolType } from './SidebarTools';
import {
  MousePointer2,
  PenTool,
  Spline,
  DoorOpen,
  Square,
  Columns,
  TrendingUp,
  Zap,
  Leaf,
  Pencil,
  Search,
  DraftingCompass,
  Compass,
  PlusSquare,
  Undo2,
  Redo2,
  X,
  Check,
  Eraser,
  Fence,
  Home,
} from 'lucide-react';

interface MobileToolsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  activeTool: CadToolType;
  setActiveTool: (tool: CadToolType) => void;
  onAddQuickRoom: (shape: 'rect' | 'l_shape') => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  osType: OperatingSystem;
}

export const MobileToolsSheet: React.FC<MobileToolsSheetProps> = ({
  isOpen,
  onClose,
  activeTool,
  setActiveTool,
  onAddQuickRoom,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  osType,
}) => {
  if (!isOpen) return null;

  const toolCategories = [
    {
      title: 'Khảo sát Tường & Không Gian',
      tools: [
        { id: 'select' as CadToolType, label: 'Chọn & Đo Laser', icon: MousePointer2, badge: 'Phổ biến' },
        { id: 'eraser' as CadToolType, label: 'Công Cụ XÓA', icon: Eraser, badge: 'Xóa nhanh' },
        { id: 'wall' as CadToolType, label: 'Tường Thẳng', icon: PenTool, badge: 'Chính' },
        { id: 'curved_wall' as CadToolType, label: 'Tường Cong (Arc)', icon: Spline, badge: 'Mới' },
      ],
    },
    {
      title: 'Cửa, Mái & Cấu Kiện',
      tools: [
        { id: 'door' as CadToolType, label: 'Cửa Đi (1-4 cánh)', icon: DoorOpen },
        { id: 'window' as CadToolType, label: 'Cửa Sổ / Vách Kính', icon: Square },
        { id: 'railing' as CadToolType, label: 'Lan Can Ban Công', icon: Fence, badge: 'Mới' },
        { id: 'roof' as CadToolType, label: 'Mái & Giàn Thép', icon: Home, badge: 'Mới' },
        { id: 'column' as CadToolType, label: 'Cột Thép (I, U, Hộp) & BTCT', icon: Columns },
        { id: 'stair' as CadToolType, label: 'Cầu Thang CAD (5 loại)', icon: TrendingUp, badge: 'Xẻ bậc' },
      ],
    },
    {
      title: 'Cơ Điện MEP & Cây Xanh',
      tools: [
        { id: 'mep' as CadToolType, label: 'Kí Hiệu MEP (11 loại)', icon: Zap, badge: 'Cơ điện' },
        { id: 'landscape' as CadToolType, label: 'Cây Bụi & Cây Lớn', icon: Leaf },
      ],
    },
    {
      title: 'Ghi Chú, Đo Đạc & Trích Chi Tiết',
      tools: [
        { id: 'pen_draw' as CadToolType, label: 'Bút Vẽ Tay Note', icon: Pencil, badge: 'Stylus' },
        { id: 'detail_callout' as CadToolType, label: 'Khoanh Trích Chi Tiết', icon: Search, badge: '1/10' },
        { id: 'angle' as CadToolType, label: 'Đo Góc Tường', icon: DraftingCompass },
        { id: 'diagonal' as CadToolType, label: 'Đo Chéo Góc Vuông', icon: Compass },
      ],
    },
  ];

  const handleSelectTool = (tool: CadToolType) => {
    setActiveTool(tool);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`relative w-full max-w-lg rounded-t-3xl shadow-2xl z-10 flex flex-col max-h-[82vh] overflow-hidden ${
          osType === 'ios'
            ? 'bg-slate-900/95 backdrop-blur-2xl border-t border-slate-700/80 text-white'
            : 'bg-[#181b22] border-t border-slate-700 text-slate-100'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
      >
        {/* Grabber Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-slate-600/70 rounded-full" />
        </div>

        {/* Header with Undo / Redo & Close */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Hộp Công Cụ Khảo Sát CAD</span>
            </h3>
            <span className="text-[11px] text-slate-400">Chọn công cụ để vẽ hoặc đo đạc</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Undo / Redo */}
            <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className={`p-1.5 rounded-md transition-colors ${
                  canUndo ? 'text-white hover:bg-slate-700' : 'text-slate-600 cursor-not-allowed'
                }`}
                title="Hoàn tác"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className={`p-1.5 rounded-md transition-colors ${
                  canRedo ? 'text-white hover:bg-slate-700' : 'text-slate-600 cursor-not-allowed'
                }`}
                title="Làm lại"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {toolCategories.map((cat, idx) => (
            <div key={idx}>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 mb-2 px-1">
                {cat.title}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {cat.tools.map((t) => {
                  const Icon = t.icon;
                  const isSelected = activeTool === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleSelectTool(t.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer active:scale-98 ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                          : 'bg-slate-800/60 border-slate-700/80 text-slate-200 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-700/60 text-amber-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs truncate">{t.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1 text-slate-950" />}
                        </div>
                        {t.badge && (
                          <span
                            className={`inline-block text-[9px] px-1.5 py-0.2 rounded mt-0.5 font-medium ${
                              isSelected ? 'bg-slate-950/20 text-slate-900' : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {t.badge}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quick Room Preset */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                onAddQuickRoom('rect');
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 p-3 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl border border-amber-500/30 font-semibold text-xs transition-colors cursor-pointer"
            >
              <PlusSquare className="w-4 h-4" />
              <span>Tạo nhanh Phòng mẫu (4m x 5m)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
