export interface FishingParams {
  leadWeight: number; // g
  floatBuoyancy: number; // g
  hookWeight: number; // g
  baitWeight: number; // g
  waterDensity: number; // g/cm^3
  waterDepth: number; // cm
  lineLength: number; // cm
  subLineLength: number; // cm
  hookSpacing: number; // cm
  subLineThickness: number; // 号数
  waterFlow: number; // -5 to 5
  hasSubLine: boolean; // 是否带子线双钩
}

export interface FishingState {
  floatY: number; // cm from surface (0 is surface, positive is down)
  leadY: number;
  hookY: number;
  status: 'floating' | 'suspended' | 'bottom_touch' | 'bottom_rest' | 'sunk';
  tensionMain: number;
  tensionSub: number;
  visibleMeshes: number; // How many meshes of the float are above water
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

export interface ShareData {
  version: string;
  appName: string;
  timestamp: string;
  description?: string;
  encrypted: boolean;
  data: string;
  params: FishingParams;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}
