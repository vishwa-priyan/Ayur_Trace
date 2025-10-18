import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, MapPin, FlaskConical, Factory, Package, User, Calendar, Weight, Leaf, Star, Send, Camera, Heart } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import MapDisplay from "@/components/MapDisplay";
import farmerImage from "@/assets/herb_photo.jpeg";

const Provenance = () => {
  const { batchId } = useParams();
  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    comment: "",
    category: ""
  });

  // Mock data - would come from blockchain/database
  const provenanceData = {
    batchId: batchId || "TXN0042",
    productName: "Ashwagandha Restorative Capsules",
    status: "verified",
    geotaggedPhoto: farmerImage,
    timeline: [
        {
          id: 1,
          type: "collection",
          title: "Collection Event",
          date: "2025-01-15",
          location: "Jaipur, Rajasthan",
          collector: "Ravi Cooperative - Farmer F2025001",
          details: {
            weight: "25.5 kg",
            quality: "Excellent",
            coords: { lat: 26.9124, lng: 75.7873 },
            geotaggedPhoto: farmerImage
          },
          icon: MapPin,
          status: "completed"
        },
      {
        id: 2,
        type: "handover",
        title: "Custody Handover", 
        date: "2025-01-16",
        from: "Ravi Cooperative",
        to: "Rajasthan Herbal Processing Ltd.",
        icon: Package,
        status: "completed"
      },
      {
        id: 3,
        type: "testing",
        title: "Quality Testing",
        date: "2025-01-18",
        lab: "Certified Ayur Labs Pvt. Ltd.",
        results: {
          moisture: "8.2%",
          pesticide: "Not Detected",
          dna: "Authentic Withania somnifera"
        },
        compliance: "Passed All Tests",
        icon: FlaskConical,
        status: "completed"
      },
      {
        id: 4,
        type: "processing",
        title: "Processing & Formulation",
        date: "2025-01-20",
        steps: ["Drying (45°C)", "Grinding (Fine)", "Encapsulation"],
        outputWeight: "22.1 kg (dry)",
        icon: Factory,
        status: "completed"
      },
      {
        id: 5,
        type: "packaging",
        title: "Final Packaging",
        date: "2025-01-25",
        manufacturer: "Ayur Wellness Co.",
        packagingDate: "2025-01-25",
        icon: Package,
        status: "completed"
      }
    ]
  };

  const handleFeedback = () => {
    if (!feedbackData.rating || !feedbackData.comment) {
      toast({
        title: "Incomplete Feedback",
        description: "Please provide rating and comment",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Thank You!",
      description: "Your feedback has been sent to the farmer",
    });

    // Reset form
    setFeedbackData({ rating: 0, comment: "", category: "" });
  };

  const StatusIcon = ({ status }: { status: string }) => (
    status === "verified" ? (
      <div className="flex items-center gap-2 text-success">
        <CheckCircle className="w-5 h-5" />
        <span className="font-semibold">Authenticity Verified</span>
      </div>
    ) : (
      <div className="flex items-center gap-2 text-destructive">
        <CheckCircle className="w-5 h-5" />
        <span className="font-semibold">Verification Failed</span>
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-gradient-earth">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <StatusIcon status={provenanceData.status} />
            <CardTitle className="text-2xl mt-4">{provenanceData.productName}</CardTitle>
            <p className="text-muted-foreground">Batch ID: {provenanceData.batchId}</p>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-lg mb-4">
                Sourced directly from certified organic farms in Rajasthan, collected by the Ravi Cooperative.
              </p>
              <Badge variant="secondary" className="bg-success/10 text-success">
                <Leaf className="w-4 h-4 mr-1" />
                Sustainably Sourced
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Provenance Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Product Journey</CardTitle>
            <p className="text-muted-foreground">Complete blockchain-verified audit trail</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {provenanceData.timeline.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="relative">
                    {/* Timeline line */}
                    {index < provenanceData.timeline.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-16 bg-border"></div>
                    )}
                    
                    <div className="flex gap-4">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{step.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {step.date}
                          </div>
                        </div>
                        
                        {step.type === "collection" && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <p className="text-sm">📍 {step.location}</p>
                              <p className="text-sm">👨‍🌾 {step.collector}</p>
                              <div className="flex gap-4 text-sm">
                                <span>Weight: {step.details?.weight}</span>
                                <span>Quality: {step.details?.quality}</span>
                              </div>
                            </div>
                            
                            {step.details?.geotaggedPhoto && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium flex items-center gap-2">
                                  <Camera className="w-4 h-4" />
                                  Geotagged Collection Photo
                                </h4>
                                <img 
                                  src={step.details.geotaggedPhoto} 
                                  alt="Collection site" 
                                  className="w-full h-48 object-cover rounded-lg border"
                                />
                              </div>
                            )}
                            
                            {step.details?.coords && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  Collection Location
                                </h4>
                                <MapDisplay
                                  lat={step.details.coords.lat}
                                  lng={step.details.coords.lng}
                                  address={step.location}
                                  isInApprovedZone={true}
                                />
                              </div>
                            )}
                          </div>
                        )}
                        
                        {step.type === "handover" && (
                          <div className="space-y-1">
                            <p className="text-sm">From: {step.from}</p>
                            <p className="text-sm">To: {step.to}</p>
                          </div>
                        )}
                        
                        {step.type === "testing" && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">{step.lab}</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <div className="text-sm">Moisture: {step.results?.moisture}</div>
                              <div className="text-sm">Pesticide: {step.results?.pesticide}</div>
                              <div className="text-sm">DNA: {step.results?.dna}</div>
                            </div>
                            <Badge variant="secondary" className="bg-success/10 text-success">
                              {step.compliance}
                            </Badge>
                          </div>
                        )}
                        
                        {step.type === "processing" && (
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              {step.steps?.map((processStep, i) => (
                                <Badge key={i} variant="outline">{processStep}</Badge>
                              ))}
                            </div>
                            <p className="text-sm">Final Output: {step.outputWeight}</p>
                          </div>
                        )}
                        
                        {step.type === "packaging" && (
                          <div className="space-y-1">
                            <p className="text-sm">Manufacturer: {step.manufacturer}</p>
                            <p className="text-sm">Packaging Date: {step.packagingDate}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {index < provenanceData.timeline.length - 1 && (
                      <Separator className="mt-6" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Farmer Profile */}
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
                <h4 className="font-semibold">Ravi Cooperative</h4>
                <p className="text-sm text-muted-foreground">Certified Organic Farmers Collective</p>
              </div>
              <p className="text-sm">
                A community-driven cooperative of 200+ farmers in Rajasthan committed to sustainable 
                Ayurvedic herb cultivation. Practicing traditional organic farming methods passed down 
                through generations while embracing modern traceability technologies.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Organic Certified</Badge>
                <Badge variant="outline">Fair Trade</Badge>
                <Badge variant="outline">Sustainable Practices</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Feedback Form */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
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
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                    className={`text-2xl ${star <= feedbackData.rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                  >
                    ★
                  </button>
                ))}
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
                rows={4}
              />
            </div>
            
            <Button onClick={handleFeedback} className="w-full">
              <Send className="w-4 h-4 mr-2" />
              Send Feedback to Farmer
            </Button>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <Button size="lg">
            Learn More About Our Supply Chain
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Provenance;