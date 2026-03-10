import React from 'react';
import { FishingParams } from '../types';
import { Settings2 } from 'lucide-react';
import { SharePanel } from './SharePanel';

interface ControlPanelProps {
  params: FishingParams;
  onChange: (params: FishingParams) => void;
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ params, onChange, onToast }) => {
  const handleChange = (key: keyof FishingParams, value: number) => {
    onChange({ ...params, [key]: value });
  };

  const controls = [
    { key: 'leadWeight', label: '铅重 (g)', min: 0, max: 10, step: 0.1 },
    { key: 'floatBuoyancy', label: '浮漂吃铅 (g)', min: 0.5, max: 5, step: 0.1 },
    { key: 'waterDensity', label: '水质密度', min: 0.9, max: 1.2, step: 0.01 },
    { key: 'waterFlow', label: '水流强度', min: -5, max: 5, step: 0.5 },
    { key: 'waterDepth', label: '水深 (cm)', min: 50, max: 500, step: 10 },
    { key: 'lineLength', label: '主线长 (cm)', min: 10, max: 400, step: 1 },
  ];

  const subLineControls = [
    { key: 'hookWeight', label: '双钩重 (g)', min: 0, max: 2, step: 0.05 },
    { key: 'baitWeight', label: '双饵重 (g)', min: 0, max: 5, step: 0.1 },
    { key: 'subLineLength', label: '子线长 (cm)', min: 15, max: 100, step: 1 },
    { key: 'hookSpacing', label: '钩间距 (cm)', min: 1, max: 20, step: 0.5 },
    { key: 'subLineThickness', label: '子线线号', min: 0.2, max: 3.0, step: 0.1 },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">参数调节</h2>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-sm font-medium text-gray-700">带子线双钩</span>
          <div className="relative">
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={params.hasSubLine}
              onChange={(e) => handleChange('hasSubLine' as keyof FishingParams, e.target.checked as any)}
            />
            <div className={`block w-10 h-6 rounded-full transition-colors ${params.hasSubLine ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${params.hasSubLine ? 'transform translate-x-4' : ''}`}></div>
          </div>
        </label>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {controls.map((ctrl) => (
          <div key={ctrl.key} className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-600">{ctrl.label}</label>
              <span className="text-sm font-mono text-blue-600">
                {params[ctrl.key as keyof FishingParams].toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={ctrl.min}
              max={ctrl.max}
              step={ctrl.step}
              value={params[ctrl.key as keyof FishingParams] as number}
              onChange={(e) => handleChange(ctrl.key as keyof FishingParams, parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        ))}
        {subLineControls.map((ctrl) => (
          <div key={ctrl.key} className={`space-y-2 transition-opacity ${params.hasSubLine ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-600">{ctrl.label}</label>
              <span className="text-sm font-mono text-blue-600">
                {params[ctrl.key as keyof FishingParams].toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={ctrl.min}
              max={ctrl.max}
              step={ctrl.step}
              value={params[ctrl.key as keyof FishingParams] as number}
              onChange={(e) => handleChange(ctrl.key as keyof FishingParams, parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              disabled={!params.hasSubLine}
            />
          </div>
        ))}
      </div>

      {/* Share Panel */}
      <SharePanel
        params={params}
        onImport={onChange}
        onToast={onToast}
      />
    </div>
  );
};
