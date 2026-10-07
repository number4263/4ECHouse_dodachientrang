import React, { useState } from 'react';
import { Bluetooth, Radio, Zap, Volume2, VolumeX, X, Check, Target, Compass, ArrowUpDown } from 'lucide-react';
import { laserService, LaserDeviceStatus } from '../services/bluetoothLaser';
import { sounds } from '../services/soundEffects';
import { ProjectData, Wall } from '../types/cad';

interface LaserMeterModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: LaserDeviceStatus;
  project: ProjectData;
  selectedWallId: string | null;
  selectedCurvedWallId?: string | null;
  onApplyMeasurementToWall: (wallId: string, valueMm: number) => void;
  onApplyMeasurementToCurvedWall?: (cwId: string, valueMm: number) => void;
  onApplyMeasurementToHeight: (valueMm: number) => void;
  onApplyMeasurementToDiagonal: (valueMm: number) => void;
}

export const LaserMeterModal: React.FC<LaserMeterModalProps> = ({
  isOpen,
  onClose,
  status,
  project,
  selectedWallId,
  selectedCurvedWallId,
  onApplyMeasurementToWall,
  onApplyMeasurementToCurvedWall,
  onApplyMeasurementToHeight,
  onApplyMeasurementToDiagonal,
}) => {
  if (!isOpen) return null;

  const [connecting, setConnecting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState<boolean>(sounds.isEnabled());

  // Virtual Laser Meter internal display value
  const [virtualValMm, setVirtualValMm] = useState<number>(() => {
    if (selectedCurvedWallId) {
      const cw = project.curvedWalls?.find((c) => c.id === selectedCurvedWallId);
      if (cw) return Math.round(cw.arcLength || cw.radius || 1500);
    }
    if (selectedWallId) {
      const w = project.walls.find((item) => item.id === selectedWallId);
      if (w) {
        return Math.round(w.measuredLength || Math.hypot(w.end.x - w.start.x, w.end.y - w.start.y));
      }
    }
    return 3600;
  });

  const [measurementTarget, setMeasurementTarget] = useState<'wall' | 'curved' | 'height' | 'diagonal'>(
    selectedCurvedWallId ? 'curved' : 'wall'
  );

  // Connect via Web Bluetooth
  const handleConnectBle = async () => {
    setConnecting(true);
    setErrorMessage(null);
    try {
      await laserService.connect();
    } catch (err: any) {
      if (err.name !== 'NotFoundError') {
        setErrorMessage(err.message || 'Không thể kết nối Bluetooth');
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnectBle = () => {
    laserService.disconnect();
  };

  const toggleSound = () => {
    const next = !soundOn;
    sounds.setSoundEnabled(next);
    setSoundOn(next);
  };

  // Trigger measurement and apply to CAD drawing
  const handleTriggerMeasurement = () => {
    laserService.simulateMeasure(virtualValMm);

    if (measurementTarget === 'wall' && selectedWallId) {
      onApplyMeasurementToWall(selectedWallId, virtualValMm);
    } else if (measurementTarget === 'curved' && selectedCurvedWallId && onApplyMeasurementToCurvedWall) {
      onApplyMeasurementToCurvedWall(selectedCurvedWallId, virtualValMm);
    } else if (measurementTarget === 'height') {
      onApplyMeasurementToHeight(virtualValMm);
    } else if (measurementTarget === 'diagonal') {
      onApplyMeasurementToDiagonal(virtualValMm);
    }
  };

  const selectedWall = project.walls.find((w) => w.id === selectedWallId);
  const selectedCurvedWall = project.curvedWalls?.find((cw) => cw.id === selectedCurvedWallId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-amber-500 animate-pulse" />
            <div>
              <h3 className="text-base font-bold text-white">Kết Nối &amp; Đo Bằng Thước Laser</h3>
              <p className="text-xs text-slate-400">
                Tự động đồng bộ số đo thực tế vào bản vẽ CAD 2D &amp; 3D SketchUp
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title={soundOn ? 'Tắt âm thanh' : 'Bật âm thanh'}
            >
              {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Bluetooth Connection Strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  status.connected ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-slate-600'
                }`}
              />
              <div>
                <div className="text-sm font-semibold text-white">
                  {status.connected ? status.deviceName || 'Thước Laser Bluetooth' : 'Chưa kết nối thiết bị Bluetooth'}
                </div>
                <div className="text-xs text-slate-400">
                  {status.connected
                    ? 'Hỗ trợ: Leica DISTO, Bosch GLM, SNDWAY, Mileseey, CEM'
                    : 'Hỗ trợ kết nối không dây trực tiếp từ thước laser tới trình duyệt'}
                </div>
              </div>
            </div>

            {status.connected ? (
              <button
                onClick={handleDisconnectBle}
                className="px-3 py-1.5 text-xs font-semibold text-rose-400 bg-rose-950/40 border border-rose-800 rounded-lg hover:bg-rose-900/60 transition-colors whitespace-nowrap cursor-pointer"
              >
                Ngắt kết nối
              </button>
            ) : (
              <button
                onClick={handleConnectBle}
                disabled={connecting}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                <Bluetooth className="w-4 h-4" />
                <span>{connecting ? 'Đang tìm thước...' : 'Tìm thước qua Bluetooth'}</span>
              </button>
            )}
          </div>

          {errorMessage && (
            <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-300 leading-relaxed">
              {errorMessage}
              <div className="mt-1 text-slate-400">
                Gợi ý: Nếu không có thước Bluetooth bên cạnh, bạn có thể dùng trực tiếp bảng điều khiển giả lập phía dưới để đo và cập nhật bản vẽ tức thì!
              </div>
            </div>
          )}

          {/* VIRTUAL RUGGED LASER RANGEFINDER CONSOLE */}
          <div className="relative p-5 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-700 shadow-2xl space-y-4">
            {/* Rangefinder Branding & Indicator */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold tracking-wider text-amber-400 uppercase">
                4ECHouse Laser Rangefinder PRO
              </span>
              <span className="flex items-center gap-1.5 font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                LASER READY
              </span>
            </div>

            {/* LCD BACKLIT DISPLAY */}
            <div className="relative p-4 rounded-xl bg-[#0f241a] border-2 border-[#1e4532] shadow-inner font-mono">
              <div className="flex justify-between items-center text-xs text-[#529e74] pb-1 border-b border-[#1b3d2c]">
                <span>
                  MỤC TIÊU:{' '}
                  {measurementTarget === 'wall'
                    ? selectedWall?.name || 'TƯỜNG THẲNG'
                    : measurementTarget === 'curved'
                    ? selectedCurvedWall?.name || 'TƯỜNG CONG'
                    : measurementTarget === 'height'
                    ? 'CHIỀU CAO TRẦN'
                    : 'ĐO CHÉO'}
                </span>
                <span className="tabular-nums">PIN: 98%</span>
              </div>

              <div className="flex items-baseline justify-between pt-3">
                <span className="text-3xl sm:text-4xl font-black text-[#5eead4] tracking-tight tabular-nums">
                  {(virtualValMm / 1000).toFixed(3)}
                </span>
                <span className="text-lg font-bold text-[#5eead4] ml-2">m</span>
                <span className="text-sm font-semibold text-[#34d399] ml-auto tabular-nums">
                  ({virtualValMm} mm)
                </span>
              </div>
            </div>

            {/* Target Select Tabs */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Áp dụng số đo vào:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => setMeasurementTarget('wall')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                    measurementTarget === 'wall'
                      ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Tường Thẳng</span>
                </button>
                <button
                  onClick={() => setMeasurementTarget('curved')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                    measurementTarget === 'curved'
                      ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Tường Cong</span>
                </button>
                <button
                  onClick={() => setMeasurementTarget('height')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                    measurementTarget === 'height'
                      ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>Cao độ Trần</span>
                </button>
                <button
                  onClick={() => setMeasurementTarget('diagonal')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                    measurementTarget === 'diagonal'
                      ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Đo Chéo</span>
                </button>
              </div>
            </div>

            {/* Wall Selector helper if in wall mode */}
            {measurementTarget === 'wall' && (
              <div className="text-xs text-slate-300">
                {selectedWall ? (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <span>
                      Đang chọn: <strong className="text-amber-400">{selectedWall.name || 'Tường'}</strong>
                    </span>
                    <span className="font-mono text-slate-400">
                      Hiện tại: {Math.round(selectedWall.measuredLength || 0)} mm
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-400">
                    Vui lòng chọn 1 bức tường trên bản vẽ 2D hoặc chọn danh sách bên dưới:
                    <select
                      className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      value={selectedWallId || ''}
                      onChange={(e) => {
                        const w = project.walls.find((item) => item.id === e.target.value);
                        if (w) {
                          onApplyMeasurementToWall(w.id, Math.round(w.measuredLength || 3500));
                        }
                      }}
                    >
                      <option value="">-- Chọn tường để gán số đo --</option>
                      {project.walls.map((w, idx) => (
                        <option key={w.id} value={w.id}>
                          {w.name || `Tường ${idx + 1}`} ({Math.round(w.measuredLength || 0)} mm)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Quick Measurement Sliders & Presets */}
            <div className="space-y-2 pt-2 border-t border-slate-700/60">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Điều chỉnh kích thước đo (mm):</span>
                <input
                  type="number"
                  step="10"
                  value={virtualValMm}
                  onChange={(e) => setVirtualValMm(Math.max(100, parseInt(e.target.value) || 0))}
                  className="w-24 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-right font-mono text-white text-xs"
                />
              </div>

              {/* Slider for smooth tuning */}
              <input
                type="range"
                min="500"
                max="12000"
                step="20"
                value={virtualValMm}
                onChange={(e) => setVirtualValMm(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />

              {/* Quick Preset Buttons (common architectural dimensions in Vietnam) */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[1200, 2200, 2800, 3200, 3600, 4200, 4800, 5000, 6800].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setVirtualValMm(preset)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {(preset / 1000).toFixed(2)}m
                  </button>
                ))}
              </div>
            </div>

            {/* BIG RED TRIGGER BUTTON (DIST / BẮN LASER) */}
            <button
              onClick={handleTriggerMeasurement}
              className="w-full group relative flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm tracking-wider uppercase shadow-[0_0_20px_rgba(225,29,72,0.4)] active:scale-[0.99] transition-all cursor-pointer"
            >
              <Zap className="w-5 h-5 fill-white animate-pulse" />
              <span>BẮN LASER · CẬP NHẬT BẢN VẼ NGAY</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 text-xs text-slate-400">
          <span>Tự động cập nhật 2D CAD (DWG) &amp; 3D SketchUp (SKP)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
