import React from 'react';
import { Zap, Radio } from 'lucide-react';
import { LaserDeviceStatus } from '../services/bluetoothLaser';
import { OperatingSystem } from '../types/device';

interface QuickLaserTriggerProps {
  laserStatus: LaserDeviceStatus;
  selectedWallName: string | null;
  onTriggerLaser: () => void;
  osType: OperatingSystem;
}

export const QuickLaserTrigger: React.FC<QuickLaserTriggerProps> = ({
  laserStatus,
  selectedWallName,
  onTriggerLaser,
  osType,
}) => {
  return (
    <div className="fixed bottom-20 right-4 z-40 flex items-center select-none pointer-events-auto">
      <button
        onClick={onTriggerLaser}
        className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl transition-all active:scale-95 cursor-pointer font-bold text-xs ${
          laserStatus.connected
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-emerald-500/30'
            : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-amber-500/30'
        } ${
          osType === 'ios'
            ? 'border border-white/30 backdrop-blur-md'
            : 'border-2 border-slate-900 elevation-8'
        }`}
        title="Bắn thước Laser Bluetooth"
      >
        <div className="relative">
          <Zap className="w-5 h-5 fill-current" />
          <span
            className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${
              laserStatus.connected ? 'bg-emerald-300 animate-ping' : 'bg-red-500'
            }`}
          />
        </div>
        <div className="text-left leading-tight pr-1">
          <span className="block text-[11px] font-black uppercase tracking-tight">
            {selectedWallName ? 'Đo ' + selectedWallName : 'Bắn Laser'}
          </span>
          <span className="block text-[9px] opacity-80 font-normal">
            {laserStatus.connected ? laserStatus.deviceName || 'Đã kết nối' : 'Chạm để đo'}
          </span>
        </div>
      </button>
    </div>
  );
};
