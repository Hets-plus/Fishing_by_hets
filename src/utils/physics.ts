import { FishingParams, FishingState } from '../types';

export function calculateFishingState(params: FishingParams): FishingState {
  const {
    leadWeight,
    floatBuoyancy,
    hookWeight,
    baitWeight,
    waterDensity,
    waterDepth,
    lineLength,
    subLineLength,
    hasSubLine,
  } = params;

  // Simplified physics model
  const effectiveHookWeight = hasSubLine ? hookWeight : 0;
  const effectiveBaitWeight = hasSubLine ? baitWeight : 0;
  const effectiveSubLineLength = hasSubLine ? subLineLength : 0;

  // Total downward force = (leadWeight + hookWeight + baitWeight)
  // Total upward force = floatBuoyancy * waterDensity
  
  const actualBuoyancy = floatBuoyancy * waterDensity;
  const totalWeight = leadWeight + effectiveHookWeight + effectiveBaitWeight;
  
  // Float has 10 meshes. Let's say each mesh supports 0.1g.
  // The float body supports the rest.
  const meshBuoyancyPerMesh = 0.1 * waterDensity;
  const floatBodyBuoyancy = actualBuoyancy - (10 * meshBuoyancyPerMesh);
  
  let status: FishingState['status'] = 'suspended';
  let floatY = 0;
  let leadY = 0;
  let hookY = 0;
  let tensionMain = 0;
  let tensionSub = 0;
  let visibleMeshes = 10;

  // Case 1: Total weight is less than float body buoyancy (Float lies flat on water)
  if (totalWeight <= floatBodyBuoyancy) {
    status = 'floating';
    floatY = 0;
    visibleMeshes = 10;
    leadY = lineLength;
    hookY = leadY + effectiveSubLineLength;
    tensionMain = totalWeight;
    tensionSub = effectiveHookWeight + effectiveBaitWeight;
  } 
  // Case 2: Total weight is between float body and max buoyancy (Suspended)
  else if (totalWeight <= actualBuoyancy) {
    status = 'suspended';
    const excessWeight = totalWeight - floatBodyBuoyancy;
    const submergedMeshes = excessWeight / meshBuoyancyPerMesh;
    visibleMeshes = Math.max(0, 10 - submergedMeshes);
    
    floatY = (10 - visibleMeshes) * 2; // 2cm per mesh visually
    leadY = floatY + lineLength;
    hookY = leadY + effectiveSubLineLength;
    
    tensionMain = totalWeight;
    tensionSub = effectiveHookWeight + effectiveBaitWeight;
    
    // Check if hook hits bottom
    if (hookY >= waterDepth) {
      status = 'bottom_touch';
      hookY = waterDepth;
      // Hook is supported by bottom.
      const weightOnLine = leadWeight; 
      if (weightOnLine <= actualBuoyancy) {
        if (weightOnLine <= floatBodyBuoyancy) {
           visibleMeshes = 10;
           floatY = 0;
        } else {
           const excess = weightOnLine - floatBodyBuoyancy;
           const subM = Math.max(0, excess / meshBuoyancyPerMesh);
           visibleMeshes = Math.max(0, 10 - subM);
           floatY = (10 - visibleMeshes) * 2;
        }
        leadY = floatY + lineLength;
        tensionMain = weightOnLine;
        tensionSub = 0;
        
        // If the calculated leadY hits the bottom, the lead is supported by the bottom
        if (leadY >= waterDepth) {
            status = 'bottom_rest';
            leadY = waterDepth;
            floatY = leadY - lineLength;
            visibleMeshes = 10 - (floatY / 2); 
            if (visibleMeshes <= 0) {
                status = 'sunk';
                visibleMeshes = 0;
            } else if (visibleMeshes > 10) {
                visibleMeshes = 10;
            }
            tensionMain = 0;
        }
      } else {
        // Lead also hits bottom
        status = 'bottom_rest';
        leadY = waterDepth;
        floatY = leadY - lineLength;
        visibleMeshes = 10 - (floatY / 2); 
        if (visibleMeshes <= 0) {
            status = 'sunk';
            visibleMeshes = 0;
        }
      }
    }
  } 
  // Case 3: Total weight exceeds max buoyancy (Sinks)
  else {
    // It will sink until something hits the bottom to relieve the weight
    // If water is very deep, it just sinks completely
    if (lineLength + effectiveSubLineLength + 20 < waterDepth) { // 20 is float length
       status = 'sunk';
       visibleMeshes = 0;
       hookY = waterDepth;
       leadY = hookY - effectiveSubLineLength;
       floatY = leadY - lineLength;
       tensionMain = leadWeight;
       tensionSub = effectiveHookWeight + effectiveBaitWeight;
    } else {
       hookY = waterDepth;
       // Check if lead hits bottom
       if (leadWeight > actualBuoyancy) {
           status = 'bottom_rest';
           leadY = waterDepth;
           floatY = leadY - lineLength;
           tensionMain = 0;
           tensionSub = 0;
           
           if (floatY > 20) { // 10 meshes * 2cm
               status = 'sunk';
               visibleMeshes = 0;
           } else if (floatY < 0) {
               visibleMeshes = 10;
           } else {
               visibleMeshes = Math.max(0, 10 - (floatY / 2));
           }
       } else {
           status = 'bottom_touch';
           const excess = leadWeight - floatBodyBuoyancy;
           const subM = Math.max(0, excess / meshBuoyancyPerMesh);
           visibleMeshes = Math.max(0, 10 - subM);
           floatY = (10 - visibleMeshes) * 2;
           leadY = floatY + lineLength;
           
           // If the calculated leadY doesn't allow the hook to reach bottom, it means the float is pulled underwater
           if (leadY + effectiveSubLineLength < waterDepth) {
               status = 'sunk';
               visibleMeshes = 0;
               hookY = waterDepth;
               leadY = hookY - effectiveSubLineLength;
               floatY = leadY - lineLength;
               tensionMain = leadWeight;
               tensionSub = 0;
           } else if (leadY >= waterDepth) {
               // Lead hits bottom!
               status = 'bottom_rest';
               leadY = waterDepth;
               floatY = leadY - lineLength;
               visibleMeshes = 10 - (floatY / 2);
               if (visibleMeshes <= 0) {
                   status = 'sunk';
                   visibleMeshes = 0;
               } else if (visibleMeshes > 10) {
                   visibleMeshes = 10;
               }
               tensionMain = 0;
               tensionSub = 0;
           } else {
               tensionMain = leadWeight;
               tensionSub = 0;
           }
       }
    }
  }

  // Ensure values are within bounds
  if (floatY < 0) floatY = 0;
  if (leadY > waterDepth) leadY = waterDepth;
  if (hookY > waterDepth) hookY = waterDepth;
  if (visibleMeshes > 10) visibleMeshes = 10;
  if (visibleMeshes < 0) visibleMeshes = 0;

  return {
    floatY,
    leadY,
    hookY,
    status,
    tensionMain,
    tensionSub,
    visibleMeshes: Math.round(visibleMeshes * 10) / 10
  };
}
