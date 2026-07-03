// Renders the ranked list of vacation suggestions.
import type { Holiday, Suggestion } from "@/lib/types";
import { SuggestionCard } from "@/components/SuggestionCard";

interface SuggestionListProps {
  suggestions: Suggestion[];
  year: number;
  holidays: Holiday[];
  /** Keys ("start|end") of suggestions already added to my calendar. */
  addedKeys: Set<string>;
  onAdd: (suggestion: Suggestion) => void;
}

/** Stable identity for a suggestion window. */
export function suggestionKey(s: Suggestion): string {
  return `${s.window.start}|${s.window.end}`;
}

export function SuggestionList({
  suggestions,
  year,
  holidays,
  addedKeys,
  onAdd,
}: SuggestionListProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        추천 휴가 (상위 {suggestions.length}개)
      </h2>
      {suggestions.map((s, i) => (
        <SuggestionCard
          key={suggestionKey(s)}
          suggestion={s}
          rank={i + 1}
          year={year}
          holidays={holidays}
          isAdded={addedKeys.has(suggestionKey(s))}
          onAdd={onAdd}
        />
      ))}
    </div>
  );
}
