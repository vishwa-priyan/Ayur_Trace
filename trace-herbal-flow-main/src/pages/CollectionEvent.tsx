import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, MapPin, Camera, RefreshCcw, Leaf, CheckCircle, QrCode } from "lucide-react";
import farmerImage from "@/assets/farmer-collection.jpg";
import QRGenerator from "@/components/QRGenerator";
import MapDisplay from "@/components/MapDisplay";

const CollectionEvent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    herbName: "",
    batchRef: "",
    weight: "",
    unit: "kg",
    harvestDate: new Date().toISOString().split('T')[0],
    visualQuality: "",
    pestDisease: false,
    moistureLevel: "",
    location: { lat: 0, lng: 0, address: "Fetching location..." },
    collectorNotes: ""
  });

  const [locationStatus, setLocationStatus] = useState<"loading" | "success" | "error">("loading");
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [autoBatchId, setAutoBatchId] = useState("");

  React.useEffect(() => {
    // Generate auto batch ID
    const generateBatchId = () => {
      const now = new Date();
      const timestamp = now.getTime().toString().slice(-6);
      return `AYR${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${timestamp}`;
    };
    setAutoBatchId(generateBatchId());

    // Simulate GPS location fetch
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        location: {
          lat: 26.9124,
          lng: 75.7873,
          address: "Jaipur, Rajasthan, India"
        }
      }));
      setLocationStatus("success");
    }, 2000);
  }, []);

  // Mock farmer history data
  const farmerHistory = [
    { date: "2025-01-20", herb: "Tulsi", weight: "15.2 kg", quality: "Excellent", batchId: "AYR202501001" },
    { date: "2025-01-15", herb: "Ashwagandha", weight: "22.5 kg", quality: "Good", batchId: "AYR202501002" },
    { date: "2025-01-10", herb: "Brahmi", weight: "8.7 kg", quality: "Excellent", batchId: "AYR202501003" }
  ];

  // Mock customer feedback
  const customerFeedback = [
    { date: "2025-01-25", product: "Tulsi Capsules", rating: 5, comment: "Excellent quality, very fresh!", customer: "Anonymous" },
    { date: "2025-01-22", product: "Ashwagandha Powder", rating: 4, comment: "Good product, fast delivery", customer: "Verified Buyer" },
    { date: "2025-01-20", product: "Brahmi Extract", rating: 5, comment: "Amazing results, will buy again", customer: "Health Enthusiast" }
  ];

  const ayurvedicHerbs = [
    "Ashwagandha (Withania somnifera)",
    "Tulsi (Ocimum sanctum)",
    "Brahmi (Bacopa monnieri)",
    "Turmeric (Curcuma longa)",
    "Neem (Azadirachta indica)",
    "Amla (Phyllanthus emblica)",
    "Ginger (Zingiber officinale)",
    "Giloy (Tinospora cordifolia)"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.herbName || !formData.weight || !formData.visualQuality) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Use auto-generated batch ID
    const finalBatchId = autoBatchId;

    // Simulate submission
    toast({
      title: "Collection Event Recorded!",
      description: `Batch ${finalBatchId} successfully logged to blockchain`,
    });

    // Navigate back after success
    setTimeout(() => navigate('/'), 2000);
  };

  const handlePhotoUpload = () => {
    // Simulate photo upload
    setPhotoUploaded(true);
    toast({
      title: "Photo Uploaded!",
      description: "Geotagged photo has been attached to this batch",
    });
  };

  const refreshGPS = () => {
    setLocationStatus("loading");
    setTimeout(() => {
      setLocationStatus("success");
    }, 1500);
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
              <div className="p-2 bg-gradient-farmer rounded-lg">
                <Leaf className="w-5 h-5 text-farmer-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">AyurTrace Collector</h1>
                <p className="text-sm text-muted-foreground">Welcome, Farmer ID: F2025001</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-farmer">New Collection Event</CardTitle>
              <CardDescription>
                Record harvest details for blockchain traceability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Collection Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Collection Details</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="herbName">Herb Name *</Label>
                    <Select value={formData.herbName} onValueChange={value => setFormData({...formData, herbName: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Ayurvedic herb" />
                      </SelectTrigger>
                      <SelectContent>
                        {ayurvedicHerbs.map(herb => (
                          <SelectItem key={herb} value={herb}>{herb}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="batchRef">Auto-Generated Batch ID</Label>
                    <Input
                      id="batchRef"
                      value={autoBatchId}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      This ID will be used for blockchain tracking
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Wet Weight *</Label>
                      <Input
                        id="weight"
                        type="number"
                        placeholder="0.00"
                        value={formData.weight}
                        onChange={e => setFormData({...formData, weight: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Select value={formData.unit} onValueChange={value => setFormData({...formData, unit: value})}>
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

                  <div className="space-y-2">
                    <Label htmlFor="harvestDate">Harvest Date</Label>
                    <Input
                      id="harvestDate"
                      type="date"
                      value={formData.harvestDate}
                      onChange={e => setFormData({...formData, harvestDate: e.target.value})}
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Location</h3>
                  
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Current Location (GPS)
                    </Label>
                    <Button variant="ghost" size="sm" onClick={refreshGPS} disabled={locationStatus === "loading"}>
                      <RefreshCcw className={`w-4 h-4 ${locationStatus === "loading" ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                  
                  {locationStatus === "success" ? (
                    <MapDisplay
                      lat={formData.location.lat}
                      lng={formData.location.lng}
                      address={formData.location.address}
                      isInApprovedZone={true}
                    />
                  ) : (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Acquiring GPS location...</p>
                    </div>
                  )}
                </div>
                </div>

                {/* Quality Metrics */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Initial Quality Assessment</h3>
                  
                  <div className="space-y-2">
                    <Label>Visual Quality *</Label>
                    <Select value={formData.visualQuality} onValueChange={value => setFormData({...formData, visualQuality: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select quality level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Moisture Estimation</Label>
                    <Select value={formData.moistureLevel} onValueChange={value => setFormData({...formData, moistureLevel: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select moisture level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="very-dry">Very Dry</SelectItem>
                        <SelectItem value="moderately-dry">Moderately Dry</SelectItem>
                        <SelectItem value="wet">Wet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any observations about the harvest..."
                      value={formData.collectorNotes}
                      onChange={e => setFormData({...formData, collectorNotes: e.target.value})}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  <Button 
                    type="button" 
                    variant={photoUploaded ? "secondary" : "outline"} 
                    className="w-full"
                    onClick={handlePhotoUpload}
                  >
                    <Camera className="w-4 h-4" />
                    {photoUploaded ? "Photo Uploaded ✓" : "Add Photo of Harvest"}
                  </Button>
                  
                  {photoUploaded && (
                    <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                      <p className="text-sm text-success">
                        📸 Geotagged photo captured at: {formData.location.address}
                      </p>
                    </div>
                  )}
                  
                  {autoBatchId && (
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <div className="flex items-center gap-2 mb-3">
                        <QrCode className="w-4 h-4" />
                        <span className="font-medium">Batch QR Code</span>
                      </div>
                      <QRGenerator 
                        batchId={autoBatchId} 
                        className="w-full flex justify-center"
                      />
                    </div>
                  )}
                  
                  <Button type="submit" variant="farmer" size="lg" className="w-full">
                    Submit Collection Event
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Visual Reference */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-0">
                <img 
                  src={farmerImage} 
                  alt="Farmer collecting herbs"
                  className="w-full h-64 object-cover rounded-t-lg"
                />
                <div className="p-4">
                  <h3 className="font-semibold mb-2">Collection Best Practices</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Harvest during optimal times (early morning)</li>
                    <li>• Ensure GPS location is accurate</li>
                    <li>• Document visual quality honestly</li>
                    <li>• Include batch reference for tracking</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Farmer History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Leaf className="w-4 h-4" />
                  My Harvest History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {farmerHistory.map((record, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-sm">{record.herb}</div>
                      <Badge variant="outline" className="text-xs">{record.batchId}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>Date: {record.date}</div>
                      <div>Weight: {record.weight}</div>
                    </div>
                    <div className="text-xs text-success mt-1">Quality: {record.quality}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Customer Feedback */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Customer Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {customerFeedback.map((feedback, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-sm">{feedback.product}</div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs">{'★'.repeat(feedback.rating)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">"{feedback.comment}"</p>
                    <div className="text-xs text-muted-foreground">
                      - {feedback.customer} on {feedback.date}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Offline Capability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  Data will be saved offline and synced when connection is available
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionEvent;