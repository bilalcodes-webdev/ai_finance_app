"use client";

import { AiReceiptGenerate } from "@/actions/transaction";
import useFetch from "@/hooks/use-fetch-hook";
import { Button } from "@react-email/components";
import { Camera, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

const RecipieScanner = ({ onScanComplete }) => {
  const fileRef = useRef(null);
  const { isLoading, data, fn, error } = useFetch(AiReceiptGenerate);

  const handleReceiptScan = async (file) => {
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    await fn(file);
    fileRef.current.value = ""
  };

  useEffect(() => {
    if (error) {
      toast.error("Something went wrong");
    }
  }, [error]);

  useEffect(() => {
    if (data && data.success && !isLoading) {
      onScanComplete(data);
      toast.success("Scan completed successfully");
    }
  }, [data, isLoading, onScanComplete]);

  return (
    <div className="flex justify-center items-center px-4 py-6">
      <input
        type="file"
        name="file"
        id="file"
        className="hidden"
        accept="image/*"
        capture="environment"
        ref={fileRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleReceiptScan(file);
        }}
      />

      <div className="w-full max-w-md">
        <Button
          type="button"
          disabled={isLoading}
          onClick={() => fileRef.current?.click()}
          className="w-full p-4 cursor-pointer text-center bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 animate-gradient text-white hover:opacity-90 transition rounded-lg"
        >
          <div className="flex justify-center items-center gap-2">
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                <span>Scanning Receipt...</span>
              </>
            ) : (
              <>
                <Camera className="h-5 w-5" />
                <span>Scan Receipt With AI</span>
              </>
            )}
          </div>
        </Button>
      </div>
    </div>
  );
};

export default RecipieScanner;
