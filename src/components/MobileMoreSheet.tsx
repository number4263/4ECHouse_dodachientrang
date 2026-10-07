import React from 'react';
import { OperatingSystem } from '../types/device';
import {
  Search,
  Compass,
  FileSpreadsheet,
  Download,
  Settings,
  Sliders,
  X,
  Building,
  RotateCcw,
  FilePlus,
  BookOpen,
} from 'lucide-react';

interface MobileMoreSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: 'detail' | 'diagonal' | 'log') => void;
  onOpenExportModal: () => void;
  onOpenProjectSettings: () => void;
  onOpenDeviceSelector: () => void;
  onOpenNewProject: () => void;
  onOpenUserGuide: () => void;
  osType: OperatingSystem;
}

export const MobileMoreSheet: React.FC<MobileMoreSheetProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenExportModal,
  onOpenProjectSettings,
  onOpenDeviceSelector,
  onOpenNewProject,
  onOpenUserGuide,
  osType,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div
        className={`relative w-full max-w-lg rounded-t-3xl shadow-2xl z-10 flex flex-col max-h-[80vh] overflow-hidden ${
          osType === 'ios'
            ? 'bg-slate-900/95 backdrop-blur-2xl border-t border-slate-700/80 text-white'
            : 'bg-[#181b22] border-t border-slate-700 text-slate-100'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-slate-600/70 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">Chức Năng &amp; Tiện Ích Mở Rộng</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2.5 overflow-y-auto">
          {/* Quick Primary Actions: Tạo Mới & Hướng Dẫn */}
          <div className="grid grid-cols-2 gap-2 pb-1">
            <button
              onClick={() => {
                onOpenNewProject();
                onClose();
              }}
              className="flex items-center gap-2 p-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 rounded-xl text-left transition-colors cursor-pointer text-emerald-300 font-semibold text-xs"
            >
              <FilePlus className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>+ Tạo Mới Bản Vẽ</span>
            </button>
            <button
              onClick={() => {
                onOpenUserGuide();
                onClose();
              }}
              className="flex items-center gap-2 p-3 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 rounded-xl text-left transition-colors cursor-pointer text-amber-300 font-semibold text-xs"
            >
              <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Hướng Dẫn Sử Dụng</span>
            </button>
          </div>

          {/* Item 1: Đo Trích Chi Tiết */}
          <button
            onClick={() => {
              onSelectTab('detail');
              onClose();
            }}
            className="w-full flex items-center gap-3 p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-left transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Trích Phóng To Chi Tiết</span>
              <span className="text-xs text-slate-400">Xem và quản lý các vòng tròn trích chi tiết tỷ lệ 1/10</span>
            </div>
          </button>

          {/* Item 2: Đo Chéo Góc Vuông */}
          <button
            onClick={() => {
              onSelectTab('diagonal');
              onClose();
            }}
            className="w-full flex items-center gap-3 p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-left transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Đo Chéo Kiểm Tra Góc Vuông</span>
              <span className="text-xs text-slate-400">Đo đường chéo phòng Pythagoras &amp; độ lệch góc tường</span>
            </div>
          </button>

          {/* Item 3: Nhật Ký Số Đo Laser */}
          <button
            onClick={() => {
              onSelectTab('log');
              onClose();
            }}
            className="w-full flex items-center gap-3 p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-left transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Nhật Ký Số Đo Laser</span>
              <span className="text-xs text-slate-400">Lịch sử các lần bắn thước laser Bluetooth ngoài hiện trường</span>
            </div>
          </button>

          {/* Divider */}
          <div className="h-px bg-slate-800 my-2" />

          {/* Item 4: Xuất CAD / SketchUp */}
          <button
            onClick={() => {
              onOpenExportModal();
              onClose();
            }}
            className="w-full flex items-center gap-3 p-3.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-left transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-amber-400 block">Xuất File AutoCAD DXF &amp; SketchUp</span>
              <span className="text-xs text-slate-300">Tải về file CAD tiêu chuẩn kiến trúc Việt Nam</span>
            </div>
          </button>

          {/* Item 5: Đổi Giao Diện iPad / iPhone / iOS / Android */}
          <button
            onClick={() => {
              onOpenDeviceSelector();
              onClose();
            }}
            className="w-full flex items-center gap-3 p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-left transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Chế Độ iPad / iPhone / Android / iOS</span>
              <span className="text-xs text-slate-400">Tùy biến hiển thị cho máy tính bảng, điện thoại và hệ điều hành</span>
            </div>
          </button>

          {/* Item 6: Cài Đặt Công Trình */}
          <button
            onClick={() => {
              onOpenProjectSettings();
              onClose();
            }}
            className="w-full flex items-center gap-3 p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-left transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-700 text-slate-300 flex items-center justify-center shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Thông Tin Công Trình &amp; Địa Chỉ</span>
              <span className="text-xs text-slate-400">Tên dự án, người khảo sát, chiều cao trần mặc định</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
