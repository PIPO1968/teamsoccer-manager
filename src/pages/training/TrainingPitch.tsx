
interface TrainingPitchProps {
  type: string;
}

export default function TrainingPitch({ type }: TrainingPitchProps) {
  return (
    <div className="w-[200px] h-[150px] pitch-background rounded-md relative">
      {type === "scoring" && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-8 h-8 border-2 border-yellow-400 rounded-full" />
          ))}
        </div>
      )}
    </div>
  );
}
