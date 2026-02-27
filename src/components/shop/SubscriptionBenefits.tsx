
import { Trophy, BarChart3, Shuffle, LayoutGrid } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SubscriptionBenefits = () => {
  const benefits = [
    {
      title: "Team management tools",
      description: "Access advanced team management features that help you make better decisions and save time.",
      icon: LayoutGrid,
      items: [
        "Detailed training reports and archives",
        "Automatic friendly match booking",
        "Advanced transfer market filters",
      ],
    },
    {
      title: "Statistics and graphs",
      description: "Gain insights with comprehensive statistics and visualizations to optimize your team's performance.",
      icon: BarChart3,
      items: [
        "Player performance trends",
        "Match and team statistics",
        "League position history",
      ],
    },
    {
      title: "Competitions",
      description: "Join exclusive tournaments and compete against other premium managers.",
      icon: Trophy,
      items: [
        "Premium-only tournaments",
        "Special competitions with rewards",
        "Custom tournament creation",
      ],
    },
    {
      title: "Customization",
      description: "Personalize your team with advanced customization options.",
      icon: Shuffle,
      items: [
        "Custom team branding",
        "Stadium customization",
        "Team uniform designer",
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <img 
          src="/teamsoccer-assets/cb2c16d3-2b9b-4600-9378-0b3d5dec7e79.png" 
          alt="Premium Features" 
          className="mx-auto w-48 h-48 object-contain"
        />
        <h2 className="text-2xl font-bold text-center mt-4">Premium gives you access to several tools and features</h2>
        <p className="text-center text-muted-foreground">that help you become a better manager.</p>
      </div>
      
      <div className="grid sm:grid-cols-2 gap-4">
        {benefits.map((benefit, index) => (
          <Card key={index} className="border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <benefit.icon className="h-5 w-5 text-hattrick-green" />
                {benefit.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{benefit.description}</p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {benefit.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionBenefits;
