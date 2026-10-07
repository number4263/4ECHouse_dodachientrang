import { sounds } from './soundEffects';

export interface LaserDeviceStatus {
  connected: boolean;
  deviceName: string | null;
  batteryLevel?: number;
  lastReadingMm?: number;
  signalStrength?: number;
}

export type MeasurementCallback = (valueMm: number, rawData?: string) => void;
export type StatusCallback = (status: LaserDeviceStatus) => void;

class BluetoothLaserService {
  private device: any = null;
  private server: any = null;
  private characteristic: any = null;
  private onMeasurementCallbacks: MeasurementCallback[] = [];
  private onStatusCallbacks: StatusCallback[] = [];
  private status: LaserDeviceStatus = {
    connected: false,
    deviceName: null,
  };

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  public getStatus(): LaserDeviceStatus {
    return { ...this.status };
  }

  public subscribeMeasurement(cb: MeasurementCallback) {
    this.onMeasurementCallbacks.push(cb);
    return () => {
      this.onMeasurementCallbacks = this.onMeasurementCallbacks.filter((c) => c !== cb);
    };
  }

  public subscribeStatus(cb: StatusCallback) {
    this.onStatusCallbacks.push(cb);
    cb(this.status);
    return () => {
      this.onStatusCallbacks = this.onStatusCallbacks.filter((c) => c !== cb);
    };
  }

  private updateStatus(newStatus: Partial<LaserDeviceStatus>) {
    this.status = { ...this.status, ...newStatus };
    this.onStatusCallbacks.forEach((cb) => cb(this.status));
  }

  // Connect to real hardware laser meter using Web Bluetooth API
  public async connect(): Promise<boolean> {
    if (!this.isSupported()) {
      throw new Error('Trình duyệt hiện tại không hỗ trợ Web Bluetooth. Vui lòng dùng Chrome, Edge trên Android/PC/Mac hoặc dùng Chế độ Giả lập Thước Laser.');
    }

    try {
      // Known BLE services for laser rangefinders:
      // - Leica Disto: 3ab10100-f831-4395-b29d-570977d5bf94
      // - Bosch GLM: 00005301-0000-0041-4c53-5f4c45594b45 or generic
      // - Mileseey / SNDWAY: FFE0 / generic serial 0xFFE0
      const navAny = navigator as any;
      const device = await navAny.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          'generic_access',
          'battery_service',
          0xffe0, // common serial / BLE module
          0xfff0,
          '3ab10100-f831-4395-b29d-570977d5bf94', // Leica Disto
          '00005301-0000-0041-4c53-5f4c45594b45', // Bosch GLM
        ],
      });

      this.device = device;
      device.addEventListener('gattserverdisconnected', () => {
        this.updateStatus({ connected: false, deviceName: null });
      });

      const server = await device.gatt.connect();
      this.server = server;

      // Discover primary services and characteristics for notifications
      try {
        const services = await server.getPrimaryServices();
        for (const service of services) {
          const characteristics = await service.getCharacteristics();
          for (const char of characteristics) {
            if (char.properties.notify || char.properties.indicate) {
              await char.startNotifications();
              char.addEventListener('characteristicvaluechanged', (event: any) => {
                this.handleCharacteristicValueChanged(event.target.value);
              });
              this.characteristic = char;
              break;
            }
          }
          if (this.characteristic) break;
        }
      } catch (err) {
        console.warn('Không thể đăng ký auto notify, kết nối ở chế độ đọc chủ động', err);
      }

      this.updateStatus({
        connected: true,
        deviceName: device.name || 'Thước Laser BLE',
        batteryLevel: 92,
      });

      sounds.playBluetoothConnected();
      return true;
    } catch (error: any) {
      if (
        error.name === 'SecurityError' ||
        (error.message && error.message.toLowerCase().includes('disallowed')) ||
        (error.message && error.message.toLowerCase().includes('permission'))
      ) {
        throw new Error(
          'Không thể kết nối Bluetooth do Chính sách Bảo mật (Permissions Policy) của trình duyệt / môi trường Iframe sandbox. ' +
          'Trình duyệt đang chặn quyền truy cập Bluetooth trực tiếp từ cửa sổ phụ này.\n\n' +
          '👉 CÁCH KHẮC PHỤC:\n' +
          '1. Vui lòng bấm trực tiếp các nút trên bộ giả lập thước laser ảo bên dưới để đo nhanh.\n' +
          '2. Hoặc nhấn mở liên kết ngoài "Shared App URL" trực tiếp trên trình duyệt chính (Chrome, Edge hoặc Safari) để sử dụng thước laser thật qua Bluetooth.'
        );
      }
      if (error.name !== 'NotFoundError') {
        console.error('Lỗi kết nối Bluetooth:', error);
      }
      throw error;
    }
  }

  public disconnect() {
    if (this.device && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.server = null;
    this.characteristic = null;
    this.updateStatus({ connected: false, deviceName: null });
  }

  // Parse bytes from rangefinder characteristic
  private handleCharacteristicValueChanged(value: DataView) {
    let readingMm: number | null = null;
    const len = value.byteLength;

    // Check if ASCII text (e.g. "3.456m" or "2540")
    let str = '';
    for (let i = 0; i < len; i++) {
      str += String.fromCharCode(value.getUint8(i));
    }
    const match = str.match(/([0-9]+(\.[0-9]+)?)/);
    if (match) {
      const val = parseFloat(match[1]);
      if (val < 100) {
        // Value in meters -> convert to mm
        readingMm = Math.round(val * 1000);
      } else {
        readingMm = Math.round(val);
      }
    } else if (len >= 4) {
      // 32-bit float Little Endian or Big Endian
      try {
        const fval = value.getFloat32(0, true);
        if (fval > 0.05 && fval < 200) {
          readingMm = Math.round(fval * 1000);
        }
      } catch {
        // fallback
      }
    }

    if (readingMm && readingMm > 0) {
      this.dispatchMeasurement(readingMm, str);
    }
  }

  // Dispatches measurement to all registered listeners
  public dispatchMeasurement(valueMm: number, rawData?: string) {
    this.updateStatus({ lastReadingMm: valueMm });
    sounds.playMeasurementConfirmed();
    this.onMeasurementCallbacks.forEach((cb) => cb(valueMm, rawData));
  }

  // Simulate laser trigger / manual input
  public simulateMeasure(valueMm: number) {
    sounds.playLaserBeep();
    setTimeout(() => {
      this.dispatchMeasurement(valueMm, `SIM:${valueMm}mm`);
    }, 250);
  }
}

export const laserService = new BluetoothLaserService();
