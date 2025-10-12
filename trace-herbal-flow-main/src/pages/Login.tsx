import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Leaf, FlaskConical, BarChart3 } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<"farmer" | "lab" | "stakeholder" | "">("");
  const [formData, setFormData] = useState({
    id: "",
    password: ""
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userType || !formData.id || !formData.password) {
      toast({
        title: "Login Failed",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    // Mock authentication - redirect based on user type
    toast({
      title: "Login Successful",
      description: `Welcome ${formData.id}!`,
    });

    // Navigate to respective dashboard
    switch (userType) {
      case "farmer":
        navigate('/collection');
        break;
      case "lab":
        navigate('/quality-test');
        break;
      case "stakeholder":
        navigate('/stakeholder');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-earth flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-gradient-primary rounded-lg w-fit">
            <Leaf className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">AyurTrace Login</CardTitle>
          <CardDescription>
            Access your blockchain traceability portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userType">User Type</Label>
              <Select value={userType} onValueChange={(value: "farmer" | "lab" | "stakeholder") => setUserType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="farmer">
                    <div className="flex items-center gap-2">
                      <Leaf className="w-4 h-4" />
                      Farmer/Collector
                    </div>
                  </SelectItem>
                  <SelectItem value="lab">
                    <div className="flex items-center gap-2">
                      <FlaskConical className="w-4 h-4" />
                      Lab/Processor
                    </div>
                  </SelectItem>
                  <SelectItem value="stakeholder">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Stakeholder/Manager
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="id">
                {userType === "farmer" ? "Farmer ID" : userType === "lab" ? "Lab ID" : userType === "stakeholder" ? "Manager ID" : "User ID"}
              </Label>
              <Input
                id="id"
                placeholder={
                  userType === "farmer" ? "F2025001" : 
                  userType === "lab" ? "LAB001" : 
                  userType === "stakeholder" ? "MGR001" : 
                  "Enter your ID"
                }
                value={formData.id}
                onChange={(e) => setFormData({...formData, id: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              variant={
                userType === "farmer" ? "farmer" : 
                userType === "lab" ? "lab" : 
                userType === "stakeholder" ? "default" : 
                "default"
              }
              disabled={!userType}
            >
              Sign In
            </Button>
          </form>

          
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;