import {
  GearSlot,
  EmpowermentMilestone,
  EMPOWERMENT_MILESTONES,
  MASTERY_BUFF_PER_LEVEL,
  MASTERY_MAX_LEVEL,
  SLOT_EXPEDITION_BUFF,
} from "../data/heroGear";

export interface GearState {
  slot: GearSlot;
  /** Current enhancement level (0–100 for ascended gear) */
  enhancementLevel: number;
  /** Current mastery forging level (0–20, 0 = none) */
  masteryLevel: number;
  /** Base expedition buff % from the gear piece at enhancement level 0 */
  baseExpeditionBuff: number;
  /** Base exploration buff % from the gear piece at enhancement level 0 */
  baseExplorationBuff: number;
}

export interface BuffResult {
  slot: GearSlot;
  expeditionBuffType: "lethality" | "hp";
  /** Total expedition buff % after all modifiers */
  totalExpeditionBuff: number;
  /** Total exploration buff % after all modifiers */
  totalExplorationBuff: number;
  /** Mastery forging multiplier applied (e.g. 1.50 = +50%) */
  masteryMultiplier: number;
  /** Empowerment milestones unlocked at current enhancement level */
  unlockedMilestones: EmpowermentMilestone[];
  /** Sum of expedition buff % from unlocked milestones */
  milestoneExpeditionBuff: number;
  /** Sum of exploration buff % from unlocked milestones */
  milestoneExplorationBuff: number;
}

/**
 * Calculate all expedition and exploration buffs for a piece of hero gear.
 *
 * Buff calculation flow:
 *  1. Start with base buff values (from base gear stats)
 *  2. Apply Mastery Forging multiplier: base × (1 + masteryLevel × 0.10)
 *  3. Add flat % from unlocked Mithril Empowerment milestones
 */
export function calcGearBuffs(gear: GearState): BuffResult {
  if (gear.masteryLevel < 0 || gear.masteryLevel > MASTERY_MAX_LEVEL) {
    throw new RangeError(`Mastery level must be 0–${MASTERY_MAX_LEVEL}`);
  }
  if (gear.enhancementLevel < 0 || gear.enhancementLevel > 100) {
    throw new RangeError("Enhancement level must be 0–100");
  }

  const masteryMultiplier = 1 + gear.masteryLevel * MASTERY_BUFF_PER_LEVEL;

  const boostedExpeditionBuff = gear.baseExpeditionBuff * masteryMultiplier;
  const boostedExplorationBuff = gear.baseExplorationBuff * masteryMultiplier;

  const unlockedMilestones = EMPOWERMENT_MILESTONES.filter(
    (m) => gear.enhancementLevel >= m.enhancementLevel
  );

  const milestoneExpeditionBuff = unlockedMilestones.reduce(
    (sum, m) => sum + m.expeditionBuff,
    0
  );
  const milestoneExplorationBuff = unlockedMilestones.reduce(
    (sum, m) => sum + m.explorationBuff,
    0
  );

  return {
    slot: gear.slot,
    expeditionBuffType: SLOT_EXPEDITION_BUFF[gear.slot],
    totalExpeditionBuff: round2(boostedExpeditionBuff + milestoneExpeditionBuff),
    totalExplorationBuff: round2(boostedExplorationBuff + milestoneExplorationBuff),
    masteryMultiplier,
    unlockedMilestones,
    milestoneExpeditionBuff,
    milestoneExplorationBuff,
  };
}

/**
 * Calculate the combined expedition buffs across all 4 gear slots.
 * Returns total lethality buff % and total HP buff % for the set.
 */
export function calcTotalExpeditionBuffs(
  gears: GearState[]
): { totalLethalityBuff: number; totalHPBuff: number } {
  let totalLethalityBuff = 0;
  let totalHPBuff = 0;

  for (const gear of gears) {
    const result = calcGearBuffs(gear);
    if (result.expeditionBuffType === "lethality") {
      totalLethalityBuff += result.totalExpeditionBuff;
    } else {
      totalHPBuff += result.totalExpeditionBuff;
    }
  }

  return {
    totalLethalityBuff: round2(totalLethalityBuff),
    totalHPBuff: round2(totalHPBuff),
  };
}

/**
 * Calculate the total Essence Stones needed to reach a target Mastery level.
 * Formula: sum(N × 10) for N = 1..targetLevel = targetLevel × (targetLevel + 1) / 2 × 10
 */
export function calcEssenceStonesTotal(targetMasteryLevel: number): number {
  if (targetMasteryLevel < 1 || targetMasteryLevel > MASTERY_MAX_LEVEL) {
    throw new RangeError(`Target mastery level must be 1–${MASTERY_MAX_LEVEL}`);
  }
  return (targetMasteryLevel * (targetMasteryLevel + 1)) / 2 * 10;
}

/**
 * Calculate the total Mythic Hero Gear pieces needed to reach a target Mastery level.
 * Only levels 11–20 require mythic gear: level N requires (N - 10) pieces.
 */
export function calcMythicGearTotal(targetMasteryLevel: number): number {
  if (targetMasteryLevel <= 10) return 0;
  const levelsAbove10 = targetMasteryLevel - 10;
  return (levelsAbove10 * (levelsAbove10 + 1)) / 2;
}

/**
 * Calculate total Mithril needed to reach a given empowerment level.
 */
export function calcMithrilTotal(targetEnhancementLevel: number): number {
  return EMPOWERMENT_MILESTONES.filter(
    (m) => m.enhancementLevel <= targetEnhancementLevel
  ).reduce((sum, m) => sum + m.mithrilRequired, 0);
}

/**
 * Calculate total Legendary Gear pieces needed to reach a given empowerment level.
 */
export function calcLegendaryGearTotal(targetEnhancementLevel: number): number {
  return EMPOWERMENT_MILESTONES.filter(
    (m) => m.enhancementLevel <= targetEnhancementLevel
  ).reduce((sum, m) => sum + m.legendaryGearRequired, 0);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
