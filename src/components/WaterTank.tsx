import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FishingState, FishingParams } from '../types';

const FishShape = ({ size = 40, shape = 'standard', name = '', dir = 1, className = "" }) => {
  let bodyPath = "M20,20 Q40,0 75,12 Q95,18 100,20 Q95,22 75,28 Q40,40 20,20 Z"; // standard
  if (shape === 'chunky') {
    bodyPath = "M20,20 Q40,-5 75,10 Q95,15 100,20 Q95,25 75,30 Q40,45 20,20 Z";
  } else if (shape === 'flat') {
    bodyPath = "M20,20 L45,2 L75,12 Q95,18 100,20 Q95,22 75,28 L45,38 Z";
  }

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <span className="text-[10px] font-medium text-white/90 mb-0.5 whitespace-nowrap drop-shadow-md">{name}</span>
      <svg width={size} height={size * 0.4} viewBox="0 0 100 40" fill="currentColor" className={dir === -1 ? "scale-x-[-1]" : ""}>
        {/* Body */}
        <path d={bodyPath} />
        {/* Tail */}
        <path d="M20,20 L0,0 Q5,10 5,20 Q5,30 0,40 Z" />
        {/* Top Fin */}
        <path d="M45,8 Q55,-5 65,10 Z" />
        {/* Bottom Fin */}
        <path d="M50,31 Q55,45 60,29 Z" />
        {/* Eye */}
        <circle cx="85" cy="17" r="2" fill="#fff" />
      </svg>
    </div>
  );
};

const BiteFish = ({ type }: { type: 'pull' | 'lift' }) => {
  const color = type === 'pull' ? '#f97316' : '#eab308';
  return (
    <g transform="scale(0.6) translate(0, -20)">
      <path d="M80,20 Q60,0 25,12 Q5,18 0,20 Q5,22 25,28 Q60,40 80,20 Z" fill={color} />
      <path d="M80,20 L100,0 Q95,10 95,20 Q95,30 100,40 Z" fill={color} />
      <path d="M55,8 Q45,-5 35,10 Z" fill={color} />
      <path d="M50,31 Q45,45 40,29 Z" fill={color} />
      <circle cx="15" cy="17" r="2" fill="#fff" />
      <circle cx="14" cy="17" r="1" fill="#000" />
    </g>
  );
};

const FISH_SPECIES = [
  { name: '鲢鳙 (上层)', y: 30, size: 65, color: 'text-slate-200', duration: 25, delay: 0, dir: 1, shape: 'chunky' },
  { name: '草鱼 (中层)', y: 110, size: 75, color: 'text-emerald-400/80', duration: 30, delay: 5, dir: -1, shape: 'standard' },
  { name: '鳊鱼 (中下层)', y: 180, size: 50, color: 'text-zinc-300/90', duration: 22, delay: 2, dir: 1, shape: 'flat' },
  { name: '鲮鱼 (底层)', y: 260, size: 45, color: 'text-cyan-400/80', duration: 20, delay: 7, dir: -1, shape: 'standard' },
  { name: '鲫鱼 (底层)', y: 320, size: 40, color: 'text-yellow-400/90', duration: 18, delay: 1, dir: 1, shape: 'standard' },
  { name: '鲤鱼 (底层)', y: 360, size: 70, color: 'text-orange-400/80', duration: 28, delay: 4, dir: -1, shape: 'chunky' },
];

interface WaterTankProps {
  state: FishingState;
  params: FishingParams;
  biteEvent?: { id: number, target: 'upper' | 'lower', type: 'pull' | 'lift' } | null;
}

