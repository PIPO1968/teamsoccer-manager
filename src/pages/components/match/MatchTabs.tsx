
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MatchOverviewTab from "./tabs/MatchOverviewTab";
import MatchEventsTab from "./tabs/MatchEventsTab";
import MatchStatsTab from "./tabs/MatchStatsTab";
import { MatchTabsProps } from "../types/matchTypes";

const MatchTabs = ({ match, matchStats, highlights, isCompleted, isUpcoming }: MatchTabsProps) => {
  return (
    <Tabs defaultValue="overview" className="mt-8">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="events">Events</TabsTrigger>
        <TabsTrigger value="stats">Statistics</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <MatchOverviewTab 
          match={match}
          matchStats={matchStats}
          isCompleted={isCompleted}
        />
      </TabsContent>
      
      <TabsContent value="events">
        <MatchEventsTab 
          match={match}
          highlights={highlights}
          isCompleted={isCompleted}
          isUpcoming={isUpcoming}
        />
      </TabsContent>
      
      <TabsContent value="stats">
        <MatchStatsTab 
          match={match}
          matchStats={matchStats}
          isCompleted={isCompleted}
          isUpcoming={isUpcoming}
        />
      </TabsContent>
    </Tabs>
  );
};

export default MatchTabs;
