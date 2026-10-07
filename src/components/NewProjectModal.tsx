import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  Square,
  FilePlus,
  Home,
  Building2,
  AlertCircle,
  Check,
  Ruler,
  Layers,
  Upload,
  Scan,
  ChevronDown,
  ChevronUp,
  History,
  Share2,
  FileCheck,
  RefreshCw,
  Smartphone,
  Eye,
  Sparkles,
  FolderDown,
  ArrowUpRight,
  Shield,
  Send,
  Database,
  FileUp,
} from 'lucide-react';
import { ProjectData } from '../types/cad';
import { SAMPLE_PROJECTS } from '../data/sampleProjects';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (newProject: ProjectData) => void;
  currentProjectHasData: boolean;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
  currentProjectHasData,
}) => {
  if (!isOpen) return null;

  const [projectName, setProjectName] = useState('Khảo sát hiện trạng nhà ở');
  const [projectCode, setProjectCode] = useState(
    `4EC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [clientName, setClientName] = useState('Chủ đầu tư');
  const [address, setAddress] = useState('Hiện trường khảo sát');
  const [surveyor, setSurveyor] = useState('KTS. 4ECHouse');
  const [surveyDate, setSurveyDate] = useState(
    new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  );
  const [defaultWallThickness, setDefaultWallThickness] = useState<number>(220);
  const [defaultCeilingHeight, setDefaultCeilingHeight] = useState<number>(2800);
  const [initTemplate, setInitTemplate] = useState<
    'blank' | 'room_4x5' | 'room_5x8' | 'sample_apt' | 'sample_townhouse' | 'upload_plan' | 'lidar_scan'
  >('blank');

  // Upload plan state
  const [uploadedPlanFile, setUploadedPlanFile] = useState<{
    name: string;
    size: string;
    type: string;
  } | null>({
    name: 'MB_KhaoSat_Tang1_HienTrang.jpg',
    size: '2.4 MB',
    type: 'image/jpeg',
  });
  const [planScaleRatio, setPlanScaleRatio] = useState<number>(100); // 1:100

  // LiDAR Scan state
  const [isLidarScanning, setIsLidarScanning] = useState<boolean>(false);
  const [lidarScannedPoints, setLidarScannedPoints] = useState<number>(18450);
  const [lidarScanCompleted, setLidarScanCompleted] = useState<boolean>(true);

  // Hidden settings state (SETTING ẨN)
  const [showHiddenSettings, setShowHiddenSettings] = useState<boolean>(false);
  const [hiddenActiveTab, setHiddenActiveTab] = useState<'received' | 'restore' | 'transfer'>('received');
  const [restoreSuccessMsg, setRestoreSuccessMsg] = useState<string | null>(null);
  const [transferSuccessMsg, setTransferSuccessMsg] = useState<string | null>(null);

  // Mock Received Floor Plans (Mặt bằng đã nhận)
  const [receivedPlans, setReceivedPlans] = useState([
    {
      id: 'rp_1',
      title: 'Mặt bằng căn hộ 3PN - Vinhomes Central Park',
      sender: 'KTS. Nguyễn Văn Hùng (Chủ trì thiết kế)',
      date: '06/10/2026 14:30',
      size: '110.5 m²',
      format: 'CAD DWG & PDF',
      status: 'Đã thẩm duyệt',
    },
    {
      id: 'rp_2',
      title: 'Sơ đồ thửa đất & Hiện trạng nhà phố 4 tầng',
      sender: 'Chủ đầu tư (Gửi qua Zalo)',
      date: '05/10/2026 09:15',
      size: '64.0 m²',
      format: 'Ảnh scan màu JPG',
      status: 'Chờ đối soát Laser',
    },
    {
      id: 'rp_3',
      title: 'Mặt bằng thô bàn giao shophouse TMDV',
      sender: 'Ban Quản Lý Tòa Nhà',
      date: '02/10/2026 16:45',
      size: '145.2 m²',
      format: 'BIM IFC / DXF',
      status: 'Khảo sát thô',
    },
  ]);

  // Mock Restore Backups (Khôi phục dữ liệu)
  const backupList = [
    {
      id: 'bk_1',
      name: 'Bản lưu tự động (Auto-Save) gần nhất',
      time: '10 phút trước',
      wallsCount: 16,
      measurementsCount: 24,
      note: 'Trước khi điều chỉnh trục dóng tường cong',
    },
    {
      id: 'bk_2',
      name: 'Snapshot Khảo sát buổi sáng',
      time: 'Hôm nay 11:45',
      wallsCount: 12,
      measurementsCount: 18,
      note: 'Đã hoàn thành đo chéo và kiểm tra góc 90°',
    },
    {
      id: 'bk_3',
      name: 'Bản lưu mốc chuẩn bị bàn giao',
      time: 'Hôm qua 18:20',
      wallsCount: 8,
      measurementsCount: 10,
      note: 'Khung lưới cột và vách chịu lực chính',
    },
  ];

  const handleStartLidarScan = () => {
    setIsLidarScanning(true);
    setLidarScanCompleted(false);
    setLidarScannedPoints(0);
    let count = 0;
    const interval = setInterval(() => {
      count += 2450;
      setLidarScannedPoints(count);
      if (count >= 24500) {
        clearInterval(interval);
        setIsLidarScanning(false);
        setLidarScanCompleted(true);
      }
    }, 200);
  };

  const handleSelectReceivedPlan = (plan: (typeof receivedPlans)[0]) => {
    setProjectName(plan.title);
    setClientName(plan.sender);
    setInitTemplate('upload_plan');
    setUploadedPlanFile({
      name: `${plan.title}.dwg`,
      size: '3.8 MB',
      type: 'application/acad',
    });
    setRestoreSuccessMsg(`Đã nạp thành công "${plan.title}" vào phôi bản vẽ!`);
    setTimeout(() => setRestoreSuccessMsg(null), 3500);
  };

  const handleRestoreBackup = (bk: (typeof backupList)[0]) => {
    setRestoreSuccessMsg(`Đã khôi phục thành công "${bk.name}" (${bk.wallsCount} tường, ${bk.measurementsCount} số đo)!`);
    setTimeout(() => setRestoreSuccessMsg(null), 3500);
  };

  const handleHandoffTransfer = () => {
    setTransferSuccessMsg('Đã tạo liên kết chuyển giao mặt bằng mã hóa: https://4echouse.vn/share/4ec-transfer-2026. Bàn giao hoàn tất!');
    setTimeout(() => setTransferSuccessMsg(null), 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let newProj: ProjectData;

    if (initTemplate === 'upload_plan') {
      // Create project pre-loaded with uploaded floor plan geometry
      const w = 7200;
      const h = 5800;
      const thick = defaultWallThickness;
      newProj = {
        id: 'proj_' + Date.now(),
        name: projectName || 'Mặt bằng tải lên - ' + (uploadedPlanFile?.name || 'Scan.jpg'),
        projectCode,
        clientName,
        address,
        surveyor,
        surveyDate,
        defaultWallThickness: thick,
        defaultCeilingHeight,
        underlayActive: true,
        underlayOpacity: 0.45,
        walls: [
          { id: 'w1', start: { x: 0, y: 0 }, end: { x: w, y: 0 }, thickness: thick, height: defaultCeilingHeight, name: 'Tường biên A (Mặt bằng tải lên)', isMeasuredWithLaser: false, measuredLength: w },
          { id: 'w2', start: { x: w, y: 0 }, end: { x: w, y: h }, thickness: thick, height: defaultCeilingHeight, name: 'Tường biên B', isMeasuredWithLaser: false, measuredLength: h },
          { id: 'w3', start: { x: w, y: h }, end: { x: 0, y: h }, thickness: thick, height: defaultCeilingHeight, name: 'Tường biên C', isMeasuredWithLaser: false, measuredLength: w },
          { id: 'w4', start: { x: 0, y: h }, end: { x: 0, y: 0 }, thickness: thick, height: defaultCeilingHeight, name: 'Tường biên D', isMeasuredWithLaser: false, measuredLength: h },
          { id: 'w5', start: { x: 3200, y: 0 }, end: { x: 3200, y: h }, thickness: 110, height: defaultCeilingHeight, name: 'Vách ngăn phòng nội bộ', isMeasuredWithLaser: false, measuredLength: h },
        ],
        curvedWalls: [],
        openings: [
          { id: 'op1', wallId: 'w1', type: 'door_single', distanceFromStart: 1200, width: 950, height: 2200, sillHeight: 0, leafCount: 1, frameThickness: 50, swingDirection: 'left', name: 'Cửa chính nhận diện' },
          { id: 'op2', wallId: 'w5', type: 'door_single', distanceFromStart: 1000, width: 900, height: 2200, sillHeight: 0, leafCount: 1, frameThickness: 50, swingDirection: 'right', name: 'Cửa thông phòng' },
          { id: 'op3', wallId: 'w3', type: 'window_sliding', distanceFromStart: 1400, width: 1800, height: 1600, sillHeight: 900, leafCount: 2, frameThickness: 60, name: 'Cửa sổ ban công' },
        ],
        columns: [
          { id: 'col1', x: 0, y: 0, width: 220, depth: 220, rotation: 0, type: 'concrete_rect' },
          { id: 'col2', x: w, y: 0, width: 220, depth: 220, rotation: 0, type: 'concrete_rect' },
          { id: 'col3', x: w, y: h, width: 220, depth: 220, rotation: 0, type: 'concrete_rect' },
          { id: 'col4', x: 0, y: h, width: 220, depth: 220, rotation: 0, type: 'concrete_rect' },
        ],
        staircases: [],
        mepElements: [],
        landscapeElements: [],
        freehandStrokes: [],
        detailCallouts: [],
        diagonalChecks: [],
        angles: [],
        rooms: [
          { id: 'r1', name: 'Không Gian Mặt Bằng Nhập Khẩu', wallIds: ['w1', 'w2', 'w3', 'w4'], area: (w * h) / 1000000, perimeter: ((w + h) * 2) / 1000 },
        ],
        notes: [
          { id: 'nt1', x: 1600, y: 2500, title: 'Mặt bằng tải lên', content: `Mặt bằng tải lên: ${uploadedPlanFile?.name || 'File ảnh/CAD'} (Tỷ lệ 1:${planScaleRatio})`, category: 'note' },
        ],
        measurementsLog: [],
        elevSectEntities: [
          { id: 'es1', type: 'level_marker', x: 200, y: 0, width: 800, height: 0, levelText: '±0.000 SÀN TẦNG 1', elevationValM: 0 },
          { id: 'es2', type: 'level_marker', x: 200, y: defaultCeilingHeight, width: 800, height: 0, levelText: `+${(defaultCeilingHeight / 1000).toFixed(3)} ĐÁY TRẦN`, elevationValM: defaultCeilingHeight / 1000 },
        ],
      };
    } else if (initTemplate === 'lidar_scan') {
      // Create project reconstructed from LiDAR 3D spatial scan
      const w = 5500;
      const h = 4200;
      const thick = defaultWallThickness;
      newProj = {
        id: 'proj_' + Date.now(),
        name: projectName || 'Bản vẽ quét LiDAR 3D Spatial Scan',
        projectCode,
        clientName,
        address,
        surveyor,
        surveyDate,
        defaultWallThickness: thick,
        defaultCeilingHeight,
        underlayActive: false,
        underlayOpacity: 0.35,
        walls: [
          { id: 'w1', start: { x: 0, y: 0 }, end: { x: w, y: 0 }, thickness: thick, height: defaultCeilingHeight, name: 'Tường LiDAR 1 (Chính diện)', isMeasuredWithLaser: true, measuredLength: w, laserTimestamp: 'LiDAR Mesh Scan' },
          { id: 'w2', start: { x: w, y: 0 }, end: { x: w, y: h }, thickness: thick, height: defaultCeilingHeight, name: 'Tường LiDAR 2 (Phải)', isMeasuredWithLaser: true, measuredLength: h, laserTimestamp: 'LiDAR Mesh Scan' },
          { id: 'w3', start: { x: w, y: h }, end: { x: 0, y: h }, thickness: thick, height: defaultCeilingHeight, name: 'Tường LiDAR 3 (Sau)', isMeasuredWithLaser: true, measuredLength: w, laserTimestamp: 'LiDAR Mesh Scan' },
          { id: 'w4', start: { x: 0, y: h }, end: { x: 0, y: 0 }, thickness: thick, height: defaultCeilingHeight, name: 'Tường LiDAR 4 (Trái)', isMeasuredWithLaser: true, measuredLength: h, laserTimestamp: 'LiDAR Mesh Scan' },
        ],
        curvedWalls: [],
        openings: [
          { id: 'op1', wallId: 'w1', type: 'door_single', distanceFromStart: 1000, width: 950, height: 2200, sillHeight: 0, leafCount: 1, frameThickness: 50, swingDirection: 'left', name: 'Cửa ra vào quét LiDAR' },
          { id: 'op2', wallId: 'w3', type: 'window_standard', distanceFromStart: 1200, width: 1600, height: 1500, sillHeight: 900, leafCount: 2, frameThickness: 50, name: 'Cửa sổ quét LiDAR' },
        ],
        columns: [],
        staircases: [],
        mepElements: [
          { id: 'mep1', category: 'socket_double', position: { x: 500, y: 150 }, rotation: 0, elevationMm: 350, label: 'Ổ cắm điện (LiDAR AI phát hiện)' },
          { id: 'mep2', category: 'switch_2', position: { x: 4800, y: 150 }, rotation: 0, elevationMm: 1250, label: 'Công tắc đèn (LiDAR AI)' },
        ],
        landscapeElements: [],
        freehandStrokes: [],
        detailCallouts: [],
        diagonalChecks: [
          {
            id: 'diag_lidar',
            name: 'Đo chéo góc LiDAR',
            p1: { x: 0, y: 0 },
            p2: { x: w, y: h },
            measuredLength: Math.round(Math.hypot(w, h)),
            calculatedLength: Math.round(Math.hypot(w, h)),
            tolerance: 0,
            isVerified: true,
          },
        ],
        angles: [
          { id: 'ang1', wall1Id: 'w1', wall2Id: 'w2', vertex: { x: w, y: 0 }, angleDeg: 90.0, deviationFrom90Deg: 0, isCalculatedFromLaser: true },
          { id: 'ang2', wall1Id: 'w4', wall2Id: 'w1', vertex: { x: 0, y: 0 }, angleDeg: 90.0, deviationFrom90Deg: 0, isCalculatedFromLaser: true },
        ],
        rooms: [
          { id: 'r_lidar', name: 'Phòng Quét LiDAR 3D', wallIds: ['w1', 'w2', 'w3', 'w4'], area: (w * h) / 1000000, perimeter: ((w + h) * 2) / 1000 },
        ],
        notes: [
          { id: 'nt_lidar', x: 1500, y: 2000, title: 'Dữ liệu LiDAR', content: `Dữ liệu TOF LiDAR: ${lidarScannedPoints.toLocaleString()} điểm đám mây đã dựng lưới tường 3D`, category: 'note' },
        ],
        measurementsLog: [],
        elevSectEntities: [
          { id: 'es1', type: 'level_marker', x: 200, y: 0, width: 800, height: 0, levelText: '±0.000 SÀN TẦNG 1', elevationValM: 0 },
          { id: 'es2', type: 'level_marker', x: 200, y: defaultCeilingHeight, width: 800, height: 0, levelText: `+${(defaultCeilingHeight / 1000).toFixed(3)} ĐÁY TRẦN`, elevationValM: defaultCeilingHeight / 1000 },
        ],
      };
    }

    if (initTemplate === 'sample_apt') {
      newProj = {
        ...SAMPLE_PROJECTS[0],
        id: 'proj_' + Date.now(),
        name: projectName || SAMPLE_PROJECTS[0].name,
        projectCode,
        clientName,
        address,
        surveyor,
        surveyDate,
      };
    } else if (initTemplate === 'sample_townhouse') {
      newProj = {
        ...SAMPLE_PROJECTS[1],
        id: 'proj_' + Date.now(),
        name: projectName || SAMPLE_PROJECTS[1].name,
        projectCode,
        clientName,
        address,
        surveyor,
        surveyDate,
      };
    } else if (initTemplate === 'room_4x5') {
      const w = 4000;
      const h = 5000;
      const thick = defaultWallThickness;
      newProj = {
        id: 'proj_' + Date.now(),
        name: projectName,
        projectCode,
        clientName,
        address,
        surveyor,
        surveyDate,
        defaultWallThickness: thick,
        defaultCeilingHeight,
        underlayActive: false,
        underlayOpacity: 0.35,
        walls: [
          { id: 'w1', start: { x: 0, y: 0 }, end: { x: w, y: 0 }, thickness: thick, height: defaultCeilingHeight, name: 'Tường trục A (Mặt tiền)', isMeasuredWithLaser: false, measuredLength: w },
          { id: 'w2', start: { x: w, y: 0 }, end: { x: w, y: h }, thickness: thick, height: defaultCeilingHeight, name: 'Tường trục 2 (Hông phải)', isMeasuredWithLaser: false, measuredLength: h },
          { id: 'w3', start: { x: w, y: h }, end: { x: 0, y: h }, thickness: thick, height: defaultCeilingHeight, name: 'Tường trục B (Sau nhà)', isMeasuredWithLaser: false, measuredLength: w },
          { id: 'w4', start: { x: 0, y: h }, end: { x: 0, y: 0 }, thickness: thick, height: defaultCeilingHeight, name: 'Tường trục 1 (Hông trái)', isMeasuredWithLaser: false, measuredLength: h },
        ],
        curvedWalls: [],
        openings: [
          { id: 'op1', wallId: 'w1', type: 'door_single', distanceFromStart: 800, width: 950, height: 2200, sillHeight: 0, leafCount: 1, swingDirection: 'left', swingInside: true, name: 'Cửa ra vào' },
          { id: 'op2', wallId: 'w3', type: 'window_sliding', distanceFromStart: 1000, width: 1800, height: 1600, sillHeight: 800, leafCount: 2, name: 'Cửa sổ lùa' },
        ],
        columns: [
          { id: 'col1', x: 0, y: 0, width: 200, depth: 200, rotation: 0, type: 'concrete_rect' },
          { id: 'col2', x: w, y: 0, width: 200, depth: 200, rotation: 0, type: 'concrete_rect' },
          { id: 'col3', x: w, y: h, width: 200, depth: 200, rotation: 0, type: 'concrete_rect' },
          { id: 'col4', x: 0, y: h, width: 200, depth: 200, rotation: 0, type: 'concrete_rect' },
        ],
        staircases: [],
        mepElements: [
          { id: 'mep1', category: 'switch_2', position: { x: 600, y: 150 }, rotation: 0, elevationMm: 1200, label: 'Công tắc 2 hạt' },
          { id: 'mep2', category: 'socket_double', position: { x: 2500, y: 150 }, rotation: 0, elevationMm: 300, label: 'Ổ cắm đôi' },
        ],
        landscapeElements: [],
        freehandStrokes: [],
        detailCallouts: [],
        diagonalChecks: [
          {
            id: 'diag1',
            name: 'Đo chéo góc P1-P3',
            p1: { x: 0, y: 0 },
            p2: { x: w, y: h },
            measuredLength: Math.round(Math.hypot(w, h)),
            calculatedLength: Math.round(Math.hypot(w, h)),
            tolerance: 0,
            isVerified: true,
          },
        ],
        angles: [
          { id: 'ang1', wall1Id: 'w1', wall2Id: 'w2', vertex: { x: w, y: 0 }, angleDeg: 90.0, deviationFrom90Deg: 0, isCalculatedFromLaser: true },
          { id: 'ang2', wall1Id: 'w4', wall2Id: 'w1', vertex: { x: 0, y: 0 }, angleDeg: 90.0, deviationFrom90Deg: 0, isCalculatedFromLaser: true },
        ],
        rooms: [
          { id: 'r1', name: 'Phòng Chính', wallIds: ['w1', 'w2', 'w3', 'w4'], area: (w * h) / 1000000, perimeter: (w + h) * 2 / 1000 },
        ],
        notes: [],
        measurementsLog: [],
        elevSectEntities: [
          { id: 'es1', type: 'level_marker', x: 200, y: 0, width: 800, height: 0, levelText: '±0.000 SÀN TẦNG 1', elevationValM: 0 },
          { id: 'es2', type: 'level_marker', x: 200, y: defaultCeilingHeight, width: 800, height: 0, levelText: `+${(defaultCeilingHeight / 1000).toFixed(3)} ĐÁY TRẦN`, elevationValM: defaultCeilingHeight / 1000 },
        ],
      };
    } else if (initTemplate === 'room_5x8') {
      const w = 5000;
      const h = 8000;
      const thick = defaultWallThickness;
      newProj = {
        id: 'proj_' + Date.now(),
        name: projectName,
        projectCode,
        clientName,
        address,
        surveyor,
        surveyDate,
        defaultWallThickness: thick,
        defaultCeilingHeight,
        underlayActive: false,
        underlayOpacity: 0.35,
        walls: [
          { id: 'w1', start: { x: 0, y: 0 }, end: { x: w, y: 0 }, thickness: thick, height: defaultCeilingHeight, name: 'Tường trục A (Mặt tiền)', isMeasuredWithLaser: false, measuredLength: w },
          { id: 'w2', start: { x: w, y: 0 }, end: { x: w, y: h }, thickness: thick, height: defaultCeilingHeight, name: 'Tường trục 2 (Hông phải)', isMeasuredWithLaser: false, measuredLength: h },
          { id: 'w3', start: { x: w, y: h }, end: { x: 0, y: h }, thickness: thick, height: defaultCeilingHeight, name: 'Tường trục B (Sau nhà)', isMeasuredWithLaser: false, measuredLength: w },
          { id: 'w4', start: { x: 0, y: h }, end: { x: 0, y: 0 }, thickness: thick, height: defaultCeilingHeight, name: 'Tường trục 1 (Hông trái)', isMeasuredWithLaser: false, measuredLength: h },
        ],
        curvedWalls: [],
        openings: [
          { id: 'op1', wallId: 'w1', type: 'door_double', distanceFromStart: 1200, width: 1600, height: 2400, sillHeight: 0, leafCount: 2, swingDirection: 'left', swingInside: true, name: 'Cửa chính 2 cánh' },
          { id: 'op2', wallId: 'w3', type: 'window_standard', distanceFromStart: 1500, width: 2000, height: 1600, sillHeight: 800, leafCount: 2, name: 'Cửa sổ sau nhà' },
        ],
        columns: [
          { id: 'col1', x: 0, y: 0, width: 220, depth: 220, rotation: 0, type: 'concrete_rect' },
          { id: 'col2', x: w, y: 0, width: 220, depth: 220, rotation: 0, type: 'concrete_rect' },
          { id: 'col3', x: w, y: h, width: 220, depth: 220, rotation: 0, type: 'concrete_rect' },
          { id: 'col4', x: 0, y: h, width: 220, depth: 220, rotation: 0, type: 'concrete_rect' },
        ],
        staircases: [],
        mepElements: [],
        landscapeElements: [],
        freehandStrokes: [],
        detailCallouts: [],
        diagonalChecks: [
          {
            id: 'diag1',
            name: 'Đo chéo góc P1-P3',
            p1: { x: 0, y: 0 },
            p2: { x: w, y: h },
            measuredLength: Math.round(Math.hypot(w, h)),
            calculatedLength: Math.round(Math.hypot(w, h)),
            tolerance: 0,
            isVerified: true,
          },
        ],
        angles: [
          { id: 'ang1', wall1Id: 'w1', wall2Id: 'w2', vertex: { x: w, y: 0 }, angleDeg: 90.0, deviationFrom90Deg: 0, isCalculatedFromLaser: true },
          { id: 'ang2', wall1Id: 'w4', wall2Id: 'w1', vertex: { x: 0, y: 0 }, angleDeg: 90.0, deviationFrom90Deg: 0, isCalculatedFromLaser: true },
        ],
        rooms: [
          { id: 'r1', name: 'Không Gian Tầng 1', wallIds: ['w1', 'w2', 'w3', 'w4'], area: (w * h) / 1000000, perimeter: (w + h) * 2 / 1000 },
        ],
        notes: [],
        measurementsLog: [],
        elevSectEntities: [
          { id: 'es1', type: 'level_marker', x: 200, y: 0, width: 800, height: 0, levelText: '±0.000 SÀN TẦNG 1', elevationValM: 0 },
          { id: 'es2', type: 'level_marker', x: 200, y: defaultCeilingHeight, width: 800, height: 0, levelText: `+${(defaultCeilingHeight / 1000).toFixed(3)} ĐÁY TRẦN`, elevationValM: defaultCeilingHeight / 1000 },
        ],
      };
    } else {
      // Blank canvas
      newProj = {
        id: 'proj_' + Date.now(),
        name: projectName,
        projectCode,
        clientName,
        address,
        surveyor,
        surveyDate,
        defaultWallThickness,
        defaultCeilingHeight,
        underlayActive: false,
        underlayOpacity: 0.35,
        walls: [],
        curvedWalls: [],
        openings: [],
        columns: [],
        staircases: [],
        mepElements: [],
        landscapeElements: [],
        freehandStrokes: [],
        detailCallouts: [],
        diagonalChecks: [],
        angles: [],
        rooms: [],
        notes: [],
        measurementsLog: [],
        elevSectEntities: [
          { id: 'es1', type: 'level_marker', x: 200, y: 0, width: 800, height: 0, levelText: '±0.000 SÀN TẦNG 1', elevationValM: 0 },
          { id: 'es2', type: 'level_marker', x: 200, y: defaultCeilingHeight, width: 800, height: 0, levelText: `+${(defaultCeilingHeight / 1000).toFixed(3)} ĐÁY TRẦN`, elevationValM: defaultCeilingHeight / 1000 },
        ],
      };
    }

    onCreateProject(newProj);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <FilePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Tạo Mới Bản Vẽ Khảo Sát</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
                  4ECHouse CAD
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Khởi tạo không gian bản vẽ mới, thiết lập thông tin hồ sơ và kết nối đo đạc Laser
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Warning if current drawing has data */}
          {currentProjectHasData && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-300">Lưu ý: </span>
                Bản vẽ hiện tại đang có dữ liệu đo đạc. Khi tạo bản vẽ mới, ứng dụng sẽ tạo không gian làm việc sạch sẽ (bạn vẫn có thể dùng Hoàn tác Ctrl+Z nếu cần).
              </div>
            </div>
          )}

          {/* Template Choice */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              1. Chọn Cách Khởi Tạo Bản Vẽ:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <button
                type="button"
                onClick={() => setInitTemplate('blank')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  initTemplate === 'blank'
                    ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Square className="w-4 h-4 text-amber-400" />
                  {initTemplate === 'blank' && <Check className="w-4 h-4 text-amber-400" />}
                </div>
                <div className="font-bold text-xs text-white">Bản Vẽ Trống</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Vẽ tự do từ đầu</div>
              </button>

              <button
                type="button"
                onClick={() => setInitTemplate('room_4x5')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  initTemplate === 'room_4x5'
                    ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Home className="w-4 h-4 text-emerald-400" />
                  {initTemplate === 'room_4x5' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <div className="font-bold text-xs text-white">Phòng Mẫu (4x5m)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Sẵn 4 tường & cửa</div>
              </button>

              <button
                type="button"
                onClick={() => setInitTemplate('sample_apt')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  initTemplate === 'sample_apt'
                    ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Building2 className="w-4 h-4 text-sky-400" />
                  {initTemplate === 'sample_apt' && <Check className="w-4 h-4 text-sky-400" />}
                </div>
                <div className="font-bold text-xs text-white">Căn Hộ 2PN</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Thang, MEP, tường cong</div>
              </button>

              {/* TÍNH NĂNG MỚI: TẢI MẶT BẰNG LÊN */}
              <button
                type="button"
                onClick={() => setInitTemplate('upload_plan')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  initTemplate === 'upload_plan'
                    ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Upload className="w-4 h-4 text-violet-400" />
                  {initTemplate === 'upload_plan' && <Check className="w-4 h-4 text-violet-400" />}
                </div>
                <div className="font-bold text-xs text-white">Tải Mặt Bằng Lên</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Ảnh, PDF, CAD đồ lại</div>
              </button>

              {/* TÍNH NĂNG MỚI: QUÉT LIDAR */}
              <button
                type="button"
                onClick={() => setInitTemplate('lidar_scan')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  initTemplate === 'lidar_scan'
                    ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Scan className="w-4 h-4 text-pink-400 animate-pulse" />
                  {initTemplate === 'lidar_scan' && <Check className="w-4 h-4 text-pink-400" />}
                </div>
                <div className="font-bold text-xs text-white">Quét LiDAR 3D</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Mesh đám mây điểm TOF</div>
              </button>
            </div>

            {/* PREVIEW SUB-PANEL KHI CHỌN TẢI MẶT BẰNG LÊN */}
            {initTemplate === 'upload_plan' && (
              <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/30 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-violet-300 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Thiết Lập Tải Mặt Bằng Bản Vẽ:</span>
                  </span>
                  <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded font-mono">
                    Underlay Blueprint
                  </span>
                </div>

                <div className="border-2 border-dashed border-violet-500/40 rounded-xl p-4 text-center bg-slate-950/60 hover:bg-slate-950/90 transition-colors">
                  <FileUp className="w-6 h-6 text-violet-400 mx-auto mb-1.5" />
                  <div className="text-xs font-semibold text-slate-200">
                    Kéo thả file bản vẽ hoặc bấm để chọn từ máy tính
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Hỗ trợ file ảnh JPG, PNG, file PDF quét, bản vẽ AutoCAD DWG/DXF
                  </div>
                  <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 bg-violet-500/20 text-violet-300 border border-violet-500/40 rounded-lg text-xs font-mono">
                    <span>Đang chọn: <strong>{uploadedPlanFile?.name}</strong> ({uploadedPlanFile?.size})</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-slate-400">Tỷ lệ đo vẽ quy chuẩn:</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    {[50, 100, 200].map((sc) => (
                      <button
                        key={sc}
                        type="button"
                        onClick={() => setPlanScaleRatio(sc)}
                        className={`px-2.5 py-1 rounded-lg border text-xs transition-colors cursor-pointer ${
                          planScaleRatio === sc
                            ? 'bg-violet-500 text-white font-bold border-violet-400'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        1:{sc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PREVIEW SUB-PANEL KHI CHỌN QUÉT LIDAR */}
            {initTemplate === 'lidar_scan' && (
              <div className="p-4 rounded-xl bg-pink-950/20 border border-pink-500/30 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-pink-300 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Cảm Biến Không Gian LiDAR 3D Spatial Scan:</span>
                  </span>
                  <span className="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded font-mono font-bold">
                    TOF LIDAR ACTIVE
                  </span>
                </div>

                <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-xs text-slate-200 font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                      <span>{isLidarScanning ? 'Đang quét không gian phòng...' : 'Đã khóa mesh không gian phòng'}</span>
                    </div>
                    <div className="text-[11px] font-mono text-pink-400">
                      Đám mây điểm: <strong>{lidarScannedPoints.toLocaleString()} pts</strong> (Sai số &lt; 2mm)
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartLidarScan}
                    disabled={isLidarScanning}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500 hover:bg-pink-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow shadow-pink-500/20"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLidarScanning ? 'animate-spin' : ''}`} />
                    <span>{isLidarScanning ? 'Đang quét...' : 'Quét Lại LiDAR'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Project Metadata Fields */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              2. Thông Tin Hồ Sơ Khảo Sát:
            </label>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Tên công trình / Dự án khảo sát:</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Ví dụ: Căn hộ 3PN, Nhà phố 3 tầng..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Mã hiệu bản vẽ:</label>
                <input
                  type="text"
                  value={projectCode}
                  onChange={(e) => setProjectCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Chủ đầu tư / Khách hàng:</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Địa chỉ công trình:</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">KTS / Cán bộ đo đạc:</label>
                <input
                  type="text"
                  value={surveyor}
                  onChange={(e) => setSurveyor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Ngày đo đạc:</label>
                <input
                  type="text"
                  value={surveyDate}
                  onChange={(e) => setSurveyDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* CAD Defaults */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              3. Thông Số Kỹ Thuật CAD Mặc Định:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Độ dày tường mặc định:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDefaultWallThickness(110)}
                    className={`p-2 rounded-lg border text-center text-xs font-medium transition-colors cursor-pointer ${
                      defaultWallThickness === 110
                        ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    110 mm (Tường 10)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDefaultWallThickness(220)}
                    className={`p-2 rounded-lg border text-center text-xs font-medium transition-colors cursor-pointer ${
                      defaultWallThickness === 220
                        ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    220 mm (Tường 20)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Chiều cao tầng / trần (mm):</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDefaultCeilingHeight(2800)}
                    className={`p-2 rounded-lg border text-center text-xs font-medium transition-colors cursor-pointer ${
                      defaultCeilingHeight === 2800
                        ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    2.8 m
                  </button>
                  <button
                    type="button"
                    onClick={() => setDefaultCeilingHeight(3300)}
                    className={`p-2 rounded-lg border text-center text-xs font-medium transition-colors cursor-pointer ${
                      defaultCeilingHeight === 3300
                        ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    3.3 m
                  </button>
                  <button
                    type="button"
                    onClick={() => setDefaultCeilingHeight(3600)}
                    className={`p-2 rounded-lg border text-center text-xs font-medium transition-colors cursor-pointer ${
                      defaultCeilingHeight === 3600
                        ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    3.6 m
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SETTING ẨN (CÀI ĐẶT ẨN & DỮ LIỆU ĐỐI SOÁT) */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowHiddenSettings((prev) => !prev)}
                className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-amber-400 transition-colors uppercase tracking-wider cursor-pointer group"
              >
                <div className="p-1 rounded bg-slate-800 group-hover:bg-amber-500/20 text-slate-400 group-hover:text-amber-400 transition-colors">
                  {showHiddenSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
                <span>4. Setting Ẩn (Mặt Bằng Đã Nhận · Khôi Phục · Chuyển Giao)</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono font-normal">
                  Nâng cao
                </span>
              </button>
            </div>

            {/* Notification messages */}
            {restoreSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{restoreSuccessMsg}</span>
              </div>
            )}
            {transferSuccessMsg && (
              <div className="p-3 rounded-xl bg-sky-500/15 border border-sky-500/30 text-xs text-sky-300 flex items-center gap-2 animate-in fade-in">
                <Share2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{transferSuccessMsg}</span>
              </div>
            )}

            {showHiddenSettings && (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 animate-in fade-in">
                {/* 3 Sub-tabs */}
                <div className="flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
                  <button
                    type="button"
                    onClick={() => setHiddenActiveTab('received')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      hiddenActiveTab === 'received'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <FolderDown className="w-3.5 h-3.5" />
                    <span>Mặt Bằng Đã Nhận ({receivedPlans.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHiddenActiveTab('restore')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      hiddenActiveTab === 'restore'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Khôi Phục Dữ Liệu ({backupList.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHiddenActiveTab('transfer')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      hiddenActiveTab === 'transfer'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Chuyển Giao Mặt Bằng</span>
                  </button>
                </div>

                {/* TAB 1: MẶT BẰNG ĐÃ NHẬN */}
                {hiddenActiveTab === 'received' && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-400">
                      Danh sách các hồ sơ mặt bằng đã nhận từ Zalo, Email hoặc chủ đầu tư cung cấp:
                    </p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {receivedPlans.map((plan) => (
                        <div
                          key={plan.id}
                          className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors"
                        >
                          <div className="space-y-0.5">
                            <div className="font-bold text-xs text-white">{plan.title}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {plan.sender} · {plan.size} · {plan.format} · {plan.date}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSelectReceivedPlan(plan)}
                            className="px-2.5 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/40 rounded text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Nạp Vào Bản Vẽ
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 2: KHÔI PHỤC DỮ LIỆU */}
                {hiddenActiveTab === 'restore' && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-400">
                      Khôi phục bản vẽ từ các mốc lưu tự động hoặc điểm khôi phục hệ thống:
                    </p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {backupList.map((bk) => (
                        <div
                          key={bk.id}
                          className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors"
                        >
                          <div className="space-y-0.5">
                            <div className="font-bold text-xs text-sky-400 flex items-center gap-1.5">
                              <Database className="w-3.5 h-3.5" />
                              <span>{bk.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono">({bk.time})</span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {bk.wallsCount} tường · {bk.measurementsCount} số đo Laser · {bk.note}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRestoreBackup(bk)}
                            className="px-2.5 py-1 bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-slate-950 border border-sky-500/40 rounded text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Khôi Phục
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: CHUYỂN GIAO MẶT BẰNG */}
                {hiddenActiveTab === 'transfer' && (
                  <div className="space-y-3">
                    <p className="text-[11px] text-slate-400">
                      Bàn giao và chuyển giao gói dữ liệu mặt bằng khảo sát cho các bên liên quan:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Chuyển giao cho Kỹ Sư Kết Cấu / MEP</span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Bàn giao file trục dóng, góc lệch laser và cao độ thông thủy
                        </p>
                        <button
                          type="button"
                          onClick={handleHandoffTransfer}
                          className="w-full mt-1 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950 rounded text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Tạo Link Bàn Giao
                        </button>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                          <span>Chuyển giao cho Chủ Đầu Tư</span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Biên bản nghiệm thu hiện trạng số liệu và phối cảnh 3D
                        </p>
                        <button
                          type="button"
                          onClick={handleHandoffTransfer}
                          className="w-full mt-1 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950 rounded text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Gửi Bản Giao Nhận
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-transform active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Khởi Tạo Bản Vẽ Mới</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
