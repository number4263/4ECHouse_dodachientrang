import React, { useState } from 'react';
import { Storey } from '../types/cad';
import { Layers, Plus, Trash2, X, Check, ArrowDown, ArrowUp } from 'lucide-react';

interface StoreyManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeys: Storey[];
  activeStoreyId?: string;
  onSelectStorey: (id: string) => void;
  onAddStorey: (storey: Storey) => void;
  onUpdateStorey: (storey: Storey) => void;
  onDeleteStorey?: (id: string) => void;
}

export const StoreyManagerModal: React.FC<StoreyManagerModalProps> = ({
  isOpen,
  onClose,
  storeys,
  activeStoreyId,
  onSelectStorey,
  onAddStorey,
  onUpdateStorey,
  onDeleteStorey,
}) => {
  const [newStoreyName, setNewStoreyName] = useState<string>('');
  const [newLevelM, setNewLevelM] = useState<number>(3.6);
  const [newHeightM, setNewHeightM] = useState<number>(3.6);
  const [newCutPlaneM, setNewCutPlaneM] = useState<number>(1.2);
  const [newCutDirection, setNewCutDirection] = useState<'down' | 'up'>('down');

  if (!isOpen) return null;

  const handleCreate = () => {
    const name = newStoreyName.trim() || `Tầng ${storeys.length + 1}`;
    const levelMm = Math.round(newLevelM * 1000);
    const heightMm = Math.round(newHeightM * 1000);
    const cutPlaneHeightMm = Math.round(newCutPlaneM * 1000);

    const newStorey: Storey = {
      id: 'st_' + Date.now(),
      name,
      levelMm,
      heightMm,
      cutPlaneHeightMm,
      cutDirection: newCutDirection,
    };

    onAddStorey(newStorey);
    onSelectStorey(newStorey.id);
    setNewStoreyName('');
    const nextLevel = (levelMm + heightMm) / 1000;
    setNewLevelM(nextLevel);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#181c24] border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#14171e]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Quản Lý Mặt Bằng Các Tầng</h3>
              <p className="text-xs text-slate-400">Thiết lập cao độ tầng &amp; hướng cắt mặt phẳng nhìn</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Storeys List */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Danh sách các tầng hiện hữu ({storeys.length}):
            </label>
            <div className="space-y-2">
              {storeys.map((st) => {
                const isActive = st.id === activeStoreyId;
                return (
                  <div
                    key={st.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-md'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectStorey(st.id)}
                          className={`w-4 h-4 rounded-full border flex items-center justify-center cursor-pointer ${
                            isActive ? 'border-amber-400 bg-amber-400' : 'border-slate-600'
                          }`}
                        >
                          {isActive && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                        </button>
                        <span className="font-bold text-sm text-white">{st.name}</span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                          {st.levelMm >= 0 ? `+${(st.levelMm / 1000).toFixed(3)}m` : `${(st.levelMm / 1000).toFixed(3)}m`}
                        </span>
                      </div>

                      {storeys.length > 1 && onDeleteStorey && (
                        <button
                          onClick={() => onDeleteStorey(st.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                          title="Xóa tầng này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Cut Plane details for this storey */}
                    <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400">Mặt phẳng cắt nhìn:</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <input
                            type="number"
                            step="0.1"
                            value={(st.cutPlaneHeightMm / 1000).toFixed(2)}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 1.2;
                              onUpdateStorey({ ...st, cutPlaneHeightMm: Math.round(val * 1000) });
                            }}
                            className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 font-mono text-white text-xs"
                          />
                          <span className="text-slate-500 font-mono">m từ sàn</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400">Hướng nhìn mặt cắt:</span>
                        <button
                          onClick={() => {
                            const nextDir = st.cutDirection === 'up' ? 'down' : 'up';
                            onUpdateStorey({ ...st, cutDirection: nextDir });
                          }}
                          className="mt-1 flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs cursor-pointer transition-colors"
                        >
                          {st.cutDirection === 'up' ? (
                            <>
                              <ArrowUp className="w-3.5 h-3.5 text-amber-400" />
                              <span>Nhìn lên (Trần RCP)</span>
                            </>
                          ) : (
                            <>
                              <ArrowDown className="w-3.5 h-3.5 text-sky-400" />
                              <span>Nhìn xuống (Mặt bằng)</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add New Storey Box */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <Plus className="w-4 h-4" />
              <span>THÊM MẶT BẰNG TẦNG MỚI</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-slate-400">Tên tầng:</label>
                <input
                  type="text"
                  placeholder={`VD: Tầng ${storeys.length + 1}, Tầng Lửng, Tầng Thượng...`}
                  value={newStoreyName}
                  onChange={(e) => setNewStoreyName(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400">Cao độ sàn tầng (m):</label>
                <input
                  type="number"
                  step="0.1"
                  value={newLevelM}
                  onChange={(e) => setNewLevelM(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 font-mono text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400">Chiều cao tầng (m):</label>
                <input
                  type="number"
                  step="0.1"
                  value={newHeightM}
                  onChange={(e) => setNewHeightM(parseFloat(e.target.value) || 3.3)}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 font-mono text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400">Cao độ cắt mặt bằng (m):</label>
                <input
                  type="number"
                  step="0.1"
                  value={newCutPlaneM}
                  onChange={(e) => setNewCutPlaneM(parseFloat(e.target.value) || 1.2)}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 font-mono text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400">Hướng cắt:</label>
                <button
                  type="button"
                  onClick={() => setNewCutDirection((d) => (d === 'down' ? 'up' : 'down'))}
                  className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                >
                  {newCutDirection === 'down' ? (
                    <>
                      <ArrowDown className="w-3.5 h-3.5 text-sky-400" />
                      <span>Nhìn xuống</span>
                    </>
                  ) : (
                    <>
                      <ArrowUp className="w-3.5 h-3.5 text-amber-400" />
                      <span>Nhìn lên</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handleCreate}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo &amp; Chuyển Đến Tầng Này</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#14171e] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
