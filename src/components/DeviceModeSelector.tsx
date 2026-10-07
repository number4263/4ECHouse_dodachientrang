import React from 'react';
import { DeviceConfig, DeviceType, OperatingSystem } from '../types/device';
import {
  Smartphone,
  Tablet,
  Monitor,
  Apple,
  RotateCw,
  Sliders,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

interface DeviceModeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DeviceConfig;
  onSetDeviceType: (type: DeviceType) => void;
  onSetOsType: (os: OperatingSystem) => void;
  onToggleSimulateFrame: () => void;
  onToggleOrientation: () => void;
}

export const DeviceModeSelectorModal: React.FC<DeviceModeSelectorModalProps> = ({
  isOpen,
  onClose,
  config,
  onSetDeviceType,
  onSetOsType,
  onToggleSimulateFrame,
  onToggleOrientation,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Chế Độ Giao Diện &amp; Hệ Điều Hành</h3>
              <p className="text-xs text-slate-400">Tùy biến hiển thị tối ưu cho iPad, iPhone, Android &amp; iOS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* 1. Chọn Thiết Bị */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2.5">
              1. Chọn Thiết Bị Khảo Sát
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* iPhone */}
              <button
                onClick={() => onSetDeviceType('iphone')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  config.deviceType === 'iphone'
                    ? 'bg-amber-500/20 border-amber-500 text-white font-bold shadow-md shadow-amber-500/10'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Smartphone className="w-6 h-6 mb-1.5 text-amber-400" />
                <span className="text-xs">iPhone / Phone</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Một tay &amp; ngón cái</span>
                {config.deviceType === 'iphone' && (
                  <span className="mt-1.5 px-2 py-0.5 text-[9px] bg-amber-500 text-slate-950 rounded-full font-bold">
                    Đang kích hoạt
                  </span>
                )}
              </button>

              {/* iPad */}
              <button
                onClick={() => onSetDeviceType('ipad')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  config.deviceType === 'ipad'
                    ? 'bg-amber-500/20 border-amber-500 text-white font-bold shadow-md shadow-amber-500/10'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Tablet className="w-6 h-6 mb-1.5 text-sky-400" />
                <span className="text-xs">iPad / Tablet</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Bút cảm ứng Stylus</span>
                {config.deviceType === 'ipad' && (
                  <span className="mt-1.5 px-2 py-0.5 text-[9px] bg-amber-500 text-slate-950 rounded-full font-bold">
                    Đang kích hoạt
                  </span>
                )}
              </button>

              {/* Desktop */}
              <button
                onClick={() => onSetDeviceType('desktop')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  config.deviceType === 'desktop'
                    ? 'bg-amber-500/20 border-amber-500 text-white font-bold shadow-md shadow-amber-500/10'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Monitor className="w-6 h-6 mb-1.5 text-emerald-400" />
                <span className="text-xs">Desktop / Auto</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Tự động thích ứng</span>
                {config.deviceType === 'desktop' && (
                  <span className="mt-1.5 px-2 py-0.5 text-[9px] bg-amber-500 text-slate-950 rounded-full font-bold">
                    Đang kích hoạt
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* 2. Chọn Hệ Điều Hành */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2.5">
              2. Chọn Hệ Điều Hành &amp; Phong Cách Giao Diện
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* iOS */}
              <button
                onClick={() => onSetOsType('ios')}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  config.osType === 'ios'
                    ? 'bg-sky-500/20 border-sky-400 text-white font-semibold'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Apple className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">Apple iOS / iPadOS</span>
                    {config.osType === 'ios' && <Check className="w-4 h-4 text-sky-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                    Kính mờ Frosted Glass, bo góc Squircle, hỗ trợ Apple Pencil, thanh Home Bar
                  </p>
                </div>
              </button>

              {/* Android */}
              <button
                onClick={() => onSetOsType('android')}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  config.osType === 'android'
                    ? 'bg-emerald-500/20 border-emerald-400 text-white font-semibold'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400 font-mono font-bold text-sm">
                  🤖
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">Google Android</span>
                    {config.osType === 'android' && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                    Material Design You, nút FAB tròn, thanh trượt pill, hỗ trợ S-Pen Samsung
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 3. Tùy Chọn Mô Phỏng Thiết Bị (Trên màn hình lớn) */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white">Khung Mô Phỏng Thiết Bị (Device Frame)</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Hiển thị khung viền iPhone / iPad thật (Tai thỏ, viền cong) khi xem trên máy tính
                </p>
              </div>
              <button
                onClick={onToggleSimulateFrame}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  config.simulateFrame ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                    config.simulateFrame ? 'translate-x-6.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {config.deviceType !== 'desktop' && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                <span className="text-xs text-slate-300">Hướng xoay màn hình:</span>
                <button
                  onClick={onToggleOrientation}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{config.orientation === 'portrait' ? 'Màn Hình Dọc (Portrait)' : 'Màn Hình Ngang (Landscape)'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-950/80">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Tự động tối ưu phím bấm &amp; cử chỉ cảm ứng</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Áp Dụng &amp; Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
