import React from 'react';
import { FishingState } from '../types';
import { Info } from 'lucide-react';

interface DetectionSystemProps {
  state: FishingState;
}

export const DetectionSystem: React.FC<DetectionSystemProps> = ({ state }) => {
  const getStatusText = () => {
    switch (state.status) {
      case 'floating': return '浮漂平躺水面 (铅太轻或水太浅)';
      case 'suspended': return '悬浮状态 (半水调漂)';
      case 'bottom_touch': return '一饵触底，一饵悬浮 (灵敏)';
      case 'bottom_rest': return '双饵躺底，铅坠悬浮 (顿口明显)';
      case 'sunk': return '铅坠到底，浮漂没入水中 (铅太重)';
      default: return '未知状态';
    }
  };

  const getAdvice = () => {
    if (state.status === 'sunk') return '建议：剪铅皮或上推浮漂。';
    if (state.status === 'floating') return '建议：加铅皮或下拉浮漂。';
    if (state.status === 'suspended') return '建议：继续上推浮漂找底。';
    if (state.status === 'bottom_touch') return '建议：适合钓轻口鱼，保持。';
    if (state.status === 'bottom_rest') return '建议：适合钓滑鱼或底层鱼。';
    return '';
  };

  return (
    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-blue-900">状态检测</h2>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
          <span className="text-gray-600">当前水下状态</span>
          <span className="font-medium text-blue-700">{getStatusText()}</span>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
          <span className="text-gray-600">露出目数</span>
          <span className="font-mono font-bold text-orange-500 text-xl">
            {state.visibleMeshes} 目
          </span>
        </div>

        <div className="p-4 bg-blue-100/50 rounded-lg text-sm text-blue-800 leading-relaxed">
          {getAdvice()}
        </div>
      </div>
    </div>
  );
};
