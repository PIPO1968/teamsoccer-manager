
import { useState, useEffect } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { DynamicAdminForm } from "@/components/admin/DynamicAdminForm";
import { PaginatedTable } from "@/components/admin/PaginatedTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/services/apiClient";
import { UserCog, Search, Wrench, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface Manager {
  user_id: number;
  username: string;
  email: string;
  country_id: number;
  is_admin: number;
  is_premium: number;
  premium_expires_at: string;
  status: string;
  created_at: string;
  last_login: string;
}

interface FieldConfig {
  name: string;
  type: string;
  nullable: boolean;
  default: any;
  isEditable: boolean;
}

const ManagerAdminTool = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [countries, setCountries] = useState<Array<{ region_id: number; name: string }>>([]);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const { toast } = useToast();
  const { t } = useLanguage();

  // Define which fields should be editable
  const editableFields = [
    'username', 'email', 'country_id', 'is_admin', 'is_premium',
    'premium_expires_at', 'status'
  ];

  useEffect(() => {
    loadManagers();
    loadCountries();
  }, []);

  const loadManagers = async () => {
    try {
      setLoading(true);
      const response = await apiFetch<{ success: boolean; managers: Manager[] }>(
        "/admin/managers"
      );
      const data = response.managers || [];
      setManagers(data);
      if (data.length > 0) {
        const sampleRow = data[0];
        const dynamicFields: FieldConfig[] = Object.keys(sampleRow).map((key) => ({
          name: key,
          type: typeof (sampleRow as Record<string, unknown>)[key] === "number" ? "integer" : "text",
          nullable: true,
          default: null,
          isEditable: editableFields.includes(key)
        }));
        setFields(dynamicFields);
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('common.failedLoadManagers'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCountries = async () => {
    try {
      const response = await apiFetch<{ success: boolean; countries: Array<{ region_id: number; name: string }> }>(
        "/admin/countries"
      );
      setCountries(response.countries || []);
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  };

  const handleFixSetup = async (managerId: number, username: string) => {
    try {
      await apiFetch<{ success: boolean }>('/admin/fix-manager-setup', {
        method: 'POST',
        body: JSON.stringify({ managerId }),
      });
      toast({
        title: 'Setup corregido',
        description: `Liga, jugadores y estadio verificados para ${username}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo completar el setup',
        variant: 'destructive',
      });
    }
  };

  const [repairingAll, setRepairingAll] = useState(false);
  const handleRepairAllLeagues = async () => {
    setRepairingAll(true);
    try {
      const data = await apiFetch<{ success: boolean; total: number; results: { managerId: number; status: string; error?: string }[] }>(
        '/admin/repair-all-leagues',
        { method: 'POST' }
      );
      const errors = data.results.filter(r => r.status === 'error');
      if (errors.length > 0) {
        toast({
          title: `Reparación: ${data.total - errors.length}/${data.total} OK`,
          description: `Errores: ${errors.map(e => e.managerId).join(', ')}`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: `Reparación completada`,
          description: data.total === 0 ? 'No había managers sin liga.' : `${data.total} manager(s) reparados.`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al reparar ligas',
        variant: 'destructive',
      });
    } finally {
      setRepairingAll(false);
    }
  };

  const handleSaveManager = async (managerData: Record<string, any>) => {
    if (!selectedManager) return;

    await apiFetch<{ success: boolean }>(
      `/admin/managers/${selectedManager.user_id}`,
      {
        method: "PUT",
        body: JSON.stringify(managerData),
      }
    );

    await loadManagers();
    setSelectedManager(null);
  };

  const filteredManagers = managers.filter(manager =>
    (manager.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (manager.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const managerColumns = [
    { key: 'user_id', label: 'ID', sortable: true },
    { key: 'username', label: 'Username', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (status: string) => (
        <span className={`px-2 py-1 rounded text-xs ${status === 'active' ? 'bg-green-100 text-green-800' :
          status === 'waiting_list' ? 'bg-yellow-100 text-yellow-800' :
            status === 'carnet_pending' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
          }`}>
          {status === 'carnet_pending' ? 'Carnet pendiente' : status}
        </span>
      )
    },
    { key: 'is_admin', label: 'Admin Level', sortable: true },
    {
      key: 'user_id',
      label: 'Acciones',
      sortable: false,
      render: (_: number, row: Manager) => (
        <Button
          size="sm"
          variant="outline"
          className="gap-1 text-orange-600 border-orange-300 hover:bg-orange-50"
          onClick={(e) => { e.stopPropagation(); handleFixSetup(row.user_id, row.username); }}
          title="Forzar setup: liga, estadio, jugadores"
        >
          <Wrench className="h-3 w-3" />
          Fix Setup
        </Button>
      )
    },
    {
      key: 'is_premium',
      label: 'Premium',
      sortable: true,
      render: (isPremium: number) => isPremium ? (
        <span className="text-green-600">Yes</span>
      ) : (
        <span className="text-gray-500">No</span>
      )
    }
  ];

  if (selectedManager) {
    return (
      <AdminGuard requiredLevel={3}>
        <div className="container mx-auto p-6">
          <DynamicAdminForm
            title="Manager"
            data={selectedManager}
            fields={fields}
            onSave={handleSaveManager}
            onCancel={() => setSelectedManager(null)}
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
          <UserCog className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Manager Administration</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Managers</CardTitle>
              <Button
                variant="outline"
                className="gap-2 text-green-700 border-green-400 hover:bg-green-50"
                onClick={handleRepairAllLeagues}
                disabled={repairingAll}
              >
                <ShieldCheck className="h-4 w-4" />
                {repairingAll ? 'Reparando...' : 'Repair All Leagues'}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Search by username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading managers...</div>
            ) : (
              <PaginatedTable
                data={filteredManagers}
                columns={managerColumns}
                onEdit={setSelectedManager}
                getEditPath={(manager) => `/manager/${manager.user_id}`}
                itemsPerPage={15}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  );
};

export default ManagerAdminTool;