export const WaterTank: React.FC<WaterTankProps> = ({ state, params, biteEvent }) => {
  const [biteOffsets, setBiteOffsets] = useState({
    upperHook: { x: 0, y: 0 },
    lowerHook: { x: 0, y: 0 },
    lead: { x: 0, y: 0 },
    float: 0
  });
  const [activeFishBite, setActiveFishBite] = useState<{ id: number, target: 'upper' | 'lower', type: 'pull' | 'lift', phase: 'hidden' | 'approaching' | 'biting' | 'leaving' } | null>(null);

  const particles = useMemo(() => {
    return [...Array(12)].map(() => ({
      width: Math.random() * 40 + 10,
      top: Math.random() * 350 + 20,
      delay: Math.random() * 3,
      baseDuration: Math.random() * 2
    }));
  }, []);

  // Scale factor to fit the water depth in the container
  const scale = 400 / params.waterDepth; // 400px is the height of the water area

  // Float tail is 60px (10 meshes, 6px each)
  // If visibleMeshes = 10, top of float is at -60px (above water)
  // If visibleMeshes = 0, top of float is at 0px (at water surface)
  // If sunk, floatTopY is positive
  const baseFloatTopY = state.status === 'sunk' ? state.floatY * scale : -state.visibleMeshes * 6;
  
  // Constrain visual Y coordinates so elements don't clip through the bottom
  const MUD_Y = 380; // Mud starts at 380px relative to water surface
  
  const mainLineSlack = Math.max(0, params.lineLength - (state.leadY - state.floatY)) * scale;
  const isFloatFlat = state.status === 'floating' || mainLineSlack > 0;
  const isLeadFlat = state.status === 'bottom_rest' && mainLineSlack > 0;

  const maxLeadY = isLeadFlat ? MUD_Y - 10.5 : MUD_Y - 21;
  const leadY = Math.min(maxLeadY, state.leadY * scale);
  
  const isLowerHookFlat = state.hookY * scale >= MUD_Y - 10;
  const maxLowerHookY = isLowerHookFlat ? MUD_Y : MUD_Y - 7.5;
  const hookY = Math.min(maxLowerHookY, state.hookY * scale); // Lower hook Y

  const subLen = params.subLineLength * scale;
  const hookDiff = Math.min(params.hookSpacing * scale, subLen * 0.9); // Upper hook is higher by hookSpacing

  const lowerHookY = hookY;
  const rawUpperHookY = leadY + subLen - hookDiff;
  const isUpperHookFlat = rawUpperHookY >= MUD_Y - 10;
  const maxUpperHookY = isUpperHookFlat ? MUD_Y : MUD_Y - 7.5;
  const upperHookY = Math.min(maxUpperHookY, rawUpperHookY);

  // Calculate slack (how much the line needs to bend)
  const lowerSlack = Math.max(0, params.subLineLength - (state.hookY - state.leadY)) * scale;
  const upperSlack = Math.max(0, (params.subLineLength - params.hookSpacing) - (state.hookY - state.leadY)) * scale;

  const mainLineStartX = isFloatFlat ? 45 : 80;
  // Adjusted connection point based on new float total length (Tail 60 + Body 40 + Pin 40 = 140)
  const mainLineStartY = isFloatFlat ? 0 : baseFloatTopY + 140;

  useEffect(() => {
    if (!biteEvent) return;

    const { target, type, id } = biteEvent;
    
    // Reset offsets immediately when a new bite starts
    setBiteOffsets({ upperHook: {x:0, y:0}, lowerHook: {x:0, y:0}, lead: {x:0, y:0}, float: 0 });
    setActiveFishBite({ id, target, type, phase: 'approaching' });

    let hx = 0, hy = 0, lx = 0, ly = 0, fy = 0;

    const isLeadOnBottom = leadY >= MUD_Y - 20;
    // Lead mobility: if on bottom, it's heavy and anchored (0.2). If suspended, it moves easily (1.0).
    const leadMobility = isLeadOnBottom ? 0.2 : 1.0;
    
    // Subline thickness affects signal transmission
    const stiffness = Math.max(0.5, Math.min(1.5, params.subLineThickness / 1.0));

    if (type === 'pull') {
      hx = target === 'upper' ? 10 : 15;
      hy = 15;
      
      // Check slack
      const slack = target === 'upper' ? upperSlack : lowerSlack;
      // Fish must pull past the slack to move the lead
      const effectivePull = Math.max(0, hy - slack);
      
      ly = effectivePull * leadMobility * stiffness;
      fy = Math.max(0, ly - mainLineSlack); // Float follows lead only if main line is taut
    } else if (type === 'lift') {
      hx = 5;
      hy = -20;
      
      // If lifting removes weight, float might rise.
      if (isLeadOnBottom) {
        // Fish needs to lift higher than the lead to move it
        const hookCurrentY = target === 'upper' ? upperHookY : lowerHookY;
        const hookNewY = hookCurrentY + hy;
        if (hookNewY < leadY) {
           ly = hookNewY - leadY; // negative (up)
           fy = mainLineSlack > 0 ? 0 : ly; // If main line is slack, lifting lead doesn't push float up
        }
      } else {
        // Lead is suspended. Lifting bait removes weight, float rises.
        ly = -10 * stiffness;
        fy = mainLineSlack > 0 ? 0 : ly;
      }
    }

    const t1 = setTimeout(() => {
      setActiveFishBite(prev => prev?.id === id ? { ...prev, phase: 'biting' } : prev);
      setBiteOffsets({
        upperHook: target === 'upper' ? { x: hx, y: hy } : { x: 0, y: 0 },
        lowerHook: target === 'lower' ? { x: hx, y: hy } : { x: 0, y: 0 },
        lead: { x: 0, y: ly },
        float: fy
      });
    }, 400);

    const t2 = setTimeout(() => {
      setActiveFishBite(prev => prev?.id === id ? { ...prev, phase: 'leaving' } : prev);
      setBiteOffsets({ upperHook: {x:0, y:0}, lowerHook: {x:0, y:0}, lead: {x:0, y:0}, float: 0 });
    }, 1000);

    const t3 = setTimeout(() => {
      setActiveFishBite(prev => prev?.id === id ? null : prev);
    }, 1600);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [biteEvent, leadY, upperHookY, lowerHookY, upperSlack, lowerSlack, params.subLineThickness]);

  // Apply bite offsets
  const finalLeadY = leadY + biteOffsets.lead.y;
  const finalFloatTopY = baseFloatTopY + biteOffsets.float;
  const finalUpperHookY = upperHookY + biteOffsets.upperHook.y;
  const finalLowerHookY = lowerHookY + biteOffsets.lowerHook.y;

  // Water flow calculations
  const flow = params.waterFlow;
  const leadX = 80 + (state.status === 'bottom_rest' ? flow * 1 : flow * 5) + biteOffsets.lead.x;
  
  // Base separation when flow is 0
  // When suspended (slack = 0), they hang straight down (0 offset).
  // When touching bottom (slack > 0), they bend to the right.
  const baseUpperX = upperSlack > 0 ? Math.min(upperSlack * 0.8, 25) : 0;
  
  // Enhanced separation logic for long sub-line: increased multiplier and max limit
   // to ensure it is clearly distinguishable from the short sub-line when lying on bottom.
   const baseLowerX = lowerSlack > 0 ? Math.min(lowerSlack * 1.4, 70) : 0;

  // When flow increases, they both converge to the flow direction
  const flowFactor = Math.min(Math.abs(flow) / 2, 1); // Max convergence at flow = 2
  
  // Target separation when flowing
  const targetUpperX = flow > 0 ? 5 : -5;
  const targetLowerX = flow > 0 ? 15 : -15;
  
  const upperOffsetX = baseUpperX * (1 - flowFactor) + targetUpperX * flowFactor;
  const lowerOffsetX = baseLowerX * (1 - flowFactor) + targetLowerX * flowFactor;
  
  const mainLineEndX = isLeadFlat ? leadX - 15.5 : leadX;
  const mainLineEndY = isLeadFlat ? finalLeadY + 5.5 : finalLeadY - 10;

  const subLineStartX = isLeadFlat ? leadX + 15.5 : leadX;
  const subLineStartY = isLeadFlat ? finalLeadY + 5.5 : finalLeadY + 21;

  const upperHookX = subLineStartX + upperOffsetX + (isUpperHookFlat ? flow * 2 : flow * 8) + biteOffsets.upperHook.x;
  const lowerHookX = subLineStartX + lowerOffsetX + (isLowerHookFlat ? flow * 2 : flow * 8) + biteOffsets.lowerHook.x;

  let upperScaleX = 1;
  if (flow < -0.5) upperScaleX = -1;

  let lowerScaleX = 1;
  if (flow < -0.5) lowerScaleX = -1;

  // Flow effect on the line's bowing
  const flowBow = flow * 8;
  
  const upperDisplacement = upperHookX - subLineStartX;
  const lowerDisplacement = lowerHookX - subLineStartX;
  
  // Upper line cubic bezier control points
  const upperCp1X = subLineStartX + flowBow + upperDisplacement * 0.3;
  const upperCp1Y = Math.min(MUD_Y - 2, subLineStartY + (finalUpperHookY - subLineStartY) * 0.3 + upperSlack * 0.6);
  const upperCp2X = upperHookX + flowBow * 0.5 - upperDisplacement * 0.1;
  const upperCp2Y = Math.min(MUD_Y - 2, finalUpperHookY - (finalUpperHookY - subLineStartY) * 0.3 + upperSlack * 0.6);

  // Lower line cubic bezier control points
  const lowerCp1X = subLineStartX + flowBow + lowerDisplacement * 0.3;
  const lowerCp1Y = Math.min(MUD_Y - 2, subLineStartY + (finalLowerHookY - subLineStartY) * 0.3 + lowerSlack * 0.6);
  const lowerCp2X = lowerHookX + flowBow * 0.5 - lowerDisplacement * 0.1;
  const lowerCp2Y = Math.min(MUD_Y - 2, finalLowerHookY - (finalLowerHookY - subLineStartY) * 0.3 + lowerSlack * 0.6);

  // Subline thickness styling
  const subLineStrokeWidth = Math.max(0.5, params.subLineThickness * 0.8);

  return (
    <div className="relative w-full h-[500px] bg-sky-100 rounded-xl overflow-hidden border-2 border-sky-200">
      {/* Sky */}
      <div className="absolute top-0 w-full h-[100px] bg-gradient-to-b from-sky-300 to-sky-100" />
      
      {/* Water Surface */}
      <div className="absolute top-[100px] w-full h-2 bg-blue-400/50 blur-[1px]" />
      
      {/* Water Body */}
      <div className="absolute top-[100px] w-full h-[400px] bg-gradient-to-b from-blue-500/30 to-blue-900/80">
        {/* Water Flow Particles */}
        {Math.abs(params.waterFlow) > 0 && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
            {particles.map((p, i) => (
              <motion.div
                key={i}
                className="absolute h-[2px] bg-white/30 rounded-full"
                style={{ width: p.width, top: p.top }}
                animate={{ x: params.waterFlow > 0 ? [-100, 500] : [500, -100] }}
                transition={{ 
                  duration: (10 - Math.abs(params.waterFlow)) * 0.3 + p.baseDuration, 
                  repeat: Infinity, 
                  ease: "linear",
                  delay: p.delay
                }}
              />
            ))}
          </div>
        )}
        {/* Fishes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-70">
          {FISH_SPECIES.map((fish, i) => (
            <motion.div 
              key={i}
              className={`absolute ${fish.color}`}
              style={{ top: fish.y }}
              animate={{ x: fish.dir === 1 ? [-200, 1000] : [1000, -200] }}
              transition={{ duration: fish.duration, repeat: Infinity, ease: "linear", delay: fish.delay }}
            >
              <FishShape size={fish.size} shape={fish.shape} name={fish.name} dir={fish.dir} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="absolute bottom-0 w-full h-4 bg-amber-900/80" />

      {/* Fishing Rig (SVG overlay for precise drawing of hooks, lead, and lines) */}
      <svg className="absolute top-[100px] left-1/2 -translate-x-1/2 w-40 h-[400px] pointer-events-none overflow-visible">
        
        {/* Main Line */}
        <motion.path 
          animate={{
            d: mainLineSlack > 0 
              ? `M ${mainLineStartX} ${mainLineStartY + biteOffsets.float} Q ${80 + flow * 12 + mainLineSlack * 0.5} ${(mainLineStartY + biteOffsets.float + mainLineEndY)/2} ${mainLineEndX} ${mainLineEndY}`
              : `M ${mainLineStartX} ${mainLineStartY + biteOffsets.float} Q ${80 + flow * 12} ${(mainLineStartY + biteOffsets.float + mainLineEndY)/2} ${mainLineEndX} ${mainLineEndY}`
          }}
          transition={{ type: "spring", stiffness: 50, damping: 10 }}
          stroke="rgba(255,255,255,0.6)" 
          strokeWidth="1.5" 
          fill="none"
        />

        {/* Sub Lines */}
        {params.hasSubLine && (
          <>
            <motion.path
              animate={{ d: `M ${subLineStartX} ${subLineStartY} C ${upperCp1X} ${upperCp1Y} ${upperCp2X} ${upperCp2Y} ${upperHookX} ${finalUpperHookY}` }}
              transition={{ type: "spring", stiffness: 50, damping: 10 }}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth={subLineStrokeWidth}
              fill="none"
            />
            <motion.path
              animate={{ d: `M ${subLineStartX} ${subLineStartY} C ${lowerCp1X} ${lowerCp1Y} ${lowerCp2X} ${lowerCp2Y} ${lowerHookX} ${finalLowerHookY}` }}
              transition={{ type: "spring", stiffness: 50, damping: 10 }}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth={subLineStrokeWidth}
              fill="none"
            />
          </>
        )}

        {/* Float */}
        <motion.g 
          animate={{ 
            y: isFloatFlat ? -41 : finalFloatTopY,
            rotate: isFloatFlat ? 90 : 0,
          }} 
          transition={{ type: "spring", stiffness: 50, damping: 10 }}
          style={{ originX: 0.5, originY: 0.5 }}
        >
          {/* Float Tail (Meshes) - Thinner and Taller */}
          {[...Array(10)].map((_, i) => (
            <rect key={i} x="79.2" y={i * 6} width="1.6" height="5.5" fill={i % 2 === 0 ? '#ef4444' : '#22c55e'} />
          ))}
          
          {/* Float Body (Smoother Jujube Shape) - Reduced Proportion */}
          <path 
            d="
              M 79.2 60 
              L 80.8 60 
              C 84 65, 87 75, 87 80 
              C 87 85, 84 95, 81 100 
              L 79 100 
              C 76 95, 73 85, 73 80 
              C 73 75, 76 65, 79.2 60 
              Z
            " 
            fill="#ffffff" 
            stroke="#cbd5e1" 
            strokeWidth="0.5" 
          />
          
          {/* Signature */}
          <text 
            x="80" 
            y="80" 
            textAnchor="middle" 
            dominantBaseline="middle" 
            fontSize="5" 
            fill="#dc2626" 
            fontWeight="bold" 
            transform="rotate(90, 80, 80)" 
            style={{ pointerEvents: 'none', userSelect: 'none', letterSpacing: '0.5px' }}
          >
            hets
          </text>
          
          {/* Float Pin (Longer & Adjusted Position) */}
          <rect x="79" y="100" width="2" height="40" fill="#1f2937" />
          
          {/* Length Info */}
          <text x="94" y="80" fontSize="8" fill="rgba(255,255,255,0.8)" style={{ pointerEvents: 'none' }}>47.5cm</text>
        </motion.g>

        {/* Lead & Figure 8 Ring */}
        <motion.g 
          animate={{ 
            x: leadX - 80, 
            y: finalLeadY,
            rotate: isLeadFlat ? -90 : 0
          }} 
          transition={{ type: "spring", stiffness: 50, damping: 10 }}
          style={{ originX: 0.5, originY: 0.5 }}
        >
          {/* Lead Sheet */}
          <rect x="75" y="-10" width="10" height="20" rx="3" fill="#71717a" stroke="#52525b" strokeWidth="1" />
          {/* Lead Sheet Texture */}
          <line x1="75" y1="-5" x2="85" y2="-5" stroke="#52525b" strokeWidth="1" opacity="0.6" />
          <line x1="75" y1="0" x2="85" y2="0" stroke="#52525b" strokeWidth="1" opacity="0.6" />
          <line x1="75" y1="5" x2="85" y2="5" stroke="#52525b" strokeWidth="1" opacity="0.6" />
          
          {/* Figure 8 Ring */}
          <circle cx="80" cy="12" r="2.5" fill="none" stroke="#d4d4d8" strokeWidth="1.5" />
          <circle cx="80" cy="16" r="2.5" fill="none" stroke="#d4d4d8" strokeWidth="1.5" />
        </motion.g>

        {/* Upper Hook & Bait */}
        {params.hasSubLine && (
          <motion.g 
            animate={{ 
              y: finalUpperHookY, 
              x: upperHookX, 
              scaleX: upperScaleX * 0.5, 
              scaleY: 0.5,
              rotate: isUpperHookFlat ? -90 : 0
            }} 
            transition={{ type: "spring", stiffness: 50, damping: 10 }}
            style={{ originX: "0px", originY: "0px" }}
          >
            {/* Hook */}
            <path d="M0 0 V 8 C 0 11 2.5 13 5 13 C 7.5 13 9 11 9 8.5 V 7 M 7 8.5 L 9 7 L 11 8.5" fill="none" stroke="#3f3f46" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="0" cy="0" r="1.5" fill="#3f3f46" />
            {/* Bait */}
            {params.baitWeight > 0 && (
              <>
                <circle cx="5" cy="11" r="4.5" fill="#d97706" />
                <circle cx="5" cy="11" r="2" fill="#fcd34d" />
              </>
            )}
            
            {/* Biting Fish */}
            {activeFishBite?.target === 'upper' && (
              <motion.g
                initial="hidden"
                animate={activeFishBite.phase === 'approaching' ? 'approaching' : activeFishBite.phase === 'biting' ? `biting_${activeFishBite.type}` : 'leaving'}
                variants={{
                  hidden: { x: 150, y: 80, opacity: 0, rotate: -20 },
                  approaching: { x: 5, y: 11, opacity: 1, rotate: 0, transition: { duration: 0.4, ease: "easeOut" } },
                  biting_pull: { x: 5, y: 11, opacity: 1, rotate: 15, transition: { duration: 0.1 } },
                  biting_lift: { x: 5, y: 11, opacity: 1, rotate: -30, transition: { duration: 0.1 } },
                  leaving: { x: -150, y: -50, opacity: 0, rotate: -10, transition: { duration: 0.6, ease: "easeIn" } }
                }}
              >
                <BiteFish type={activeFishBite.type} />
              </motion.g>
            )}
          </motion.g>
        )}

        {/* Lower Hook & Bait */}
        {params.hasSubLine && (
          <motion.g 
            animate={{ 
              y: finalLowerHookY, 
              x: lowerHookX, 
              scaleX: lowerScaleX * 0.5, 
              scaleY: 0.5,
              rotate: isLowerHookFlat ? -90 : 0
            }} 
            transition={{ type: "spring", stiffness: 50, damping: 10 }}
            style={{ originX: "0px", originY: "0px" }}
          >
            {/* Hook */}
            <path d="M0 0 V 8 C 0 11 2.5 13 5 13 C 7.5 13 9 11 9 8.5 V 7 M 7 8.5 L 9 7 L 11 8.5" fill="none" stroke="#3f3f46" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="0" cy="0" r="1.5" fill="#3f3f46" />
            {/* Bait */}
            {params.baitWeight > 0 && (
              <>
                <circle cx="5" cy="11" r="4.5" fill="#d97706" />
                <circle cx="5" cy="11" r="2" fill="#fcd34d" />
              </>
            )}

            {/* Biting Fish */}
            {activeFishBite?.target === 'lower' && (
              <motion.g
                initial="hidden"
                animate={activeFishBite.phase === 'approaching' ? 'approaching' : activeFishBite.phase === 'biting' ? `biting_${activeFishBite.type}` : 'leaving'}
                variants={{
                  hidden: { x: 150, y: 80, opacity: 0, rotate: -20 },
                  approaching: { x: 5, y: 11, opacity: 1, rotate: 0, transition: { duration: 0.4, ease: "easeOut" } },
                  biting_pull: { x: 5, y: 11, opacity: 1, rotate: 15, transition: { duration: 0.1 } },
                  biting_lift: { x: 5, y: 11, opacity: 1, rotate: -30, transition: { duration: 0.1 } },
                  leaving: { x: -150, y: -50, opacity: 0, rotate: -10, transition: { duration: 0.6, ease: "easeIn" } }
                }}
              >
                <BiteFish type={activeFishBite.type} />
              </motion.g>
            )}
          </motion.g>
        )}

      </svg>
    </div>
  );
};
