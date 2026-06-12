"use client";

import { QrCode } from "lucide-react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Asset } from "@/lib/db/schema";
import { useEffect, useState } from "react";

export function QrCodeDialog({ asset }: { asset: Asset }) {
  const [qrValue, setQrValue] = useState("");

  useEffect(() => {
    // We encode the full URL to the scan action in the QR code
    setQrValue(`${window.location.origin}/dashboard/admin/scan?assetId=${asset.id}`);
  }, [asset.id]);

  const handlePrint = () => {
    // A simple print trigger for the QR code
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR - ${asset.name}</title>
          <style>
            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .qr-container { padding: 2rem; border: 2px dashed #ccc; text-align: center; }
            h2 { margin-top: 0; }
            p { color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h2>${asset.name}</h2>
            <div id="qr"></div>
            <p>${asset.category}</p>
            <p>ID: ${asset.id}</p>
          </div>
          <script>
            // Simply use the raw SVG that react-qr-code generates
            document.getElementById("qr").innerHTML = \`<svg viewBox="0 0 256 256" style="height: auto; max-width: 100%; width: 256px;">...</svg>\`;
          </script>
        </body>
      </html>
    `);
    // Wait for the window to load the SVG and trigger print
    // Or simpler: just let the admin right-click and save/print the image.
  };

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="ghost" size="icon" title="View QR Code" />}>
        <QrCode className="h-4 w-4" />
        <span className="sr-only">QR Code</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md flex flex-col items-center">
        <DialogHeader className="w-full">
          <DialogTitle>Asset QR Code</DialogTitle>
          <DialogDescription>
            Scan this code to instantly open the Quick Action panel for this asset.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl mt-4 border">
          {qrValue && (
            <QRCode
              value={qrValue}
              size={200}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox={`0 0 256 256`}
            />
          )}
          <h3 className="mt-4 font-semibold text-gray-900">{asset.name}</h3>
          <p className="text-xs text-gray-500 font-mono mt-1">{asset.id}</p>
        </div>
        <div className="w-full flex justify-end mt-4">
          <Button variant="outline" onClick={() => window.print()}>
            Print Page
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
