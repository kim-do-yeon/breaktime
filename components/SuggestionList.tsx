// Renders the ranked list of vacation suggestions.
import type { Suggestion } from "@/lib/types";
import { SuggestionCard } from "@/components/SuggestionCard";

interface SuggestionListProps {
  suggestions: Suggestion[];
}

export function SuggestionList({ suggestions }: SuggestionListProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        추천 휴가 (상위 {suggestions.length}개)
      </h2>
      {suggestions.map((s, i) => (
        <SuggestionCard
          key={`${s.window.start}-${s.window.end}`}
          suggestion={s}
          rank={i + 1}
        />
      ))}
    </div>
  );
}
