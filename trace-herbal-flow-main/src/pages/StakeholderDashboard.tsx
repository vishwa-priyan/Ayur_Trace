import React, { useState } from "react";
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
  Target, Globe, Activity, Bell
} from "lucide-react";

const StakeholderDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTimeRange, setSelectedTimeRange] = useState("30");
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data
  const kpiData = {
    totalHarvested: "2,450 kg",
    pendingQuality: 12,
    complianceRate: 98,
    consumerScans: 1847,
    activeFarmers: 45,
    totalBatches: 156,
    avgQualityScore: 4.3,
    carbonFootprint: "2.1 tons CO₂"
  };

  const harvestTrend = [
    { name: 'Week 1', value: 400 },
    { name: 'Week 2', value: 600 },
    { name: 'Week 3', value: 800 },
    { name: 'Week 4', value: 650 },
  ];

  const qualityData = [
    { name: 'Passed', value: 95, fill: '#10b981' },
    { name: 'Moisture Failed', value: 3, fill: '#f59e0b' },
    { name: 'Pesticide Failed', value: 2, fill: '#ef4444' },
  ];

  const recentBatches = [
    { batchId: "TXN0045", product: "Ashwagandha", farmer: "F2025001", date: "2025-01-27", status: "In Processing", location: "Jaipur" },
    { batchId: "TXN0044", product: "Tulsi", farmer: "F2025002", date: "2025-01-26", status: "Quality Check", location: "Udaipur" },
    { batchId: "TXN0043", product: "Brahmi", farmer: "F2025003", date: "2025-01-25", status: "Completed", location: "Jodhpur" },
  ];

  const farmerPerformance = [
    { name: 'F2025001', harvests: 25, quality: 4.8, compliance: 100 },
    { name: 'F2025002', harvests: 18, quality: 4.2, compliance: 95 },
    { name: 'F2025003', harvests: 22, quality: 4.5, compliance: 98 },
    { name: 'F2025004', harvests: 15, quality: 4.1, compliance: 92 },
  ];

  const regionalData = [
    { region: 'Rajasthan', batches: 65, quality: 4.3 },
    { region: 'Gujarat', batches: 42, quality: 4.1 },
    { region: 'Maharashtra', batches: 28, quality: 4.5 },
    { region: 'Karnataka', batches: 21, quality: 4.2 },
  ];

  const alertsData = [
    { id: 1, type: "warning", message: "Batch TXN0040 moisture level exceeds threshold", time: "2 hours ago" },
    { id: 2, type: "info", message: "New farmer F2025010 registered in system", time: "4 hours ago" },
    { id: 3, type: "success", message: "Quality certification received for 15 batches", time: "1 day ago" },
  ];

  return (
    <div className="min-h-screen bg-gradient-earth">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">AyurTrace Supply Chain Dashboard</h1>
              <p className="text-muted-foreground">Real-time blockchain traceability insights</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button>
                <AlertCircle className="w-4 h-4 mr-2" />
                Run Audit
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Harvested</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiData.totalHarvested}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Farmers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiData.activeFarmers}</div>
              <p className="text-xs text-muted-foreground">+3 new this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{kpiData.complianceRate}%</div>
              <p className="text-xs text-muted-foreground">Last 90 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Quality Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{kpiData.avgQualityScore}/5</div>
              <p className="text-xs text-muted-foreground">Across all batches</p>
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
                  <CardDescription>Weekly harvest volumes over the last month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={harvestTrend}>
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
                  <CardDescription>Distribution of quality test outcomes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={qualityData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {qualityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
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
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Recent Alerts & Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alertsData.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        alert.type === 'warning' ? 'bg-yellow-500' :
                        alert.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
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
                  {farmerPerformance.map((farmer) => (
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
                          <Button variant="outline" size="sm">View Details</Button>
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
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={regionalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="batches" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sustainability">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Environmental Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">{kpiData.carbonFootprint}</div>
                    <p className="text-sm text-green-600">Total Carbon Footprint Saved</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Organic Farms:</span>
                      <p className="font-medium">42/45 (93%)</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fair Trade:</span>
                      <p className="font-medium">38/45 (84%)</p>
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
            <CardDescription>Search and audit specific batches for compliance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search by Batch ID, Collector ID, or Product Name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 text-lg"
                />
              </div>
              <Button size="lg">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Results Table */}
            <div className="border rounded-lg">
                <div className="grid grid-cols-6 gap-4 p-4 border-b bg-muted font-medium">
                  <div>Batch ID</div>
                  <div>Product</div>
                  <div>Farmer ID</div>
                  <div>Location</div>
                  <div>Date</div>
                  <div>Status</div>
                </div>
                {recentBatches.map((batch) => (
                  <div key={batch.batchId} className="grid grid-cols-6 gap-4 p-4 border-b hover:bg-muted/50">
                    <div className="font-medium">{batch.batchId}</div>
                    <div>{batch.product}</div>
                    <div>{batch.farmer}</div>
                    <div>{batch.location}</div>
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
                ))}
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
            <Button size="lg">
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