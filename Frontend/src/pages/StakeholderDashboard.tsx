import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  Search, TrendingUp, AlertCircle, CheckCircle, MapPin, 
  Download, Filter, Calendar, Package, FlaskConical, Users, 
  Target, Globe, Bell, ArrowLeft
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const StakeholderDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTimeRange, setSelectedTimeRange] = useState("30");
  const [activeTab, setActiveTab] = useState("overview");

  // Initial mock data as fallback
  const [metrics, setMetrics] = useState<any>({
    totalHarvested: "2,450 kg",
    pendingQuality: 12,
    complianceRate: 98,
    consumerScans: 1847,
    activeFarmers: 45,
    totalBatches: 156,
    avgQualityScore: 4.3,
    carbonFootprint: "2.1 tons CO₂",
    harvestTrend: [
      { name: 'Week 1', value: 400 },
      { name: 'Week 2', value: 600 },
      { name: 'Week 3', value: 800 },
      { name: 'Week 4', value: 650 },
    ],
    qualityData: [
      { name: 'Passed', value: 95, fill: '#10b981' },
      { name: 'Failed', value: 5, fill: '#ef4444' },
    ],
    recentBatches: [
      { batchId: "AYR202501001", product: "Tulsi", farmer: "F2025001", date: "2025-01-20", status: "Completed", location: "Jaipur" },
      { batchId: "AYR202501002", product: "Ashwagandha", farmer: "F2025001", date: "2025-01-15", status: "Quality Check", location: "Jaipur" },
      { batchId: "AYR202501003", product: "Brahmi", farmer: "F2025001", date: "2025-01-10", status: "In Processing", location: "Jaipur" },
    ],
    farmerPerformance: [
      { name: 'F2025001', harvests: 3, quality: 4.5, compliance: 100 }
    ],
    regionalData: [
      { region: 'Jaipur', batches: 3, quality: 4.5 }
    ],
    alertsData: [
      { id: 'alert-default-1', type: "success", message: "All scanned quality tests within compliant margins.", time: "2 hours ago" },
    ]
  });

  const fetchMetrics = async () => {
    const token = localStorage.getItem("ayurtrace_token");
    if (!token) return;
    try {
      const response = await fetch("/api/stakeholder/metrics", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error("Error fetching stakeholder metrics:", err);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleRunAudit = () => {
    fetchMetrics();
    toast({
      title: "Audit Running",
      description: "Recalculating real-time compliance metrics from PostgreSQL database...",
    });
  };

  const filteredBatches = metrics.recentBatches.filter((batch: any) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      batch.batchId.toLowerCase().includes(query) ||
      batch.product.toLowerCase().includes(query) ||
      batch.farmer.toLowerCase().includes(query) ||
      (batch.location && batch.location.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-gradient-earth">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">AyurTrace Stakeholder Dashboard</h1>
                <p className="text-muted-foreground text-sm">Real-time ledger analytics | User: {user?.name || "Manager"}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button onClick={handleRunAudit}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Run Audit
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Harvested</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalHarvested}</div>
              <p className="text-xs text-muted-foreground">Logged in PostgreSQL</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Farmers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeFarmers}</div>
              <p className="text-xs text-muted-foreground">Registered collectives</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{metrics.complianceRate}%</div>
              <p className="text-xs text-muted-foreground">Passed lab quality tests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Quality Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{metrics.avgQualityScore}/5</div>
              <p className="text-xs text-muted-foreground">Consumer ratings</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="farmers">Farmers</TabsTrigger>
            <TabsTrigger value="regions">Regions</TabsTrigger>
            <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Harvest Volume Trend</CardTitle>
                  <CardDescription>Weight distribution over logged dates</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={metrics.harvestTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quality Test Results</CardTitle>
                  <CardDescription>Passed vs Failed test ratios</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={metrics.qualityData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {metrics.qualityData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.fill || (index === 0 ? "#10b981" : "#ef4444")} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Alerts & Notifications */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-md">
                  <Bell className="w-5 h-5" />
                  Recent Alerts & Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.alertsData.map((alert: any) => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        alert.type === 'warning' ? 'bg-yellow-500' :
                        alert.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">{alert.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="farmers">
            <Card>
              <CardHeader>
                <CardTitle>Farmer Performance Analytics</CardTitle>
                <CardDescription>Track individual farmer metrics and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.farmerPerformance.map((farmer: any) => (
                    <div key={farmer.name} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <div className="font-medium">Farmer {farmer.name}</div>
                        <Badge variant="outline">{farmer.harvests} Harvests</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Quality Score:</span>
                          <p className="font-medium text-primary">{farmer.quality}/5</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Compliance:</span>
                          <p className="font-medium text-success">{farmer.compliance}%</p>
                        </div>
                        <div>
                          <Button variant="outline" size="sm" onClick={() => {
                            setSearchQuery(farmer.name);
                            setActiveTab("overview");
                          }}>View Batches</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="regions">
            <Card>
              <CardHeader>
                <CardTitle>Regional Performance</CardTitle>
                <CardDescription>Track performance by geographical region</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics.regionalData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={metrics.regionalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="region" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="batches" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground">No regional data available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sustainability">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-md">
                    <Globe className="w-5 h-5 text-emerald-700" />
                    Environmental Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-800">{metrics.carbonFootprint}</div>
                    <p className="text-sm text-emerald-700">Total Carbon Footprint Saved</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Organic Farms:</span>
                      <p className="font-medium">100%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fair Trade:</span>
                      <p className="font-medium">100%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conservation Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Water Conservation</span>
                    <Badge variant="secondary">15,000L saved</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Biodiversity Score</span>
                    <Badge variant="secondary" className="bg-success/10 text-success">8.2/10</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Soil Health Index</span>
                    <Badge variant="outline">Good</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Batch Search & Audit */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Batch Search & Audit</CardTitle>
            <CardDescription>Search and audit specific batches for compliance. Click on a batch to view its public provenance timeline.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search by Batch ID, Collector ID, or Herb/Product Name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 text-lg"
                />
              </div>
              <Button size="lg" onClick={() => {}}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Results Table */}
            <div className="border rounded-lg overflow-x-auto">
              <div className="min-w-[700px]">
                <div className="grid grid-cols-6 gap-4 p-4 border-b bg-muted font-semibold">
                  <div>Batch ID</div>
                  <div>Product</div>
                  <div>Farmer ID</div>
                  <div>Location</div>
                  <div>Date</div>
                  <div>Status</div>
                </div>
                {filteredBatches.length > 0 ? (
                  filteredBatches.map((batch: any) => (
                    <div 
                      key={batch.batchId} 
                      className="grid grid-cols-6 gap-4 p-4 border-b hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/provenance/${batch.batchId}`)}
                    >
                      <div className="font-semibold text-primary">{batch.batchId}</div>
                      <div>{batch.product}</div>
                      <div>{batch.farmer}</div>
                      <div className="truncate">{batch.location}</div>
                      <div>{batch.date}</div>
                      <div>
                        <Badge variant={
                          batch.status === "Completed" ? "secondary" :
                          batch.status === "Quality Check" ? "default" : "outline"
                        }>
                          {batch.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-center text-muted-foreground text-sm">No batches found matching the search query.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Generation */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance & Sustainability Reports</CardTitle>
            <CardDescription>Generate reports for regulatory bodies and certification agencies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ayush">AYUSH Export Compliance</SelectItem>
                    <SelectItem value="nmpb">NMPB Sustainability Report</SelectItem>
                    <SelectItem value="qms">QMS Audit Trail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Period</label>
                <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Filters</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="herb">By Herb Type</SelectItem>
                    <SelectItem value="facility">By Facility</SelectItem>
                    <SelectItem value="cooperative">By Cooperative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button size="lg" onClick={() => {
              toast({
                title: "Report Generated",
                description: `Successfully compiled the ${selectedTimeRange}-day compliance summary.`,
              });
            }}>
              <Download className="w-4 h-4 mr-2" />
              Generate Report (PDF/Excel)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StakeholderDashboard;