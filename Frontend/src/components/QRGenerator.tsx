import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRGeneratorProps {
  batchId: string;
  className?: string;
}

const QRGenerator = ({ batchId, className = "" }: QRGeneratorProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    if (batchId) {
      const generateQR = async () => {
        try {
          // Create provenance URL that would link to the consumer portal
          const provenanceUrl = `${window.location.origin}/provenance/${batchId}`;
          const url = await QRCode.toDataURL(provenanceUrl, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
            width: 200,
          });
          setQrCodeUrl(url);
        } catch (err) {
          console.error('Error generating QR code:', err);
        }
      };

      generateQR();
    }
  }, [batchId]);

  if (!qrCodeUrl) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg ${className}`}>
        <span className="text-muted-foreground">Generating QR...</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <img 
        src={qrCodeUrl} 
        alt={`QR Code for batch ${batchId}`}
        className="rounded-lg shadow-sm"
      />
      <p className="text-xs text-muted-foreground text-center">
        Scan to view product provenance
      </p>
    </div>
  );
};

export default QRGenerator;