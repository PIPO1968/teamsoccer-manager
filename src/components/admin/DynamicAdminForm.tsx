
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface FieldConfig {
  name: string;
  type: string;
  nullable: boolean;
  default: any;
  isEditable: boolean;
}

interface DynamicAdminFormProps {
  title: string;
  data: Record<string, any>;
  fields: FieldConfig[];
  onSave: (data: Record<string, any>) => Promise<void>;
  onCancel: () => void;
  countries?: Array<{ region_id: number; name: string }>;
  teams?: Array<{ team_id: number; name: string }>;
  series?: Array<{ series_id: number; name: string; division: number; group_number: number }>;
}

export const DynamicAdminForm = ({
  title,
  data,
  fields,
  onSave,
  onCancel,
  countries = [],
  teams = [],
  series = []
}: DynamicAdminFormProps) => {
  const [formData, setFormData] = useState(data);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log('Form data updated:', data);
    setFormData(data);
  }, [data]);

  const handleSave = async () => {
    try {
      setLoading(true);
      await onSave(formData);
      toast({
        title: "Success",
        description: `${title} updated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update ${title.toLowerCase()}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: FieldConfig) => {
    if (!field.isEditable) return null;

    const value = formData[field.name];
    console.log(`Rendering field ${field.name} with value:`, value);

    // Special handling for nationality_id with countries
    if (field.name === 'nationality_id' && countries.length > 0) {
      return (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>Nationality</Label>
          <Select
            value={value?.toString() || ''}
            onValueChange={(newValue) => setFormData(prev => ({ ...prev, [field.name]: parseInt(newValue) }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select nationality" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.region_id} value={country.region_id.toString()}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Special handling for team_id
    if (field.name === 'team_id' && teams.length > 0) {
      return (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>Team</Label>
          <Select
            value={value?.toString() || ''}
            onValueChange={(newValue) => setFormData(prev => ({ ...prev, [field.name]: newValue === 'null' ? null : parseInt(newValue) }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="null">No Team</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.team_id} value={team.team_id.toString()}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (field.name === 'country_id' && countries.length > 0) {
      return (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>Country</Label>
          <Select
            value={value?.toString() || ''}
            onValueChange={(newValue) => setFormData(prev => ({ ...prev, [field.name]: parseInt(newValue) }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.region_id} value={country.region_id.toString()}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (field.name === 'status') {
      return (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>Status</Label>
          <Select
            value={value || ''}
            onValueChange={(newValue) => setFormData(prev => ({ ...prev, [field.name]: newValue }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="carnet_pending">Carnet de Manager</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (field.name === 'position') {
      const positions = ['GK', 'DEF', 'MID', 'FWD'];
      return (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>Position</Label>
          <Select
            value={value || ''}
            onValueChange={(newValue) => setFormData(prev => ({ ...prev, [field.name]: newValue }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent>
              {positions.map((pos) => (
                <SelectItem key={pos} value={pos}>
                  {pos}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Handle leadership field (1-10 scale)
    if (field.name === 'leadership') {
      const leadershipOptions = Array.from({ length: 10 }, (_, i) => i + 1);
      return (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>Leadership</Label>
          <Select
            value={value?.toString() || ''}
            onValueChange={(newValue) => setFormData(prev => ({ ...prev, [field.name]: parseInt(newValue) }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select leadership level" />
            </SelectTrigger>
            <SelectContent>
              {leadershipOptions.map((level) => (
                <SelectItem key={level} value={level.toString()}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Handle form field
    if (field.name === 'form') {
      const formOptions = ['Excellent', 'Good', 'Average', 'Poor'];
      return (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>Form</Label>
          <Select
            value={value || ''}
            onValueChange={(newValue) => setFormData(prev => ({ ...prev, [field.name]: newValue }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select form" />
            </SelectTrigger>
            <SelectContent>
              {formOptions.map((formOption) => (
                <SelectItem key={formOption} value={formOption}>
                  {formOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Handle boolean fields
    if (field.type === 'boolean') {
      return (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>{field.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
          <Select
            value={value?.toString() || 'false'}
            onValueChange={(newValue) => setFormData(prev => ({ ...prev, [field.name]: newValue === 'true' }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">No</SelectItem>
              <SelectItem value="true">Yes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Handle text areas for long text fields
    if (field.type === 'text' && (field.name.includes('description') || field.name.includes('content'))) {
      return (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>{field.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
          <Textarea
            id={field.name}
            value={value || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
            rows={3}
          />
        </div>
      );
    }

    // Handle numeric fields
    if (field.type === 'integer' || field.type === 'bigint') {
      return (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>{field.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
          <Input
            id={field.name}
            type="number"
            value={value || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: parseInt(e.target.value) || 0 }))}
          />
        </div>
      );
    }

    // Handle date fields
    if (field.type.includes('timestamp') || field.type.includes('date')) {
      const dateValue = value ? new Date(value).toISOString().split('T')[0] : '';
      return (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>{field.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
          <Input
            id={field.name}
            type="date"
            value={dateValue}
            onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
          />
        </div>
      );
    }

    // Default to text input
    return (
      <div key={field.name} className="space-y-2">
        <Label htmlFor={field.name}>{field.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
        <Input
          id={field.name}
          type="text"
          value={value || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
        />
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit {title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(renderField)}
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
