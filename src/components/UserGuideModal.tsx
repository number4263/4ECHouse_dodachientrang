import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Zap,
  PenTool,
  Eraser,
  Undo2,
  Smartphone,
  Tablet,
  Download,
  Building,
  Compass,
  CheckCircle2,
  Layers,
  Keyboard,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Columns,
  DoorOpen,
  Square,
  Search,
  Pencil,
  Sparkles,
  Camera,
  Sun,
  ClipboardCheck,
  Share2,
  Scan,
  Upload,
  Spline,
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewProject?: () => void;
  onOpenLaserModal?: () => void;
  onOpenExportModal?: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenNewProject,
  onOpenLaserModal,
  onOpenExportModal,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<
    'quickstart' | 'laser' | 'tools' | 'eraser' | 'touch' | 'elevation' | 'shortcuts' | 'pro_features'
  >('quickstart');

  const tabs: { id: typeof activeTab; label: string; icon: any }[] = [
    { id: 'quickstart', label: 'Bắt Đầu Nhanh', icon: CheckCircle2 },
    { id: 'pro_features', label: 'Tính Năng Mới v2026', icon: Sparkles },
    { id: 'laser', label: 'Thước Đo Laser', icon: Zap },
    { id: 'tools', label: 'Công Cụ Vẽ CAD', icon: PenTool },
    { id: 'eraser', label: 'Công Cụ Xóa', icon: Eraser },
    { id: 'touch', label: 'iPad / iPhone & Cảm Ứng', icon: Tablet },
    { id: 'elevation', label: 'Mặt Đứng & Đo Chéo', icon: Building },
    { id: 'shortcuts', label: 'Phím Tắt Bàn Phím', icon: Keyboard },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Cẩm Nang Hướng Dẫn Sử Dụng 4ECHouse</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-bold">
                  v2026 PRO
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Khảo sát hiện trạng kiến trúc kết hợp thước đo Laser Bluetooth &amp; xuất file kỹ thuật
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-2.5 border-b border-slate-800 bg-slate-950/40 shrink-0 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800/80 border-amber-500 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs leading-relaxed">
          {/* TAB 1: BẮT ĐẦU NHANH */}
          {activeTab === 'quickstart' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-800/60 to-slate-900 border border-amber-500/30">
                <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Quy Trình Khảo Sát Hiện Trạng 4 Bước Chuẩn Chuyên Nghiệp</span>
                </h4>
                <p className="text-slate-400 text-xs">
                  Ứng dụng 4ECHouse được thiết kế dành riêng cho Kiến trúc sư và Kỹ sư để đẩy nhanh tốc độ đo đạc hiện trường lên gấp 5 lần so với ghi chép sổ tay truyền thống.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white text-xs">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[11px] font-bold">
                      1
                    </span>
                    <span>Tạo Mới Bản Vẽ &amp; Thiết Lập Hồ Sơ</span>
                  </div>
                  <p className="text-slate-400">
                    Bấm nút <strong>"+ Tạo Mới"</strong> trên thanh Header để tạo bản vẽ trống hoặc chọn mẫu phòng có sẵn. Điền tên công trình, mã số và chủ nhà.
                  </p>
                  {onOpenNewProject && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenNewProject();
                      }}
                      className="mt-1 text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Mở hộp thoại Tạo Mới</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white text-xs">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[11px] font-bold">
                      2
                    </span>
                    <span>Kết Nối Thước Đo Laser Bluetooth</span>
                  </div>
                  <p className="text-slate-400">
                    Bật Bluetooth trên thước đo laser (Bosch, Leica, Mileseey...) và nhấn nút <strong>"Thước Laser"</strong> trên góc phải màn hình để ghép nối không dây.
                  </p>
                  {onOpenLaserModal && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenLaserModal();
                      }}
                      className="mt-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Mở bảng điều khiển Laser</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white text-xs">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[11px] font-bold">
                      3
                    </span>
                    <span>Vẽ Phác Tường &amp; Bắn Số Đo Lọt Lòng</span>
                  </div>
                  <p className="text-slate-400">
                    Dùng công cụ Tường thẳng (W) vẽ sơ bộ chu vi phòng. Bấm chọn vào bức tường cần đo và bấm nút bắn tia laser trên thước, số đo thực tế sẽ cập nhật lập tức vào bản vẽ CAD!
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white text-xs">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[11px] font-bold">
                      4
                    </span>
                    <span>Xuất File In Ấn PDF, AutoCAD &amp; SketchUp</span>
                  </div>
                  <p className="text-slate-400">
                    Nhấn nút <strong>"Xuất File"</strong> để tạo bản vẽ PDF tỷ lệ kỹ thuật (1/50, 1/100, Fit) có khung tên và bảng diện tích phòng, hoặc xuất file AutoCAD (.dwg, .dxf) và 3D SketchUp (.rb).
                  </p>
                  {onOpenExportModal && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenExportModal();
                      }}
                      className="mt-1 text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Mở menu Xuất File</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: THƯỚC ĐO LASER */}
          {activeTab === 'laser' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Cách Kết Nối Thước Đo Laser Không Dây (Web Bluetooth API)</span>
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Ứng dụng 4ECHouse hỗ trợ giao thức <strong>Bluetooth LE (BLE)</strong> tiêu chuẩn mở, tương thích với hầu hết các dòng thước đo laser điện tử hiện nay:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li><strong>Bosch GLM Series</strong>: GLM 50C, GLM 100C, GLM 120C, GLM 150-27C.</li>
                  <li><strong>Leica DISTO Series</strong>: DISTO D1, D2, X3, X4, D510.</li>
                  <li><strong>Mileseey, SNDWay, Hoto, Duka</strong> và các dòng thước đo thông minh có Bluetooth.</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Trường Hợp Có Thước Laser Thật</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                    <li>Bật nguồn thước và kích hoạt biểu tượng Bluetooth trên máy.</li>
                    <li>Bấm nút <strong>"Thước Laser"</strong> trên thanh Header của 4ECHouse.</li>
                    <li>Bấm nút <strong>"Tìm &amp; Kết Nối Thước Đo BLE"</strong>.</li>
                    <li>Chọn tên thước trong danh sách trình duyệt và nhấn Pair.</li>
                    <li>Đèn trạng thái chuyển sang <strong>XANH LÁ (READY)</strong>!</li>
                  </ol>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Dùng Thước Giả Lập Ảo (Simulator)</span>
                  </div>
                  <p className="text-slate-400">
                    Nếu bạn đang ngồi văn phòng hoặc chưa có thước laser tại chỗ, mở modal Thước Laser và sử dụng bàn phím số mô phỏng để gõ số đo mm chính xác, hoặc bấm các phím tắt số đo nhanh (+100mm, -100mm, 3000mm, 4500mm...).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CÔNG CỤ VẼ CAD */}
          {activeTab === 'tools' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <h4 className="text-sm font-bold text-white mb-2">Bộ Công Cụ Vẽ &amp; Khảo Sát Kiến Trúc Đầy Đủ</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-bold text-amber-400 flex items-center gap-1.5">
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Tường Thẳng [W] &amp; Tường Cong Arc [Q]</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Vẽ tường đôi chuẩn xây dựng. Bấm điểm đầu, kéo đến điểm cuối (tự bắt góc vuông 90° và snap điểm mút). Với tường cong, bấm 3 điểm: Điểm đầu, Điểm cuối và Đỉnh độ võng cung.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-bold text-red-400 flex items-center gap-1.5">
                      <DoorOpen className="w-3.5 h-3.5" />
                      <span>Cửa Đi [D] &amp; Cửa Sổ / Vách Kính [S]</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Bấm lên bất kỳ bức tường nào để chèn cửa. Hỗ trợ tùy chỉnh số cánh (1, 2, 3, 4 cánh), hướng mở quay trong/ngoài, cửa trượt lùa và vách kính thông tầng.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <Columns className="w-3.5 h-3.5" />
                      <span>Cột Kết Cấu BTCT &amp; Thép [C]</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Đặt cột chữ nhật, cột tròn, cột thép chữ I, thép hộp hoặc hộp kỹ thuật gen âm tường.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-bold text-sky-400 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Cầu Thang Bộ Hiện Trạng [T]</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Thang thẳng, thang chữ L, thang chữ U 2 vế có chiếu nghỉ phẳng hoặc xẻ 2, 3 bậc kèm mũi tên chỉ hướng UP.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-bold text-yellow-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Ký Hiệu Điện Nước MEP [M]</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Ghi nhận vị trí ổ cắm, công tắc, tủ điện tổng DB, ống cấp nước, phễu thoát sàn, đầu báo khói theo cao độ thực tế.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-bold text-fuchsia-400 flex items-center gap-1.5">
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Bút Vẽ Note [P] &amp; Trích Chi Tiết [J]</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Vẽ tay tự do khoanh vùng nứt lún thấm dột bằng Apple Pencil hoặc ngón tay. Khoanh vòng tròn trích chi tiết tỷ lệ 1/10, 1/20.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CÔNG CỤ XÓA */}
          {activeTab === 'eraser' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                  <Eraser className="w-4 h-4" />
                  <span>Công Cụ Xóa Nhanh (Eraser Tool - Phím Tắt [E])</span>
                </h4>
                <p className="text-slate-300">
                  Công cụ Xóa được thiết kế giúp bạn dọn dẹp hoặc chỉnh sửa các đối tượng trên bản vẽ cực kỳ nhanh chóng mà không cần qua nhiều bước chọn.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center font-mono font-bold text-white shrink-0">
                    1
                  </span>
                  <div>
                    <div className="font-bold text-white">Kích hoạt Công cụ Xóa:</div>
                    <div className="text-slate-400 mt-0.5">
                      Bấm vào biểu tượng <strong>Tẩy (Eraser)</strong> trên thanh công cụ bên trái (hoặc nhấn phím <strong>E</strong> trên bàn phím). Trên điện thoại, chọn mục "Xóa" trong menu công cụ.
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center font-mono font-bold text-white shrink-0">
                    2
                  </span>
                  <div>
                    <div className="font-bold text-white">Chạm hoặc Quét để xóa tức thì:</div>
                    <div className="text-slate-400 mt-0.5">
                      Khi rê chuột qua bất kỳ đối tượng nào (tường, cửa, cột, thang, thiết bị MEP, nét bút note...), đối tượng sẽ phát sáng viền đỏ nổi bật. Bấm chuột hoặc chạm ngón tay để xóa ngay lập tức! Bạn cũng có thể giữ chuột và quét qua nhiều nét vẽ tay để xóa hàng loạt.
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center font-mono font-bold text-white shrink-0">
                    3
                  </span>
                  <div>
                    <div className="font-bold text-white">Hoàn tác an toàn (Undo / Redo):</div>
                    <div className="text-slate-400 mt-0.5">
                      Nếu lỡ tay xóa nhầm, bạn chỉ cần nhấn <strong>Ctrl + Z</strong> (hoặc bấm nút Hoàn tác trên thanh Header) để khôi phục lại trạng thái ban đầu bất cứ lúc nào!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: IPAD / IPHONE & CẢM ỨNG */}
          {activeTab === 'touch' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-sky-400 flex items-center gap-2">
                  <Tablet className="w-4 h-4" />
                  <span>Trải Nghiệm Mượt Mà Trên iPad, iPhone, Android &amp; iOS</span>
                </h4>
                <p className="text-slate-300">
                  4ECHouse tự động nhận diện thiết bị của bạn và tối ưu hóa giao diện tương ứng theo từng nền tảng:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <span>Giao Diện iPhone / Smartphone</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-400">
                    <li>Thanh điều hướng ngón tay cái dưới đáy màn hình (Bottom Nav).</li>
                    <li>Khay chọn công cụ trượt mượt mà (Bottom Sheet).</li>
                    <li>Nút <strong>"Bắn Laser"</strong> siêu to đặt ở góc dưới phải để thao tác 1 tay nhanh chóng tại công trường.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    <Tablet className="w-4 h-4 text-emerald-400" />
                    <span>Giao Diện iPad / Tablet &amp; Apple Pencil</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-400">
                    <li>Thu phóng canvas 2 ngón tay (Pinch-to-zoom) siêu mượt.</li>
                    <li>Kéo di chuyển bản vẽ bằng 2 ngón tay hoặc giữ khoảng trống.</li>
                    <li>Hỗ trợ bút cảm ứng (Apple Pencil, Samsung S-Pen) nhận diện độ chính xác cao.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: MẶT ĐỨNG & ĐO CHÉO */}
          {activeTab === 'elevation' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  <span>Trang 2: Bản Vẽ Mặt Đứng &amp; Mặt Cắt Kỹ Thuật</span>
                </h4>
                <p className="text-slate-300">
                  Nhấn vào tab <strong>"Mặt Đứng &amp; Mặt Cắt"</strong> trên thanh Header để chuyển sang không gian vẽ cao độ công trình:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li><strong>Cao độ tầng</strong>: Thêm ký hiệu mốc cao độ chuẩn kiến trúc (±0.000, +3.600, +7.200...).</li>
                  <li><strong>Dầm &amp; sàn bê tông</strong>: Thể hiện chiều dày sàn, dầm bo khung nhà.</li>
                  <li><strong>Mái dốc &amp; Mái bằng</strong>: Khảo sát độ dốc mái ngói, sê-nô thu nước.</li>
                  <li><strong>Lan can ban công</strong>: Thể hiện chiều cao tay vịn lan can kính hoặc sắt.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-sky-400 flex items-center gap-2">
                  <Compass className="w-4 h-4" />
                  <span>Kiểm Tra Góc Vuông Bằng Đo Chéo Tam Giác (Tránh Phòng Méo)</span>
                </h4>
                <p className="text-slate-300">
                  Trong xây dựng thực tế, rất ít căn nhà vuông góc 90° tuyệt đối. Tính năng đo chéo cho phép bạn:
                </p>
                <p className="text-slate-400">
                  Bắn tia laser đo 2 cạnh góc tường ($a$ và $b$), sau đó bắn tiếp 1 đường chéo ($c$) nối giữa 2 góc đối diện. Hệ thống sẽ tự động áp dụng định lý cosin để tính ra góc giao thực tế và độ lệch méo so với góc vuông 90°!
                </p>
              </div>
            </div>
          )}

          {/* TAB 7: BẢNG PHÍM TẮT */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Keyboard className="w-4 h-4 text-amber-400" />
                  <span>Bảng Tra Cứu Phím Tắt Bàn Phím Toàn Diện</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="font-sans text-slate-300">Công cụ Chọn / Đo Laser</span>
                    <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-amber-400 font-bold">V</kbd>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="font-sans text-slate-300">Công cụ XÓA (Tẩy đối tượng)</span>
                    <kbd className="px-2 py-1 bg-rose-500/20 border border-rose-500/40 rounded text-rose-400 font-bold">E</kbd>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="font-sans text-slate-300">Vẽ Tường Thẳng (Wall)</span>
                    <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-amber-400 font-bold">W</kbd>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="font-sans text-slate-300">Vẽ Tường Cong 3 Điểm (Arc)</span>
                    <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-amber-400 font-bold">Q</kbd>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="font-sans text-slate-300">Chèn Cửa Đi (Door)</span>
                    <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-amber-400 font-bold">D</kbd>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="font-sans text-slate-300">Chèn Cửa Sổ / Vách Kính</span>
                    <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-amber-400 font-bold">S</kbd>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="font-sans text-slate-300">Đặt Cột Kết Cấu (Column)</span>
                    <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-amber-400 font-bold">C</kbd>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="font-sans text-slate-300">Dựng Cầu Thang (Stair)</span>
                    <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-amber-400 font-bold">T</kbd>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="font-sans text-slate-300">Thiết Bị Điện Nước (MEP)</span>
                    <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-amber-400 font-bold">M</kbd>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="font-sans text-slate-300">Bút Vẽ Ghi Chú Hiện Trường</span>
                    <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-amber-400 font-bold">P</kbd>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="font-sans text-slate-300">Khoanh Trích Chi Tiết</span>
                    <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-amber-400 font-bold">J</kbd>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="font-sans text-slate-300">Đo Chéo Góc Tam Giác</span>
                    <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-amber-400 font-bold">X</kbd>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="font-sans text-slate-300">Hoàn Tác (Undo)</span>
                    <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-emerald-400 font-bold">Ctrl + Z</kbd>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="font-sans text-slate-300">Làm Lại (Redo)</span>
                    <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-emerald-400 font-bold">Ctrl + Y</kbd>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="font-sans text-slate-300">Hủy Lệnh / Bỏ Chọn</span>
                    <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-400 font-bold">Esc</kbd>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="font-sans text-slate-300">Xóa Đối Tượng Đang Chọn</span>
                    <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-rose-400 font-bold">Delete / Backspace</kbd>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: TÍNH NĂNG MỚI NÂNG CẤP v2026 */}
          {activeTab === 'pro_features' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200">
                  <strong className="text-amber-400 font-bold block mb-1">
                    Cẩm Nang Các Tính Năng Chuyên Sâu v2026 PRO Đã Được Tích Hợp:
                  </strong>
                  Toàn bộ các yêu cầu nâng cấp kỹ thuật mới nhất đã được đồng bộ xuyên suốt từ Bản vẽ 2D, Mặt đứng &amp; Mặt cắt, Mô hình 3D cho đến Xuất hồ sơ pháp lý.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* 1. Đo độ dốc */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-sky-400 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-sky-400" />
                    <span>1. Đo Độ Dốc Mái &amp; Sàn (Mặt Đứng/Mặt Cắt)</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Chọn công cụ "Đo Độ Dốc Mái/Sàn" và bấm 2 điểm bất kỳ trên mái hoặc sàn dốc. Hệ thống tính toán và hiển thị trực tiếp độ dốc <strong>i (%)</strong> và góc nghiêng <strong>(°)</strong> kèm tam giác độ dốc CAD chuẩn kỹ thuật.
                  </p>
                </div>

                {/* 2. Magnetic Snapping & Auto-Weld */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>2. Hút Điểm Nam Châm (20px) &amp; Tự Động Weld</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Khi vẽ tường hoặc đường thẳng, đầu mút tự động bắt dính vào điểm mút (endpoint) và điểm giữa (midpoint) của tường hiện có trong bán kính 20px. Góc giao của các bức tường được tự động Weld lấp đầy thành một khối liền mạch.
                  </p>
                </div>

                {/* 3. Khung bao cửa tùy chỉnh */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <DoorOpen className="w-4 h-4 text-amber-400" />
                    <span>3. Bề Dày Khung Bao Cửa &amp; Vách Kính</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Kí hiệu cửa đi, cửa sổ, vách kính nay có bảng tùy chỉnh bề dày khung bao: chọn nhanh các mốc tiêu chuẩn <strong>45mm, 50mm, 60mm, 80mm, 100mm</strong> hoặc nhập số mm tùy chỉnh trực tiếp.
                  </p>
                </div>

                {/* 4. Tường cong sagitta & chord */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Spline className="w-4 h-4 text-amber-400" />
                    <span>4. Tường Cong: Độ Võng Cung &amp; Dây Cung</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Bán kính cong R được tính toán từ kích thước độ võng cung (sagitta h) và chiều dài dây cung (chord C) theo công thức toán học chính xác: R = h/2 + C²/(8h). Người dùng có thể nhập số thủ công để chỉnh hình dáng tường cong.
                  </p>
                </div>

                {/* 5. Cầu thang CAD nâng cao */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span>5. Block Cầu Thang: Tròn, U &amp; L Chuẩn Kỹ Thuật</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Thang tròn / cong: tùy chỉnh Bán kính trong &amp; Bán kính ngoài. Thang U: tùy chỉnh vế thang giữa 2 chiếu nghỉ (3 vế). Thang L: xẻ chiếu nghỉ với tâm xẻ xuất phát chính xác từ góc trong giao giữa 2 vế thang.
                  </p>
                </div>

                {/* 6. Trích chi tiết Drafting */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-amber-400" />
                    <span>6. View Trích Chi Tiết: Vẽ Tay, Note &amp; Snap 20px</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Trang Trích chi tiết tích hợp canvas đồ họa: bút vẽ tay, đoạn thẳng kỹ thuật, note ghi chú có chân dóng, công cụ tẩy xóa và hoàn tác Undo/Redo. Đầu mút của các nét mới vẽ tự động căn chỉnh Snap 20px vào nét cũ.
                  </p>
                </div>

                {/* 7. Giàn thép mái TCVN */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-orange-400 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-orange-400" />
                    <span>7. Lan Can &amp; Giàn Thép Mái (TCVN 5575)</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Vẽ lan can và vẽ mái ngay trên view Mặt bằng, đồng bộ trực tiếp sang Mặt đứng &amp; Mô hình 3D. Tùy chọn khung thép mái hình tam giác, hình thang, hình chữ nhật với hệ giằng thép kỹ thuật Pratt, Warren hoặc Howe.
                  </p>
                </div>

                {/* 8. Tạo mới bản vẽ & Setting ẩn */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-violet-400 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-violet-400" />
                    <span>8. Tạo Mới: Tải Mặt Bằng, LiDAR &amp; Setting Ẩn</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Thêm 2 cách khởi tạo: "Tải mặt bằng lên" (ảnh/PDF/CAD đồ lại) và "Quét LiDAR 3D" (đám mây điểm TOF). Mục "Setting Ẩn" hỗ trợ xem mặt bằng đã nhận, khôi phục bản lưu tự động khẩn cấp và xuất link chuyển giao mặt bằng.
                  </p>
                </div>

                {/* 9. Xuất hồ sơ chuyên sâu */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-rose-400 flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-rose-400" />
                    <span>9. Xuất Hồ Sơ: Render 4K, Nắng Gắt &amp; Biên Bản</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Hộp thoại Xuất hồ sơ nay có: Phối cảnh ảnh render 4K, Phân tích hướng nắng &amp; bức xạ nhiệt mặt trời QCVN 09, Biên bản nghiệm thu khảo sát hiện trạng TCVN có chữ ký pháp lý, và liên kết chia sẻ dự án qua mã QR Code.
                  </p>
                </div>

                {/* 10. View khác - Panorama 720° */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>10. View Khác: Chụp Nhanh &amp; Panorama 720°</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Toolbox công cụ đa năng: Chụp nhanh snapshot độ nét cao, tương tác Panorama 720° góc xoay 360x180°, thư viện vật liệu VR, quản lý danh mục vật liệu và cài đặt thương hiệu (logo, avatar, số điện thoại, tên công ty).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SHORTCUTS */}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/70 shrink-0 text-xs">
          <span className="text-slate-400 hidden sm:inline">
            Ứng dụng 4ECHouse - Hỗ trợ kỹ thuật: <strong>support@4echouse.vn</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer ml-auto"
          >
            Đã Hiểu &amp; Bắt Đầu
          </button>
        </div>
      </div>
    </div>
  );
};
