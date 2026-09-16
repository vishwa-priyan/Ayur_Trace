import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, MapPin, Camera, RefreshCcw, Leaf, QrCode, Heart } from "lucide-react";
import farmerImage from "@/assets/farmer-collection.jpg";
import QRGenerator from "@/components/QRGenerator";
import MapDisplay from "@/components/MapDisplay";
import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/lib/api";

const CollectionEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
    collectorNotes: "",
    photoUrl: ""
  });

  const [locationStatus, setLocationStatus] = useState("loading");
  const [isUploading, setIsUploading] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [autoBatchId, setAutoBatchId] = useState("");
  const fileInputRef = React.useRef(null);
  const [farmerHistory, setFarmerHistory] = useState([]);
  const [farmerFeedback, setFarmerFeedback] = useState([]);

  useEffect(() => {
    // Generate auto batch ID
    const generateBatchId = () => {
      const now = new Date();
      const timestamp = now.getTime().toString().slice(-6);
      return `AYR${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${timestamp}`;
    };
    setAutoBatchId(generateBatchId());

    const getGPS = () => {
      setLocationStatus("loading");
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setFormData((prev) => ({
              ...prev,
              location: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                address: `GPS Coordinates: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
              }
            }));
            setLocationStatus("success");
          },
          (error) => {
            console.error("Error getting location", error);
            setLocationStatus("error");
            toast({
              title: "GPS Error",
              description: "Could not fetch your location. Please ensure location services are enabled.",
              variant: "destructive"
            });
          }
        );
      } else {
        setLocationStatus("error");
      }
    };
    
    getGPS();

    // Fetch batches history
    const fetchHistory = async () => {
      const token = localStorage.getItem("ayurtrace_token");
      if (!token) return;
      try {
        const response = await fetch(getApiUrl("/api/batches"), {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setFarmerHistory(data.map((b) => ({
            date: b.harvest_date ? b.harvest_date.split('T')[0] : '',
            herb: b.herb_name.split(' ')[0],
            weight: `${b.weight} ${b.unit}`,
            quality: b.visual_quality,
            batchId: b.batch_id
          })));
        }
      } catch (err) {
        console.error("Error fetching farmer history:", err);
      }
    };

    const fetchFeedback = async () => {
      const token = localStorage.getItem("ayurtrace_token");
      if (!token) return;
      try {
        const response = await fetch(getApiUrl("/api/farmer/feedback"), {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setFarmerFeedback(data);
        }
      } catch (err) {
        console.error("Error fetching farmer feedback:", err);
      }
    };

    fetchHistory();
    fetchFeedback();
  }, []);



  const ayurvedicHerbs = [
  "Ashwagandha (Withania somnifera)",
  "Tulsi (Ocimum sanctum)",
  "Brahmi (Bacopa monnieri)",
  "Turmeric (Curcuma longa)",
  "Neem (Azadirachta indica)",
  "Amla (Phyllanthus emblica)",
  "Ginger (Zingiber officinale)",
  "Giloy (Tinospora cordifolia)"];


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.herbName || !formData.weight || !formData.visualQuality) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields",
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

    // Map moisture text selection to a numeric percentage value; null if not selected
    let numericMoisture = null;
    if (formData.moistureLevel === 'very-dry') numericMoisture = 6.0;
    else if (formData.moistureLevel === 'moderately-dry') numericMoisture = 9.5;
    else if (formData.moistureLevel === 'wet') numericMoisture = 14.5;

    try {
      const response = await fetch(getApiUrl("/api/batches"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          batchId: autoBatchId,
          herbName: formData.herbName,
          weight: parseFloat(formData.weight),
          unit: formData.unit,
          harvestDate: formData.harvestDate,
          visualQuality: formData.visualQuality,
          pestDisease: formData.pestDisease,
          moistureLevel: numericMoisture,
          latitude: formData.location.lat,
          longitude: formData.location.lng,
          address: formData.location.address,
          collectorNotes: formData.collectorNotes,
          photoUrl: formData.photoUrl
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to record collection event.");
      }

      toast({
        title: "Collection Event Recorded!",
        description: `Batch ${autoBatchId} successfully logged to PostgreSQL`
      });

      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      toast({
        title: "Submission Failed",
        description: err.message || "Could not connect to the backend server.",
        variant: "destructive"
      });
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("ayurtrace_token");
    if (!token) return;

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const response = await fetch(getApiUrl("/api/upload"), {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: uploadData
      });

      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      
      setFormData(prev => ({ ...prev, photoUrl: data.url }));
      setPhotoUploaded(true);
      toast({
        title: "Photo Uploaded!",
        description: "Photo of harvest has been attached to this batch"
      });
    } catch (err) {
      toast({
        title: "Upload Error",
        description: "Failed to upload photo",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const refreshGPS = () => {
    setLocationStatus("loading");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              address: `GPS Coordinates: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
            }
          }));
          setLocationStatus("success");
        },
        (error) => {
          setLocationStatus("error");
          toast({
            title: "GPS Error",
            description: "Could not fetch your location.",
            variant: "destructive"
          });
        }
      );
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
              <div className="p-2 bg-gradient-farmer rounded-lg">
                <Leaf className="w-5 h-5 text-farmer-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">AyurTrace Collector</h1>
                <p className="text-sm text-muted-foreground">Welcome, Farmer ID: {user?.id || "F2025001"}</p>
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
                Record harvest details for secure ledger traceability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Collection Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Collection Details</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="herbName">Herb Name *</Label>
                    <Select value={formData.herbName} onValueChange={(value) => setFormData({ ...formData, herbName: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Ayurvedic herb" />
                      </SelectTrigger>
                      <SelectContent>
                        {ayurvedicHerbs.map((herb) =>
                        <SelectItem key={herb} value={herb}>{herb}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="batchRef">Auto-Generated Batch ID</Label>
                    <Input
                      id="batchRef"
                      value={autoBatchId}
                      disabled
                      className="bg-muted" />
                    
                    <p className="text-xs text-muted-foreground">
                      This ID will be used for database tracking
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
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })} />
                      
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
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
                      onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })} />
                    
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
                      <Button type="button" variant="ghost" size="sm" onClick={refreshGPS} disabled={locationStatus === "loading"}>
                        <RefreshCcw className={`w-4 h-4 ${locationStatus === "loading" ? "animate-spin" : ""}`} />
                      </Button>
                    </div>
                    
                    {locationStatus === "success" ?
                    <MapDisplay
                      lat={formData.location.lat}
                      lng={formData.location.lng}
                      address={formData.location.address}
                      isInApprovedZone={true} /> :


                    <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Acquiring GPS location...</p>
                      </div>
                    }
                  </div>
                </div>

                {/* Quality Metrics */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Initial Quality Assessment</h3>
                  
                  <div className="space-y-2">
                    <Label>Visual Quality *</Label>
                    <Select value={formData.visualQuality} onValueChange={(value) => setFormData({ ...formData, visualQuality: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select quality level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Excellent">Excellent</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Fair">Fair</SelectItem>
                        <SelectItem value="Poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Moisture Estimation</Label>
                    <Select value={formData.moistureLevel} onValueChange={(value) => setFormData({ ...formData, moistureLevel: value })}>
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
                      onChange={(e) => setFormData({ ...formData, collectorNotes: e.target.value })} />
                    
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                  />
                  <Button
                    type="button"
                    variant={photoUploaded ? "secondary" : "outline"}
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}>
                    
                    <Camera className="w-4 h-4 mr-2" />
                    {isUploading ? "Uploading..." : photoUploaded ? "Photo Uploaded ✓" : "Add Photo of Harvest"}
                  </Button>
                  
                  {photoUploaded &&
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                      <p className="text-sm text-success">
                        📸 Geotagged photo captured at: {formData.location.address}
                      </p>
                    </div>
                  }
                  
                  {autoBatchId &&
                  <div className="border rounded-lg p-4 bg-muted/50">
                      <div className="flex items-center gap-2 mb-3">
                        <QrCode className="w-4 h-4" />
                        <span className="font-medium">Batch QR Code</span>
                      </div>
                      <QRGenerator
                      batchId={autoBatchId}
                      className="w-full flex justify-center" />
                    
                    </div>
                  }
                  
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
                  className="w-full h-64 object-cover rounded-t-lg" />
                
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
                {farmerHistory.map((record, index) =>
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
                )}
              </CardContent>
            </Card>

            {/* Customer Feedback */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Heart className="w-4 h-4 text-emerald-600" />
                  Customer Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {farmerFeedback.length > 0 ? (
                  farmerFeedback.slice(0, 5).map((feedback) => (
                    <div key={feedback.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-xs">
                          {feedback.herb_name ? feedback.herb_name.split(' ')[0] : 'Herb'}
                        </div>
                        <div className="flex items-center gap-0.5">
                          <span className="text-xs text-yellow-500">{'★'.repeat(feedback.rating)}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">"{feedback.comment}"</p>
                      <div className="text-[10px] text-muted-foreground flex justify-between">
                        <span>Batch: {feedback.batch_id}</span>
                        <span>{new Date(feedback.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No customer feedback received yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>);

};

export default CollectionEvent;