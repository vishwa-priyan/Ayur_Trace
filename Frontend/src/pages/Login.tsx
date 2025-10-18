import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Leaf, FlaskConical, BarChart3 } from "lucide-react";

import { auth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname as string | undefined;

  const [userType, setUserType] = useState<"farmer" | "lab" | "stakeholder" | "">("");
  const [formData, setFormData] = useState({
    id: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userType || !formData.id || !formData.password) {
      toast({
        title: "Login Failed",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    // treat id as email if it contains @, otherwise map to domain (adjust as needed)
    const email = formData.id.includes("@") ? formData.id : `${formData.id}@example.com`;

    try {
      await signInWithEmailAndPassword(auth, email, formData.password);

      toast({
        title: "Login Successful",
        description: `Welcome ${formData.id}!`,
      });

      // If the user was redirected here from a protected page, go back there.
      if (from) {
        navigate(from, { replace: true });
        return;
      }

      // Otherwise, fall back to role based routing
      switch (userType) {
        case "farmer":
          navigate('/collection', { replace: true });
          break;
        case "lab":
          navigate('/quality-test', { replace: true });
          break;
        case "stakeholder":
          navigate('/stakeholder', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
    } catch (err: any) {
      const code = err?.code;
      let message = err?.message || "Invalid credentials";

      if (code) {
        switch (code) {
          case "auth/user-not-found":
          case "auth/wrong-password":
            message = "Invalid ID/email or password.";
            break;
          case "auth/invalid-email":
            message = "Invalid email format.";
            break;
          case "auth/too-many-requests":
            message = "Too many attempts. Try again later.";
            break;
          case "auth/user-disabled":
            message = "This account has been disabled.";
            break;
          default:
            break;
        }
      }

      toast({
        title: "Login Failed",
        description: message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
                {userType === "farmer" ? "Farmer ID / Email" : userType === "lab" ? "Lab ID / Email" : userType === "stakeholder" ? "Manager ID / Email" : "User ID / Email"}
              </Label>
              <Input
                id="id"
                placeholder={
                  userType === "farmer" ? "F2025001 or farmer@example.com" :
                  userType === "lab" ? "LAB001 or lab@example.com" :
                  userType === "stakeholder" ? "MGR001 or manager@example.com" :
                  "Enter your ID or email"
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
              disabled={!userType || loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;