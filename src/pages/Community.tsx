
import { User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CommunityNews } from "./community/CommunityNews";
import { TopForumPosters } from "./community/TopForumPosters";

const Community = () => {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <User className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Community</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Community News Section */}
        <div className="lg:col-span-2">
          <CommunityNews />
        </div>

        {/* Top Forum Posters Sidebar */}
        <div>
          <TopForumPosters />
        </div>
      </div>
    </div>
  );
};

export default Community;
