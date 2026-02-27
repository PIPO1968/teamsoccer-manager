
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Group } from "./useGroups";

export function useManagerGroups(managerId: string | undefined) {
  return useQuery({
    queryKey: ['manager-groups', managerId],
    queryFn: async () => {
      if (!managerId) return { owned: [], member: [] };
      
      // Get groups owned by the manager with accurate member count
      const { data: ownedGroups, error: ownedError } = await supabase
        .from('groups')
        .select(`
          *,
          member_count:group_members(count)
        `)
        .eq('owner_id', parseInt(managerId))
        .eq('group_members.is_active', true);
        
      if (ownedError) throw ownedError;
      
      // Get groups where the manager is a member (not owner) with accurate member count
      const { data: memberGroups, error: memberError } = await supabase
        .from('group_members')
        .select(`
          group:groups(
            *,
            member_count:group_members(count)
          )
        `)
        .eq('manager_id', parseInt(managerId))
        .eq('is_active', true)
        .neq('role', 'owner');
        
      if (memberError) throw memberError;
      
      // Format member groups using counted members
      const formattedMemberGroups = memberGroups.map(m => ({
        ...m.group,
        member_count: m.group.member_count[0].count || 0
      }));
      
      // Format owned groups using counted members
      const formattedOwnedGroups = ownedGroups.map(g => ({
        ...g,
        member_count: g.member_count[0].count || 0
      }));
      
      return { 
        owned: formattedOwnedGroups || [], 
        member: formattedMemberGroups || [] 
      };
    },
    enabled: !!managerId
  });
}
