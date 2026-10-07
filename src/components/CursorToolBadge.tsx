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
  Eraser,
  Layers,
  Building,
  Fence,
  Home,
  Sliders,
} from 'lucide-react';

interface CursorToolBadgeProps {
  pos: { x: number; y: number } | null;
  tool: string;
  subType?: string;
  measureHint?: string;
}

export const CursorToolBadge: React.FC<CursorToolBadgeProps> = ({
  pos,
  tool,
  subType,
  measureHint,
}) => {
  if (!pos) return null;

  const getToolInfo = () => {
    switch (tool) {
      case 'select':
        return { label: 'Chọn / Đo Laser', icon: MousePointer2, color: 'text-amber-400' };
      case 'eraser':
        return { label: 'XÓA ĐỐI TƯỢNG', icon: Eraser, color: 'text-rose-400' };
      case 'wall':
        return { label: 'Vẽ Tường', icon: PenTool, color: 'text-amber-400' };
      case 'curved_wall':
        return { label: 'Tường Cong (Arc)', icon: Spline, color: 'text-sky-400' };
      case 'slab':
        return { label: 'Vẽ Sàn Bê Tông', icon: Layers, color: 'text-blue-400' };
      case 'railing':
        return { label: 'Vẽ Lan Can', icon: Fence, color: 'text-emerald-400' };
      case 'roof':
        return { label: 'Vẽ Mái Nhà', icon: Home, color: 'text-orange-400' };
      case 'door':
        return { label: 'Đặt Cửa Đi', icon: DoorOpen, color: 'text-rose-400' };
      case 'window':
        return { label: 'Đặt Cửa Sổ', icon: Square, color: 'text-cyan-400' };
      case 'glass_partition':
        return { label: 'Đặt Vách Kính', icon: Square, color: 'text-teal-400' };
      case 'column':
        return { label: 'Đặt Cột', icon: Columns, color: 'text-indigo-400' };
      case 'stair':
        return { label: 'Đặt Cầu Thang', icon: TrendingUp, color: 'text-violet-400' };
      case 'mep':
        return { label: 'Đặt Thiết Bị MEP', icon: Zap, color: 'text-yellow-400' };
      case 'landscape':
        return { label: 'Đặt Cây Xanh', icon: Leaf, color: 'text-emerald-400' };
      case 'pen_draw':
        return { label: 'Bút Vẽ Note', icon: Pencil, color: 'text-lime-400' };
      case 'detail_callout':
        return { label: 'Trích Chi Tiết', icon: Search, color: 'text-amber-400' };
      case 'angle':
        return { label: 'Đo Góc Tường', icon: DraftingCompass, color: 'text-sky-400' };
      case 'diagonal':
        return { label: 'Đo Chéo Góc', icon: Compass, color: 'text-teal-400' };
      case 'level':
        return { label: 'Cao Độ & Mặt Cắt', icon: Sliders, color: 'text-sky-400' };
      default:
        return { label: tool, icon: MousePointer2, color: 'text-slate-300' };
    }
  };

  const { label, icon: Icon, color } = getToolInfo();

  return (
    <div
      className="fixed pointer-events-none z-50 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/95 border border-slate-700/90 text-white shadow-2xl backdrop-blur select-none transition-transform duration-75"
      style={{
        left: pos.x + 18,
        top: pos.y + 18,
        transform: 'translate3d(0, 0, 0)',
      }}
    >
      <Icon className={`w-3.5 h-3.5 ${color}`} />
      <span className="text-[11px] font-semibold tracking-tight">{label}</span>
      {subType && (
        <span className="text-[10px] text-amber-300 bg-slate-800/80 px-1 py-0.5 rounded border border-slate-700 font-mono">
          {subType}
        </span>
      )}
      {measureHint && (
        <span className="text-[10px] text-white bg-amber-600/80 px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">
          {measureHint}
        </span>
      )}
    </div>
  );
};
