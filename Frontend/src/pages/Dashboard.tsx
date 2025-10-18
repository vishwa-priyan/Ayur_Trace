import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, FlaskConical, Smartphone, Monitor, ChevronRight } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-earth">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AyurTrace</h1>
                <p className="text-sm text-muted-foreground">Blockchain Herb Traceability</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
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
                  Complete traceability for Ayurvedic herbs using blockchain technology. 
                  Ensure authenticity, quality, and compliance at every step of the supply chain.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Choose Your Interface:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-farmer"
                    onClick={() => navigate('/collection')}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-farmer rounded-lg">
                          <Smartphone className="w-5 h-5 text-farmer-foreground" />
                        </div>
                        <CardTitle className="text-farmer">Farmer Collection</CardTitle>
                      </div>
                      <CardDescription>
                        Mobile-optimized interface for field data collection and harvest logging
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="farmer" className="w-full">
                        Start Collection Event
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-lab"
                    onClick={() => navigate('/quality-test')}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-lab rounded-lg">
                          <Monitor className="w-5 h-5 text-lab-foreground" />
                        </div>
                        <CardTitle className="text-lab">Lab & Processing</CardTitle>
                      </div>
                      <CardDescription>
                        Professional interface for quality testing and processing steps
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="lab" className="w-full">
                        Lab Interface
                        <ChevronRight className="w-4 h-4" />
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
              From seed to shelf, track every step of your Ayurvedic herb supply chain with blockchain-powered transparency
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
    </div>
  );
};

export default Dashboard;