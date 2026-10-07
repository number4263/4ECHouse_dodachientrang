import React from 'react';
import {
  Bluetooth,
  Download,
  Play,
  Radio,
  RotateCcw,
  Undo2,
  Redo2,
  Smartphone,
  Tablet,
  Monitor,
  Sliders,
  FilePlus,
  BookOpen,
} from 'lucide-react';
import { LaserDeviceStatus } from '../services/bluetoothLaser';
import { DeviceConfig } from '../types/device';

interface HeaderProps {
  activeTab: '2d' | 'elevation_section' | 'detail' | '3d' | 'diagonal' | 'log' | 'other_views';
  setActiveTab: (tab: '2d' | 'elevation_section' | 'detail' | '3d' | 'diagonal' | 'log' | 'other_views') => void;
  laserStatus: LaserDeviceStatus;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenLaserModal: () => void;
  onOpenExportModal: () => void;
  onOpenProjectSettings: () => void;
  projectName: string;
  deviceConfig: DeviceConfig;
  onOpenDeviceSelector: () => void;
  onOpenNewProject: () => void;
  onOpenUserGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  laserStatus,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenLaserModal,
  onOpenExportModal,
  onOpenProjectSettings,
  projectName,
  deviceConfig,
  onOpenDeviceSelector,
  onOpenNewProject,
  onOpenUserGuide,
}) => {
  const isIphone = deviceConfig.deviceType === 'iphone';
  const isIpad = deviceConfig.deviceType === 'ipad';
  const isIos = deviceConfig.osType === 'ios';

  return (
    <header
      className={`flex items-center justify-between px-3 sm:px-5 py-2 sm:py-2.5 border-b select-none z-30 shrink-0 gap-2 transition-colors ${
        isIos
          ? 'bg-slate-900/95 backdrop-blur-xl border-slate-800 text-slate-100'
          : 'bg-[#181b22] border-slate-800 text-slate-100'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top, 8px)' }}
    >
      {/* Zone 1: Wordmark, Device Mode Badge & Undo/Redo */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onOpenProjectSettings}
          className="text-left group cursor-pointer focus-visible:outline-none"
          title="Bấm để cấu hình thông tin công trình"
        >
          <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
            4ECHouse
          </span>
          <span className="hidden xl:inline-block ml-2.5 text-xs text-slate-400 font-normal group-hover:text-slate-200">
            {projectName}
          </span>
        </button>

        {/* Create New Project Button */}
        <button
          onClick={onOpenNewProject}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer"
          title="Tạo mới bản vẽ khảo sát"
        >
          <FilePlus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Tạo Mới</span>
        </button>

        {/* Device & OS Selector Trigger Badge */}
        <button
          onClick={onOpenDeviceSelector}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border cursor-pointer ${
            isIos
              ? 'bg-sky-500/15 border-sky-400/40 text-sky-300 hover:bg-sky-500/25'
              : 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/25'
          }`}
          title="Chuyển đổi giao diện iPad / iPhone / Android / iOS"
        >
          {isIphone ? (
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          ) : isIpad ? (
            <Tablet className="w-3.5 h-3.5 text-sky-400" />
          ) : (
            <Monitor className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span className="font-semibold">
            {isIphone ? 'iPhone' : isIpad ? 'iPad' : 'Desktop'}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-[10px] opacity-90">{isIos ? 'iOS' : 'Android'}</span>
        </button>

        {/* Undo / Redo controls */}
        <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/80">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              canUndo
                ? 'text-slate-200 hover:text-white hover:bg-slate-700 shadow-xs'
                : 'text-slate-600 cursor-not-allowed pointer-events-none'
            }`}
            title={canUndo ? 'Hoàn tác (Ctrl+Z)' : 'Không có thao tác hoàn tác'}
            aria-label="Hoàn tác (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              canRedo
                ? 'text-slate-200 hover:text-white hover:bg-slate-700 shadow-xs'
                : 'text-slate-600 cursor-not-allowed pointer-events-none'
            }`}
            title={canRedo ? 'Làm lại (Ctrl+Y / Ctrl+Shift+Z)' : 'Không có thao tác làm lại'}
            aria-label="Làm lại (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Zone 2: Navigation tabs (Hidden on iPhone because iPhone uses thumb-friendly MobileBottomNav) */}
      {!isIphone && (
        <nav className="flex items-center gap-2 md:gap-5 text-xs sm:text-sm font-medium text-slate-400 overflow-x-auto">
          <button
            onClick={() => setActiveTab('2d')}
            className={`py-1 transition-colors relative whitespace-nowrap cursor-pointer ${
              activeTab === '2d'
                ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-400'
                : 'hover:text-slate-200'
            }`}
          >
            Mặt bằng 2D
          </button>
          <button
            onClick={() => setActiveTab('elevation_section')}
            className={`py-1 transition-colors relative whitespace-nowrap cursor-pointer ${
              activeTab === 'elevation_section'
                ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-400'
                : 'hover:text-slate-200'
            }`}
          >
            Mặt đứng &amp; Mặt cắt
          </button>
          <button
            onClick={() => setActiveTab('detail')}
            className={`py-1 transition-colors relative whitespace-nowrap cursor-pointer ${
              activeTab === 'detail'
                ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-400'
                : 'hover:text-slate-200'
            }`}
          >
            Trích chi tiết
          </button>
          <button
            onClick={() => setActiveTab('3d')}
            className={`py-1 transition-colors relative whitespace-nowrap cursor-pointer ${
              activeTab === '3d'
                ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-400'
                : 'hover:text-slate-200'
            }`}
          >
            Mô hình 3D
          </button>
          <button
            onClick={() => setActiveTab('diagonal')}
            className={`py-1 transition-colors relative whitespace-nowrap cursor-pointer hidden lg:inline-block ${
              activeTab === 'diagonal'
                ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-400'
                : 'hover:text-slate-200'
            }`}
          >
            Đo chéo góc
          </button>
          <button
            onClick={() => setActiveTab('log')}
            className={`py-1 transition-colors relative whitespace-nowrap cursor-pointer hidden lg:inline-block ${
              activeTab === 'log'
                ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-400'
                : 'hover:text-slate-200'
            }`}
          >
            Nhật ký đo
          </button>
          <button
            onClick={() => setActiveTab('other_views')}
            className={`py-1 transition-colors relative whitespace-nowrap cursor-pointer ${
              activeTab === 'other_views'
                ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-400'
                : 'hover:text-slate-200'
            }`}
          >
            View khác &amp; Toolbox
          </button>
        </nav>
      )}

      {/* Zone 3: Actions (User Guide + Laser Connect + Export CAD) */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* User Guide Tutorial button */}
        <button
          onClick={onOpenUserGuide}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
          title="Hướng dẫn sử dụng & phím tắt"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Hướng Dẫn</span>
        </button>

        {/* Laser connect button */}
        <button
          onClick={onOpenLaserModal}
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
            laserStatus.connected
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
          title="Kết nối thước Laser Bluetooth hoặc mở Giả lập đo"
        >
          <Radio
            className={`w-3.5 h-3.5 ${laserStatus.connected ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`}
          />
          <span className="hidden sm:inline">
            {laserStatus.connected
              ? laserStatus.deviceName || 'Laser Đã Kết Nối'
              : 'Thước Laser BLE'}
          </span>
          <span className="sm:hidden text-[11px]">Laser</span>
          {laserStatus.lastReadingMm && (
            <span className="font-mono font-semibold text-emerald-400 tabular-nums text-[11px]">
              {(laserStatus.lastReadingMm / 1000).toFixed(3)}m
            </span>
          )}
        </button>

        {/* Primary Action: Export CAD & SketchUp (hidden or compact on iPhone) */}
        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Xuất DWG / SKP</span>
          <span className="sm:hidden">Xuất</span>
        </button>
      </div>
    </header>
  );
};
