import React, { useState } from 'react';
import {
  Camera,
  Compass,
  Layers,
  Settings,
  Image,
  User,
  Phone,
  Building,
  Upload,
  Plus,
  Trash2,
  Check,
  RotateCw,
  Eye,
  Sparkles,
  Download,
  FolderOpen,
  Palette,
  Maximize2,
  Share2,
} from 'lucide-react';
import {
  PanoramaCompanySettings,
  PanoramaMaterialItem,
  PanoramaSceneItem,
  ProjectData,
} from '../types/cad';

interface OtherViewsToolboxProps {
  project: ProjectData;
  onTakeSnapshot?: () => void;
}

const DEFAULT_MATERIALS: PanoramaMaterialItem[] = [
  { id: 'mat_1', name: 'Gỗ Sồi Tự Nhiên (Oak Wood)', category: 'Gỗ lát sàn & Nội thất', thumbnail: '🪵', roughness: 0.35, color: '#b48a58' },
  { id: 'mat_2', name: 'Đá Marble Trắng Vân Mây (Calacatta)', category: 'Đá ốp lát cao cấp', thumbnail: '🏛️', roughness: 0.12, color: '#f8fafc' },
  { id: 'mat_3', name: 'Gạch Terrazzo Hạt Nhỏ', category: 'Gạch lát nền hiện đại', thumbnail: '🧱', roughness: 0.45, color: '#cbd5e1' },
  { id: 'mat_4', name: 'Sơn Bê Tông Mài Hiệu Ứng', category: 'Sơn tường nghệ thuật', thumbnail: '🎨', roughness: 0.65, color: '#94a3b8' },
  { id: 'mat_5', name: 'Kính Cường Lực Siêu Trong (Ultra Clear)', category: 'Kính & Vách ngăn', thumbnail: '🪟', roughness: 0.05, color: '#38bdf8' },
  { id: 'mat_6', name: 'Kim Loại Đen Mờ Anode (Matte Black)', category: 'Khung cửa & Phụ kiện', thumbnail: '⚙️', roughness: 0.28, color: '#1e293b' },
];

const DEFAULT_SCENES: PanoramaSceneItem[] = [
  {
    id: 'sc_1',
    title: 'Phòng Khách & Bếp Mở',
    roomName: 'Khu vực sinh hoạt chung',
    fov: 75,
    yaw: 45,
    pitch: 0,
    imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
    hotspotsCount: 3,
  },
  {
    id: 'sc_2',
    title: 'Phòng Ngủ Master',
    roomName: 'Không gian nghỉ ngơi',
    fov: 75,
    yaw: 120,
    pitch: -5,
    imageUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
    hotspotsCount: 2,
  },
  {
    id: 'sc_3',
    title: 'Ban Công View Toàn Cảnh',
    roomName: 'Sân vườn ngoài trời',
    fov: 80,
    yaw: 0,
    pitch: 10,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    hotspotsCount: 4,
  },
];

