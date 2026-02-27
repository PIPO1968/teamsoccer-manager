
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";

interface TacticsDialogProps {
  open: boolean;
  currentFormation: string;
  setOpen: (b: boolean) => void;
  onChangeFormation: (formation: string) => void;
}

const formations = ["4-4-2", "4-3-3", "4-2-3-1", "3-5-2", "5-3-2"];

export default function TacticsDialog({
  open,
  setOpen,
  currentFormation,
  onChangeFormation
}: TacticsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Team Tactics</DialogTitle>
          <DialogDescription>Change your team's formation and playing style</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Formation</h4>
            <div className="grid grid-cols-3 gap-2">
              {formations.map((formation) => (
                <Button
                  key={formation}
                  variant={currentFormation === formation ? "default" : "outline"}
                  onClick={() => onChangeFormation(formation)}
                >
                  {formation}
                </Button>
              ))}
            </div>
          </div>
          <Tabs defaultValue="attacking">
            <TabsList className="grid grid-cols-3 mb-2">
              <TabsTrigger value="attacking">Attacking</TabsTrigger>
              <TabsTrigger value="midfield">Midfield</TabsTrigger>
              <TabsTrigger value="defending">Defending</TabsTrigger>
            </TabsList>
            <TabsContent value="attacking" className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Direct Play</span>
                  <span>Possession</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Cautious</span>
                  <span>Attacking</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
            </TabsContent>
            <TabsContent value="midfield">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Defensive</span>
                    <span>Offensive</span>
                  </div>
                  <Progress value={50} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Narrow</span>
                    <span>Wide</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="defending">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Deep Block</span>
                    <span>High Press</span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Zonal</span>
                    <span>Man Marking</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              toast({
                title: "Tactics Updated",
                description: "Your team's tactics have been updated.",
              });
              setOpen(false);
            }}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
