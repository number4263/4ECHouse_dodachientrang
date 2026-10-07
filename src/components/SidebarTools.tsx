import React from 'react';
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
  Eraser,
  Fence,
  Home,
} from 'lucide-react';

export type CadToolType =
  | 'select'
  | 'eraser'
  | 'wall'
  | 'curved_wall'
  | 'railing'
  | 'roof'
  | 'stair'
  | 'door'
  | 'window'
  | 'column'
  | 'mep'
  | 'landscape'
  | 'pen_draw'
  | 'detail_callout'
  | 'angle'
  | 'diagonal'
  | 'note';

interface SidebarToolsProps {
  activeTool: CadToolType;
  setActiveTool: (tool: CadToolType) => void;
  onAddQuickRoom: (shape: 'rect' | 'l_shape') => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const SidebarTools: React.FC<SidebarToolsProps> = ({
  activeTool,
  setActiveTool,
  onAddQuickRoom,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}) => {
  const tools: { id: CadToolType; label: string; icon: any; shortcut: string; category?: string }[] = [
    { id: 'select', label: 'Chọn / Đo Laser', icon: MousePointer2, shortcut: 'V' },
    { id: 'eraser', label: 'Công Cụ Xóa', icon: Eraser, shortcut: 'E' },
    { id: 'wall', label: 'Tường Thẳng', icon: PenTool, shortcut: 'W' },
    { id: 'curved_wall', label: 'Tường Cong (Arc)', icon: Spline, shortcut: 'Q' },
    { id: 'railing', label: 'Lan Can Ban Công', icon: Fence, shortcut: 'B' },
    { id: 'roof', label: 'Mái & Giàn Thép', icon: Home, shortcut: 'R' },
    { id: 'stair', label: 'Cầu Thang CAD', icon: TrendingUp, shortcut: 'T' },
    { id: 'door', label: 'Cửa Đi (1-4 cánh)', icon: DoorOpen, shortcut: 'D' },
    { id: 'window', label: 'Cửa Sổ / Vách Kính', icon: Square, shortcut: 'S' },
    { id: 'column', label: 'Cột Thép & BTCT', icon: Columns, shortcut: 'C' },
    { id: 'mep', label: 'Cơ Điện MEP', icon: Zap, shortcut: 'M' },
    { id: 'landscape', label: 'Cây Xanh', icon: Leaf, shortcut: 'L' },
    { id: 'pen_draw', label: 'Bút Vẽ Tay Note', icon: Pencil, shortcut: 'P' },
    { id: 'detail_callout', label: 'Trích Chi Tiết', icon: Search, shortcut: 'J' },
    { id: 'angle', label: 'Đo Góc Tường', icon: DraftingCompass, shortcut: 'A' },
    { id: 'diagonal', label: 'Đo Chéo Góc', icon: Compass, shortcut: 'X' },
  ];

  return (
    <aside className="w-14 sm:w-16 border-r border-slate-800 bg-[#16191f] flex flex-col items-center py-2 select-none z-20 shrink-0 overflow-y-auto">
      {/* Quick Undo / Redo in sidebar */}
      <div className="flex items-center gap-1 w-full px-1.5 mb-1.5 justify-center">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-1.5 rounded-lg transition-all cursor-pointer group relative ${
            canUndo
              ? 'text-slate-200 hover:text-white hover:bg-slate-800'
              : 'text-slate-600 cursor-not-allowed pointer-events-none'
          }`}
          title="Hoàn tác (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
          <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] rounded shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-slate-700">
            <span className="font-semibold text-amber-400">Hoàn tác</span>
            <span className="ml-1 text-slate-400 font-mono">[Ctrl+Z]</span>
          </div>
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-1.5 rounded-lg transition-all cursor-pointer group relative ${
            canRedo
              ? 'text-slate-200 hover:text-white hover:bg-slate-800'
              : 'text-slate-600 cursor-not-allowed pointer-events-none'
          }`}
          title="Làm lại (Ctrl+Y / Ctrl+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
          <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] rounded shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-slate-700">
            <span className="font-semibold text-amber-400">Làm lại</span>
            <span className="ml-1 text-slate-400 font-mono">[Ctrl+Y]</span>
          </div>
        </button>
      </div>

      <div className="w-8 h-px bg-slate-800 mb-2 shrink-0" />

      {/* Main CAD tools list */}
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

              {/* Tooltip on hover */}
              <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] rounded shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-slate-700">
                <span className="font-semibold text-amber-400">{t.label}</span>
                <span className="ml-1 text-slate-400 font-mono">[{t.shortcut}]</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-slate-800 my-2 shrink-0" />

      {/* Quick Room Generator Presets */}
      <div className="flex flex-col items-center gap-2 w-full px-2 shrink-0">
        <button
          onClick={() => onAddQuickRoom('rect')}
          className="w-full aspect-square rounded-xl flex flex-col items-center justify-center p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 transition-colors cursor-pointer group relative"
          title="Tạo nhanh phòng chữ nhật chuẩn"
        >
          <PlusSquare className="w-5 h-5" />
          <span className="text-[8px] sm:text-[9px] font-medium leading-none mt-1 hidden sm:block">Phòng</span>
          <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[11px] rounded shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-slate-700">
            Tạo nhanh Phòng chữ nhật (4m x 5m)
          </div>
        </button>
      </div>
    </aside>
  );
};


