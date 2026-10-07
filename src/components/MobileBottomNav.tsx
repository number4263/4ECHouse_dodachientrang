import React from 'react';
import { OperatingSystem } from '../types/device';
import { CadToolType } from './SidebarTools';
import {
  Compass,
  Building,
  Layers,
  Box,
  Menu,
  Wrench,
  PenTool,
  Spline,
  TrendingUp,
  DoorOpen,
  Square,
  Columns,
  Zap,
  Leaf,
  Pencil,
  Search,
  MousePointer2,
  Eraser,
  Fence,
  Home,
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: '2d' | 'elevation_section' | 'detail' | '3d' | 'diagonal' | 'log' | 'other_views';
  setActiveTab: (tab: '2d' | 'elevation_section' | 'detail' | '3d' | 'diagonal' | 'log' | 'other_views') => void;
  activeTool: CadToolType;
  onOpenToolsSheet: () => void;
  onOpenMoreMenu: () => void;
  osType: OperatingSystem;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  activeTool,
  onOpenToolsSheet,
  onOpenMoreMenu,
  osType,
}) => {
  const getToolIcon = (tool: CadToolType) => {
    switch (tool) {
      case 'select': return MousePointer2;
      case 'eraser': return Eraser;
      case 'wall': return PenTool;
      case 'curved_wall': return Spline;
      case 'railing': return Fence;
      case 'roof': return Home;
      case 'stair': return TrendingUp;
      case 'door': return DoorOpen;
      case 'window': return Square;
      case 'column': return Columns;
      case 'mep': return Zap;
      case 'landscape': return Leaf;
      case 'pen_draw': return Pencil;
      case 'detail_callout': return Search;
      default: return Wrench;
    }
  };

  const ActiveToolIcon = getToolIcon(activeTool);

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 select-none ${
        osType === 'ios'
          ? 'bg-slate-950/85 backdrop-blur-xl border-t border-slate-800/80 pb-safe'
          : 'bg-[#181b22] border-t border-slate-800 shadow-2xl pb-1'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
    >
      <div className="flex items-center justify-around h-14 px-2 max-w-md mx-auto relative">
        {/* Tab 1: Mặt bằng 2D */}
        <button
          onClick={() => setActiveTab('2d')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
            activeTab === '2d'
              ? osType === 'ios'
                ? 'text-amber-400 font-bold'
                : 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Layers className="w-5 h-5 mb-0.5" />
            {activeTab === '2d' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">Mặt Bằng</span>
        </button>

        {/* Tab 2: Mặt đứng & Mặt cắt */}
        <button
          onClick={() => setActiveTab('elevation_section')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
            activeTab === 'elevation_section'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Building className="w-5 h-5 mb-0.5" />
            {activeTab === 'elevation_section' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">Mặt Đứng</span>
        </button>

        {/* Center: CAD Tools Button (Floating Action) */}
        <div className="flex-1 flex justify-center -translate-y-3">
          <button
            onClick={onOpenToolsSheet}
            className={`w-12 h-12 rounded-full flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer ${
              osType === 'ios'
                ? 'bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 shadow-amber-500/30 border-2 border-slate-900'
                : 'bg-amber-500 text-slate-950 shadow-xl border-2 border-slate-900'
            }`}
            title="Mở bảng công cụ CAD"
          >
            <ActiveToolIcon className="w-5 h-5" />
            <span className="text-[8px] font-bold leading-none mt-0.5">Vẽ CAD</span>
          </button>
        </div>

        {/* Tab 3: Mô hình 3D */}
        <button
          onClick={() => setActiveTab('3d')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
            activeTab === '3d'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Box className="w-5 h-5 mb-0.5" />
            {activeTab === '3d' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">3D Phối Cảnh</span>
        </button>

        {/* Tab 4: Thêm / Menu */}
        <button
          onClick={onOpenMoreMenu}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
            activeTab === 'detail' || activeTab === 'diagonal' || activeTab === 'log'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Menu className="w-5 h-5 mb-0.5" />
            {(activeTab === 'detail' || activeTab === 'diagonal' || activeTab === 'log') && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">Thêm</span>
        </button>
      </div>

      {/* iOS Home Indicator Bar decoration */}
      {osType === 'ios' && (
        <div className="w-32 h-1 bg-slate-600/50 rounded-full mx-auto mt-1 mb-0.5" />
      )}
    </nav>
  );
};
