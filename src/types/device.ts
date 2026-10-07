export type DeviceType = 'iphone' | 'ipad' | 'desktop';
export type OperatingSystem = 'ios' | 'android';

export interface DeviceConfig {
  deviceType: DeviceType;
  osType: OperatingSystem;
  simulateFrame: boolean; // When on desktop, show device frame (iPhone/iPad mockup)
  orientation: 'portrait' | 'landscape';
}
