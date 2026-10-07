export interface Point2D {
  x: number; // in mm
  y: number; // in mm
}

export type WallAlignment = 'center' | 'interior' | 'exterior';

export interface Wall {
  id: string;
  start: Point2D;
  end: Point2D;
  thickness: number; // 110mm, 220mm, etc.
  height: number; // 2800mm, 3000mm, etc.
  alignment?: WallAlignment; // mép trong, mép ngoài, chính giữa
  selected?: boolean;
  name?: string;
  isMeasuredWithLaser?: boolean;
  laserTimestamp?: string;
  measuredLength?: number; // actual length measured
  storeyId?: string;
}

export interface CurvedWall {
  id: string;
  start: Point2D;
  end: Point2D;
  controlPoint: Point2D; // midpoint on arc or bulge control
  radius: number; // mm
  arcLength: number; // mm
  chordLength: number; // mm (khoảng cách 2 đầu mút)
  sagitta: number; // mm (độ võng cung tròn)
  thickness: number;
  height: number;
  alignment?: WallAlignment;
  name?: string;
  isMeasuredWithLaser?: boolean;
  storeyId?: string;
}

export type OpeningType =
  | 'door_single'
  | 'door_double'
  | 'door_3leaf'
  | 'door_4leaf'
  | 'door_sliding'
  | 'window_1leaf'
  | 'window_standard'
  | 'window_3leaf'
  | 'window_4leaf'
  | 'window_sliding'
  | 'glass_partition';

export interface Opening {
  id: string;
  wallId: string;
  type: OpeningType;
  distanceFromStart: number; // in mm from wall.start
  width: number; // in mm
  height: number; // in mm
  sillHeight: number; // bậu cửa (0 for door, 900 for window)
  leafCount?: number; // số cánh (1, 2, 3, 4)
  frameThickness?: number; // bề dày khung bao (mm), default 50mm
  swingDirection?: 'left' | 'right';
  swingInside?: boolean;
  name?: string;
  storeyId?: string;
}

export type StructuralColumnType =
  | 'concrete_rect'
  | 'concrete_circle'
  | 'steel_i'
  | 'steel_u'
  | 'steel_box'
  | 'steel_rect'
  | 'box_chase';

export interface Column {
  id: string;
  x: number;
  y: number;
  width: number; // mm (e.g. 200)
  depth: number; // mm (e.g. 200)
  flangeThickness?: number; // bề dày cánh thép (for I, U)
  webThickness?: number; // bề dày bụng thép
  rotation: number; // degrees
  type: StructuralColumnType;
  profileName?: string; // e.g. "I200x100x5.5x8", "H300x300", "Thép hộp 150x150"
}

export type StaircaseType = 'straight' | 'l_shape' | 'u_shape' | 'curved' | 'spiral';
export type LandingSplitType = 'flat' | 'split_2' | 'split_3';

export interface Staircase {
  id: string;
  type: StaircaseType;
  position: Point2D;
  rotation: number;
  runWidth: number; // chiều rộng vế thang (e.g. 900mm)
  totalLength: number; // tổng chiều dài (e.g. 3600mm)
  stepCount: number; // tổng số bậc (17, 19, 21...)
  riserHeight: number; // chiều cao bậc (160 - 180mm)
  treadDepth: number; // rộng mặt bậc (250 - 300mm)
  landingType: LandingSplitType; // chiếu nghỉ phẳng, xẻ 2, xẻ 3
  stepsBeforeLanding: number; // số bậc vế 1
  stepsAfterLanding: number; // số bậc vế 2
  stairWellGap?: number; // khoảng hở giếng thang giữa 2 vế (e.g. 100mm)
  innerRadius?: number; // bán kính trong cho thang xoắn/thang cong (mm)
  outerRadius?: number; // bán kính ngoài cho thang xoắn/thang cong (mm)
  stepsMiddleFlight?: number; // số bậc vế thang giữa 2 chiếu nghỉ (thang U 3 vế)
  name?: string;
}

export type MepCategory =
  | 'socket_single'
  | 'socket_double'
  | 'switch_single_1way'
  | 'switch_single_2way'
  | 'switch_double_1way'
  | 'switch_double_2way'
  | 'water_meter'
  | 'switch_1'
  | 'switch_2'
  | 'panel_db'
  | 'light_ceiling'
  | 'ac_indoor'
  | 'water_supply'
  | 'water_drain'
  | 'toilet_drain'
  | 'fire_detector'
  | 'fire_hydrant';

export interface MepCatalogItem {
  category: MepCategory;
  name: string;
  tag: string;
  description: string;
  defaultElevationMm: number;
}

