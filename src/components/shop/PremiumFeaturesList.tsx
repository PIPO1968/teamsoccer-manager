
import { Check, X } from "lucide-react";

const PremiumFeaturesList = () => {
  const features = [
    { name: "Advanced Statistics", included: true },
    { name: "Visual Graphs & Analysis", included: true },
    { name: "Ad-free Experience", included: true },
    { name: "Team Designer Tools", included: true },
    { name: "Training Optimization", included: true },
    { name: "Transfer Assistant", included: true },
    { name: "Priority Customer Support", included: true },
    { name: "Exclusive Competitions", included: true },
    { name: "Match Analysis Tools", included: true },
  ];

  return (
    <div className="space-y-3">
      {features.map((feature, index) => (
        <div key={index} className="flex items-center justify-between pb-2 border-b last:border-0">
          <span>{feature.name}</span>
          {feature.included ? (
            <Check className="h-5 w-5 text-green-600" />
          ) : (
            <X className="h-5 w-5 text-gray-400" />
          )}
        </div>
      ))}
    </div>
  );
};

export default PremiumFeaturesList;
