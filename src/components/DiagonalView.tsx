import React, { useState } from 'react';
import { Compass, CheckCircle2, AlertTriangle, Plus, Zap, Trash2 } from 'lucide-react';
import { ProjectData, DiagonalCheck } from '../types/cad';

interface DiagonalViewProps {
  project: ProjectData;
  onAddDiagonal: (p1Name: string, p2Name: string, measuredMm: number) => void;
  onDeleteDiagonal: (id: string) => void;
  onOpenLaserModal: () => void;
}

export const DiagonalView: React.FC<DiagonalViewProps> = ({
  project,
  onAddDiagonal,
  onDeleteDiagonal,
  onOpenLaserModal,
}) => {
  const [measuring, setMeasuring] = useState<boolean>(false);
  const [customDiagName, setCustomDiagName] = useState<string>('Kiểm tra góc vuông P1 - P3');
  const [customMeasuredMm, setCustomMeasuredMm] = useState<number>(8154);

  return (
    <div className="flex-1 bg-[#181b20] p-6 text-slate-200 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-950/60 to-slate-900 border border-sky-800/40">
          <div className="flex items-center gap-3">
            <Compass className="w-7 h-7 text-sky-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Kiểm Tra Góc Vuông &amp; Đo Chéo Tam Giác</h2>
              <p className="text-xs text-slate-400 mt-1">
                Phương pháp kiểm tra hiện trạng chuẩn 4ECHouse: Bắn tia laser đo 2 cạnh góc vuông và 1 đường chéo để tính chính xác góc lệch méo của nhà.
              </p>
            </div>
          </div>
        </div>

        {/* Existing Diagonals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Danh Sách Đường Chéo Đã Kiểm Tra ({project.diagonalChecks.length})</h3>
            <button
              onClick={onOpenLaserModal}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Bắn Laser Đo Đường Chéo Mới</span>
            </button>
          </div>

          {project.diagonalChecks.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 text-xs">
              Chưa có đường chéo kiểm tra nào. Chọn công cụ "Đo Chéo" trên thanh bên trái hoặc click nút trên để thêm.
            </div>
          ) : (
            <div className="grid gap-3">
              {project.diagonalChecks.map((diag) => {
                const diff = Math.abs(diag.measuredLength - diag.calculatedLength);
                const isAcceptable = diff <= 25; // within 25mm tolerance

                return (
                  <div
                    key={diag.id}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{diag.name}</span>
                        {isAcceptable ? (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" />
                            Góc vuông chuẩn (Sai lệch &le; 25mm)
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3" />
                            Góc méo lệch {diff} mm
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                        <span>Số đo thực tế (Laser): <strong className="text-amber-400">{Math.round(diag.measuredLength)} mm</strong></span>
                        <span>·</span>
                        <span>Số đo hình học (CAD): <strong>{Math.round(diag.calculatedLength)} mm</strong></span>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteDiagonal(diag.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      title="Xóa đường chéo này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Formula Explanation */}
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="font-semibold text-slate-300">Nguyên lý tam giác hiện trạng (Pythagoras):</div>
          <p>
            Đối với một góc phòng có 2 cạnh góc vuông A và B, theo định lý Pythagoras đường chéo lý thuyết phải bằng: C = √(A² + B²).
          </p>
          <p>
            Khi dùng thước laser bắn đường chéo thực tế C_thực, nếu C_thực &gt; C thì góc phòng là góc tù (&gt; 90°), ngược lại nếu C_thực &lt; C thì góc phòng là góc nhọn (&lt; 90°). Dữ liệu này giúp KTS xử lý góc vát khi thiết kế nội thất hoặc xuất sang AutoCAD / SketchUp.
          </p>
        </div>
      </div>
    </div>
  );
};