export const MEP_CATALOG: MepCatalogItem[] = [
  { category: 'switch_single_1way', name: 'Công tắc đơn 1 chiều', tag: 'CT-1C', description: 'Công tắc 1 phím 1 chiều bật tắt đèn', defaultElevationMm: 1200 },
  { category: 'switch_single_2way', name: 'Công tắc đơn 2 chiều (cầu thang)', tag: 'CT-2C', description: 'Công tắc 1 phím đảo chiều cầu thang / hành lang', defaultElevationMm: 1200 },
  { category: 'switch_double_1way', name: 'Công tắc đôi 1 chiều', tag: 'CT2-1C', description: 'Công tắc 2 phím bật 2 lộ đèn riêng biệt', defaultElevationMm: 1200 },
  { category: 'switch_double_2way', name: 'Công tắc đôi 2 chiều (đảo chiều)', tag: 'CT2-2C', description: 'Công tắc 2 phím đảo chiều 2 vị trí', defaultElevationMm: 1200 },
  { category: 'water_meter', name: 'Đồng hồ nước (ĐH)', tag: 'ĐH-NƯỚC', description: 'Đồng hồ đo lưu lượng nước cấp sinh hoạt', defaultElevationMm: 450 },
  { category: 'socket_double', name: 'Ổ cắm đôi 220V (tiếp địa)', tag: 'OC-2', description: 'Ổ cắm đôi 2 chấu/3 chấu 16A', defaultElevationMm: 350 },
  { category: 'socket_single', name: 'Ổ cắm đơn 220V', tag: 'OC-1', description: 'Ổ cắm đơn âm tường', defaultElevationMm: 350 },
  { category: 'panel_db', name: 'Tủ điện tổng DB (Aptomat)', tag: 'TỦ-DB', description: 'Tủ điện phân phối tầng / căn hộ', defaultElevationMm: 1500 },
  { category: 'light_ceiling', name: 'Đèn trần Downlight âm trần', tag: 'ĐÈN-DL', description: 'Đèn LED âm trần', defaultElevationMm: 2800 },
  { category: 'ac_indoor', name: 'Máy lạnh / Điều hòa treo tường', tag: 'ĐH-KK', description: 'Dàn lạnh máy điều hòa không khí', defaultElevationMm: 2400 },
  { category: 'water_supply', name: 'Ống cấp nước sạch PPR', tag: 'CẤP-N', description: 'Đầu chờ cấp nước sạch', defaultElevationMm: 500 },
  { category: 'water_drain', name: 'Phễu thu sàn / Thoát sàn', tag: 'THOÁT-S', description: 'Ga thu sàn ngăn mùi', defaultElevationMm: 0 },
  { category: 'toilet_drain', name: 'Ống xả bồn cầu Ø110', tag: 'XẢ-BC', description: 'Tâm xả bồn cầu cách tường 300mm', defaultElevationMm: 0 },
  { category: 'fire_detector', name: 'Đầu báo khói / Báo cháy', tag: 'PCCC-BK', description: 'Đầu báo khói quang điện gắn trần', defaultElevationMm: 2800 },
  { category: 'fire_hydrant', name: 'Hộp chữa cháy vách tường', tag: 'PCCC-CC', description: 'Hộp cứu hỏa cuộn vòi', defaultElevationMm: 1250 },
];

export interface MepElement {
  id: string;
  category: MepCategory;
  position: Point2D;
  rotation: number;
  elevationMm: number; // cao độ đặt thiết bị (300, 1200, 1500, 2600mm...)
  label?: string; // mã hiệu (e.g. "Ổ cắm sàn", "Tủ DB Tầng 1", "D110")
}

export interface LandscapeElement {
  id: string;
  type: 'shrub' | 'tree_large';
  position: Point2D;
  radius: number; // bán kính tán cây (e.g. 400mm cây bụi, 1200mm cây lớn)
  name?: string;
}

export interface FreehandStroke {
  id: string;
  points: Point2D[];
  color: string;
  strokeWidth: number;
  toolType: 'pen' | 'highlighter';
  noteText?: string;
}

export interface RailingElement {
  id: string;
  start: Point2D;
  end: Point2D;
  heightMm: number; // 900, 1100 mm
  style: 'glass' | 'steel_bar' | 'masonry';
  name?: string;
}

export interface RoofElement {
  id: string;
  start: Point2D;
  end: Point2D;
  shape: RoofTrussShape; // 'triangle' | 'trapezoid' | 'rectangular'
  bracing: RoofTrussBracing; // 'warren' | 'pratt' | 'howe'
  slopeDeg: number; // e.g. 28°
  overhangMm?: number; // e.g. 600mm
  name?: string;
}

export interface DetailCallout {
  id: string;
  center: Point2D;
  radius: number; // bán kính khoanh vùng chi tiết
  label: string; // "CHI TIẾT A", "CHI TIẾT B"
  scale: string; // "1/10", "1/20"
  description: string;
  strokes?: FreehandStroke[];
  lines?: { id: string; start: Point2D; end: Point2D; color: string; width: number }[];
  notes?: SurveyNote[];
}

export interface DiagonalCheck {
  id: string;
  name: string;
  p1: Point2D;
  p2: Point2D;
  measuredLength: number; // mm measured with laser
  calculatedLength: number; // mm in CAD coordinates
  tolerance: number; // difference in mm
  isVerified: boolean;
}

