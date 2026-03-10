import React, { useEffect, useState } from 'react';
import { FishingState, Achievement } from '../types';
import { Award, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AchievementSystemProps {
  state: FishingState;
}

export const AchievementSystem: React.FC<AchievementSystemProps> = ({ state }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 'first_blood', title: '初入江湖', description: '第一次调漂', unlocked: false, icon: '🐟' },
    { id: 'perfect_balance', title: '完美平衡', description: '调四钓二 (露出2目)', unlocked: false, icon: '⚖️' },
    { id: 'bottom_feeder', title: '底层猎手', description: '铅坠到底', unlocked: false, icon: '⚓' },
    { id: 'suspended_master', title: '悬浮大师', description: '半水调漂成功', unlocked: false, icon: '🎈' },
    { id: 'sunk_stone', title: '沉底顽石', description: '浮漂完全没入水中', unlocked: false, icon: '🪨' },
  ]);

  const [recentUnlock, setRecentUnlock] = useState<Achievement | null>(null);

  useEffect(() => {
    const unlock = (id: string) => {
      setAchievements(prev => prev.map(a => {
        if (a.id === id && !a.unlocked) {
          setRecentUnlock({ ...a, unlocked: true });
          setTimeout(() => setRecentUnlock(null), 3000);
          return { ...a, unlocked: true };
        }
        return a;
      }));
    };

    unlock('first_blood');

    if (Math.abs(state.visibleMeshes - 2) < 0.1 && state.status === 'bottom_touch') {
      unlock('perfect_balance');
    }

    if (state.status === 'bottom_rest') {
      unlock('bottom_feeder');
    }

    if (state.status === 'suspended') {
      unlock('suspended_master');
    }

    if (state.status === 'sunk') {
      unlock('sunk_stone');
    }
  }, [state]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
      <div className="flex items-center gap-2 mb-6">
        <Award className="w-5 h-5 text-yellow-500" />
        <h2 className="text-lg font-semibold text-gray-800">成就系统</h2>
      </div>

      <div className="space-y-3">
        {achievements.map((ach) => (
          <div 
            key={ach.id} 
            className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
              ach.unlocked ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50 border border-gray-100 opacity-60 grayscale'
            }`}
          >
            <div className="text-2xl">{ach.icon}</div>
            <div className="flex-1">
              <h3 className={`font-medium ${ach.unlocked ? 'text-yellow-800' : 'text-gray-600'}`}>
                {ach.title}
              </h3>
              <p className="text-sm text-gray-500">{ach.description}</p>
            </div>
            {ach.unlocked && <CheckCircle2 className="w-5 h-5 text-yellow-500" />}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {recentUnlock && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 whitespace-nowrap z-50"
          >
            <span className="text-xl">{recentUnlock.icon}</span>
            <div>
              <p className="text-xs text-gray-400">解锁成就</p>
              <p className="font-bold">{recentUnlock.title}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
