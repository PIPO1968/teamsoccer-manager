
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface PostActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export default function PostActions({ onEdit, onDelete }: PostActionsProps) {
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    setOpen(false);
    onDelete();
  };

  return (
    <div className="py-3 flex justify-end gap-2">
      <Button 
        size="sm" 
        variant="outline" 
        onClick={onEdit}
      >
        <Pencil className="h-4 w-4 mr-1" /> Edit
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button 
            size="sm" 
            variant="destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
