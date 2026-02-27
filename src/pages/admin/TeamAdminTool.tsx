
import { useState, useEffect } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { DynamicAdminForm } from "@/components/admin/DynamicAdminForm";
import { PaginatedTable } from "@/components/admin/PaginatedTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Building, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Team {
  team_id: number;
  name: string;
  manager_id: number;
  country_id: number;
  is_bot: number;
  team_rating: number;
  team_morale: number;
  team_spirit: string;
  fan_count: number;
  club_logo: string;
  created_at: string;
}

interface FieldConfig {
  name: string;
  type: string;
  nullable: boolean;
  default: any;
  isEditable: boolean;
}

const TeamAdminTool = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [countries, setCountries] = useState<Array<{ region_id: number; name: string }>>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const { toast } = useToast();

  // Define which fields should be editable
  const editableFields = [
    'name', 'manager_id', 'country_id', 'is_bot', 'team_rating', 
    'team_morale', 'team_spirit', 'fan_count', 'club_logo'
  ];

  useEffect(() => {
    loadTeams();
    loadCountries();
    loadTableStructure();
  }, []);

  const loadTableStructure = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const sampleRow = data[0];
        const dynamicFields: FieldConfig[] = Object.keys(sampleRow).map(key => ({
          name: key,
          type: typeof sampleRow[key] === 'number' ? 'integer' : 'text',
          nullable: true,
          default: null,
          isEditable: editableFields.includes(key)
        }));
        setFields(dynamicFields);
      }
    } catch (error) {
      console.error('Error loading table structure:', error);
    }
  };

  const loadTeams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          managers!teams_manager_id_fkey (username),
          leagues_regions!teams_country_id_fkey (name)
        `)
        .order('team_id');

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load teams",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCountries = async () => {
    try {
      const { data, error } = await supabase
        .from('leagues_regions')
        .select('region_id, name')
        .order('name');

      if (error) throw error;
      setCountries(data || []);
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  };

  const handleSaveTeam = async (teamData: Record<string, any>) => {
    if (!selectedTeam) return;

    // Filter out non-editable fields and system fields
    const allowedFields = {
      name: teamData.name,
      manager_id: teamData.manager_id ? Number(teamData.manager_id) : null,
      country_id: teamData.country_id ? Number(teamData.country_id) : null,
      is_bot: teamData.is_bot ? Number(teamData.is_bot) : 0,
      team_rating: teamData.team_rating ? Number(teamData.team_rating) : null,
      team_morale: teamData.team_morale ? Number(teamData.team_morale) : null,
      team_spirit: teamData.team_spirit || null,
      fan_count: teamData.fan_count ? Number(teamData.fan_count) : null,
      club_logo: teamData.club_logo || null
    };

    // Remove null/undefined values to avoid unnecessary updates
    const updateData = Object.fromEntries(
      Object.entries(allowedFields).filter(([_, value]) => value !== null && value !== undefined)
    );

    const { error } = await supabase
      .from('teams')
      .update(updateData)
      .eq('team_id', selectedTeam.team_id);

    if (error) throw error;

    await loadTeams();
    setSelectedTeam(null);
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const teamColumns = [
    { key: 'team_id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { 
      key: 'manager', 
      label: 'Manager', 
      sortable: true,
      render: (_: any, team: any) => team.managers?.username || 'No Manager'
    },
    { 
      key: 'country', 
      label: 'Country', 
      sortable: true,
      render: (_: any, team: any) => team.leagues_regions?.name || 'Unknown'
    },
    { key: 'team_rating', label: 'Rating', sortable: true },
    { 
      key: 'is_bot', 
      label: 'Bot', 
      sortable: true,
      render: (isBot: number) => isBot ? (
        <span className="text-orange-600">Yes</span>
      ) : (
        <span className="text-green-600">No</span>
      )
    }
  ];

  if (selectedTeam) {
    return (
      <AdminGuard requiredLevel={3}>
        <div className="container mx-auto p-6">
          <DynamicAdminForm
            title="Team"
            data={selectedTeam}
            fields={fields}
            onSave={handleSaveTeam}
            onCancel={() => setSelectedTeam(null)}
            countries={countries}
          />
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard requiredLevel={3}>
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Building className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Team Administration</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Teams</CardTitle>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Search by team name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading teams...</div>
            ) : (
              <PaginatedTable
                data={filteredTeams}
                columns={teamColumns}
                onEdit={setSelectedTeam}
                getEditPath={(team) => `/team/${team.team_id}`}
                itemsPerPage={15}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  );
};

export default TeamAdminTool;
