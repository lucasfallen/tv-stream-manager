export type DeviceType = 'tv' | 'pc' | 'tablet' | 'mobile' | 'other';

export interface DeviceSpecs {
  screenSize?: string; // ex: "55 inch", "13.3 inch", "6.1 inch"
  resolution?: string; // ex: "1920x1080", "2560x1440", "1170x2532"
  operatingSystem?: string; // ex: "Android", "iOS", "Windows", "macOS"
  browser?: string; // ex: "Chrome", "Safari", "Firefox", "Edge"
  processor?: string; // ex: "Intel i5", "Apple M1", "Snapdragon 888"
  memory?: string; // ex: "8GB RAM", "16GB RAM"
  storage?: string; // ex: "256GB SSD", "512GB SSD"
  network?: string; // ex: "WiFi 6", "Ethernet", "5G"
}

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  specs: DeviceSpecs;
  notes?: string;
  currentDashboardIndex: number;
  isPlaying: boolean;
  isConnected: boolean;
  totalDashboards: number;
  lastConnection?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DeviceUpdateData {
  name?: string;
  type?: DeviceType;
  specs?: Partial<DeviceSpecs>;
  notes?: string;
}
