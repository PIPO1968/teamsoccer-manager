
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ErrorDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errorDetails: string | null;
}

const ErrorDetailsDialog = ({ open, onOpenChange, errorDetails }: ErrorDetailsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Error Details</DialogTitle>
          <DialogDescription>
            Technical information about the error:
          </DialogDescription>
        </DialogHeader>
        <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
          <pre className="text-xs whitespace-pre-wrap">{errorDetails}</pre>
        </div>
        <Button 
          variant="outline" 
          onClick={() => onOpenChange(false)}
          className="w-full mt-4"
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ErrorDetailsDialog;
