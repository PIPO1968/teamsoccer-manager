
import { useParams, useNavigate } from "react-router-dom";
import { useGroups } from "@/hooks/useGroups";
import { useGroupMembers } from "@/hooks/useGroupMembers";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { RoomInfo } from "@/components/groups/RoomInfo";
import { RoomMembers } from "@/components/groups/RoomMembers";
import { RoomApplications } from "@/components/groups/RoomApplications";
import { JoinRoomButton } from "@/components/groups/JoinRoomButton";

export default function RoomDetailsPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { groups, applyToGroup, deleteGroup } = useGroups();
  const { members, applications, handleApplication, userApplication } = useGroupMembers(Number(groupId));
  const { manager } = useAuth();
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const group = groups?.find(g => g.id === Number(groupId));
  const isOwner = group?.owner_id === manager?.user_id;
  const isMember = members?.some(m => m.manager_id === manager?.user_id);
  const hasApplied = applications?.some(app => app.applicant_id === manager?.user_id) || userApplication !== null;

  // Add the missing functions
  const handleJoinRequest = () => {
    setShowJoinDialog(true);
  };

  const submitJoinRequest = () => {
    if (groupId) {
      applyToGroup.mutate({ 
        groupId: Number(groupId), 
        message: applicationMessage.trim() || undefined 
      }, {
        onSuccess: () => {
          setShowJoinDialog(false);
          setApplicationMessage("");
        }
      });
    }
  };

  const handleDeleteGroup = () => {
    if (groupId && isOwner) {
      deleteGroup.mutate(Number(groupId), {
        onSuccess: () => {
          navigate('/rooms');
        }
      });
    }
  };

  if (!group) {
    return <div>Room not found</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-4xl mx-auto">
        <RoomInfo 
          group={group} 
          members={members} 
          isOwner={isOwner}
          onDeleteClick={() => setShowDeleteDialog(true)}
        />

        {isMember && members && (
          <RoomMembers members={members} />
        )}

        {isOwner && applications && applications.length > 0 && (
          <RoomApplications 
            applications={applications}
            onHandle={(applicationId, status) => 
              handleApplication.mutate({ applicationId, status })}
          />
        )}

        {!isOwner && !isMember && !hasApplied && manager?.user_id && (
          <JoinRoomButton onClick={handleJoinRequest} />
        )}

        {!isOwner && !isMember && hasApplied && (
          <div className="text-center p-4 bg-muted rounded-md">
            <p>Your application to join this room is pending approval.</p>
          </div>
        )}

        <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request to join {group.name}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                You can include a message with your application:
              </p>
              <Textarea
                placeholder="Write a message to the room owner (optional)"
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={submitJoinRequest} 
                disabled={applyToGroup.isPending}
              >
                {applyToGroup.isPending ? 'Submitting...' : 'Submit Request'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to delete this room?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the room, 
                remove all members, and delete the room's forum and all its content.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteGroup}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteGroup.isPending}
              >
                {deleteGroup.isPending ? 'Deleting...' : 'Delete Room'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
