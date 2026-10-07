import React from 'react';
import { LaserMeasurement, ProjectData } from '../types/cad';
import { Radio, Copy, CheckCircle2, Zap, ArrowRight } from 'lucide-react';

interface MeasurementLogViewProps {
  project: ProjectData;
  onApplyMeasurementToWall: (wallId: string, valueMm: number) => void;
  onOpenLaserModal: () => void;
}

export const MeasurementLogView: React.FC<MeasurementLogViewProps> = ({
  project,
  onApplyMeasurementToWall,
  onOpenLaserModal,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const copyVal = (id: string, valMm: number) => {
    navigator.clipboard.writeText(`${valMm}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="flex-1 bg-[#181b20] p-6 text-slate-200 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-amber-500" />
              <span>Nhật Ký Số Đo Thước Laser</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Ghi lại chi tiết tất cả các lần bắn laser từ thiết bị để đối chiếu hiện trường
            </p>
          </div>
          <button
            onClick={onOpenLaserModal}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Bắn Thước Laser Mới</span>
          </button>
        </div>

        {/* Measurements Table */}
        {project.measurementsLog.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 text-xs space-y-3">
            <Radio className="w-8 h-8 text-slate-600 mx-auto" />
            <div>Chưa có dữ liệu nhật ký đo nào trong phiên làm việc này.</div>
            <button
              onClick={onOpenLaserModal}
              className="text-amber-400 hover:underline cursor-pointer"
            >
              Mở thước laser để bắt đầu đo &rarr;
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3">Hạng mục khảo sát</th>
                  <th className="px-4 py-3">Số đo (mm)</th>
                  <th className="px-4 py-3">Số đo (m)</th>
                  <th className="px-4 py-3">Nguồn</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {project.measurementsLog.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-400">{m.timestamp}</td>
                    <td className="px-4 py-3 font-medium text-white">{m.targetName || 'Đo tự do'}</td>
                    <td className="px-4 py-3 font-mono font-bold text-amber-400 text-sm">
                      {m.valueMm} mm
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">
                      {(m.valueMm / 1000).toFixed(3)} m
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-2 py-0.5 rounded">
                        {m.deviceSource === 'BLE_DEVICE' ? 'Thước Laser BLE' : 'Giả lập'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => copyVal(m.id, m.valueMm)}
                        className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors cursor-pointer mr-1"
                        title="Sao chép số đo"
                      >
                        {copiedId === m.id ? 'Đã chép' : 'Sao chép'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
