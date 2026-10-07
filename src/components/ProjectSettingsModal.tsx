import React, { useState } from 'react';
import { X, Building, Check, FolderOpen, RefreshCcw } from 'lucide-react';
import { ProjectData } from '../types/cad';
import { SAMPLE_PROJECTS } from '../data/sampleProjects';

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectData;
  onUpdateProjectInfo: (info: Partial<ProjectData>) => void;
  onLoadTemplate: (template: ProjectData) => void;
  onResetProject: () => void;
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateProjectInfo,
  onLoadTemplate,
  onResetProject,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: project.name,
    projectCode: project.projectCode,
    clientName: project.clientName,
    address: project.address,
    surveyor: project.surveyor,
    surveyDate: project.surveyDate,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProjectInfo(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <Building className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-white">Thông Tin Hồ Sơ &amp; Mẫu Khảo Sát</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Tên công trình / Hạng mục:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Mã hiệu bản vẽ:</label>
                <input
                  type="text"
                  value={formData.projectCode}
                  onChange={(e) => setFormData({ ...formData, projectCode: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Chủ đầu tư / Chủ nhà:</label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Địa chỉ công trình:</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">KTS / Cán bộ đo đạc:</label>
                <input
                  type="text"
                  value={formData.surveyor}
                  onChange={(e) => setFormData({ ...formData, surveyor: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Ngày khảo sát:</label>
                <input
                  type="text"
                  value={formData.surveyDate}
                  onChange={(e) => setFormData({ ...formData, surveyDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow"
            >
              Lưu Thông Tin Bản Vẽ
            </button>
          </form>

          {/* Preset Sample Projects */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <FolderOpen className="w-4 h-4 text-amber-500" />
              <span>Nạp Dự Án Khảo Sát Mẫu Điển Hình:</span>
            </div>

            <div className="grid gap-2">
              {SAMPLE_PROJECTS.map((sample) => (
                <div
                  key={sample.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{sample.name}</div>
                    <div className="text-[11px] text-slate-400">
                      {sample.walls.length} tường · {sample.openings.length} cửa · {sample.rooms.length} phòng
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onLoadTemplate(sample);
                      onClose();
                    }}
                    className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer font-medium"
                  >
                    Nạp mẫu này
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
