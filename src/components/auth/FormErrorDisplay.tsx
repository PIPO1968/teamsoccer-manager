
interface FormErrorDisplayProps {
  error?: string;
}

export function FormErrorDisplay({ error }: FormErrorDisplayProps) {
  if (!error) return null;
  
  return (
    <div className="p-3 bg-red-100 border border-red-300 rounded-md text-red-800 text-sm">
      {error}
    </div>
  );
}
