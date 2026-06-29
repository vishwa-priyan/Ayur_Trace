import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Leaf, FlaskConical, Smartphone, Monitor, ChevronRight, LogOut, LogIn, BarChart3, QrCode, Scan, Loader2, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [batchId, setBatchId] = useState("");
  const [isScanningOpen, setIsScanningOpen] = useState(false);
  const [scanState, setScanState] = useState<'idle' | 'initializing' | 'scanning' | 'success'>('idle');
  const [selectedMockBatch, setSelectedMockBatch] = useState("AYR202501001");

  const handleSearch = () => {
    if (batchId.trim()) {
      navigate(`/provenance/${batchId.trim()}`);
    } else {
      toast({
        title: "Batch ID required",
        description: "Please enter a valid Batch ID to track.",
        variant: "destructive",
      });
    }
  };

  const handleScanQR = () => {
    setIsScanningOpen(true);
    setScanState('initializing');
  };

  useEffect(() => {
    if (!isScanningOpen) return;

    let timer1: ReturnType<typeof setTimeout>;
    let timer2: ReturnType<typeof setTimeout>;
    let timer3: ReturnType<typeof setTimeout>;

    if (scanState === 'initializing') {
      timer1 = setTimeout(() => {
        setScanState('scanning');
      }, 800);
    } else if (scanState === 'scanning') {
      timer2 = setTimeout(() => {
        setScanState('success');
      }, 2000);
    } else if (scanState === 'success') {
      timer3 = setTimeout(() => {
        setIsScanningOpen(false);
        navigate(`/provenance/${selectedMockBatch}`);
      }, 1200);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isScanningOpen, scanState, selectedMockBatch, navigate]);

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
              <p className="text-sm text-muted-foreground">Blockchain Herb Traceability</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => navigate('/login')}>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            )}
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
                  Complete traceability for Ayurvedic herbs using blockchain database technology. 
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
                        }}
                      />
                    </div>
                    <Button 
                      onClick={handleSearch}
                      className="h-11 px-6 bg-gradient-primary text-white font-medium hover:opacity-90 shadow-md"
                    >
                      Trace Batch
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleScanQR}
                      className="h-11 px-4 border-primary/30 hover:bg-primary/5 text-primary font-medium"
                    >
                      <QrCode className="w-5 h-5 mr-2" />
                      Scan QR Code
                    </Button>
                  </div>
                  
                  {/* Demo Batch Suggestions */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Try demo batches:</span>
                    {['AYR202501001', 'AYR202501002', 'AYR202501003'].map((id) => (
                      <button
                        key={id}
                        onClick={() => setBatchId(id)}
                        className="px-2 py-1 bg-secondary text-secondary-foreground rounded hover:bg-primary hover:text-white transition-colors font-mono"
                      >
                        {id}
                      </button>
                    ))}
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
                    }}
                  >
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
                    }}
                  >
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
                    }}
                  >
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
                className="relative z-10 w-full h-auto rounded-2xl shadow-2xl"
              />
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

      {/* Mock QR Scanner Modal */}
      <Dialog open={isScanningOpen} onOpenChange={setIsScanningOpen}>
        <DialogContent className="sm:max-w-md bg-background border border-border rounded-xl shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
              <QrCode className="w-5 h-5 text-primary animate-pulse" />
              Mock QR Code Scanner
            </DialogTitle>
            <DialogDescription>
              Simulating device camera integration for instant batch tracking.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-6 space-y-6">
            {/* Viewfinder Frame */}
            <div className="relative w-64 h-64 border-4 border-primary/40 rounded-2xl overflow-hidden bg-black/90 flex flex-col items-center justify-center shadow-inner">
              {/* Corner Indicators */}
              <div className="absolute top-2 left-2 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl"></div>
              <div className="absolute top-2 right-2 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr"></div>
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl"></div>
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br"></div>

              {scanState === 'initializing' && (
                <div className="text-center space-y-2 text-muted-foreground p-4">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">Initializing Camera...</p>
                </div>
              )}

              {scanState === 'scanning' && (
                <>
                  {/* Laser line pulsing animation */}
                  <div className="absolute left-0 w-full h-1 bg-red-500 top-1/2 -translate-y-1/2 animate-pulse"></div>
                  <div className="text-center text-muted-foreground z-10 p-4">
                    <Scan className="w-12 h-12 text-primary/40 animate-pulse mx-auto mb-2" />
                    <p className="text-xs text-white/70">Align QR code inside the frame</p>
                  </div>
                </>
              )}

              {scanState === 'success' && (
                <div className="text-center space-y-2 text-emerald-500 animate-in zoom-in-50 duration-300 p-4">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                  <p className="text-sm font-bold">Successfully Decoded!</p>
                  <p className="text-xs font-mono bg-emerald-950/50 text-emerald-400 px-2 py-1 rounded">
                    {selectedMockBatch}
                  </p>
                </div>
              )}
            </div>

            {/* Mock Selection Controller */}
            {scanState !== 'success' && (
              <div className="w-full space-y-2">
                <label className="text-xs font-medium text-muted-foreground block text-center">
                  Select which demo batch to simulate scanning:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['AYR202501001', 'AYR202501002', 'AYR202501003'].map((id) => (
                    <Button
                      key={id}
                      variant={selectedMockBatch === id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedMockBatch(id)}
                      className={`text-xs font-mono ${
                        selectedMockBatch === id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'border-border hover:bg-primary/5 hover:text-primary'
                      }`}
                    >
                      {id.slice(-3)}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;