export const OtherViewsToolbox: React.FC<OtherViewsToolboxProps> = ({ project, onTakeSnapshot }) => {
  // Main sub-view: 'snapshot' | 'panorama'
  const [activeMainTool, setActiveMainTool] = useState<'snapshot' | 'panorama'>('panorama');

  // Panorama Subtabs: 'materials' | 'scenes' | 'settings' | 'material_manager'
  const [activePanoTab, setActivePanoTab] = useState<'scenes' | 'materials' | 'settings' | 'material_manager'>('scenes');

  // Snapshot options state
  const [snapshotAspect, setSnapshotAspect] = useState<'16:9' | '4:3' | '1:1'>('16:9');
  const [snapshotResolution, setSnapshotResolution] = useState<'1080p' | '2k' | '4k'>('1080p');
  const [includeWatermark, setIncludeWatermark] = useState<boolean>(true);
  const [snapshotSuccess, setSnapshotSuccess] = useState<boolean>(false);

  // Panorama items state
  const [scenes, setScenes] = useState<PanoramaSceneItem[]>(DEFAULT_SCENES);
  const [activeSceneId, setActiveSceneId] = useState<string>(DEFAULT_SCENES[0].id);
  const [yaw, setYaw] = useState<number>(DEFAULT_SCENES[0].yaw);
  const [pitch, setPitch] = useState<number>(DEFAULT_SCENES[0].pitch);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);

  // Materials state
  const [materials, setMaterials] = useState<PanoramaMaterialItem[]>(DEFAULT_MATERIALS);
  const [selectedMatCategory, setSelectedMatCategory] = useState<string>('all');
  const [newMatName, setNewMatName] = useState<string>('');
  const [newMatCategory, setNewMatCategory] = useState<string>('Gỗ lát sàn & Nội thất');

  // Company / Branding Settings state
  const [companySettings, setCompanySettings] = useState<PanoramaCompanySettings>({
    bgLogoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    contactPerson: project.surveyor || 'KTS. Nguyễn Quốc Trần',
    phone: '0988 123 456',
    companyName: '4ECHouse Architecture & Surveying',
  });
  const [savedSettingsSuccess, setSavedSettingsSuccess] = useState<boolean>(false);

  const activeScene = scenes.find((s) => s.id === activeSceneId) || scenes[0];

  const handleTakeQuickSnapshot = () => {
    setSnapshotSuccess(true);
    if (onTakeSnapshot) onTakeSnapshot();
    setTimeout(() => setSnapshotSuccess(false), 3000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSettingsSuccess(true);
    setTimeout(() => setSavedSettingsSuccess(false), 2500);
  };

  const handleAddNewMaterial = () => {
    if (!newMatName.trim()) return;
    const item: PanoramaMaterialItem = {
      id: 'mat_' + Date.now(),
      name: newMatName.trim(),
      category: newMatCategory,
      thumbnail: '✨',
      roughness: 0.3,
      color: '#e2e8f0',
    };
    setMaterials((prev) => [item, ...prev]);
    setNewMatName('');
  };

  return (
    <div className="flex-1 w-full h-full bg-[#13161c] text-slate-200 overflow-y-auto flex flex-col">
      {/* Top Banner & Main Mode Switcher */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-white">TRANG VIEW KHÁC - Toolbox → Công cụ</h2>
            <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-semibold">
              4ECHouse Multi-View
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Không gian làm việc mở rộng: Chụp nhanh phối cảnh và trình diễn Panorama 720° VR thực tế ảo
          </p>
        </div>

        {/* Primary Tool Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveMainTool('snapshot')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeMainTool === 'snapshot'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Chụp Nhanh</span>
          </button>
          <button
            onClick={() => setActiveMainTool('panorama')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeMainTool === 'panorama'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Panorama 720° VR</span>
          </button>
        </div>
      </div>

      {/* BODY CONTENT */}
      {activeMainTool === 'snapshot' ? (
        /* TOOL 1: CHỤP NHANH */
        <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Simulated Live Camera Preview */}
            <div className="lg:col-span-2 space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl aspect-video flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80"
                  alt="Snapshot Frame"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Viewfinder crosshairs */}
                <div className="absolute inset-6 border border-white/20 pointer-events-none rounded-lg flex flex-col justify-between p-3">
                  <div className="flex justify-between text-[11px] font-mono text-white/70">
                    <span>FRAME [{snapshotAspect}]</span>
                    <span>RES: {snapshotResolution.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-end text-[11px] font-mono text-white/70">
                    <span>4ECHOUSE SURVEY CAMERA</span>
                    <span>ISO 100 · 24mm F2.8</span>
                  </div>
                </div>

                {includeWatermark && (
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] text-white border border-white/10 flex items-center gap-2">
                    <span className="font-bold text-amber-400">4ECHouse CAD</span>
                    <span>·</span>
                    <span>{project.projectCode}</span>
                  </div>
                )}
              </div>

              {snapshotSuccess && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Đã chụp ảnh nhanh thành công! Ảnh độ phân giải cao đã được tải về.</span>
                </div>
              )}
            </div>

            {/* Right: Snapshot Controls */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-500" />
                <span>Tùy Chọn Chụp Nhanh</span>
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Tỷ lệ khung hình (Aspect Ratio):</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['16:9', '4:3', '1:1'] as const).map((asp) => (
                    <button
                      key={asp}
                      onClick={() => setSnapshotAspect(asp)}
                      className={`py-1.5 text-xs rounded-lg border font-mono transition-colors ${
                        snapshotAspect === asp
                          ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                          : 'bg-slate-950 border-slate-700 text-slate-300'
                      }`}
                    >
                      {asp}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Độ phân giải xuất ảnh:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['1080p', '2k', '4k'] as const).map((res) => (
                    <button
                      key={res}
                      onClick={() => setSnapshotResolution(res)}
                      className={`py-1.5 text-xs rounded-lg border font-mono transition-colors ${
                        snapshotResolution === res
                          ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                          : 'bg-slate-950 border-slate-700 text-slate-300'
                      }`}
                    >
                      {res.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-300">Đính kèm Watermark công trình:</span>
                <input
                  type="checkbox"
                  checked={includeWatermark}
                  onChange={(e) => setIncludeWatermark(e.target.checked)}
                  className="accent-amber-500 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleTakeQuickSnapshot}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer transition-transform active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>CHỤP VÀ TẢI ẢNH NGAY</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TOOL 2: PANORAMA 720° */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sub Navigation Bar for Panorama */}
          <div className="bg-slate-950/70 border-b border-slate-800 px-6 flex items-center gap-2 overflow-x-auto shrink-0">
            {[
              { id: 'scenes', label: '+ Tác phẩm panorama', icon: Sparkles },
              { id: 'materials', label: '+ Vật liệu panorama', icon: Palette },
              { id: 'material_manager', label: '+ Quản lý vật liệu', icon: Layers },
              { id: 'settings', label: '+ Cài đặt (Thương hiệu)', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activePanoTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActivePanoTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'border-amber-500 text-amber-400 bg-slate-900/50'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Panorama Sub-views Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* SUBTAB 1: TÁC PHẨM PANORAMA */}
            {activePanoTab === 'scenes' && (
              <div className="max-w-6xl mx-auto space-y-6">
                {/* 720° Simulated Interactive Spherical Viewport */}
                <div className="relative w-full aspect-[21/9] sm:aspect-[2/1] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl group">
                  <img
                    src={activeScene.imageUrl}
                    alt={activeScene.title}
                    style={{
                      transform: `scale(1.25) rotateY(${yaw}deg) translateY(${pitch}px)`,
                      transition: isAutoRotate ? 'transform 0.5s ease-out' : 'none',
                    }}
                    className="w-full h-full object-cover transition-transform"
                  />
                  <div className="absolute inset-0 bg-radial-gradient pointer-events-none" />

                  {/* Top Overlay Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-white">{activeScene.title}</span>
                    <span className="text-slate-400">· {activeScene.roomName}</span>
                  </div>

                  {/* Hotspots simulation */}
                  <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2">
                    <button className="flex items-center gap-1.5 bg-amber-500/90 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-full text-[11px] shadow-lg animate-bounce cursor-pointer">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem Điểm Hotspot A</span>
                    </button>
                  </div>
                  <div className="absolute top-2/3 right-1/4 -translate-x-1/2 -translate-y-1/2">
                    <button className="flex items-center gap-1.5 bg-sky-500/90 hover:bg-sky-400 text-slate-950 font-bold px-3 py-1.5 rounded-full text-[11px] shadow-lg cursor-pointer">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Chi tiết cửa trượt</span>
                    </button>
                  </div>

                  {/* Bottom Navigation & Orbit Controls */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 backdrop-blur px-4 py-2 rounded-2xl border border-white/15 text-xs">
                    <button
                      onClick={() => setYaw((y) => y - 30)}
                      className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
                      title="Xoay trái"
                    >
                      <RotateCw className="w-4 h-4 -scale-x-100" />
                    </button>
                    <button
                      onClick={() => setYaw((y) => y + 30)}
                      className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
                      title="Xoay phải"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                    <span className="h-4 w-px bg-white/20 mx-1" />
                    <button
                      onClick={() => setIsAutoRotate(!isAutoRotate)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        isAutoRotate ? 'bg-amber-500 text-slate-950' : 'bg-white/10 text-white'
                      }`}
                    >
                      {isAutoRotate ? 'Tự Xoay 720° ON' : 'Tự Xoay OFF'}
                    </button>
                    <span className="text-[11px] font-mono text-slate-300 ml-2">Góc nhìn: {yaw}°</span>
                  </div>
                </div>

                {/* Scene Selector Grid */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Danh Sách Tác Phẩm Panorama Trong Công Trình ({scenes.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {scenes.map((sc) => (
                      <div
                        key={sc.id}
                        onClick={() => {
                          setActiveSceneId(sc.id);
                          setYaw(sc.yaw);
                          setPitch(sc.pitch);
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          sc.id === activeSceneId
                            ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="aspect-video rounded-lg overflow-hidden mb-2">
                          <img src={sc.imageUrl} alt={sc.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="font-bold text-xs text-amber-400">{sc.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{sc.roomName}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 2: VẬT LIỆU PANORAMA */}
            {activePanoTab === 'materials' && (
              <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Palette className="w-4 h-4 text-amber-500" />
                    <span>Bộ Sưu Tập Vật Liệu Panorama &amp; VR Reality</span>
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs">
                    <button
                      onClick={() => setSelectedMatCategory('all')}
                      className={`px-3 py-1 rounded-lg border text-xs ${
                        selectedMatCategory === 'all'
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                          : 'bg-slate-900 text-slate-300 border-slate-700'
                      }`}
                    >
                      Tất cả ({materials.length})
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {materials.map((mat) => (
                    <div
                      key={mat.id}
                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center text-xl">
                          {mat.thumbnail}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-slate-600 inline-block"
                            style={{ backgroundColor: mat.color }}
                          />
                          <span>Độ bóng: {mat.roughness}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{mat.name}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{mat.category}</p>
                      </div>
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <span>PBR Realistic Shader</span>
                        <span className="text-amber-400 font-medium">Sẵn sàng áp VR</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBTAB 3: QUẢN LÝ VẬT LIỆU */}
            {activePanoTab === 'material_manager' && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-500" />
                    <span>Thêm Mới &amp; Quản Lý Vật Liệu Panorama</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-slate-400">Tên vật liệu mới:</label>
                      <input
                        type="text"
                        value={newMatName}
                        onChange={(e) => setNewMatName(e.target.value)}
                        placeholder="VD: Gạch thẻ gốm đỏ, Sơn giả đá vân vàng..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Danh mục vật liệu:</label>
                      <select
                        value={newMatCategory}
                        onChange={(e) => setNewMatCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="Gỗ lát sàn & Nội thất">Gỗ lát sàn &amp; Nội thất</option>
                        <option value="Đá ốp lát cao cấp">Đá ốp lát cao cấp</option>
                        <option value="Gạch lát nền hiện đại">Gạch lát nền hiện đại</option>
                        <option value="Sơn tường nghệ thuật">Sơn tường nghệ thuật</option>
                        <option value="Kính & Vách ngăn">Kính &amp; Vách ngăn</option>
                        <option value="Khung cửa & Phụ kiện">Khung cửa &amp; Phụ kiện</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={handleAddNewMaterial}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Lưu Vật Liệu Vào Danh Mục</span>
                  </button>
                </div>

                {/* Materials List Table */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-800 font-bold text-xs text-white">
                    Bảng Danh Sách Vật Liệu Đang Quản Lý
                  </div>
                  <div className="divide-y divide-slate-800 text-xs">
                    {materials.map((m) => (
                      <div key={m.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/40">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{m.thumbnail}</span>
                          <div>
                            <div className="font-semibold text-white">{m.name}</div>
                            <div className="text-[11px] text-slate-400">{m.category}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => setMaterials((prev) => prev.filter((it) => it.id !== m.id))}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded"
                          title="Xóa vật liệu"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 4: CÀI ĐẶT (THƯƠNG HIỆU / CÔNG TY) */}
            {activePanoTab === 'settings' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Settings className="w-4 h-4 text-amber-500" />
                      <span>Cài Đặt Hồ Sơ Thương Hiệu &amp; Trình Diễn Panorama</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Các thông tin này sẽ hiển thị trên góc giao diện xoay 720° khi gửi link cho khách hàng &amp; đối tác
                    </p>
                  </div>

                  {/* 1. Hình nền / Logo */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">Hình nền / Logo công ty (URL):</label>
                    <input
                      type="text"
                      value={companySettings.bgLogoUrl}
                      onChange={(e) => setCompanySettings({ ...companySettings, bgLogoUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  {/* 2. Ảnh đại diện */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">Ảnh đại diện (Avatar KTS phụ trách):</label>
                    <input
                      type="text"
                      value={companySettings.avatarUrl}
                      onChange={(e) => setCompanySettings({ ...companySettings, avatarUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  {/* 3. Người liên hệ */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">Người liên hệ:</label>
                    <input
                      type="text"
                      value={companySettings.contactPerson}
                      onChange={(e) => setCompanySettings({ ...companySettings, contactPerson: e.target.value })}
                      placeholder="VD: KTS. Nguyễn Văn A"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  {/* 4. Số điện thoại */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">Số điện thoại:</label>
                    <input
                      type="text"
                      value={companySettings.phone}
                      onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                      placeholder="VD: 0988 123 456"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  {/* 5. Tên công ty */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">Tên công ty / Studio kiến trúc:</label>
                    <input
                      type="text"
                      value={companySettings.companyName}
                      onChange={(e) => setCompanySettings({ ...companySettings, companyName: e.target.value })}
                      placeholder="VD: 4ECHouse Architecture"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  {savedSettingsSuccess && (
                    <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Đã lưu cài đặt thông tin thương hiệu thành công!</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
                    >
                      Lưu Cài Đặt Panorama
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