export interface WallAngle {
  id: string;
  wall1Id: string;
  wall2Id: string;
  vertex: Point2D;
  angleDeg: number;
  deviationFrom90Deg: number;
  isCalculatedFromLaser: boolean;
  diagonalDistanceMm?: number;
}

export interface Room {
  id: string;
  name: string;
  wallIds: string[];
  area: number; // in m²
  perimeter: number; // in m
  color?: string;
}

export interface SurveyNote {
  id: string;
  x: number;
  y: number;
  title: string;
  content: string;
  category: 'electric' | 'water' | 'structure' | 'note';
}

export interface LaserMeasurement {
  id: string;
  timestamp: string;
  valueMm: number;
  targetName?: string;
  deviceSource: 'BLE_DEVICE' | 'SIMULATOR' | 'MANUAL';
  mode: 'WALL' | 'DIAGONAL' | 'HEIGHT' | 'FREE' | 'CURVED';
}

// Elevation & Section entities
export type ElevSectEntityType =
  | 'level_marker'
  | 'beam_slab'
  | 'roof_pitched'
  | 'roof_flat'
  | 'railing_balcony'
  | 'facade_door_window'
  | 'wall'
  | 'door'
  | 'window'
  | 'glass_partition';

export type RoofTrussShape = 'triangle' | 'trapezoid' | 'rectangular';
export type RoofTrussBracing = 'warren' | 'pratt' | 'howe';

export interface ElevSectEntity {
  id: string;
  type: ElevSectEntityType;
  x: number; // mm
  y: number; // mm (elevation from baseline)
  width: number;
  height: number;
  levelText?: string; // e.g. "+3.600", "CAO ĐỘ SÀN TẦNG 2"
  elevationValM?: number; // 3.6
  material?: string;
  railingHeightMm?: number; // 900, 1100
  railingStyle?: 'glass' | 'steel_bar' | 'masonry';
  roofSlopeDeg?: number; // độ dốc mái 25°, 30°
  trussShape?: RoofTrussShape; // hình tam giác, hình thang, hình chữ nhật
  trussBracing?: RoofTrussBracing; // giằng thép ở trong: warren, pratt, howe
  name?: string;
}

export interface PanoramaMaterialItem {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  roughness: number;
  color: string;
}

export interface PanoramaSceneItem {
  id: string;
  title: string;
  roomName: string;
  fov: number;
  yaw: number;
  pitch: number;
  imageUrl: string;
  hotspotsCount: number;
}

export interface PanoramaCompanySettings {
  bgLogoUrl: string;
  avatarUrl: string;
  contactPerson: string;
  phone: string;
  companyName: string;
}

export interface Storey {
  id: string;
  name: string; // e.g. "Tầng 1 (Trệt)", "Tầng 2", "Tầng 3", "Tầng Mái"
  levelMm: number; // cao độ sàn tầng (0, 3600, 7200, 10800mm)
  cutPlaneHeightMm: number; // cao độ mặt phẳng cắt nhìn mặt bằng (mặc định 1200mm từ sàn)
  heightMm: number; // chiều cao thông thủy tầng (3300 - 3900mm)
  cutDirection?: 'down' | 'up'; // hướng nhìn mặt cắt: 'down' (nhìn xuống mặt sàn) | 'up' (nhìn lên trần RCP)
}

export interface FloorPlanLayer {
  id: string;
  name: string; // "Tầng 1 (Trệt)", "Tầng 2", "Tầng Lửng", "Mặt Cắt A-A"
  levelM: number;
}

export interface ProjectData {
  id: string;
  name: string;
  projectCode: string;
  clientName: string;
  address: string;
  surveyor: string;
  surveyDate: string;
  defaultWallThickness: number; // 110 or 220
  defaultCeilingHeight: number; // 2800 or 3000
  defaultWallAlignment?: WallAlignment; // 'center' | 'interior' | 'exterior'
  storeys?: Storey[]; // danh sách mặt bằng các tầng
  activeStoreyId?: string; // tầng đang kích hoạt
  walls: Wall[];
  curvedWalls: CurvedWall[];
  openings: Opening[];
  columns: Column[];
  staircases: Staircase[];
  mepElements: MepElement[];
  landscapeElements: LandscapeElement[];
  freehandStrokes: FreehandStroke[];
  detailCallouts: DetailCallout[];
  diagonalChecks: DiagonalCheck[];
  angles: WallAngle[];
  rooms: Room[];
  notes: SurveyNote[];
  measurementsLog: LaserMeasurement[];
  // Elevation / Section entities
  elevSectEntities: ElevSectEntity[];
  // Plan elements for railings and roofs
  railings?: RailingElement[];
  roofs?: RoofElement[];
  // Underlay settings
  underlayActive: boolean;
  underlayOpacity: number; // 0.1 - 0.7
}
