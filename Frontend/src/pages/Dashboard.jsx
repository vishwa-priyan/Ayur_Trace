import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Leaf, FlaskConical, Smartphone, Monitor, ChevronRight, LogOut, LogIn, BarChart3, QrCode, Scan, Loader2, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { useAuth } from "@/contexts/AuthContext";
import { Html5QrcodeScanner } from "html5-qrcode/esm/html5-qrcode-scanner";

/**
 * Safely extract the batch ID if a full URL is scanned.
 */
const extractBatchId = (scanResult) => {
  if (!scanResult) return "";
  const trimmed = scanResult.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const url = new URL(trimmed);
      const parts = url.pathname.split('/');
      const lastPart = parts[parts.length - 1];
      if (lastPart) return lastPart;
    } catch (e) {
      const parts = trimmed.split('/');
      return parts[parts.length - 1] || trimmed;
    }
  }
  return trimmed;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [batchId, setBatchId] = useState("");
  const [isScanningOpen, setIsScanningOpen] = useState(false);
  const pendingScannedId = useRef(null);

  const handleSearch = () => {
    if (batchId.trim()) {
      navigate(`/provenance/${batchId.trim()}`);
    } else {
      toast({
        title: "Batch ID required",
        description: "Please enter a valid Batch ID to track.",
        variant: "destructive"
      });
    }
  };

  const handleScanQR = () => {
    setIsScanningOpen(true);
  };

  useEffect(() => {
    let scanner = null;
    if (isScanningOpen) {
      const timer = setTimeout(() => {
        scanner = new Html5QrcodeScanner("reader", {
          qrbox: { width: 250, height: 250 },
          fps: 10,
        });

        scanner.render((result) => {
          try { if (scanner) scanner.clear(); } catch (e) {}
          setIsScanningOpen(false);
          pendingScannedId.current = extractBatchId(result);
        }, () => {
          // Ignore scanner errors
        });
      }, 150);

      return () => {
        clearTimeout(timer);
        try { if (scanner) scanner.clear(); } catch (e) {}
      };
    }
  }, [isScanningOpen]);

  useEffect(() => {
    if (!isScanningOpen && pendingScannedId.current) {
      const scannedId = pendingScannedId.current;
      pendingScannedId.current = null;
      const t = setTimeout(() => {
        navigate(`/provenance/${scannedId}`);
      }, 100);
      return () => clearTimeout(t);
    }
  }, [isScanningOpen, navigate]);

  return (
    <div className="min-h-screen bg-gradient-earth font-sans">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">AyurTrace</h1>
              <p className="text-sm text-muted-foreground">Secured Herb Traceability</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user ?
            <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div> :

            <Button size="sm" onClick={() => navigate('/login')}>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            }
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-5xl font-bold text-foreground leading-tight">
                  Track Every Herb<br />
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    From Farm to Pharmacy
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl">
                  Complete traceability for Ayurvedic herbs using secured database technology. 
                  Ensure authenticity, quality, and compliance at every step of the supply chain.
                </p>
              </div>

              {/* End-User Herb Batch Tracker Card */}
              <Card className="border-2 border-primary/20 bg-background/90 backdrop-blur-sm shadow-xl p-6 rounded-2xl">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-primary" />
                    Trace Your Herb Batch
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Enter the Batch ID from your packaging or scan the QR code to trace the herb's journey from farm to pharmacy.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Input
                        placeholder="Enter Batch ID (e.g. AYR202501001)"
                        value={batchId}
                        onChange={(e) => setBatchId(e.target.value)}
                        className="h-11 pl-4 text-base"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSearch();
                        }} />
                      
                    </div>
                    <Button
                      onClick={handleSearch}
                      className="h-11 px-6 bg-gradient-primary text-white font-medium hover:opacity-90 shadow-md">
                      
                      Trace Batch
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleScanQR}
                      className="h-11 px-4 border-primary/30 hover:bg-primary/5 text-primary font-medium">
                      
                      <QrCode className="w-5 h-5 mr-2" />
                      Scan QR Code
                    </Button>
                  </div>
                  
                  {/* Demo Batch Suggestions */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Try demo batches:</span>
                    {['AYR202501001', 'AYR202501002', 'AYR202501003'].map((id) =>
                    <button
                      key={id}
                      onClick={() => setBatchId(id)}
                      className="px-2 py-1 bg-secondary text-secondary-foreground rounded hover:bg-primary hover:text-white transition-colors font-mono">
                      
                        {id}
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Portal Roles section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Choose Your Interface:</h3>
                <div className="grid md:grid-cols-3 gap-4 items-stretch">
                  {/* Farmer Collection Card */}
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-farmer flex flex-col h-full justify-between"
                    onClick={() => {
                      if (user?.role === 'farmer') {
                        navigate('/collection');
                      } else {
                        navigate('/login', { state: { from: { pathname: '/collection' } } });
                      }
                    }}>
                    
                    <CardHeader className="pb-4 flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-farmer rounded-lg">
                          <Smartphone className="w-5 h-5 text-farmer-foreground" />
                        </div>
                        <CardTitle className="text-farmer text-md">Farmer Collection</CardTitle>
                      </div>
                      <CardDescription className="text-xs">
                        Mobile-optimized interface for harvest data collection
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button variant="farmer" className="w-full text-xs">
                        Start Collection Event
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Lab & Processing Card */}
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-lab flex flex-col h-full justify-between"
                    onClick={() => {
                      if (user?.role === 'lab') {
                        navigate('/quality-test');
                      } else {
                        navigate('/login', { state: { from: { pathname: '/quality-test' } } });
                      }
                    }}>
                    
                    <CardHeader className="pb-4 flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-lab rounded-lg">
                          <Monitor className="w-5 h-5 text-lab-foreground" />
                        </div>
                        <CardTitle className="text-lab text-md">Lab & Processing</CardTitle>
                      </div>
                      <CardDescription className="text-xs">
                        Professional interface for quality testing & processing
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button variant="lab" className="w-full text-xs">
                        Lab Interface
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Stakeholder Dashboard Card */}
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary flex flex-col h-full justify-between"
                    onClick={() => {
                      if (user?.role === 'stakeholder') {
                        navigate('/stakeholder');
                      } else {
                        navigate('/login', { state: { from: { pathname: '/stakeholder' } } });
                      }
                    }}>
                    
                    <CardHeader className="pb-4 flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-primary rounded-lg">
                          <BarChart3 className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <CardTitle className="text-primary text-md">Manager Portal</CardTitle>
                      </div>
                      <CardDescription className="text-xs">
                        Executive analytics, carbon stats and supplier audits
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button variant="default" className="w-full text-xs bg-gradient-primary hover:opacity-90 shadow-lg text-primary-foreground border-0">
                        Stakeholder Portal
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-3xl opacity-20"></div>
              <img
                src={heroImage}
                alt="Ayurvedic herb traceability technology"
                className="relative z-10 w-full h-auto rounded-2xl shadow-2xl" />
              
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-background/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">Complete Traceability Solution</h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From seed to shelf, track every step of your Ayurvedic herb supply chain with database-backed transparency
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto p-3 bg-gradient-farmer rounded-full w-fit mb-4">
                  <Leaf className="w-8 h-8 text-farmer-foreground" />
                </div>
                <CardTitle>Collection Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  GPS-enabled harvest logging with quality metrics and farmer verification
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto p-3 bg-gradient-lab rounded-full w-fit mb-4">
                  <FlaskConical className="w-8 h-8 text-lab-foreground" />
                </div>
                <CardTitle>Quality Testing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Lab-grade testing results with compliance verification and certificate management
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto p-3 bg-gradient-primary rounded-full w-fit mb-4">
                  <Monitor className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle>Processing Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Complete processing workflow tracking from drying to packaging with batch management
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* QR Scanner Modal */}
      <Dialog open={isScanningOpen} onOpenChange={setIsScanningOpen}>
        <DialogContent className="sm:max-w-md bg-background border border-border rounded-xl shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
              <QrCode className="w-5 h-5 text-primary" />
              Scan Batch QR Code
            </DialogTitle>
            <DialogDescription>
              Align the QR code on your product packaging inside the frame to track its journey.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-6 space-y-6">
            <div id="reader" className="w-full min-h-[300px]"></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>);

};

export default Dashboard;