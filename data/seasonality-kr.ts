/**
 * Off-season weight table for Korea by month (1-indexed).
 *
 * Values range 0..1 where:
 *   1.0 = best off-season (cheap, uncrowded, good for budget travel)
 *   0.0 = peak season (expensive, crowded — low off-season weight)
 *
 * Rationale:
 * - Jul/Aug: peak summer vacation season, highest prices → 0.1
 * - Feb: Seollal travel rush, cold, limited appeal → 0.2
 * - Jan: New Year + cold → 0.25
 * - Sep: Chuseok rush → 0.3
 * - Dec: Christmas/New Year rush → 0.3
 * - May: Children's Day / Buddha's Birthday cluster, busy → 0.55
 * - Oct: fall foliage season, Hangeul/Foundation Day cluster, busy → 0.5
 * - Mar: early spring, quiet, cheap → 0.8
 * - Jun: pre-summer, still mild, cheaper → 0.85
 * - Nov: late autumn, very quiet, excellent value → 0.85
 * - Apr: cherry blossom peak (busy) but short window, shoulder → 0.7
 */
export const seasonalityByMonth: Record<number, number> = {
  1: 0.25, // January — cold, post-New Year rush
  2: 0.2, // February — Seollal rush, cold
  3: 0.8, // March — spring shoulder, quiet
  4: 0.7, // April — cherry blossoms (popular but short)
  5: 0.55, // May — Children's Day / Buddha's Birthday cluster
  6: 0.85, // June — pre-summer, mild, cheap
  7: 0.1, // July — peak summer, very expensive
  8: 0.1, // August — peak summer, very expensive
  9: 0.3, // September — Chuseok rush
  10: 0.5, // October — fall busy season
  11: 0.85, // November — excellent shoulder month
  12: 0.3, // December — Christmas/New Year rush
};

/**
 * Get the off-season weight for a given month (1-indexed).
 * Returns 0.5 as neutral fallback for unknown months.
 */
export function getSeasonWeight(month: number): number {
  return seasonalityByMonth[month] ?? 0.5;
}

/** Season tier for display grouping. */
export type SeasonTier = "peak" | "shoulder" | "off";

/** Rich, human-readable season info for the guide UI. */
export interface SeasonInfo {
  month: number;
  /** off-season weight (same as seasonalityByMonth) */
  weight: number;
  tier: SeasonTier;
  /** short tier label in Korean */
  tierLabel: string;
  /** relative price level 1 (cheapest) .. 5 (most expensive) */
  priceLevel: number;
  /** one-line pricing note */
  priceNote: string;
  /** timing / crowd / weather context */
  timingNote: string;
}

/**
 * Month-by-month season guide (1-indexed). Derived to stay consistent with
 * `seasonalityByMonth`: higher weight → lower price level.
 * priceLevel = round(1 + (1 - weight) * 4), so weight 1.0→1, 0.1→5.
 */
export const seasonGuide: Record<number, SeasonInfo> = {
  1: {
    month: 1,
    weight: 0.25,
    tier: "peak",
    tierLabel: "성수기",
    priceLevel: 4,
    priceNote: "신정 연휴·겨울 스키/온천 수요로 숙박·항공권 비쌈",
    timingNote: "한파, 신정 연휴 이동 혼잡. 스키·해외 온난지 여행 성수기",
  },
  2: {
    month: 2,
    weight: 0.2,
    tier: "peak",
    tierLabel: "성수기",
    priceLevel: 4,
    priceNote: "설날 대이동으로 교통·숙박비 급등, 항공권 최고가 시기",
    timingNote: "설 연휴 혼잡, 추위 지속. 국내 여행지 한산하나 이동은 정체",
  },
  3: {
    month: 3,
    weight: 0.8,
    tier: "off",
    tierLabel: "비수기",
    priceLevel: 2,
    priceNote: "연중 가장 저렴한 시기 중 하나, 항공·숙박 할인 많음",
    timingNote: "초봄 환절기, 관광지 한산. 가성비 여행 최적",
  },
  4: {
    month: 4,
    weight: 0.7,
    tier: "shoulder",
    tierLabel: "준성수기",
    priceLevel: 2,
    priceNote: "벚꽃 명소만 국지적으로 비싸고 그 외 지역은 저렴",
    timingNote: "벚꽃 시즌(짧음), 온화한 날씨. 벚꽃 명소 외엔 여유로움",
  },
  5: {
    month: 5,
    weight: 0.55,
    tier: "shoulder",
    tierLabel: "준성수기",
    priceLevel: 3,
    priceNote: "어린이날·석가탄신일 연휴로 가족 여행 수요 상승",
    timingNote: "쾌청한 날씨, 연휴 집중. 리조트·테마파크 붐빔",
  },
  6: {
    month: 6,
    weight: 0.85,
    tier: "off",
    tierLabel: "비수기",
    priceLevel: 1,
    priceNote: "여름 성수기 직전으로 가장 저렴, 특가 항공권 풍부",
    timingNote: "초여름 온화, 장마 전. 관광지 한산한 숨은 비수기",
  },
  7: {
    month: 7,
    weight: 0.1,
    tier: "peak",
    tierLabel: "극성수기",
    priceLevel: 5,
    priceNote: "여름 휴가 시작, 숙박·항공권 연중 최고가",
    timingNote: "장마·폭염, 휴가철 극혼잡. 예약 경쟁 치열",
  },
  8: {
    month: 8,
    weight: 0.1,
    tier: "peak",
    tierLabel: "극성수기",
    priceLevel: 5,
    priceNote: "여름 휴가 절정, 리조트·해외 항공권 최고가 유지",
    timingNote: "폭염, 전국 휴가 집중으로 최악의 혼잡",
  },
  9: {
    month: 9,
    weight: 0.3,
    tier: "peak",
    tierLabel: "성수기",
    priceLevel: 4,
    priceNote: "추석 대이동으로 교통·숙박비 급등",
    timingNote: "추석 연휴 혼잡, 초가을 선선. 연휴 전후는 여유",
  },
  10: {
    month: 10,
    weight: 0.5,
    tier: "shoulder",
    tierLabel: "준성수기",
    priceLevel: 3,
    priceNote: "단풍 시즌 수요로 인기 지역 숙박비 상승",
    timingNote: "단풍철 절정, 쾌청. 개천절·한글날 연휴로 붐빔",
  },
  11: {
    month: 11,
    weight: 0.85,
    tier: "off",
    tierLabel: "비수기",
    priceLevel: 1,
    priceNote: "연중 최고 가성비, 항공·숙박 특가 집중",
    timingNote: "늦가을 한산, 여행하기 쾌적. 숨은 명당 시기",
  },
  12: {
    month: 12,
    weight: 0.3,
    tier: "peak",
    tierLabel: "성수기",
    priceLevel: 4,
    priceNote: "크리스마스·연말 수요로 숙박·항공권 상승",
    timingNote: "연말 분위기·스키 시즌 시작. 도심·리조트 붐빔",
  },
};

/** Ordered list form of the season guide (Jan..Dec). */
export const seasonGuideList: SeasonInfo[] = Object.values(seasonGuide).sort(
  (a, b) => a.month - b.month
);

/** Get rich season info for a given month (1-indexed). */
export function getSeasonInfo(month: number): SeasonInfo | undefined {
  return seasonGuide[month];
}
