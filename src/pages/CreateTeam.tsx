
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

const CreateTeam = () => {
  const [teamName, setTeamName] = useState("Gridiron Rovers");
  const [teamLogo, setTeamLogo] = useState<string>("logo1");
  const [primaryColor, setPrimaryColor] = useState("#1a2b4c");
  const [secondaryColor, setSecondaryColor] = useState("#3498db");
  const [isLoading, setIsLoading] = useState(false);
  const [teamStyle, setTeamStyle] = useState({
    offensive: 50,
    defensive: 50,
    passing: 50,
    physical: 50
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Redirect to dashboard
      window.location.href = "/";
    }, 1500);
  };

  const colorOptions = [
    { name: "Royal Blue", value: "#1a2b4c" },
    { name: "Deep Red", value: "#8b0000" },
    { name: "Forest Green", value: "#228b22" },
    { name: "Purple", value: "#4b0082" },
    { name: "Black", value: "#000000" },
    { name: "Orange", value: "#ff8c00" },
  ];
  
  const secondaryColorOptions = [
    { name: "Sky Blue", value: "#3498db" },
    { name: "Gold", value: "#ffd700" },
    { name: "Silver", value: "#c0c0c0" },
    { name: "White", value: "#ffffff" },
    { name: "Lime Green", value: "#32cd32" },
    { name: "Pink", value: "#ff69b4" },
  ];
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Your Team</CardTitle>
          <CardDescription>
            Customize your team's identity, colors, and playing style
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="identity" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="identity">Identity</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="style">Playing Style</TabsTrigger>
            </TabsList>
            
            <TabsContent value="identity">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input
                    id="teamName"
                    placeholder="E.g. Athletic FC"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>Team Logo</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    {["logo1", "logo2", "logo3"].map((logo) => (
                      <div 
                        key={logo}
                        className={`p-4 border rounded-md cursor-pointer hover:bg-accent transition-colors ${
                          teamLogo === logo ? "border-primary bg-primary/10" : ""
                        }`}
                        onClick={() => setTeamLogo(logo)}
                      >
                        <div className="aspect-square rounded-full bg-primary flex items-center justify-center">
                          <span className="text-white font-bold text-xl">
                            {teamName.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <p className="text-center text-xs mt-2 text-muted-foreground">
                          {logo === "logo1" ? "Classic" : logo === "logo2" ? "Modern" : "Minimal"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label>Stadium Name</Label>
                  <Input 
                    placeholder="E.g. Gridiron Arena"
                    defaultValue="Gridiron Arena"
                    className="mt-2"
                  />
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button 
                    type="button" 
                    onClick={() => {
                      const element = document.querySelector('[data-value="colors"]');
                      if (element instanceof HTMLElement) {
                        element.click();
                      }
                    }}
                  >
                    Next: Team Colors
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="colors">
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {colorOptions.map((color) => (
                        <div
                          key={color.value}
                          className={`h-10 rounded-md cursor-pointer border-2 ${
                            primaryColor === color.value ? "border-primary" : "border-transparent"
                          }`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => setPrimaryColor(color.value)}
                          title={color.name}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Selected: {colorOptions.find(c => c.value === primaryColor)?.name}</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {secondaryColorOptions.map((color) => (
                        <div
                          key={color.value}
                          className={`h-10 rounded-md cursor-pointer border-2 ${
                            secondaryColor === color.value ? "border-primary" : "border-transparent"
                          }`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => setSecondaryColor(color.value)}
                          title={color.name}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Selected: {secondaryColorOptions.find(c => c.value === secondaryColor)?.name}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label>Preview</Label>
                  <div className="border rounded-md p-6 mt-2 flex flex-col items-center">
                    <div 
                      className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {teamName.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="mt-4 px-6 py-3 rounded-md font-semibold" style={{ 
                      backgroundColor: primaryColor,
                      color: secondaryColor === "#ffffff" ? secondaryColor : "white",
                    }}>
                      {teamName}
                    </div>
                    <div 
                      className="mt-4 pitch-background rounded-md w-full h-32 p-4 flex flex-col justify-between"
                      style={{ borderColor: secondaryColor }}
                    >
                      <div className="flex justify-evenly">
                        {[1, 2, 3].map(i => (
                          <div 
                            key={i} 
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: primaryColor }}
                          >
                            <span style={{ color: secondaryColor === "#ffffff" ? secondaryColor : "white" }}>
                              {i}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-4">
                  <Button 
                    variant="outline"
                    type="button" 
                    onClick={() => {
                      const element = document.querySelector('[data-value="identity"]');
                      if (element instanceof HTMLElement) {
                        element.click();
                      }
                    }}
                  >
                    Back to Identity
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => {
                      const element = document.querySelector('[data-value="style"]');
                      if (element instanceof HTMLElement) {
                        element.click();
                      }
                    }}
                  >
                    Next: Playing Style
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="style">
              <div className="grid gap-6">
                <div>
                  <Label>Team Philosophy</Label>
                  <Select defaultValue="balanced">
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select a philosophy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="attacking">Attacking</SelectItem>
                        <SelectItem value="possession">Possession</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="counter">Counter-Attack</SelectItem>
                        <SelectItem value="defensive">Defensive</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Team Play Style</Label>
                  
                  <div className="space-y-6 mt-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Defensive</span>
                        <span>Offensive</span>
                      </div>
                      <Slider
                        value={[teamStyle.offensive]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={([value]) => setTeamStyle({...teamStyle, offensive: value})}
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Physical</span>
                        <span>Technical</span>
                      </div>
                      <Slider
                        value={[teamStyle.physical]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={([value]) => setTeamStyle({...teamStyle, physical: value})}
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Direct Play</span>
                        <span>Short Passing</span>
                      </div>
                      <Slider
                        value={[teamStyle.passing]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={([value]) => setTeamStyle({...teamStyle, passing: value})}
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Low Pressure</span>
                        <span>High Pressure</span>
                      </div>
                      <Slider
                        value={[teamStyle.defensive]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={([value]) => setTeamStyle({...teamStyle, defensive: value})}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-8">
                  <Button 
                    variant="outline"
                    type="button" 
                    onClick={() => {
                      const element = document.querySelector('[data-value="colors"]');
                      if (element instanceof HTMLElement) {
                        element.click();
                      }
                    }}
                  >
                    Back to Colors
                  </Button>
                  <Button 
                    onClick={handleCreate}
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Team..." : "Create and Start Game"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground justify-center">
          You can change these settings later in the Team Administration panel.
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateTeam;
