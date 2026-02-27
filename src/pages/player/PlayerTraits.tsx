
import { generatePersonalityDescription } from "@/utils/playerTraits";

interface PlayerTraitsProps {
  personality: number;
  experience: number;
  leadership: number;
  loyalty: number;
}

export default function PlayerTraits({
  personality,
  experience,
  leadership,
  loyalty,
}: PlayerTraitsProps) {
  const description = generatePersonalityDescription(
    personality,
    experience,
    leadership,
    loyalty
  );

  return (
    <div className="w-full bg-white p-4 rounded-lg text-gray-700 text-sm leading-relaxed border border-gray-200 shadow-sm">
      {description}
    </div>
  );
}

