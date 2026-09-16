import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Leaf, FlaskConical, BarChart3 } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/lib/api";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from?.pathname;

  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState("");
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();

    if (!userType || !formData.id || !formData.password || (!isLogin && (!formData.name || !formData.email))) {
      toast({
        title: `${isLogin ? 'Login' : 'Registration'} Failed`,
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin 
        ? { id: formData.id, password: formData.password, userType }
        : { id: formData.id, name: formData.name, email: formData.email, password: formData.password, userType };

      const response = await fetch(getApiUrl(endpoint), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || (isLogin ? "Invalid credentials" : "Registration failed"));
      }

      const data = await response.json();
      
      if (!isLogin) {
        toast({
          title: "Registration Successful",
          description: "You can now log in with your credentials."
        });
        setIsLogin(true);
        setFormData(prev => ({...prev, password: ""}));
        return;
      }

      login(data.token, data.user);

      toast({
        title: "Login Successful",
        description: `Welcome ${data.user.name}!`
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
    } catch (err) {
      const message = err?.message || (isLogin ? "Invalid credentials" : "Registration failed");

      toast({
        title: `${isLogin ? 'Login' : 'Registration'} Failed`,
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
          <CardTitle className="text-2xl">{isLogin ? 'AyurTrace Login' : 'Create Account'}</CardTitle>
          <CardDescription>
            {isLogin ? 'Access your secured traceability portal' : 'Register to join the traceability network'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userType">User Type</Label>
              <Select value={userType} onValueChange={(value) => setUserType(value)}>
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
                "Enter your unique ID"
                }
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                required />
            </div>

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name or Organization</Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required />
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
              disabled={!userType || loading}>
              
              {loading ? (isLogin ? "Signing In..." : "Registering...") : (isLogin ? "Sign In" : "Sign Up")}
            </Button>
            
            <div className="text-center text-sm">
              {isLogin ? (
                <p>
                  Don't have an account?{" "}
                  <button type="button" className="text-primary hover:underline" onClick={() => setIsLogin(false)}>
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button type="button" className="text-primary hover:underline" onClick={() => setIsLogin(true)}>
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>);

};

export default Login;