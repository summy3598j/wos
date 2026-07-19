export type TroopType = "infantry" | "lancer" | "marksman";
export type GearSlot = "goggles" | "gloves" | "belt" | "boots";
export type GearQuality = "grey" | "green" | "blue" | "purple" | "gold" | "mythic" | "legendary";

/** Enhancement points granted when consuming a piece of gear for enhancement */
export const ENHANCEMENT_POINTS_BY_QUALITY: Record<GearQuality, number> = {
  grey: 10,
  green: 30,
  blue: 60,
  purple: 150,
  gold: 0,      // Gold gear is not consumed for enhancement points
  mythic: 0,
  legendary: 0,
};

/**
 * Each gear slot's primary expedition buff type.
 *  - goggles & boots → expedition lethality (殺傷力)
 *  - gloves & belt   → expedition HP (HP)
 */
export const SLOT_EXPEDITION_BUFF: Record<GearSlot, "lethality" | "hp"> = {
  goggles: "lethality",
  gloves: "hp",
  belt: "hp",
  boots: "lethality",
};

/**
 * Mithril Empowerment (配能) milestones for Legendary/Mythic gear.
 * Each milestone unlocks when the gear reaches the given enhancement level.
 *
 * expeditionBuff: percentage buff to the slot's primary expedition stat
 * explorationBuff: percentage buff to exploration stat (hero HP or lethality)
 *
 * Costs: mithrilRequired + legendaryGearRequired consumed at that milestone.
 *
 * Sources:
 *  - "Level 20: 20% attack or defense in expedition"
 *  - "Level 40: 30% defense or attack"
 *  - "Level 60: 15% hero attack or defense (exploration)"
 *  - "Level 80: 50% attack or defense for expedition"
 *  - Cost data: 10/20/30/40/50 Mithril + 3/5/5/10/10 Mythic Gear per milestone
 */
export interface EmpowermentMilestone {
  enhancementLevel: number;  // +20, +40, +60, +80, +100
  expeditionBuff: number;    // % added to slot's expedition stat
  explorationBuff: number;   // % added to exploration hero stat
  mithrilRequired: number;
  legendaryGearRequired: number;
}

export const EMPOWERMENT_MILESTONES: EmpowermentMilestone[] = [
  { enhancementLevel: 20,  expeditionBuff: 20, explorationBuff: 7.5,  mithrilRequired: 10, legendaryGearRequired: 3  },
  { enhancementLevel: 40,  expeditionBuff: 30, explorationBuff: 10,   mithrilRequired: 20, legendaryGearRequired: 5  },
  { enhancementLevel: 60,  expeditionBuff: 15, explorationBuff: 10,   mithrilRequired: 30, legendaryGearRequired: 5  },
  { enhancementLevel: 80,  expeditionBuff: 50, explorationBuff: 15,   mithrilRequired: 40, legendaryGearRequired: 10 },
  { enhancementLevel: 100, expeditionBuff: 30, explorationBuff: 15,   mithrilRequired: 50, legendaryGearRequired: 10 },
];

/**
 * Mastery Forging (精錬鍛造) system — exclusive to Gold/Legendary gear.
 *
 * Requirements to unlock:
 *  - Furnace level 20
 *  - Gear at Enhancement level 20
 *
 * Each level multiplies all gear buffs (Gear Strength + expedition/exploration stats)
 * by (1 + level * MASTERY_BUFF_PER_LEVEL).
 *
 * Levels 1–10:  Essence Stones only (N × 10 stones for level N)
 * Levels 11–20: Essence Stones + Mythic Hero Gear ((N × 10) stones + (N - 10) mythic gear)
 */
export const MASTERY_MAX_LEVEL = 20;
export const MASTERY_BUFF_PER_LEVEL = 0.10; // +10% per mastery level

export interface MasteryLevel {
  level: number;
  buffPercent: number;       // cumulative buff multiplier at this level (e.g. 10, 20, ..., 200)
  essenceStonesRequired: number;
  mythicGearRequired: number;
}

export function getMasteryLevels(): MasteryLevel[] {
  return Array.from({ length: MASTERY_MAX_LEVEL }, (_, i) => {
    const level = i + 1;
    return {
      level,
      buffPercent: level * 10,
      essenceStonesRequired: level * 10,
      mythicGearRequired: level > 10 ? level - 10 : 0,
    };
  });
}

/**
 * Enhancement tracks summary.
 * Gear has three independent upgrade tracks:
 *  1. Enhancement (強化): 0–100 (Ascended gear: +1–+100)
 *  2. Mastery Forging (精錬鍛造): 1–20 (Gold/Legendary only)
 *  3. Widget (ウィジェット): 0–10
 *
 * Ascension (昇格/神話化) requires Enhancement 100 + Mastery 10,
 * consuming 2 Legendary Hero Gear pieces.
 */
export const ENHANCEMENT_MAX_LEVEL = 100;
export const WIDGET_MAX_LEVEL = 10;
export const MASTERY_LEVEL_FOR_ASCENSION = 10;
export const ENHANCEMENT_LEVEL_FOR_ASCENSION = 100;
export const GEAR_CONSUMED_FOR_ASCENSION = 2;
