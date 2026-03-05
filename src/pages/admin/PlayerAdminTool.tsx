
import { useState, useEffect } from "react";
import { getPlayerImageUrl } from "@/lib/getPlayerImageUrl";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { DynamicAdminForm } from "@/components/admin/DynamicAdminForm";
import { PaginatedTable } from "@/components/admin/PaginatedTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/services/apiClient";
import { User, Search, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Player {
  player_id: number;
  first_name: string;
  last_name: string;
  position: string;
  age: number;
  nationality_id: number;
  team_id: number;
  value: number;
  wage: number;
  rating: number;
  pace: number;
  finishing: number;
  passing: number;
  defense: number;
  dribbling: number;
  heading: number;
  stamina: number;
  fitness?: number;
  form?: string;
  personality?: number;
  experience?: number;
  leadership?: number;
  loyalty?: number;
  image_url?: string;
}

interface FieldConfig {
  name: string;
  type: string;
  nullable: boolean;
  default: any;
  isEditable: boolean;
}

const editableFields = [
  'first_name', 'last_name', 'position', 'age', 'nationality_id',
  'team_id', 'value', 'wage', 'rating', 'pace', 'finishing', 'passing',
  'defense', 'dribbling', 'heading', 'stamina', 'fitness', 'form',
  'personality', 'experience', 'leadership', 'loyalty'
];

const PlayerAdminTool = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Array<{ team_id: number; name: string }>>([]);
  const [countries, setCountries] = useState<Array<{ region_id: number; name: string }>>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadPlayers();
    loadTeams();
    loadCountries();
  }, []);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<{ success: boolean; players: any[] }>('/admin/players?limit=100');
      setPlayers(data.players || []);
      if (data.players && data.players.length > 0) {
        const sample = data.players[0];
        const dynamicFields: FieldConfig[] = Object.keys(sample)
          .filter(k => k !== 'teams' && k !== 'team_name')
          .map(key => ({
            name: key,
            type: typeof sample[key] === 'number' ? 'integer' : 'text',
            nullable: true,
            default: null,
            isEditable: editableFields.includes(key)
          }));
        setFields(dynamicFields);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load players", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadTeams = async () => {
    try {
      const data = await apiFetch<{ success: boolean; teams: any[] }>('/teams');
      setTeams(data.teams || []);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const loadCountries = async () => {
    try {
      const data = await apiFetch<{ success: boolean; countries: any[] }>('/admin/countries');
      setCountries(data.countries || []);
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  };

  const handleSavePlayer = async (playerData: Record<string, any>) => {
    if (isCreating) {
      const { player_id, ...createData } = playerData;
      const insertData = {
        first_name: createData.first_name || '',
        last_name: createData.last_name || '',
        position: createData.position || 'MID',
        age: Number(createData.age) || 20,
        nationality_id: Number(createData.nationality_id) || 1,
        team_id: createData.team_id ? Number(createData.team_id) : null,
        value: Number(createData.value) || 100000,
        wage: Number(createData.wage) || 5000,
        rating: Number(createData.rating) || 65,
        pace: Number(createData.pace) || 10,
        finishing: Number(createData.finishing) || 10,
        passing: Number(createData.passing) || 10,
        defense: Number(createData.defense) || 10,
        dribbling: Number(createData.dribbling) || 10,
        heading: Number(createData.heading) || 10,
        stamina: Number(createData.stamina) || 10,
        ...(createData.fitness && { fitness: Number(createData.fitness) }),
        ...(createData.form && { form: createData.form }),
        ...(createData.personality && { personality: Number(createData.personality) }),
        ...(createData.experience && { experience: Number(createData.experience) }),
        ...(createData.leadership && { leadership: Number(createData.leadership) }),
        ...(createData.loyalty && { loyalty: Number(createData.loyalty) }),
        image_url: (() => {
          const country = countries.find(c => c.region_id === Number(createData.nationality_id));
          return getPlayerImageUrl(country ? country.name : "", createData.first_name || '', createData.last_name || '');
        })()
      };
      await apiFetch('/admin/players', { method: 'POST', body: JSON.stringify(insertData) });
    } else if (selectedPlayer) {
      const allowedFields: Record<string, any> = {
        ...(playerData.first_name !== undefined && { first_name: playerData.first_name }),
        ...(playerData.last_name !== undefined && { last_name: playerData.last_name }),
        ...(playerData.position !== undefined && { position: playerData.position }),
        ...(playerData.age !== undefined && { age: Number(playerData.age) }),
        ...(playerData.nationality_id !== undefined && { nationality_id: Number(playerData.nationality_id) }),
        ...(playerData.team_id !== undefined && { team_id: playerData.team_id ? Number(playerData.team_id) : null }),
        ...(playerData.value !== undefined && { value: Number(playerData.value) }),
        ...(playerData.wage !== undefined && { wage: Number(playerData.wage) }),
        ...(playerData.rating !== undefined && { rating: Number(playerData.rating) }),
        ...(playerData.pace !== undefined && { pace: Number(playerData.pace) }),
        ...(playerData.finishing !== undefined && { finishing: Number(playerData.finishing) }),
        ...(playerData.passing !== undefined && { passing: Number(playerData.passing) }),
        ...(playerData.defense !== undefined && { defense: Number(playerData.defense) }),
        ...(playerData.dribbling !== undefined && { dribbling: Number(playerData.dribbling) }),
        ...(playerData.heading !== undefined && { heading: Number(playerData.heading) }),
        ...(playerData.stamina !== undefined && { stamina: Number(playerData.stamina) }),
        ...(playerData.fitness !== undefined && { fitness: Number(playerData.fitness) }),
        ...(playerData.form !== undefined && { form: playerData.form }),
        ...(playerData.personality !== undefined && { personality: Number(playerData.personality) }),
        ...(playerData.experience !== undefined && { experience: Number(playerData.experience) }),
        ...(playerData.leadership !== undefined && { leadership: Number(playerData.leadership) }),
        ...(playerData.loyalty !== undefined && { loyalty: Number(playerData.loyalty) }),
        ...(playerData.image_url !== undefined ? { image_url: playerData.image_url } : {})
      };
      await apiFetch(`/admin/players/${selectedPlayer.player_id}`, { method: 'PUT', body: JSON.stringify(allowedFields) });
    }
    await loadPlayers();
    setSelectedPlayer(null);
    setIsCreating(false);
  };

  const handleEditPlayer = (player: Player) => {
    setSelectedPlayer({
      ...player,
      leadership: player.leadership || 5,
      position: player.position || 'MID',
      fitness: player.fitness || 100,
      form: player.form || 'Average',
      personality: player.personality || 5,
      experience: player.experience || 5,
      loyalty: player.loyalty || 5
    });
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setSelectedPlayer({
      player_id: 0, first_name: '', last_name: '', position: 'MID', age: 20,
      nationality_id: 1, team_id: 0, value: 100000, wage: 5000, rating: 65,
      pace: 10, finishing: 10, passing: 10, defense: 10,
      dribbling: 10, heading: 10, stamina: 10,
      fitness: 100, form: 'Average', personality: 5, experience: 5, leadership: 5, loyalty: 5
    });
    setIsCreating(true);
  };

  const filteredPlayers = players.filter(player =>
    `${player.first_name} ${player.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const playerColumns = [
    { key: 'player_id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true, render: (_: any, player: any) => `${player.first_name} ${player.last_name}` },
    { key: 'position', label: 'Position', sortable: true },
    { key: 'age', label: 'Age', sortable: true },
    { key: 'team', label: 'Team', sortable: true, render: (_: any, player: any) => player.teams?.name || 'Free Agent' },
    { key: 'rating', label: 'Rating', sortable: true },
    { key: 'value', label: 'Value', sortable: true, render: (value: number) => `$${(value / 1000000).toFixed(1)}M` }
  ];

  if (selectedPlayer) {
    return (
      <AdminGuard requiredLevel={3}>
        <div className="container mx-auto p-6">
          <DynamicAdminForm
            title={isCreating ? "New Player" : "Player"}
            data={selectedPlayer}
            fields={fields}
            onSave={handleSavePlayer}
            onCancel={() => { setSelectedPlayer(null); setIsCreating(false); }}
            countries={countries}
            teams={teams}
          />
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard requiredLevel={3}>
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Player Administration</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              All Players
              <Button onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-1" />
                Create New Player
              </Button>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Search by player name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading players...</div>
            ) : (
              <PaginatedTable
                data={filteredPlayers}
                columns={playerColumns}
                onEdit={handleEditPlayer}
                getEditPath={(player) => `/players/${player.player_id}`}
                itemsPerPage={15}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  );
};

export default PlayerAdminTool;
