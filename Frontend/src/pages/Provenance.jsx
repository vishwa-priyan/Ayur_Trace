import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, MapPin, FlaskConical, Factory, Package, User, Calendar, Leaf, Send, Camera, Heart, ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import MapDisplay from "@/components/MapDisplay";
import fallbackHerbPhoto from "@/assets/herb_photo.jpeg";
import { getApiUrl, getAssetUrl } from "@/lib/api";

const Provenance = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [provenanceData, setProvenanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);

  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    comment: "",
    category: ""
  });

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch(getApiUrl(`/api/provenance/${batchId}/feedback`));
      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data);
      }
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
    }
  };

  useEffect(() => {
    const fetchProvenance = async () => {
      try {
        const response = await fetch(getApiUrl(`/api/provenance/${batchId}`));
        if (!response.ok) {
          throw new Error("Failed to load provenance timeline for batch " + batchId);
        }
        const data = await response.json();
        setProvenanceData(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Error loading provenance timeline.");
      } finally {
        setLoading(false);
      }
    };
    fetchProvenance();
    fetchFeedbacks();
  }, [batchId]);

  // Derive farmer info from the first collection step in the timeline
  const collectionStep = provenanceData?.timeline?.find(s => s.type === 'collection');
  const farmerName = collectionStep?.farmerName || 'Farmer';
  const farmerId = collectionStep?.farmerId || '';

  const handleFeedback = async () => {
    if (!feedbackData.rating || !feedbackData.comment) {
      toast({
        title: "Incomplete Feedback",
        description: "Please provide rating and comment",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/api/provenance/${batchId}/feedback`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(feedbackData)
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      toast({
        title: "Thank You!",
        description: "Your feedback has been sent to the farmer"
      });

      // Reset form and refetch feedbacks
      setFeedbackData({ rating: 0, comment: "", category: "" });
      fetchFeedbacks();
    } catch (err) {
      toast({
        title: "Submission Failed",
        description: err.message || "Could not save your feedback.",
        variant: "destructive"
      });
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'collection':return MapPin;
      case 'handover':return Package;
      case 'testing':return FlaskConical;
      case 'processing':return Factory;
      case 'packaging':return Package;
      default:return CheckCircle;
    }
  };

  const StatusIcon = ({ status }) =>
  status === "verified" ?
  <div className="flex items-center justify-center gap-2 text-success">
        <CheckCircle className="w-5 h-5 text-emerald-600" />
        <span className="font-semibold text-emerald-600 text-lg">Authenticity Verified</span>
      </div> :

  <div className="flex items-center justify-center gap-2 text-destructive">
        <CheckCircle className="w-5 h-5" />
        <span className="font-semibold text-lg">Verification Failed</span>
      </div>;



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-earth">
        <div className="text-center">
          <p className="text-lg text-muted-foreground animate-pulse">Loading batch audit trail...</p>
        </div>
      </div>);

  }

  if (error || !provenanceData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-earth">
        <Card className="w-full max-w-md p-6 text-center">
          <CardTitle className="text-destructive mb-4">Batch Not Found</CardTitle>
          <p className="text-muted-foreground mb-6">
            The batch ID "{batchId}" could not be verified on our PostgreSQL ledger.
          </p>
          <Button onClick={() => navigate('/')} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Card>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gradient-earth">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        {/* Header */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <StatusIcon status={provenanceData.status} />
            <CardTitle className="text-3xl mt-4 text-emerald-800">{provenanceData.productName}</CardTitle>
            <p className="text-muted-foreground text-sm font-mono mt-1">Batch ID: {provenanceData.batchId}</p>
          </CardHeader>
          <CardContent>
            <div className="text-center max-w-xl mx-auto">
              <p className="text-md mb-4 text-muted-foreground">
                Sourced directly from certified organic farms in Rajasthan, collected by local collectives.
              </p>
              <Badge variant="secondary" className="bg-success/10 text-success">
                <Leaf className="w-4 h-4 mr-1 text-emerald-600" />
                Sustainably Sourced
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Provenance Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Product Journey</CardTitle>
            <p className="text-muted-foreground">Complete database-verified audit trail</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {provenanceData.timeline.map((step, index) => {
                const Icon = getIcon(step.type);
                return (
                  <div key={step.id} className="relative">
                    {/* Timeline line */}
                    {index < provenanceData.timeline.length - 1 &&
                    <div className="absolute left-6 top-12 w-0.5 h-16 bg-border"></div>
                    }
                    
                    <div className="flex gap-4">
                      <div className="p-3 bg-primary/10 rounded-full h-fit">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{step.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {step.date}
                          </div>
                        </div>
                        
                        {step.type === "collection" &&
                        <div className="space-y-4">
                            <div className="space-y-2">
                              <p className="text-sm">📍 {step.location}</p>
                              <p className="text-sm font-medium">👨‍🌾 {step.collector}</p>
                              <div className="flex gap-4 text-sm text-muted-foreground">
                                <span>Weight: {step.details?.weight}</span>
                                <span>Quality: {step.details?.quality}</span>
                                {step.details?.moistureLevel &&
                              <span>Moisture: {step.details.moistureLevel}</span>
                              }
                              </div>
                              {step.details?.collectorNotes &&
                            <p className="text-xs italic text-muted-foreground">Notes: "{step.details.collectorNotes}"</p>
                            }
                            </div>
                            
                            {/* Show the uploaded batch photo if present, else fall back to static asset */}
                            {(step.details?.photoUrl || fallbackHerbPhoto) &&
                          <div className="space-y-2 max-w-md">
                                <h4 className="text-sm font-medium flex items-center gap-2">
                                  <Camera className="w-4 h-4" />
                                  Geotagged Collection Photo
                                </h4>
                                <img
                              src={step.details?.photoUrl ? getAssetUrl(step.details.photoUrl) : fallbackHerbPhoto}
                              alt="Collection site"
                              className="w-full h-48 object-cover rounded-lg border" />
                            
                              </div>
                          }
                            
                            {step.details?.coords &&
                          <div className="space-y-2">
                                <h4 className="text-sm font-medium flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  Collection Location
                                </h4>
                                <MapDisplay
                              lat={step.details.coords.lat}
                              lng={step.details.coords.lng}
                              address={step.location}
                              isInApprovedZone={true} />
                            
                              </div>
                          }
                          </div>
                        }
                        
                        {step.type === "handover" &&
                        <div className="space-y-1 text-sm text-muted-foreground">
                            <p>From: <span className="font-semibold text-foreground">{step.from}</span></p>
                            <p>To: <span className="font-semibold text-foreground">{step.to}</span></p>
                          </div>
                        }
                        
                        {step.type === "testing" &&
                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-foreground">{step.lab}</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                              <div>Moisture: {step.results?.moisture}</div>
                              <div>Pesticide: {step.results?.pesticide}</div>
                              <div>DNA: {step.results?.dna}</div>
                            </div>
                            <Badge variant="secondary" className="bg-success/10 text-success mt-2">
                              {step.compliance}
                            </Badge>
                          </div>
                        }
                        
                        {step.type === "processing" &&
                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-foreground">{step.facility}</p>
                            <div className="flex flex-wrap gap-2">
                              {step.steps?.map((processStep, i) =>
                            <Badge key={i} variant="outline">{processStep}</Badge>
                            )}
                            </div>
                            <p className="text-sm text-muted-foreground">Final Output Weight: {step.outputWeight}</p>
                          </div>
                        }
                        
                        {step.type === "packaging" &&
                        <div className="space-y-1 text-sm text-muted-foreground">
                            <p>Manufacturer: <span className="font-semibold text-foreground">{step.manufacturer}</span></p>
                            <p>Packaging Date: <span className="font-semibold text-foreground">{step.packagingDate}</span></p>
                            {step.details?.outputWeight &&
                          <p>Total Packed Weight: {step.details.outputWeight}</p>
                          }
                            {step.details?.storageLocation &&
                          <p>Storage: {step.details.storageLocation}</p>
                          }
                          </div>
                        }
                      </div>
                    </div>
                    
                    {index < provenanceData.timeline.length - 1 &&
                    <Separator className="mt-6" />
                    }
                  </div>);

              })}
            </div>
          </CardContent>
        </Card>

        {/* Farmer Profile — populated from real batch data */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Meet the Collector
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg text-emerald-800">{farmerName}</h4>
                {farmerId && <p className="text-sm text-muted-foreground">Farmer ID: {farmerId}</p>}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Registered collector in the AyurTrace traceability network. 
                All collection events, quality data, and processing steps are recorded 
                on the PostgreSQL ledger and verifiable through this provenance trail.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="outline">Registered Collector</Badge>
                <Badge variant="outline">Secure Ledger Verified</Badge>
                <Badge variant="outline">Traceable Supply Chain</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Feedback Form */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              Send Feedback to Farmer
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Your feedback helps farmers improve quality and builds trust in the supply chain
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) =>
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                  className={`text-2xl ${star <= feedbackData.rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}>
                  
                    ★
                  </button>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={feedbackData.category} onValueChange={(value) => setFeedbackData({ ...feedbackData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select feedback category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quality">Product Quality</SelectItem>
                  <SelectItem value="packaging">Packaging</SelectItem>
                  <SelectItem value="freshness">Freshness</SelectItem>
                  <SelectItem value="sustainability">Sustainability</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Feedback</label>
              <Textarea
                placeholder="Share your experience with this product..."
                value={feedbackData.comment}
                onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                rows={4} />
              
            </div>
            
            <Button onClick={handleFeedback} className="w-full bg-emerald-700 hover:bg-emerald-800">
              <Send className="w-4 h-4 mr-2" />
              Send Feedback to Farmer
            </Button>
          </CardContent>
        </Card>

        {/* Customer Feedback List */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-emerald-600" />
              Customer Reviews
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {feedbacks.length > 0 ? (
              <div className="space-y-3">
                {feedbacks.map((f) => (
                  <div key={f.id} className="p-4 bg-muted/40 rounded-lg border border-border">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-1 text-yellow-500 font-bold">
                        {"★".repeat(f.rating)}
                        {"☆".repeat(5 - f.rating)}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(f.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {f.category && (
                      <Badge variant="secondary" className="mb-2 text-xs">
                        Category: {f.category}
                      </Badge>
                    )}
                    <p className="text-sm text-foreground italic">"{f.comment}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No reviews yet. Be the first to leave feedback!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <Button size="lg" className="bg-emerald-700 hover:bg-emerald-800" onClick={() => navigate('/')}>
            Learn More About Our Supply Chain
          </Button>
        </div>
      </div>
    </div>);

};

export default Provenance;