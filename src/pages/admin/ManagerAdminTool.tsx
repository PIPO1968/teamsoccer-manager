
import { useState, useEffect } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { DynamicAdminForm } from "@/components/admin/DynamicAdminForm";
import { PaginatedTable } from "@/components/admin/PaginatedTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { UserCog, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  // Define which fields should be editable
  const editableFields = [
    'username', 'email', 'country_id', 'is_admin', 'is_premium', 
    'premium_expires_at', 'status'
  ];

  useEffect(() => {
    loadManagers();
    loadCountries();
    loadTableStructure();
  }, []);

  const loadTableStructure = async () => {
    try {
      const { data, error } = await supabase
        .from('managers')
        .select('*')
        .limit(1);

      if (error) throw error;

      // Get table structure from the first row
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

  const loadManagers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('managers')
        .select('*')
        .order('user_id');

      if (error) throw error;
      setManagers(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load managers",
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

  const handleSaveManager = async (managerData: Record<string, any>) => {
    if (!selectedManager) return;

    const { error } = await supabase
      .from('managers')
      .update(managerData)
      .eq('user_id', selectedManager.user_id);

    if (error) throw error;

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
        <span className={`px-2 py-1 rounded text-xs ${
          status === 'active' ? 'bg-green-100 text-green-800' :
          status === 'waiting_list' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {status}
        </span>
      )
    },
    { key: 'is_admin', label: 'Admin Level', sortable: true },
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
            <CardTitle>All Managers</CardTitle>
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
