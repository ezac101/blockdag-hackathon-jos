"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Key, Download, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { isValidPassphrase } from "@/lib/utils";
import {
  decryptFile,
  verifyZKProof,
  createDownloadableFile,
  base64ToArray,
} from "@/lib/encryption";
import { claimDrop, getDropStatus } from "@/lib/api-client";

type ClaimState =
  | "idle"
  | "verifying"
  | "downloading"
  | "decrypting"
  | "success";

export default function ReceiverPage() {
  const [passphrase, setPassphrase] = useState("");
  const [dropId, setDropId] = useState("");
  const [claimState, setClaimState] = useState<ClaimState>("idle");
  const [downloadedFile, setDownloadedFile] = useState<{
    name: string;
    size: number;
  } | null>(null);
  const [burned, setBurned] = useState(false);
  const { toast } = useToast();

  const handleClaim = async () => {
    if (!isValidPassphrase(passphrase)) {
      toast({
        title: "Invalid passphrase",
        description: "Passphrase must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }

    if (!dropId.trim()) {
      toast({
        title: "Missing Drop ID",
        description: "Please enter the Drop ID to claim your file.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Step 1: Verify credentials and prepare
      setClaimState("verifying");

      console.log("Attempting to claim drop:", {
        dropId,
        passphraseLength: passphrase.length,
      });

      // Step 2: Claim the drop (API returns decrypted file directly)
      setClaimState("downloading");

      console.log("Fetching drop from API...");
      const {
        fileName,
        fileContent,
        mimeType: apiMimeType,
        fileType,
      } = await claimDrop(dropId, passphrase);

      console.log("Drop retrieved successfully:", {
        fileName,
        fileSize: fileContent.length,
        fileType: fileType || fileName.split(".").pop(),
      });

      // Step 3: Prepare download (file is already decrypted by API)
      setClaimState("decrypting");

      const getFileMimeType = (filename: string): string => {
        const ext = filename.split(".").pop()?.toLowerCase();
        const mimeTypes: { [key: string]: string } = {
          // Archives
          zip: "application/zip",
          "7z": "application/x-7z-compressed",
          rar: "application/vnd.rar",
          tar: "application/x-tar",
          gz: "application/gzip",
          bz2: "application/x-bzip2",
          // Documents
          pdf: "application/pdf",
          ps: "application/postscript",
          doc: "application/msword",
          docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          xls: "application/vnd.ms-excel",
          xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ppt: "application/vnd.ms-powerpoint",
          pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          // Text
          txt: "text/plain",
          csv: "text/csv",
          json: "application/json",
          xml: "application/xml",
          html: "text/html",
          css: "text/css",
          js: "application/javascript",
          // Images
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          png: "image/png",
          gif: "image/gif",
          webp: "image/webp",
          svg: "image/svg+xml",
          bmp: "image/bmp",
          tiff: "image/tiff",
          ico: "image/x-icon",
          // Audio
          mp3: "audio/mpeg",
          wav: "audio/wav",
          ogg: "audio/ogg",
          flac: "audio/flac",
          aac: "audio/aac",
          m4a: "audio/mp4",
          // Video
          mp4: "video/mp4",
          webm: "video/webm",
          avi: "video/x-msvideo",
          mov: "video/quicktime",
          mkv: "video/x-matroska",
          flv: "video/x-flv",
          wmv: "video/x-ms-wmv",
          // Other
          bin: "application/octet-stream",
        };
        return mimeTypes[ext || ""] || "application/octet-stream";
      };

      const mimeType = apiMimeType || getFileMimeType(fileName);
      console.log("Downloading file:", {
        fileName,
        mimeType,
        size: fileContent.length,
        extension: fileName.split(".").pop(),
      });

      // Safety check: NEVER allow .bin files to be downloaded
      if (fileName.endsWith(".bin")) {
        console.error(
          "ERROR: Attempting to download .bin file - this should never happen!"
        );
        toast({
          title: "File type error",
          description:
            "Invalid file type received. Please try again or contact support.",
          variant: "destructive",
        });
        setClaimState("idle");
        return;
      }

      // File is already decrypted by the API, just download it
      createDownloadableFile(fileContent, fileName, mimeType);

      setDownloadedFile({
        name: fileName,
        size: fileContent.length,
      });

      setClaimState("success");
      setBurned(false); // V3: Drops are persistent and can be claimed unlimited times

      toast({
        title: "File claimed successfully!",
        description:
          "Your file has been downloaded. You can claim it again anytime with the same credentials.",
      });
    } catch (error) {
      console.error("Claim error:", error);
      toast({
        title: "Claim failed",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
      setClaimState("idle");
    }
  };

  const handleReset = () => {
    setClaimState("idle");
    setPassphrase("");
    setDownloadedFile(null);
    setBurned(false);
  };

  return (
    <div className="container pt-24 pb-12 px-4 max-w-3xl mx-auto min-h-screen bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Claim Anonymous Drop
          </h1>
          <p className="text-gray-600 text-lg">
            Enter the passphrase to securely download and decrypt your file.
          </p>
        </div>

        {claimState === "idle" && (
          <>
            {/* Drop ID and Passphrase Input */}
            <Card className="mb-6 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Key className="h-5 w-5 text-blue-600" />
                  Enter Drop Details
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Enter the Drop ID and passphrase shared by the sender.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="dropId"
                    className="text-sm font-medium text-gray-900"
                  >
                    Drop ID
                  </label>
                  <Input
                    id="dropId"
                    type="text"
                    placeholder="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
                    value={dropId}
                    onChange={(e) => setDropId(e.target.value)}
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="passphrase"
                    className="text-sm font-medium text-gray-900"
                  >
                    Passphrase
                  </label>
                  <Input
                    id="passphrase"
                    type="text"
                    placeholder="quantum-secure-drop-anonymous-encrypted-blockdag"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    className="font-mono"
                    onKeyPress={(e) => e.key === "Enter" && handleClaim()}
                  />
                </div>

                <Button
                  onClick={handleClaim}
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!passphrase || !dropId}
                >
                  Claim & Download
                </Button>
              </CardContent>
            </Card>

            {/* V3 Info Banner */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-2 text-gray-900">
                      V3: Unlimited Claims
                    </p>
                    <p className="text-gray-600">
                      Drops can now be claimed unlimited times with the same
                      credentials. Files are decrypted server-side and delivered
                      securely via HTTPS.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Processing States */}
        {claimState !== "idle" && claimState !== "success" && (
          <Card className="border-gray-200">
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">
                    {claimState === "verifying" && "Verifying credentials..."}
                    {claimState === "downloading" &&
                      "Downloading decrypted file..."}
                    {claimState === "decrypting" && "Preparing download..."}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {claimState === "verifying" &&
                      "Checking Drop ID and passphrase with BlockDAG ledger..."}
                    {claimState === "downloading" &&
                      "Retrieving your file from IPFS (already decrypted)..."}
                    {claimState === "decrypting" &&
                      "Your browser will download the file automatically..."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success State */}
        {claimState === "success" && downloadedFile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="mb-6 border-blue-300 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <CheckCircle className="h-6 w-6" />
                  File Downloaded Successfully!
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Your file has been securely downloaded. The drop remains
                  accessible.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Download className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-pulse" />
                    <p className="text-lg font-medium mb-1 text-gray-900">
                      {downloadedFile.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Check your downloads folder
                    </p>
                  </div>
                </div>

                {/* Info about persistent drops */}
                <div className="flex gap-3 p-4 bg-blue-100 border border-blue-300 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-600 mb-1">
                      Unlimited Claims Available
                    </p>
                    <p className="text-gray-600">
                      V3 Update: This drop can be claimed unlimited times. Share
                      the same credentials to allow multiple downloads without
                      expiration.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Claim Another Drop
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
