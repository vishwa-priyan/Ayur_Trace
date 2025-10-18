import React from 'react';
import { MapPin, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MapDisplayProps {
  lat: number;
  lng: number;
  address: string;
  isInApprovedZone?: boolean;
  className?: string;
}

const MapDisplay = ({ 
  lat, 
  lng, 
  address, 
  isInApprovedZone = true, 
  className = "" 
}: MapDisplayProps) => {
  // Using OpenStreetMap static map API as a simple solution
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lng}`;
  
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="font-medium">Location Details</span>
        </div>
        <Badge 
          variant={isInApprovedZone ? "secondary" : "destructive"}
          className={isInApprovedZone ? "bg-success/10 text-success" : ""}
        >
          {isInApprovedZone ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              Approved Zone
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3 mr-1" />
              Outside Zone
            </>
          )}
        </Badge>
      </div>
      
      <div className="bg-muted rounded-lg p-4 space-y-2">
        <iframe
          src={mapUrl}
          className="w-full h-48 rounded border-0"
          title="Location Map"
        />
        
        <div className="space-y-1">
          <p className="text-sm font-medium">{address}</p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Lat: {lat.toFixed(6)}</span>
            <span>Lng: {lng.toFixed(6)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapDisplay;