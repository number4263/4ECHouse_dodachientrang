import { MepCategory } from '../types/cad';

export interface MepCategoryItem {
  id: MepCategory;
  label: string;
  defaultElevationMm: number;
  categoryGroup: 'electric' | 'water' | 'hvac' | 'fire';
}

export const MEP_CATEGORIES: MepCategoryItem[] = [
  { id: 'switch_single_1way', label: 'Công tắc đơn 1 chiều', defaultElevationMm: 1200, categoryGroup: 'electric' },
  { id: 'switch_single_2way', label: 'Công tắc đơn 2 chiều (đảo chiều)', defaultElevationMm: 1200, categoryGroup: 'electric' },
  { id: 'switch_double_1way', label: 'Công tắc đôi 1 chiều', defaultElevationMm: 1200, categoryGroup: 'electric' },
  { id: 'switch_double_2way', label: 'Công tắc đôi 2 chiều (đảo chiều)', defaultElevationMm: 1200, categoryGroup: 'electric' },
  { id: 'socket_double', label: 'Ổ cắm đôi 220V', defaultElevationMm: 300, categoryGroup: 'electric' },
  { id: 'socket_single', label: 'Ổ cắm đơn 220V', defaultElevationMm: 300, categoryGroup: 'electric' },
  { id: 'water_meter', label: 'Đồng hồ nước (ĐH)', defaultElevationMm: 400, categoryGroup: 'water' },
  { id: 'panel_db', label: 'Tủ điện tổng DB', defaultElevationMm: 1500, categoryGroup: 'electric' },
  { id: 'light_ceiling', label: 'Đèn trần Downlight', defaultElevationMm: 2800, categoryGroup: 'electric' },
  { id: 'ac_indoor', label: 'Máy lạnh Indoor Unit', defaultElevationMm: 2500, categoryGroup: 'hvac' },
  { id: 'water_supply', label: 'Ống cấp nước sạch D21', defaultElevationMm: 600, categoryGroup: 'water' },
  { id: 'water_drain', label: 'Phễu thu thoát sàn D60', defaultElevationMm: 0, categoryGroup: 'water' },
  { id: 'toilet_drain', label: 'Ống xả bồn cầu Ø110', defaultElevationMm: 0, categoryGroup: 'water' },
  { id: 'fire_detector', label: 'Đầu báo khói / báo cháy PCCC', defaultElevationMm: 2800, categoryGroup: 'fire' },
  { id: 'fire_hydrant', label: 'Tủ cứu hỏa vách tường', defaultElevationMm: 1200, categoryGroup: 'fire' },
];

export const getMepCategoryLabel = (cat: MepCategory): string => {
  const item = MEP_CATEGORIES.find((c) => c.id === cat);
  if (item) return item.label;
  if (cat === 'switch_1') return 'Công tắc đơn 1 chiều';
  if (cat === 'switch_2') return 'Công tắc đôi 1 chiều';
  return 'Thiết bị MEP';
};
