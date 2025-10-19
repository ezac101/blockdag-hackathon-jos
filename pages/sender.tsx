"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import {
  Upload,
  Key,
  CheckCircle,
  Copy,
  QrCode,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { QRCodeSVG } from "qrcode.react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { formatFileSize, copyToClipboard } from "@/lib/utils";
import { encryptFile, generateZKProof, arrayToBase64 } from "@/lib/encryption";
import { uploadToAPI } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type UploadStep = "idle" | "encrypting" | "uploading" | "storing" | "complete";

export default function SenderPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStep, setUploadStep] = useState<UploadStep>("idle");
  const [progress, setProgress] = useState(0);
  const [txHash, setTxHash] = useState("");
  const [dropId, setDropId] = useState("");
  const [apiPassphrase, setApiPassphrase] = useState("");
  const [explorerUrl, setExplorerUrl] = useState("");
  const [showQR, setShowQR] = useState(false);
  const { toast } = useToast();

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      toast({
        title: "File selected",
        description: `${acceptedFiles[0].name} (${formatFileSize(
          acceptedFiles[0].size
        )})`,
        variant: "success",
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Missing file",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Step 1: Read file as bytes (no encryption needed - API handles it)
      setUploadStep("encrypting");
      setProgress(10);

      const fileBuffer = await file.arrayBuffer();
      const fileData = new Uint8Array(fileBuffer);

      setProgress(35);

      // Step 2: Upload to API (handles IPFS and BlockDAG)
      setUploadStep("uploading");
      setProgress(50);

      const result = await uploadToAPI(fileData, file.name);

      setProgress(90);

      // Store all the important values
      setDropId(result.dropId);
      setTxHash(result.txHash);
      setApiPassphrase(result.passphrase);
      setExplorerUrl(result.explorerUrl);

      // Store dropId in localStorage for later reference
      if (typeof window !== "undefined") {
        const dropData = {
          dropId: result.dropId,
          txHash: result.txHash,
          ipfsHash: result.ipfsHash,
          explorerUrl: result.explorerUrl,
          apiPassphrase: result.passphrase, // API's passphrase for claiming
          filename: file.name,
          uploadedAt: new Date().toISOString(),
        };
        localStorage.setItem(`drop-${result.dropId}`, JSON.stringify(dropData));
      }

      setProgress(100);

      // Complete
      setUploadStep("complete");

      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
      });

      toast({
        title: "Drop created successfully!",
        description: "Share the passphrase securely with your recipient.",
        variant: "success",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
      setUploadStep("idle");
      setProgress(0);
    }
  };

  const handleCopyPassphrase = async () => {
    const success = await copyToClipboard(apiPassphrase);
    if (success) {
      toast({
        title: "Copied!",
        description: "Passphrase copied to clipboard",
      });
    }
  };

  const handleCopyDropId = async () => {
    const success = await copyToClipboard(dropId);
    if (success) {
      toast({
        title: "Copied!",
        description: "Drop ID copied to clipboard",
      });
    }
  };

  const handleCopyTxHash = async () => {
    const success = await copyToClipboard(txHash);
    if (success) {
      toast({
        title: "Copied!",
        description: "Transaction hash copied to clipboard",
      });
    }
  };

  return (
    <div className="container pt-24 pb-12 px-4 max-w-4xl mx-auto bg-white min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Send Anonymous Drop
          </h1>
          <p className="text-gray-600 text-lg">
            Upload your file securely. No traces, no logs, complete anonymity.
          </p>
        </div>

        {uploadStep === "idle" && (
          <>
            {/* File Upload */}
            <Card className="mb-6 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Upload className="h-5 w-5" />
                  Select File
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Choose a file to upload (max 100MB). The API will handle
                  encryption and storage.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all",
                    isDragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-blue-400 hover:bg-blue-50",
                    file && "border-blue-500 bg-blue-50"
                  )}
                >
                  <input {...getInputProps()} />
                  {file ? (
                    <div>
                      <CheckCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2 text-gray-900">
                        {isDragActive
                          ? "Drop file here..."
                          : "Drag & drop file here"}
                      </p>
                      <p className="text-sm text-gray-600">
                        or click to browse
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={!file}
            >
              Upload Securely
            </Button>
          </>
        )}

        {/* Progress */}
        {uploadStep !== "idle" && uploadStep !== "complete" && (
          <Card className="mb-6 border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Uploading...</CardTitle>
              <CardDescription className="text-gray-600">
                {uploadStep === "encrypting" && "Preparing file for upload..."}
                {uploadStep === "uploading" &&
                  "Uploading to IPFS and BlockDAG network..."}
                {uploadStep === "storing" && "Finalizing secure storage..."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="h-3" />
              <p className="text-center text-sm text-gray-600 mt-2">
                {progress}%
              </p>
            </CardContent>
          </Card>
        )}

        {/* Success */}
        {uploadStep === "complete" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="mb-6 border-blue-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <CheckCircle className="h-6 w-6" />
                  Drop Created Successfully!
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Share both the Drop ID and passphrase securely with your
                  recipient. They need both to claim the file.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Drop ID */}
                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-900">
                    Drop ID (Share with recipient)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={dropId}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyDropId}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Passphrase */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Passphrase (Share Securely)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={apiPassphrase}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyPassphrase}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowQR(!showQR)}
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </div>

                  {showQR && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="flex justify-center p-4 bg-white rounded-lg"
                    >
                      <QRCodeSVG
                        value={`${dropId}|${apiPassphrase}`}
                        size={200}
                      />
                    </motion.div>
                  )}
                </div>

                {/* Transaction Hash */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Transaction Hash
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={txHash}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyTxHash}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  {explorerUrl && (
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline mt-2 inline-flex items-center gap-1"
                    >
                      View on BlockDAG Explorer{" "}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                {/* Info Notice */}
                <div className="flex gap-3 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-primary mb-1">Important:</p>
                    <p className="text-muted-foreground">
                      This drop remains accessible on the network. Anyone with
                      the Drop ID and passphrase can download the file. Keep
                      these credentials secure.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setUploadStep("idle");
                      setFile(null);
                      setProgress(0);
                      setTxHash("");
                      setDropId("");
                      setApiPassphrase("");
                      setExplorerUrl("");
                    }}
                  >
                    Send Another
                  </Button>
                  <Button variant="glow" className="flex-1" asChild>
                    <a href={`/status?id=${dropId}`}>Check Status</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
