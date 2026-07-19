import {
  calcGearBuffs,
  calcTotalExpeditionBuffs,
  calcEssenceStonesTotal,
  calcMythicGearTotal,
  calcMithrilTotal,
  calcLegendaryGearTotal,
  GearState,
} from "./heroGearBuffs";

// ── Mastery Forging resource costs ──────────────────────────────────────────

test("essence stones to reach mastery level 1", () => {
  expect(calcEssenceStonesTotal(1)).toBe(10);
});

test("essence stones to reach mastery level 10", () => {
  // sum(10+20+...+100) = 550
  expect(calcEssenceStonesTotal(10)).toBe(550);
});

test("essence stones to reach mastery level 20", () => {
  // sum(10..200) = 10 * sum(1..20) = 10 * 210 = 2100
  expect(calcEssenceStonesTotal(20)).toBe(2100);
});

test("no mythic gear required for mastery level ≤ 10", () => {
  expect(calcMythicGearTotal(10)).toBe(0);
});

test("mythic gear required for mastery level 11", () => {
  // level 11 needs 1 piece
  expect(calcMythicGearTotal(11)).toBe(1);
});

test("mythic gear required for mastery level 20", () => {
  // levels 11–20 need 1+2+...+10 = 55 pieces
  expect(calcMythicGearTotal(20)).toBe(55);
});

// ── Mithril empowerment resource costs ──────────────────────────────────────

test("mithril total to +20 empowerment", () => {
  expect(calcMithrilTotal(20)).toBe(10);
});

test("mithril total to +100 empowerment", () => {
  // 10+20+30+40+50 = 150
  expect(calcMithrilTotal(100)).toBe(150);
});

test("legendary gear total to +60 empowerment", () => {
  // 3+5+5 = 13
  expect(calcLegendaryGearTotal(60)).toBe(13);
});

test("legendary gear total to +100 empowerment", () => {
  // 3+5+5+10+10 = 33
  expect(calcLegendaryGearTotal(100)).toBe(33);
});

// ── Buff calculations ────────────────────────────────────────────────────────

const baseGoggles: GearState = {
  slot: "goggles",
  enhancementLevel: 0,
  masteryLevel: 0,
  baseExpeditionBuff: 0,
  baseExplorationBuff: 0,
};

test("no buffs with all zeros", () => {
  const result = calcGearBuffs(baseGoggles);
  expect(result.totalExpeditionBuff).toBe(0);
  expect(result.totalExplorationBuff).toBe(0);
  expect(result.unlockedMilestones).toHaveLength(0);
});

test("mastery multiplier only — no empowerment", () => {
  const gear: GearState = {
    slot: "gloves",
    enhancementLevel: 0,
    masteryLevel: 5,
    baseExpeditionBuff: 100,
    baseExplorationBuff: 20,
  };
  const result = calcGearBuffs(gear);
  // masteryMultiplier = 1 + 5 × 0.10 = 1.5
  expect(result.masteryMultiplier).toBe(1.5);
  expect(result.totalExpeditionBuff).toBe(150); // 100 × 1.5
  expect(result.totalExplorationBuff).toBe(30);  // 20 × 1.5
  expect(result.milestoneExpeditionBuff).toBe(0);
});

test("empowerment milestones at +40 unlock two tiers", () => {
  const gear: GearState = {
    slot: "boots",
    enhancementLevel: 40,
    masteryLevel: 0,
    baseExpeditionBuff: 0,
    baseExplorationBuff: 0,
  };
  const result = calcGearBuffs(gear);
  expect(result.unlockedMilestones).toHaveLength(2); // +20 and +40
  expect(result.milestoneExpeditionBuff).toBe(20 + 30); // 50
  expect(result.milestoneExplorationBuff).toBe(7.5 + 10); // 17.5
});

test("fully maxed gear — enhancement 100, mastery 20", () => {
  const gear: GearState = {
    slot: "goggles",
    enhancementLevel: 100,
    masteryLevel: 20,
    baseExpeditionBuff: 50,
    baseExplorationBuff: 10,
  };
  const result = calcGearBuffs(gear);
  // masteryMultiplier = 1 + 20 × 0.10 = 3.0
  expect(result.masteryMultiplier).toBe(3.0);
  // boosted base: 50 × 3 = 150 expedition, 10 × 3 = 30 exploration
  // all 5 milestones: 20+30+15+50+30 = 145 expedition, 7.5+10+10+15+15 = 57.5 exploration
  expect(result.totalExpeditionBuff).toBe(150 + 145);
  expect(result.totalExplorationBuff).toBe(30 + 57.5);
  expect(result.expeditionBuffType).toBe("lethality");
});

test("goggles buff type is lethality", () => {
  expect(calcGearBuffs({ ...baseGoggles, slot: "goggles" }).expeditionBuffType).toBe("lethality");
});

test("gloves buff type is hp", () => {
  expect(calcGearBuffs({ ...baseGoggles, slot: "gloves" }).expeditionBuffType).toBe("hp");
});

test("belt buff type is hp", () => {
  expect(calcGearBuffs({ ...baseGoggles, slot: "belt" }).expeditionBuffType).toBe("hp");
});

test("boots buff type is lethality", () => {
  expect(calcGearBuffs({ ...baseGoggles, slot: "boots" }).expeditionBuffType).toBe("lethality");
});

// ── Total expedition buffs across all slots ──────────────────────────────────

test("total expedition buffs for a full gear set at +20 enhancement", () => {
  const gearSet: GearState[] = ["goggles", "gloves", "belt", "boots"].map((slot) => ({
    slot: slot as GearState["slot"],
    enhancementLevel: 20,
    masteryLevel: 0,
    baseExpeditionBuff: 0,
    baseExplorationBuff: 0,
  }));

  const totals = calcTotalExpeditionBuffs(gearSet);
  // goggles (lethality) + boots (lethality): 20 + 20 = 40
  // gloves (HP) + belt (HP): 20 + 20 = 40
  expect(totals.totalLethalityBuff).toBe(40);
  expect(totals.totalHPBuff).toBe(40);
});

// ── Error handling ────────────────────────────────────────────────────────────

test("throws on invalid mastery level", () => {
  expect(() =>
    calcGearBuffs({ ...baseGoggles, masteryLevel: 21 })
  ).toThrow(RangeError);
});

test("throws on invalid enhancement level", () => {
  expect(() =>
    calcGearBuffs({ ...baseGoggles, enhancementLevel: 101 })
  ).toThrow(RangeError);
});

test("throws on invalid mastery level for essence stones calc", () => {
  expect(() => calcEssenceStonesTotal(0)).toThrow(RangeError);
  expect(() => calcEssenceStonesTotal(21)).toThrow(RangeError);
});
