import React, { useState, useEffect } from 'react';
import { FishingParams, FishingState } from './types';
import { calculateFishingState } from './utils/physics';
import { WaterTank } from './components/WaterTank';
import { ControlPanel } from './components/ControlPanel';
import { DetectionSystem } from './components/DetectionSystem';
import { AchievementSystem } from './components/AchievementSystem';
import { Droplet, Activity } from 'lucide-react';

export default function App() {
  const [params, setParams] = useState<FishingParams>({
    leadWeight: 2.5,
    floatBuoyancy: 3.0,
    hookWeight: 0.2,
    baitWeight: 0,
    waterDensity: 1.0,
    waterDepth: 200,
    lineLength: 100,
    subLineLength: 45,
    hookSpacing: 5,
    subLineThickness: 0.8,
    waterFlow: 0,
    hasSubLine: true,
  });

  const [state, setState] = useState<FishingState>({
    floatY: 0,
    leadY: 0,
    hookY: 0,
    status: 'suspended',
    tensionMain: 0,
    tensionSub: 0,
    visibleMeshes: 10,
  });

  const [biteEvent, setBiteEvent] = useState<{ id: number, target: 'upper' | 'lower', type: 'pull' | 'lift' } | null>(null);

  const triggerBite = (target: 'upper' | 'lower', type: 'pull' | 'lift') => {
    setBiteEvent({ id: Date.now(), target, type });
  };

  useEffect(() => {
    setState(calculateFishingState(params));
  }, [params]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-200">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
            <Droplet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">智能钓鱼调漂模拟器</h1>
            <p className="text-xs text-gray-500 font-medium">动态水下物理引擎驱动</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Visual & Detection */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
              <WaterTank state={state} params={params} biteEvent={biteEvent} />
            </div>
            
            {/* Bite Simulation Panel */}
            {params.hasSubLine && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-rose-500" />
                  咬钩模拟 (动态漂相)
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-600">上钩 (短子线)</div>
                    <div className="flex gap-2">
                      <button onClick={() => triggerBite('upper', 'pull')} className="flex-1 py-2 bg-rose-50 text-rose-600 rounded-lg text-sm hover:bg-rose-100 transition-colors font-medium">顿口 (下拉)</button>
                      <button onClick={() => triggerBite('upper', 'lift')} className="flex-1 py-2 bg-sky-50 text-sky-600 rounded-lg text-sm hover:bg-sky-100 transition-colors font-medium">顶漂 (上送)</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-600">下钩 (长子线)</div>
                    <div className="flex gap-2">
                      <button onClick={() => triggerBite('lower', 'pull')} className="flex-1 py-2 bg-rose-50 text-rose-600 rounded-lg text-sm hover:bg-rose-100 transition-colors font-medium">顿口 (下拉)</button>
                      <button onClick={() => triggerBite('lower', 'lift')} className="flex-1 py-2 bg-sky-50 text-sky-600 rounded-lg text-sm hover:bg-sky-100 transition-colors font-medium">顶漂 (上送)</button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                  💡 提示：漂相的灵敏度受当前调钓状态（悬浮/触底/躺底）以及子线粗细、水流等因素的综合影响。躺底时最迟钝，悬浮时最灵敏。
                </div>
              </div>
            )}

            <DetectionSystem state={state} />
          </div>

          {/* Right Column: Controls & Achievements */}
          <div className="lg:col-span-5 space-y-6">
            <ControlPanel params={params} onChange={setParams} />
            <AchievementSystem state={state} />
          </div>

        </div>
      </main>
    </div>
  );
}
