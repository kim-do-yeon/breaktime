// Zod validation schemas for planner form inputs.
import { z } from "zod";
import { coverageRange } from "@/lib/holidays/korea";

/** A single blackout date range. */
export const blackoutSchema = z
  .object({
    start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식이어야 합니다."),
    end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식이어야 합니다."),
  })
  .refine((b) => b.start <= b.end, {
    message: "종료일은 시작일과 같거나 이후여야 합니다.",
    path: ["end"],
  });

/** Full planner input schema. */
export const plannerInputSchema = z.object({
  daysRemaining: z
    .number({ invalid_type_error: "남은 연차 일수를 입력하세요." })
    .int("정수로 입력하세요.")
    .min(1, "최소 1일 이상이어야 합니다.")
    .max(365, "365일을 초과할 수 없습니다."),
  year: z
    .number()
    .int()
    .min(coverageRange.minYear, `${coverageRange.minYear}년 이후만 지원합니다.`)
    .max(coverageRange.maxYear, `${coverageRange.maxYear}년까지만 지원합니다.`),
  blackouts: z.array(blackoutSchema),
  country: z.literal("KR"),
});

export type PlannerInput = z.infer<typeof plannerInputSchema>;

/** Validate raw input; returns { success, data } or { success:false, errors }. */
export function validatePlannerInput(raw: unknown) {
  return plannerInputSchema.safeParse(raw);
}
