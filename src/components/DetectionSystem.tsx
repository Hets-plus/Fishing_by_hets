import React, { useState, useEffect } from 'react';
import { FishingState } from '../types';
import { AlertTriangle, CheckCircle, HelpCircle, Anchor, ArrowDownUp } from 'lucide-react';
import suggestions from '../suggestions.json';

const statusConfig = {
  floating: {
    title: '浮漂躺平',
    icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
    color: 'orange',
    description: '铅坠过轻或浮漂浮力过大，整个线组浮在水面。'
  },
  suspended: {
    title: '双钩悬浮',
    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    color: 'green',
    description: '铅坠重量与浮漂浮力达到完美平衡，双钩悬浮于水中，灵敏度最高。'
  },
  bottom_touch: {
    title: '下钩触底',
    icon: <Anchor className="w-5 h-5 text-blue-500" />,
    color: 'blue',
    description: '下钩触底，上钩悬浮，是钓底层鱼类的经典状态，兼顾灵敏与稳定。'
  },
  bottom_rest: {
    title: '铅坠躺底',
    icon: <HelpCircle className="w-5 h-5 text-purple-500" />,
    color: 'purple',
    description: '铅坠和双钩都躺在水底，非常迟钝，但能有效抗风浪和过滤小鱼信号。'
  },
  sunk: {
    title: '浮漂沉没',
    icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
    color: 'red',
    description: '铅坠过重，浮漂被完全拉入水中，无法观察鱼讯。'
  }
};

interface DetectionSystemProps {
  state: FishingState;
}

export const DetectionSystem: React.FC<DetectionSystemProps> = ({ state }) => {
  const config = statusConfig[state.status];
  const [suggestion, setSuggestion] = useState({ title: '', description: '' });

  useEffect(() => {
    const availableSuggestions = suggestions[state.status] || [];
    if (availableSuggestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableSuggestions.length);
      setSuggestion(availableSuggestions[randomIndex]);
    }
  }, [state.status]);

  if (!config) return null;

  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100`}>
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <ArrowDownUp className="w-5 h-5 text-indigo-500" />
        状态检测 & 智能建议
      </h2>
      <div className={`bg-${config.color}-50 border-l-4 border-${config.color}-400 p-4 rounded-r-lg`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {config.icon}
          </div>
          <div className="ml-3">
            <p className={`text-sm font-bold text-${config.color}-700`}>{config.title}</p>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600">{config.description}</p>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200/80">
        <h3 className="text-sm font-semibold text-gray-500 mb-2">💡 hets钓鱼智能助手建议：</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="font-bold text-gray-800">{suggestion.title}</p>
          <p className="mt-1 text-sm text-gray-600">{suggestion.description}</p>
        </div>
      </div>
    </div>
  );
};
