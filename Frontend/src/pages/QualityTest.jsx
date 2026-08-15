import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, FlaskConical, Search, QrCode, Upload, CheckCircle, AlertTriangle } from "lucide-react";
import labImage from "@/assets/lab-testing.jpg";
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

const QualityTest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("quality-test");
  const [batchId, setBatchId] = useState("");
  const [batchFound, setBatchFound] = useState(false);
  const [certificateUploaded, setCertificateUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const fileInputRef = React.useRef(null);
  const [batchHistory, setBatchHistory] = useState([]);
  const [batchData, setBatchData] = useState({
    id: "",
    herbName: "",
    farmerName: "",
    harvestDate: "",
    weight: "",
    location: "",
    farmer: {
      name: "",
      id: "",
      totalHarvests: 0,
      avgQuality: null
    }
  });

  // Lab statistics derived from real batch data when a batch is searched
  const [labStats, setLabStats] = useState({ testsToday: 0, passRate: 0, pending: 0 });

  const [qualityTestData, setQualityTestData] = useState({
    testType: "",
    labName: "AyurLab Certified Testing",
    testDate: new Date().toISOString().split('T')[0],
    technician: "",
    moistureContent: "",
    pesticideResult: "not-detected",
    pesticideLevel: "",
    dnaResult: "",
    overallCompliance: "",
    notes: "",
    certificateUrl: ""
  });

  const [processingData, setProcessingData] = useState({
    stepType: "",
    facilityName: "AyurProcess Center",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    processedBy: "",
    method: "",
    temperature: "",
    duration: "",
    outputWeight: "",
    outputUnit: "kg",
    storageLocation: ""
  });

  // Automatically fill technician and processor name from user profile
  useEffect(() => {
    if (user) {
      setQualityTestData((prev) => ({ ...prev, technician: user.name }));
      setProcessingData((prev) => ({ ...prev, processedBy: user.name }));
    }
  }, [user]);

  const searchBatch = async () => {
    if (!batchId.trim()) {
      toast({
        title: "Missing Batch ID",
        description: "Please enter a batch ID to search.",
        variant: "destructive"
      });
      return;
    }

    const token = localStorage.getItem("ayurtrace_token");
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in first",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`/api/batches/${batchId.trim()}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Batch ${batchId} not found.`);
      }

      const data = await response.json();

      setBatchData({
        id: data.batch_id,
        herbName: data.herb_name,
        farmerName: `${data.farmer_name} (${data.farmer_id})`,
        harvestDate: data.harvest_date ? data.harvest_date.split('T')[0] : '',
        weight: `${data.weight} ${data.unit}`,
        location: data.address || `GPS: ${data.latitude}, ${data.longitude}`,
        farmer: {
          name: data.farmer_name,
          id: data.farmer_id,
          totalHarvests: 0,   // will be computed from provenance below
          avgQuality: null
        }
      });

      // Fetch provenance timeline for this batch to populate history and lab stats
      const provRes = await fetch(`/api/provenance/${batchId.trim()}`);
      if (provRes.ok) {
        const provData = await provRes.json();
        setBatchHistory(provData.timeline.map((step, idx) => ({
          id: idx + 1,
          step: step.title,
          date: step.date,
          location: step.location || step.lab || step.facility || step.from || 'Processing Facility',
          status: 'Completed',
          details: step.collector || step.compliance || step.details?.outputWeight || 'Secure verified step'
        })));

        // Compute lab stats from the real timeline
        const testSteps = provData.timeline.filter(s => s.type === 'testing');
        const passedTests = testSteps.filter(s => s.compliance?.toLowerCase().includes('passed'));
        setBatchData(prev => ({
          ...prev,
          farmer: {
            ...prev.farmer,
            totalHarvests: provData.timeline.filter(s => s.type === 'collection').length
          }
        }));
        setLabStats({
          testsToday: testSteps.length,
          passRate: testSteps.length > 0 ? Math.round((passedTests.length / testSteps.length) * 100) : 0,
          pending: testSteps.length === 0 ? 1 : 0
        });
      }

      setBatchFound(true);
      toast({
        title: "Batch Found",
        description: `Retrieved details for batch ${batchId}`
      });
    } catch (err) {
      setBatchFound(false);
      setBatchHistory([]);
      toast({
        title: "Batch Not Found",
        description: err.message || `No batch found with ID ${batchId}`,
        variant: "destructive"
      });
    }
  };

  const handleCertificateUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("ayurtrace_token");
    if (!token) return;

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: uploadData
      });

      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      
      setQualityTestData(prev => ({ ...prev, certificateUrl: data.url }));
      setCertificateUploaded(true);
      toast({
        title: "Certificate Uploaded!",
        description: "Lab certificate has been successfully attached"
      });
    } catch (err) {
      toast({
        title: "Upload Error",
        description: "Failed to upload certificate",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // QR Scanner: use a ref to hold the pending scanned batch ID so we can
  // trigger searchBatch directly without DOM hacks.
  const pendingScannedId = React.useRef(null);

  useEffect(() => {
    let scanner = null;
    if (showScanner) {
      // Small timeout to allow the Dialog DOM to mount before injecting the scanner
      const timer = setTimeout(() => {
        scanner = new Html5QrcodeScanner("reader", {
          qrbox: { width: 250, height: 250 },
          fps: 10,
        });

        scanner.render((result) => {
          try { if (scanner) scanner.clear(); } catch (e) {}
          setShowScanner(false);
          const derived = extractBatchId(result);
          setBatchId(derived);
          pendingScannedId.current = derived;
        }, () => {
          // Ignore partial-scan errors — they are normal
        });

      }, 150);

      return () => {
        clearTimeout(timer);
        try { if (scanner) scanner.clear(); } catch (e) {}
      };
    }
  }, [showScanner]);

  // When a QR code is scanned, trigger the search automatically
  useEffect(() => {
    if (!showScanner && pendingScannedId.current) {
      const scannedId = pendingScannedId.current;
      pendingScannedId.current = null;
      // Small delay to let the Dialog close and state settle
      const t = setTimeout(() => {
        setBatchId(scannedId);
        searchBatch();
      }, 100);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showScanner]);

  const submitQualityTest = async (e) => {
    e.preventDefault();

    if (!batchFound || !qualityTestData.testType || !qualityTestData.technician) {
      toast({
        title: "Incomplete Data",
        description: "Please search for a batch and fill all required fields",
        variant: "destructive"
      });
      return;
    }

    const token = localStorage.getItem("ayurtrace_token");
    if (!token) return;

    try {
      const response = await fetch(`/api/batches/${batchData.id}/quality-test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          testType: qualityTestData.testType,
          labName: qualityTestData.labName,
          testDate: qualityTestData.testDate,
          technician: qualityTestData.technician,
          moistureContent: qualityTestData.moistureContent || null,
          pesticideResult: qualityTestData.pesticideResult,
          pesticideLevel: qualityTestData.pesticideLevel || null,
          dnaResult: qualityTestData.dnaResult || null,
          overallCompliance: qualityTestData.overallCompliance === "pass" ? "Passed" : qualityTestData.overallCompliance === "fail" ? "Failed" : "Conditional",
          notes: qualityTestData.notes,
          certificateUrl: qualityTestData.certificateUrl
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to save quality test results.");
      }

      toast({
        title: "Quality Test Recorded!",
        description: `Test results for batch ${batchData.id} added to PostgreSQL`
      });

      // Refresh history
      searchBatch();
    } catch (err) {
      toast({
        title: "Submission Failed",
        description: err.message || "Error saving test to PostgreSQL database.",
        variant: "destructive"
      });
    }
  };

  const submitProcessingStep = async (e) => {
    e.preventDefault();

    if (!batchFound || !processingData.stepType || !processingData.processedBy) {
      toast({
        title: "Incomplete Data",
        description: "Please search for a batch and fill all required fields",
        variant: "destructive"
      });
      return;
    }

    const token = localStorage.getItem("ayurtrace_token");
    if (!token) return;

    try {
      const response = await fetch(`/api/batches/${batchData.id}/processing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          stepType: processingData.stepType,
          facilityName: processingData.facilityName,
          startDate: processingData.startDate,
          endDate: processingData.endDate,
          processedBy: processingData.processedBy,
          method: processingData.method,
          temperature: processingData.temperature,
          duration: processingData.duration,
          outputWeight: processingData.outputWeight,
          outputUnit: processingData.outputUnit,
          storageLocation: processingData.storageLocation
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to save processing step.");
      }

      toast({
        title: "Processing Step Recorded!",
        description: `${processingData.stepType} step for batch ${batchData.id} added to PostgreSQL`
      });

      // Refresh history
      searchBatch();
    } catch (err) {
      toast({
        title: "Submission Failed",
        description: err.message || "Error saving step to PostgreSQL database.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-earth">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-lab rounded-lg">
                <FlaskConical className="w-5 h-5 text-lab-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">AyurTrace Lab & Processor</h1>
                <p className="text-sm text-muted-foreground">Welcome, Logged in: {user?.name || "Lab Tech"} ({user?.id || "LT2025001"})</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Batch Search */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lab">Batch Identification</CardTitle>
                <CardDescription>
                  Search or scan batch ID to retrieve harvest details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter Batch ID (e.g., AYR202501002)"
                      value={batchId}
                      onChange={(e) => setBatchId(e.target.value)}
                      className="h-14 text-lg px-4" />
                    
                  </div>
                  <div className="flex gap-2">
                    <Button id="search-btn" variant="outline" onClick={searchBatch} size="lg" className="h-14 px-6">
                      <Search className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Search</span>
                    </Button>
                    <Button variant="outline" size="lg" className="h-14 px-6" onClick={() => setShowScanner(true)}>
                      <QrCode className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Scan QR</span>
                    </Button>
                  </div>
                </div>

                <Dialog open={showScanner} onOpenChange={setShowScanner}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Scan Batch QR Code</DialogTitle>
                    </DialogHeader>
                    <div id="reader" className="w-full min-h-[300px]"></div>
                  </DialogContent>
                </Dialog>

                {batchFound &&
                <div className="mt-6 p-6 bg-success/10 border border-success/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span className="font-semibold text-success text-lg">Batch Found</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div className="space-y-3">
                        <div>
                          <span className="text-muted-foreground text-sm">Herb:</span>
                          <p className="font-medium text-lg">{batchData.herbName}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-sm">Farmer:</span>
                          <p className="font-medium">{batchData.farmerName}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="text-muted-foreground text-sm">Harvest Date:</span>
                          <p className="font-medium">{batchData.harvestDate}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-sm">Weight:</span>
                          <p className="font-medium">{batchData.weight}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <span className="text-muted-foreground text-sm">Location:</span>
                      <p className="font-medium">{batchData.location}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {batchData.farmer.totalHarvests > 0 && <Badge variant="outline">Collection Events: {batchData.farmer.totalHarvests}</Badge>}
                      {batchData.farmer.avgQuality !== null && <Badge variant="outline">Avg Quality: {batchData.farmer.avgQuality}/5</Badge>}
                    </div>
                  </div>
                }
              </CardContent>
            </Card>

            {/* Tabs for Quality Test / Processing */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="quality-test">Quality Test</TabsTrigger>
                <TabsTrigger value="processing">Processing Step</TabsTrigger>
              </TabsList>

              {/* Quality Test Tab */}
              <TabsContent value="quality-test">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lab">Add Quality Test Results</CardTitle>
                    <CardDescription>
                      Record laboratory test results and compliance status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={submitQualityTest} className="space-y-6">
                      {/* Test Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Test Type *</Label>
                          <Select value={qualityTestData.testType} onValueChange={(value) => setQualityTestData({ ...qualityTestData, testType: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select test" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="moisture">Moisture Content</SelectItem>
                              <SelectItem value="pesticide">Pesticide Residue</SelectItem>
                              <SelectItem value="dna">DNA Barcoding</SelectItem>
                              <SelectItem value="heavy-metals">Heavy Metals</SelectItem>
                              <SelectItem value="microbial">Microbial Count</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Test Date</Label>
                          <Input
                            type="date"
                            value={qualityTestData.testDate}
                            onChange={(e) => setQualityTestData({ ...qualityTestData, testDate: e.target.value })} />
                          
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Laboratory</Label>
                          <Input
                            value={qualityTestData.labName}
                            onChange={(e) => setQualityTestData({ ...qualityTestData, labName: e.target.value })} />
                          
                        </div>

                        <div className="space-y-2">
                          <Label>Technician *</Label>
                          <Input
                            placeholder="Enter technician name"
                            value={qualityTestData.technician}
                            onChange={(e) => setQualityTestData({ ...qualityTestData, technician: e.target.value })} />
                          
                        </div>
                      </div>

                      {/* Test Results */}
                      {qualityTestData.testType === "moisture" &&
                      <div className="space-y-2">
                          <Label>Moisture Content (%)</Label>
                          <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 8.5"
                          value={qualityTestData.moistureContent}
                          onChange={(e) => setQualityTestData({ ...qualityTestData, moistureContent: e.target.value })} />
                        
                          {parseFloat(qualityTestData.moistureContent) > 12 &&
                        <div className="flex items-center gap-2 text-warning">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="text-sm">Moisture content exceeds 12% threshold</span>
                            </div>
                        }
                        </div>
                      }

                      {qualityTestData.testType === "pesticide" &&
                      <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Pesticide Detection Result</Label>
                            <Select value={qualityTestData.pesticideResult} onValueChange={(value) => setQualityTestData({ ...qualityTestData, pesticideResult: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="not-detected">Not Detected</SelectItem>
                                <SelectItem value="detected">Detected</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {qualityTestData.pesticideResult === "detected" &&
                        <div className="space-y-2">
                              <Label>Level (ppm)</Label>
                              <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={qualityTestData.pesticideLevel}
                            onChange={(e) => setQualityTestData({ ...qualityTestData, pesticideLevel: e.target.value })} />
                          
                            </div>
                        }
                        </div>
                      }

                      {qualityTestData.testType === "dna" &&
                      <div className="space-y-2">
                          <Label>DNA Barcoding Result</Label>
                          <Select value={qualityTestData.dnaResult} onValueChange={(value) => setQualityTestData({ ...qualityTestData, dnaResult: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select result" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="authentic">Authentic Species</SelectItem>
                              <SelectItem value="adulteration">Potential Adulteration</SelectItem>
                              <SelectItem value="unidentified">Unidentified</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      }

                      {/* Overall Compliance */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Overall Compliance Status</Label>
                          <Select value={qualityTestData.overallCompliance} onValueChange={(value) => setQualityTestData({ ...qualityTestData, overallCompliance: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select compliance" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pass">Pass</SelectItem>
                              <SelectItem value="conditional">Conditional Pass</SelectItem>
                              <SelectItem value="fail">Fail</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Additional Notes</Label>
                          <Textarea
                            placeholder="Any additional observations or comments..."
                            value={qualityTestData.notes}
                            onChange={(e) => setQualityTestData({ ...qualityTestData, notes: e.target.value })} />
                          
                        </div>

                        <input
                          type="file"
                          accept=".pdf,image/*"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={handleCertificateUpload}
                        />
                        <Button
                          type="button"
                          variant={certificateUploaded ? "secondary" : "outline"}
                          className="w-full"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}>
                          
                          <Upload className="w-4 h-4 mr-2" />
                          {isUploading ? "Uploading..." : certificateUploaded ? "Certificate Uploaded ✓" : "Attach Lab Certificate (PDF/Image)"}
                        </Button>
                        
                        {certificateUploaded &&
                        <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                            <p className="text-sm text-success">
                              📄 Certificate successfully attached and verified
                            </p>
                          </div>
                        }

                        <Button type="submit" variant="lab" size="lg" className="w-full">
                          Submit Quality Test Results
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Processing Step Tab */}
              <TabsContent value="processing">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lab">Add Processing Step</CardTitle>
                    <CardDescription>
                      Record physical processing steps and transformations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={submitProcessingStep} className="space-y-6">
                      {/* Processing Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Processing Step *</Label>
                          <Select value={processingData.stepType} onValueChange={(value) => setProcessingData({ ...processingData, stepType: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select step" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="washing">Washing/Cleaning</SelectItem>
                              <SelectItem value="drying">Drying</SelectItem>
                              <SelectItem value="grinding">Grinding</SelectItem>
                              <SelectItem value="sorting">Sorting</SelectItem>
                              <SelectItem value="storage">Storage</SelectItem>
                              <SelectItem value="packaging">Packaging</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Processed By *</Label>
                          <Input
                            placeholder="Enter processor name"
                            value={processingData.processedBy}
                            onChange={(e) => setProcessingData({ ...processingData, processedBy: e.target.value })} />
                          
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            value={processingData.startDate}
                            onChange={(e) => setProcessingData({ ...processingData, startDate: e.target.value })} />
                          
                        </div>

                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input
                            type="date"
                            value={processingData.endDate}
                            onChange={(e) => setProcessingData({ ...processingData, endDate: e.target.value })} />
                          
                        </div>
                      </div>

                      {/* Dynamic Parameters */}
                      {processingData.stepType === "drying" &&
                      <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Method</Label>
                            <Select value={processingData.method} onValueChange={(value) => setProcessingData({ ...processingData, method: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sun-dry">Sun Dry</SelectItem>
                                <SelectItem value="mechanical">Mechanical Dryer</SelectItem>
                                <SelectItem value="shade-dry">Shade Dry</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Temperature (°C)</Label>
                            <Input
                            type="number"
                            placeholder="e.g., 60"
                            value={processingData.temperature}
                            onChange={(e) => setProcessingData({ ...processingData, temperature: e.target.value })} />
                          
                          </div>

                          <div className="space-y-2">
                            <Label>Duration (hours)</Label>
                            <Input
                            type="number"
                            placeholder="e.g., 24"
                            value={processingData.duration}
                            onChange={(e) => setProcessingData({ ...processingData, duration: e.target.value })} />
                          
                          </div>
                        </div>
                      }

                      {processingData.stepType === "storage" &&
                      <div className="space-y-2">
                          <Label>Storage Location</Label>
                          <Input
                          placeholder="e.g., Warehouse-A, Section-3"
                          value={processingData.storageLocation}
                          onChange={(e) => setProcessingData({ ...processingData, storageLocation: e.target.value })} />
                        
                        </div>
                      }

                      {/* Output */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Output Weight</Label>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="0.0"
                            value={processingData.outputWeight}
                            onChange={(e) => setProcessingData({ ...processingData, outputWeight: e.target.value })} />
                          
                        </div>

                        <div className="space-y-2">
                          <Label>Unit</Label>
                          <Select value={processingData.outputUnit} onValueChange={(value) => setProcessingData({ ...processingData, outputUnit: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kg">kg</SelectItem>
                              <SelectItem value="g">g</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button type="submit" variant="lab" size="lg" className="w-full">
                        Submit Processing Step
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-0">
                <img
                  src={labImage}
                  alt="Lab testing equipment"
                  className="w-full h-48 object-cover rounded-t-lg" />
                
                <div className="p-4">
                  <h3 className="font-semibold mb-2">Testing Standards</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Follow ISO 17025 procedures</li>
                    <li>• Moisture content: &lt;12%</li>
                    <li>• Pesticide residues: &lt;0.01 ppm</li>
                    <li>• DNA authentication required</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Batch History</CardTitle>
                <CardDescription>Complete audit trail for this batch</CardDescription>
              </CardHeader>
              <CardContent>
                {batchHistory.length > 0 ?
                <div className="space-y-3 font-sans">
                    {batchHistory.map((entry) =>
                  <div key={entry.id} className="p-3 bg-muted/50 rounded-lg">
                        <div className="font-medium text-sm">{entry.step}</div>
                        <div className="text-xs text-muted-foreground mt-1">{entry.date}</div>
                        <div className="text-xs text-muted-foreground">{entry.location}</div>
                        <Badge variant="outline" className="text-xs mt-2">{entry.status}</Badge>
                      </div>
                  )}
                  </div> :

                <p className="text-sm text-muted-foreground">
                    Search for a batch to view its history
                  </p>
                }
              </CardContent>
            </Card>

            {/* Lab Statistics — computed from the searched batch's test history */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Lab Statistics (This Batch)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tests on Batch</span>
                  <Badge variant="secondary">{labStats.testsToday}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pass Rate</span>
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    {labStats.testsToday > 0 ? `${labStats.passRate}%` : 'N/A'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pending Tests</span>
                  <Badge variant="outline">{labStats.pending}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>);

};

export default QualityTest;