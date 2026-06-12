"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QrScanner() {
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5Qrcode("qr-reader");

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError("");
      setIsScanning(true);
      await scannerRef.current?.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Pause scanning once we get a result
          scannerRef.current?.pause();
          
          try {
            const url = new URL(decodedText);
            if (url.origin === window.location.origin && url.pathname === "/dashboard/admin/scan") {
              // Successfully parsed our own QR code
              router.push(decodedText);
            } else {
              setError("Invalid QR Code: Not an AssetFlow QR code.");
              scannerRef.current?.resume();
            }
          } catch (e) {
            // Not a URL
            // If the QR code just contains the asset ID, handle it:
            router.push(`/dashboard/admin/scan?assetId=${decodedText}`);
          }
        },
        (errorMessage) => {
          // This fires constantly while searching for a QR code, so we ignore it
        }
      );
    } catch (err: any) {
      setError("Failed to start camera: " + err.message);
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    try {
      await scannerRef.current?.stop();
      setIsScanning(false);
    } catch (err) {
      console.error("Failed to stop scanner", err);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto space-y-4">
      <div 
        id="qr-reader" 
        className="w-full bg-muted rounded-xl overflow-hidden min-h-[300px] flex items-center justify-center border-2 border-dashed"
      >
        {!isScanning && (
          <div className="text-muted-foreground">Camera is offline</div>
        )}
      </div>

      {error && <p className="text-destructive text-sm font-medium">{error}</p>}

      <div className="flex gap-4">
        {!isScanning ? (
          <Button onClick={startScanning} size="lg">
            Start Camera
          </Button>
        ) : (
          <Button onClick={stopScanning} variant="outline" size="lg">
            Stop Camera
          </Button>
        )}
      </div>
    </div>
  );
}
