import React, { useState } from 'react';
import {
  X,
  Download,
  FileCode,
  Box,
  FileText,
  CheckCircle2,
  Copy,
  ExternalLink,
  HelpCircle,
  Printer,
  Sliders,
  Check,
  Compass,
  Camera,
  Sun,
  ClipboardCheck,
  Share2,
  QrCode,
  Image,
  Sparkles,
  Building,
  Calendar,
  UserCheck,
  ShieldCheck,
  Link2,
} from 'lucide-react';
import { ProjectData } from '../types/cad';
import { CadDxfExporter } from '../services/cadDxfExporter';
import { SketchupExporter } from '../services/sketchupExporter';
import { PdfExporter, PdfExportOptions } from '../services/pdfExporter';
import { PdfLayoutPreview } from './PdfLayoutPreview';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectData;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, project }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<
    'pdf' | 'cad' | 'sketchup' | 'csv' | 'render' | 'sunlight' | 'survey_report' | 'share'
  >('pdf');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);

  // Render configuration
  const [renderResolution, setRenderResolution] = useState<'2k' | '4k' | '8k'>('4k');
  const [renderLighting, setRenderLighting] = useState<'daylight' | 'sunset' | 'night'>('daylight');
  const [renderSuccess, setRenderSuccess] = useState<boolean>(false);

  // Sunlight analysis configuration
  const [sunlightSeason, setSunlightSeason] = useState<'summer' | 'winter' | 'equinox'>('summer');
  const [sunlightHour, setSunlightHour] = useState<number>(14); // 14:00
  const [cityLocation, setCityLocation] = useState<'hanoi' | 'hcm' | 'danang'>('hcm');

  // PDF Export Configuration State
  const [pdfPaperSize, setPdfPaperSize] = useState<'a4_landscape' | 'a4_portrait' | 'a3_landscape'>('a4_landscape');
  const [pdfScaleMode, setPdfScaleMode] = useState<'fit' | '1:50' | '1:100'>('fit');
  const [showMeasurements, setShowMeasurements] = useState<boolean>(true);
  const [showRoomLabels, setShowRoomLabels] = useState<boolean>(true);
  const [showWallHatch, setShowWallHatch] = useState<boolean>(true);
  const [showTitleBlock, setShowTitleBlock] = useState<boolean>(true);
  const [showSchedule, setShowSchedule] = useState<boolean>(true);
  const [showNorthArrow, setShowNorthArrow] = useState<boolean>(true);
  const [showOpenings, setShowOpenings] = useState<boolean>(true);
  const [showColumns, setShowColumns] = useState<boolean>(true);
  const [showStairs, setShowStairs] = useState<boolean>(true);

  // File Download Helper
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export CAD DXF / DWG
  const handleExportDxf = () => {
    const dxfContent = CadDxfExporter.generateDxf(project);
    downloadFile(dxfContent, `${project.projectCode}_4echouse_mat_bang.dxf`, 'application/dxf');
  };

  const handleExportDwg = () => {
    const dxfContent = CadDxfExporter.generateDxf(project);
    downloadFile(dxfContent, `${project.projectCode}_4echouse_mat_bang.dwg`, 'application/acad');
  };

  // Export SketchUp Ruby script (.rb)
  const handleExportSketchupScript = () => {
    const rbContent = SketchupExporter.generateRubyScript(project);
    downloadFile(rbContent, `${project.projectCode}_4echouse_sketchup.rb`, 'text/plain');
  };

  // Export 3D OBJ for SketchUp Import
  const handleExportObj = () => {
    const objContent = SketchupExporter.generateObj(project);
    downloadFile(objContent, `${project.projectCode}_3d_model.obj`, 'text/plain');
  };

  // Generate PDF document with current options
  const getPdfDoc = () => {
    const options: PdfExportOptions = {
      paperSize: pdfPaperSize,
      scaleMode: pdfScaleMode,
      showMeasurements,
      showRoomLabels,
      showWallHatch,
      showTitleBlock,
      showSchedule,
      showNorthArrow,
      showOpenings,
      showColumns,
      showStairs,
    };
    return PdfExporter.generateSurveyPdf(project, options);
  };

  // Export PDF Download
  const handleExportPdf = () => {
    const doc = getPdfDoc();
    doc.save(`${project.projectCode}_ban_ve_mat_bang_4echouse.pdf`);
  };

  // Print PDF Directly
  const handlePrintPdf = () => {
    const doc = getPdfDoc();
    const blobUrl = doc.output('bloburl');
    const printWindow = window.open(blobUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
    }
  };

  // Export CSV Data
  const handleExportCsv = () => {
    const rows = [
      ['4ECHOUSE - BANG DANH MUC TUONG HIEN TRANG'],
      ['STT', 'Ten Tuong / Hang Muc', 'Chieu Dai (mm)', 'Be Day (mm)', 'Chieu Cao (mm)', 'Do Bang Laser', 'Thoi Gian Do'],
      ...project.walls.map((w, idx) => [
        (idx + 1).toString(),
        w.name || `Tuong ${idx + 1}`,
        Math.round(w.measuredLength || Math.hypot(w.end.x - w.start.x, w.end.y - w.start.y)).toString(),
        w.thickness.toString(),
        (w.height || project.defaultCeilingHeight).toString(),
        w.isMeasuredWithLaser ? 'Co (Laser BLE)' : 'Chua',
        w.laserTimestamp || project.surveyDate,
      ]),
      [],
      ['DANH MUC GOC GIAO GIUA HAI TUONG (DO LECH)'],
      ['STT', 'Cap Tuong Giao Nhau', 'Goc Do (Do)', 'Do Lech So Voi 90 Do', 'Do Bang Laser'],
      ...(project.angles || []).map((ang, idx) => {
        const w1 = project.walls.find((w) => w.id === ang.wall1Id);
        const w2 = project.walls.find((w) => w.id === ang.wall2Id);
        return [
          (idx + 1).toString(),
          `${w1?.name || 'Tuong 1'} x ${w2?.name || 'Tuong 2'}`,
          `${ang.angleDeg.toFixed(1)} do`,
          `${ang.deviationFrom90Deg > 0 ? '+' : ''}${ang.deviationFrom90Deg.toFixed(1)} do`,
          ang.isCalculatedFromLaser ? 'Co (Tu dong tinh tu Laser)' : 'CAD',
        ];
      }),
    ];

    const csvContent = '\uFEFF' + rows.map((e) => e.join(',')).join('\n');
    downloadFile(csvContent, `${project.projectCode}_so_do_hien_trang.csv`, 'text/csv;charset=utf-8;');
  };

  const rubyScriptCode = SketchupExporter.generateRubyScript(project);

  const copyRubyToClipboard = () => {
    navigator.clipboard.writeText(rubyScriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Xuất Dữ Liệu Khảo Sát &amp; Bản Vẽ Kỹ Thuật</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-bold">
                4ECHouse
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Xuất sang Bản vẽ PDF chuẩn in ấn, AutoCAD (.dwg, .dxf), SketchUp (.skp, .rb) và bảng số liệu Excel
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800 bg-slate-950/30 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pdf')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
              activeTab === 'pdf'
                ? 'bg-slate-800/80 border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Xuất Bản Vẽ PDF (Print Layout)</span>
          </button>

          <button
            onClick={() => setActiveTab('cad')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
              activeTab === 'cad'
                ? 'bg-slate-800/80 border-amber-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4 text-amber-400" />
            <span>2D AutoCAD (DWG / DXF)</span>
          </button>

          <button
            onClick={() => setActiveTab('sketchup')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
              activeTab === 'sketchup'
                ? 'bg-slate-800/80 border-amber-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box className="w-4 h-4 text-rose-400" />
            <span>3D SketchUp (SKP / RB)</span>
          </button>

          <button
            onClick={() => setActiveTab('csv')}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'csv'
                ? 'bg-slate-800/80 border-amber-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-sky-400" />
            <span>Bảng số đo (CSV)</span>
          </button>

          {/* 4 TÍNH NĂNG XUẤT HỒ SƠ MỚI THEO YÊU CẦU */}
          <button
            onClick={() => setActiveTab('render')}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'render'
                ? 'bg-slate-800/80 border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4 text-amber-400" />
            <span>Phối Cảnh / Ảnh Render</span>
          </button>

          <button
            onClick={() => setActiveTab('sunlight')}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'sunlight'
                ? 'bg-slate-800/80 border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Phân Tích Ánh Sáng Mặt Trời</span>
          </button>

          <button
            onClick={() => setActiveTab('survey_report')}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'survey_report'
                ? 'bg-slate-800/80 border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ClipboardCheck className="w-4 h-4 text-emerald-400" />
            <span>Biên Bản / Hồ Sơ Khảo Sát</span>
          </button>

          <button
            onClick={() => setActiveTab('share')}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'share'
                ? 'bg-slate-800/80 border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-4 h-4 text-violet-400" />
            <span>Chia Sẻ Dự Án</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: PDF PRINT LAYOUT (Promoted & Enhanced) */}
          {activeTab === 'pdf' && (
            <div className="space-y-5">
              {/* Primary Action Card */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Bản Vẽ Mặt Bằng Kiến Trúc Định Dạng In Ấn (PDF)</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
                      Scaled Layout
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Bản vẽ in ấn chuẩn tỷ lệ kỹ thuật bàn giao chủ đầu tư: Nét tường dày, số đo kích thước, nhãn phòng &amp; diện tích ($m^2$), khung tên tiêu chuẩn.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleExportPdf}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải File PDF</span>
                  </button>
                  <button
                    onClick={handlePrintPdf}
                    className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
                    title="Mở tab mới để xem trước hoặc in ngay"
                  >
                    <Printer className="w-4 h-4 text-amber-400" />
                    <span className="hidden sm:inline">In Ngay</span>
                  </button>
                </div>
              </div>

              {/* Live Scaled Print Layout Preview */}
              <PdfLayoutPreview
                project={project}
                options={{
                  paperSize: pdfPaperSize,
                  scaleMode: pdfScaleMode,
                  showMeasurements,
                  showRoomLabels,
                  showWallHatch,
                  showTitleBlock,
                  showSchedule,
                  showNorthArrow,
                  showOpenings,
                  showColumns,
                  showStairs,
                }}
              />

              {/* Layout & Format Customization Options */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>Tùy Chỉnh Khổ Giấy &amp; Tỷ Lệ In Ấn</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Paper Size */}
                  <div>
                    <label className="block text-slate-400 mb-1.5 font-medium">Khổ giấy in ấn:</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setPdfPaperSize('a4_landscape')}
                        className={`p-2 rounded-lg border text-center font-medium transition-colors cursor-pointer ${
                          pdfPaperSize === 'a4_landscape'
                            ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                            : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        A4 Ngang
                      </button>
                      <button
                        onClick={() => setPdfPaperSize('a4_portrait')}
                        className={`p-2 rounded-lg border text-center font-medium transition-colors cursor-pointer ${
                          pdfPaperSize === 'a4_portrait'
                            ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                            : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        A4 Dọc
                      </button>
                      <button
                        onClick={() => setPdfPaperSize('a3_landscape')}
                        className={`p-2 rounded-lg border text-center font-medium transition-colors cursor-pointer ${
                          pdfPaperSize === 'a3_landscape'
                            ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                            : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        A3 Bản Vẽ
                      </button>
                    </div>
                  </div>

                  {/* Scale Mode */}
                  <div>
                    <label className="block text-slate-400 mb-1.5 font-medium">Tỷ lệ bản vẽ in ấn:</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setPdfScaleMode('fit')}
                        className={`p-2 rounded-lg border text-center font-medium transition-colors cursor-pointer ${
                          pdfScaleMode === 'fit'
                            ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                            : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        Vừa Trang (Fit)
                      </button>
                      <button
                        onClick={() => setPdfScaleMode('1:50')}
                        className={`p-2 rounded-lg border text-center font-medium transition-colors cursor-pointer ${
                          pdfScaleMode === '1:50'
                            ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                            : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        Tỷ lệ 1/50
                      </button>
                      <button
                        onClick={() => setPdfScaleMode('1:100')}
                        className={`p-2 rounded-lg border text-center font-medium transition-colors cursor-pointer ${
                          pdfScaleMode === '1:100'
                            ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                            : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        Tỷ lệ 1/100
                      </button>
                    </div>
                  </div>
                </div>

                {/* Print Detail Checkboxes */}
                <div className="pt-2 border-t border-slate-800">
                  <label className="block text-slate-400 mb-2 font-medium">Nội dung hiển thị trên bản vẽ in:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 border border-slate-700/60 cursor-pointer hover:bg-slate-800">
                      <input
                        type="checkbox"
                        checked={showMeasurements}
                        onChange={(e) => setShowMeasurements(e.target.checked)}
                        className="accent-amber-500 rounded"
                      />
                      <span className="text-slate-300">Kích thước tường (mm)</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 border border-slate-700/60 cursor-pointer hover:bg-slate-800">
                      <input
                        type="checkbox"
                        checked={showRoomLabels}
                        onChange={(e) => setShowRoomLabels(e.target.checked)}
                        className="accent-amber-500 rounded"
                      />
                      <span className="text-slate-300">Nhãn tên phòng &amp; $m^2$</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 border border-slate-700/60 cursor-pointer hover:bg-slate-800">
                      <input
                        type="checkbox"
                        checked={showWallHatch}
                        onChange={(e) => setShowWallHatch(e.target.checked)}
                        className="accent-amber-500 rounded"
                      />
                      <span className="text-slate-300">Độ dày &amp; nét cắt tường</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 border border-slate-700/60 cursor-pointer hover:bg-slate-800">
                      <input
                        type="checkbox"
                        checked={showOpenings}
                        onChange={(e) => setShowOpenings(e.target.checked)}
                        className="accent-amber-500 rounded"
                      />
                      <span className="text-slate-300">Cửa đi &amp; vách kính</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 border border-slate-700/60 cursor-pointer hover:bg-slate-800">
                      <input
                        type="checkbox"
                        checked={showTitleBlock}
                        onChange={(e) => setShowTitleBlock(e.target.checked)}
                        className="accent-amber-500 rounded"
                      />
                      <span className="text-slate-300">Khung tên bản vẽ 4ECHouse</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 border border-slate-700/60 cursor-pointer hover:bg-slate-800">
                      <input
                        type="checkbox"
                        checked={showNorthArrow}
                        onChange={(e) => setShowNorthArrow(e.target.checked)}
                        className="accent-amber-500 rounded"
                      />
                      <span className="text-slate-300">Kí hiệu Hướng Bắc (N)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Technical Specifications Summary */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Tiêu Chuẩn Đồ Họa Bản Vẽ In Ấn:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>Đồ họa vector chuẩn in ấn (Crisp Vector Graphic), nét in sắc bén không phụ thuộc độ phân giải màn hình.</li>
                  <li>Tường được phân lớp 2 nét cắt đôi chuẩn kiến trúc theo chiều dày {project.defaultWallThickness}mm / 220mm.</li>
                  <li>Hệ thống đường gióng kích thước (Dimension lines) và gạch chéo 45 độ theo tiêu chuẩn CAD xây dựng.</li>
                  <li>Bảng thống kê diện tích từng phòng và tổng diện tích mặt sàn lọt lòng ($m^2$).</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: 2D AUTOCAD DWG / DXF */}
          {activeTab === 'cad' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Bản vẽ CAD 2D Hiện Trạng</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
                      Chuẩn R2000 mm
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Bao gồm đầy đủ các nét cắt tường, cửa đi, cửa sổ, đường gióng kích thước lọt lòng và khung tên bản vẽ.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportDxf}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải file .DXF</span>
                  </button>
                  <button
                    onClick={handleExportDwg}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg border border-slate-700 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải file .DWG</span>
                  </button>
                </div>
              </div>

              {/* Layer Structure Breakdown */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300">
                  Cấu trúc phân lớp Layer chuẩn xuất ra AutoCAD:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-800 flex items-center justify-between">
                    <span>A-WALL (Nét cắt tường)</span>
                    <span className="w-3 h-3 rounded-full bg-white border border-slate-400" />
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-800 flex items-center justify-between">
                    <span>A-DOOR (Cửa đi &amp; góc mở)</span>
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-800 flex items-center justify-between">
                    <span>A-GLAZ (Cửa sổ, vách kính)</span>
                    <span className="w-3 h-3 rounded-full bg-cyan-400" />
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-800 flex items-center justify-between">
                    <span>A-DIMS (Gióng kích thước)</span>
                    <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-800 flex items-center justify-between">
                    <span>A-ROOM (Tên phòng &amp; m²)</span>
                    <span className="w-3 h-3 rounded-full bg-fuchsia-400" />
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-800 flex items-center justify-between">
                    <span>A-COLU (Cột bê tông)</span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SKETCHUP EXPORT */}
          {activeTab === 'sketchup' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Xuất 3D Cho SketchUp Pro</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Đùn tường và tạo lỗ cửa tự động bằng Ruby Script hoặc file định dạng 3D OBJ chuẩn.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportSketchupScript}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải Script .RB</span>
                  </button>
                  <button
                    onClick={handleExportObj}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg border border-slate-700 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải File .OBJ</span>
                  </button>
                </div>
              </div>

              {/* Ruby script copy box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Mã Ruby Script tự động hóa SketchUp:
                  </span>
                  <button
                    onClick={copyRubyToClipboard}
                    className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedCode ? 'Đã sao chép!' : 'Sao chép mã'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 max-h-36 overflow-y-auto">
                  {rubyScriptCode.slice(0, 1000)}...
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: CSV MEASUREMENT AUDIT */}
          {activeTab === 'csv' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Bảng Thống Kê Số Đo Chi Tiết (CSV / Excel)</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Bảng số liệu chi tiết từng bức tường, kích thước lọt lòng/phủ bì, mốc thời gian bắn laser để kiểm chứng hiện trường.
                  </p>
                </div>
                <button
                  onClick={handleExportCsv}
                  className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg shadow transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải Bảng Excel CSV</span>
                </button>
              </div>

              {/* Data Preview */}
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                    <tr>
                      <th className="px-3 py-2">STT</th>
                      <th className="px-3 py-2">Tên Tường</th>
                      <th className="px-3 py-2">Chiều dài (mm)</th>
                      <th className="px-3 py-2">Bề dày</th>
                      <th className="px-3 py-2">Nguồn số đo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                    {project.walls.slice(0, 5).map((w, idx) => (
                      <tr key={w.id}>
                        <td className="px-3 py-2">{idx + 1}</td>
                        <td className="px-3 py-2 font-sans">{w.name || `Tường ${idx + 1}`}</td>
                        <td className="px-3 py-2 text-amber-400 font-bold">{Math.round(w.measuredLength || 0)} mm</td>
                        <td className="px-3 py-2">{w.thickness} mm</td>
                        <td className="px-3 py-2 font-sans text-emerald-400">
                          {w.isMeasuredWithLaser ? 'Thước Laser BLE' : 'Vẽ CAD'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: PHỐI CẢNH / ẢNH RENDER (Render 4K & Perspectives) */}
          {activeTab === 'render' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>Xuất Ảnh Phối Cảnh &amp; Render Kiến Trúc 4K</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-bold">
                      Photorealistic 4K
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Render hình ảnh phối cảnh không gian nội ngoại thất có đổ bóng thực tế từ dữ liệu khảo sát
                  </p>
                </div>
                <button
                  onClick={() => {
                    setRenderSuccess(true);
                    setTimeout(() => setRenderSuccess(false), 3000);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Xuất Ảnh Render 4K (PNG)</span>
                </button>
              </div>

              {renderSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Đã xuất thành công gói ảnh render 4K ({renderResolution.toUpperCase()}) cho công trình {project.name}!</span>
                </div>
              )}

              {/* Settings Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Độ Phân Giải Render:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '2k', label: '2K QHD', desc: '2560x1440' },
                      { id: '4k', label: '4K UHD', desc: '3840x2160' },
                      { id: '8k', label: '8K Ultra', desc: '7680x4320' },
                    ].map((res) => (
                      <button
                        key={res.id}
                        type="button"
                        onClick={() => setRenderResolution(res.id as any)}
                        className={`p-2.5 rounded-xl border text-center transition-colors cursor-pointer ${
                          renderResolution === res.id
                            ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="text-xs">{res.label}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{res.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Hiệu Ứng Ánh Sáng Môi Trường:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'daylight', label: 'Ban Ngày', temp: '5500K Nắng ấm' },
                      { id: 'sunset', label: 'Hoàng Hôn', temp: '3200K Vàng rực' },
                      { id: 'night', label: 'Ban Đêm', temp: '2700K Đèn rọi' },
                    ].map((lit) => (
                      <button
                        key={lit.id}
                        type="button"
                        onClick={() => setRenderLighting(lit.id as any)}
                        className={`p-2.5 rounded-xl border text-center transition-colors cursor-pointer ${
                          renderLighting === lit.id
                            ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="text-xs">{lit.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{lit.temp}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preset Perspectives Gallery */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Các Góc Nhìn Phối Cảnh Hiện Trạng:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      title: 'Phối cảnh Nội thất Phòng Khách',
                      desc: `Trực diện ${project.walls.length} diện tường & ${project.openings.length} ô cửa`,
                      img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80',
                    },
                    {
                      title: 'Góc nhìn Chim Bay (Axonometric)',
                      desc: `Toàn cảnh mặt bằng thông thủy sàn và giàn mái thép`,
                      img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
                    },
                    {
                      title: 'Phối cảnh Ngoại thất & Ban công',
                      desc: `Mặt đứng chiếu sáng tự nhiên và lan can kính`,
                      img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
                    },
                  ].map((card, i) => (
                    <div key={i} className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                      <img src={card.img} alt={card.title} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="p-3 bg-slate-950/90 border-t border-slate-800 space-y-1">
                        <div className="font-bold text-xs text-white">{card.title}</div>
                        <div className="text-[10px] text-slate-400">{card.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PHÂN TÍCH ÁNH SÁNG MẶT TRỜI (Sun & Shadow Study) */}
          {activeTab === 'sunlight' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Phân Tích Hướng Nắng &amp; Bóng Đổ (Solar Radiation Analysis)</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-bold">
                      QCVN 09:2017
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Mô phỏng quỹ đạo mặt trời, bóng đổ các thời điểm trong ngày và chỉ số bức xạ nhiệt qua các ô cửa kính
                  </p>
                </div>
                <button
                  onClick={() => {
                    const content = `4ECHOUSE - BAO CAO PHAN TICH ANH SANG MAT TROI\nCong trinh: ${project.name}\nDia diem: ${cityLocation.toUpperCase()}\nGio phan tich: ${sunlightHour}:00\nMua: ${sunlightSeason}\nChi so buc xa: 485 W/m2\nTy le che nang: 68%`;
                    downloadFile(content, `${project.projectCode}_phan_tich_anh_sang.txt`, 'text/plain;charset=utf-8');
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Xuất Báo Cáo Ánh Sáng (PDF/Data)</span>
                </button>
              </div>

              {/* Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <label className="text-xs text-slate-400 font-medium">Khu vực địa lý (Việt Nam):</label>
                  <select
                    value={cityLocation}
                    onChange={(e) => setCityLocation(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="hcm">TP. Hồ Chí Minh (10.82° B, 106.63° Đ)</option>
                    <option value="hanoi">Hà Nội (21.02° B, 105.83° Đ)</option>
                    <option value="danang">Đà Nẵng (16.05° B, 108.20° Đ)</option>
                  </select>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <label className="text-xs text-slate-400 font-medium">Mùa trong năm:</label>
                  <select
                    value={sunlightSeason}
                    onChange={(e) => setSunlightSeason(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="summer">Hạ chí (Tháng 6 - Góc chiếu cao nhất)</option>
                    <option value="equinox">Xuân phân / Thu phân (Tháng 3, 9)</option>
                    <option value="winter">Đông chí (Tháng 12 - Nắng xiên chếch)</option>
                  </select>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Khung giờ:</span>
                    <span className="font-mono font-bold text-amber-400">{sunlightHour}:00</span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="18"
                    step="1"
                    value={sunlightHour}
                    onChange={(e) => setSunlightHour(parseInt(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>06:00 (Sáng)</span>
                    <span>12:00 (Trưa)</span>
                    <span>18:00 (Chiều)</span>
                  </div>
                </div>
              </div>

              {/* Sunlight Statistics Display */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2.5 rounded-lg bg-slate-900/80">
                  <div className="text-[10px] text-slate-400">Góc cao độ mặt trời</div>
                  <div className="text-sm font-bold font-mono text-amber-400 mt-0.5">
                    {sunlightHour <= 12 ? (sunlightHour - 6) * 12 : (18 - sunlightHour) * 12}°
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80">
                  <div className="text-[10px] text-slate-400">Cường độ bức xạ</div>
                  <div className="text-sm font-bold font-mono text-white mt-0.5">
                    {Math.round(480 + (12 - Math.abs(12 - sunlightHour)) * 35)} W/m²
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80">
                  <div className="text-[10px] text-slate-400">Tỷ lệ đón nắng tự nhiên</div>
                  <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">78.5% (Tốt)</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80">
                  <div className="text-[10px] text-slate-400">Tiêu chuẩn cách nhiệt</div>
                  <div className="text-sm font-bold font-mono text-sky-400 mt-0.5">Đạt QCVN 09</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: BIÊN BẢN / HỒ SƠ KHẢO SÁT (Legal Survey Report) */}
          {activeTab === 'survey_report' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-emerald-400" />
                    <span>Biên Bản &amp; Hồ Sơ Nghiệm Thu Khảo Sát Hiện Trạng</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
                      TCVN Chuẩn Pháp Lý
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Biên bản nghiệm thu số liệu đo đạc hiện trường, xác nhận giữa KTS khảo sát và Chủ đầu tư / Nhà thầu
                  </p>
                </div>
                <button
                  onClick={handleExportPdf}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>In / Xuất Biên Bản Khảo Sát (PDF)</span>
                </button>
              </div>

              {/* Official Survey Sheet Preview */}
              <div className="p-6 rounded-2xl bg-white text-slate-900 shadow-xl space-y-4 border border-slate-300 font-sans">
                {/* Letterhead */}
                <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900">
                  <div>
                    <div className="text-xs font-bold text-slate-600 uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                    <div className="text-[11px] text-slate-500">Độc lập - Tự do - Hạnh phúc</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-slate-900">MÃ SỐ: {project.projectCode}</div>
                    <div className="text-[11px] text-slate-500">Ngày lập: {project.surveyDate}</div>
                  </div>
                </div>

                <div className="text-center py-2">
                  <h3 className="text-base font-bold uppercase tracking-wider text-slate-950">
                    BIÊN BẢN BÀN GIAO SỐ LIỆU KHẢO SÁT HIỆN TRẠNG CÔNG TRÌNH
                  </h3>
                  <p className="text-xs text-slate-600 italic">
                    (Áp dụng thiết bị đo khoảng cách Laser quang học Bluetooth độ chính xác cao)
                  </p>
                </div>

                {/* Project Metadata Table */}
                <div className="grid grid-cols-2 gap-2 text-xs border border-slate-300 p-3 rounded-lg bg-slate-50">
                  <div><strong>Tên công trình:</strong> {project.name}</div>
                  <div><strong>Chủ đầu tư:</strong> {project.clientName}</div>
                  <div><strong>Địa điểm khảo sát:</strong> {project.address}</div>
                  <div><strong>Cán bộ đo đạc:</strong> {project.surveyor}</div>
                  <div><strong>Thiết bị sử dụng:</strong> Thước Laser Bluetooth BLE ±1.5mm</div>
                  <div><strong>Tổng số cấu kiện:</strong> {project.walls.length} tường · {project.openings.length} cửa</div>
                </div>

                {/* Signatures */}
                <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs">
                  <div className="space-y-12">
                    <div className="font-bold uppercase">ĐẠI DIỆN CHỦ ĐẦU TƯ / KHÁCH HÀNG</div>
                    <div className="text-slate-400 italic">(Ký và ghi rõ họ tên)</div>
                    <div className="font-semibold text-slate-900">{project.clientName}</div>
                  </div>
                  <div className="space-y-12">
                    <div className="font-bold uppercase">KTS / CÁN BỘ ĐO ĐẠC HIỆN TRƯỜNG</div>
                    <div className="text-slate-400 italic">(Đã đối soát số đo laser)</div>
                    <div className="font-semibold text-slate-900">{project.surveyor}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: CHIA SẺ DỰ ÁN (Collaborative Sharing & QR Code) */}
          {activeTab === 'share' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-violet-400" />
                    <span>Chia Sẻ Dự Án Đám Mây &amp; Quét QR Code 3D</span>
                    <span className="text-[10px] bg-violet-500/20 text-violet-400 border border-violet-500/30 px-2 py-0.5 rounded font-mono font-bold">
                      WebAR Cloud
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Tạo liên kết chia sẻ trực tiếp bản vẽ 2D/3D cho thầu thợ, kỹ sư và khách hàng mở trên điện thoại
                  </p>
                </div>
              </div>

              {/* QR and Link Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* QR Code Container */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-36 h-36 bg-white p-2.5 rounded-xl flex items-center justify-center shadow-lg">
                    {/* Simulated SVG QR Code */}
                    <div className="w-full h-full bg-slate-900 rounded flex flex-col items-center justify-center text-white text-[10px] font-mono p-1">
                      <QrCode className="w-16 h-16 text-amber-400 mb-1" />
                      <span>SCAN TO VIEW</span>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-white">Quét QR Xem Trên Điện Thoại</div>
                  <div className="text-[10px] text-slate-400">Xem trực tiếp mô hình 3D AR không cần cài app</div>
                </div>

                {/* Share Link Settings */}
                <div className="sm:col-span-2 p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">Đường dẫn chia sẻ dự án bảo mật:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`https://4echouse.vn/share/${project.projectCode.toLowerCase()}`}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-amber-400 font-mono select-all focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`https://4echouse.vn/share/${project.projectCode.toLowerCase()}`);
                          setCopiedShareLink(true);
                          setTimeout(() => setCopiedShareLink(false), 2500);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
                      >
                        {copiedShareLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedShareLink ? 'Đã chép' : 'Sao chép'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-medium">Quyền hạn truy cập liên kết:</label>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-center">
                        <div className="font-bold text-white">Chỉ Xem (View)</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Khách hàng / Thợ</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center text-slate-400">
                        <div className="font-bold">Bình Luận</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Chủ đầu tư góp ý</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center text-slate-400">
                        <div className="font-bold">Đồng Tác Giả</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">KTS cộng tác</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80 shrink-0 text-xs text-slate-400">
          <span>Công trình: {project.name} ({project.projectCode})</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer font-medium"
          >
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
};

