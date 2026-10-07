import { useState, useEffect, useCallback } from 'react';
import { DeviceConfig, DeviceType, OperatingSystem } from '../types/device';

export function useDeviceConfig() {
  const [config, setConfig] = useState<DeviceConfig>(() => {
    // Default initial detection
    let detectedDevice: DeviceType = 'desktop';
    let detectedOS: OperatingSystem = 'ios';

    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent || '';
      const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isAndroid = /Android/.test(ua);
      const isTablet = /iPad/.test(ua) || (isIOS && window.innerWidth >= 768) || (isAndroid && !/Mobile/.test(ua)) || (window.innerWidth >= 768 && window.innerWidth <= 1180);
      const isPhone = /iPhone|iPod/.test(ua) || (isAndroid && /Mobile/.test(ua)) || window.innerWidth < 640;

      if (isPhone) {
        detectedDevice = 'iphone';
      } else if (isTablet) {
        detectedDevice = 'ipad';
      } else {
        detectedDevice = 'desktop';
      }

      if (isAndroid) {
        detectedOS = 'android';
      } else {
        detectedOS = 'ios';
      }

      // Check saved preference
      try {
        const saved = localStorage.getItem('four_ec_house_device_config') || localStorage.getItem('zhouse_cad_device_config');
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            deviceType: parsed.deviceType || detectedDevice,
            osType: parsed.osType || detectedOS,
            simulateFrame: parsed.simulateFrame !== undefined ? parsed.simulateFrame : false,
            orientation: parsed.orientation || (window.innerWidth < window.innerHeight ? 'portrait' : 'landscape'),
          };
        }
      } catch {
        // ignore
      }
    }

    return {
      deviceType: detectedDevice,
      osType: detectedOS,
      simulateFrame: false,
      orientation: 'landscape',
    };
  });

  const updateConfig = useCallback((newConfig: Partial<DeviceConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...newConfig };
      try {
        localStorage.setItem('four_ec_house_device_config', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const setDeviceType = useCallback((type: DeviceType) => {
    updateConfig({ deviceType: type });
  }, [updateConfig]);

  const setOsType = useCallback((os: OperatingSystem) => {
    updateConfig({ osType: os });
  }, [updateConfig]);

  const toggleSimulateFrame = useCallback(() => {
    setConfig((prev) => {
      const next = { ...prev, simulateFrame: !prev.simulateFrame };
      try {
        localStorage.setItem('four_ec_house_device_config', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const toggleOrientation = useCallback(() => {
    setConfig((prev) => {
      const nextOrient: 'portrait' | 'landscape' = prev.orientation === 'portrait' ? 'landscape' : 'portrait';
      const next: DeviceConfig = { ...prev, orientation: nextOrient };
      try {
        localStorage.setItem('four_ec_house_device_config', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  return {
    config,
    updateConfig,
    setDeviceType,
    setOsType,
    toggleSimulateFrame,
    toggleOrientation,
  };
}
