/**
 * API client for Syspec Drop API (BlockDAG powered)
 */

// Base URL for the API
const API_BASE_URL = "https://syspecdrop-api-production.up.railway.app";

export interface UploadMetadata {
  ipfsHash: string;
  txHash: string;
  filename: string;
  fileSize: number;
  encryptedSize: number;
  zkCommitment: string;
  burnAfterClaim: boolean;
  expiresAt: string;
  uploadedAt: string;
}

export interface DropStatus {
  txHash: string;
  status: "pending" | "active" | "claimed" | "expired" | "burned";
  ipfsHash?: string;
  filename?: string;
  fileSize?: number;
  uploadedAt?: string;
  claimedAt?: string;
  expiresAt?: string;
  claimCount?: number;
}

// API Response types from the actual endpoint
interface UploadApiResponse {
  success: boolean;
  dropId: string;
  ipfsHash: string;
  passphrase: string;
  txHash: string;
  explorerUrl: string;
  message: string;
}

interface ClaimApiResponse {
  success: boolean;
  fileName: string;
  fileContent: string; // base64 encoded
  txHash?: string;
  fileType?: string; // e.g., "docx", "pdf", "png"
  mimeType?: string; // e.g., "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  message: string;
}

interface StatusApiResponse {
  success: boolean;
  dropId: string;
  exists: boolean;
  claimed: boolean;
  ipfsHash?: string;
  createdAt?: number;
  message: string;
}

/**
 * Upload encrypted file to the Syspec Drop API
 * Returns dropId, passphrase, txHash, and IPFS hash
 */
export async function uploadToAPI(
  encryptedData: Uint8Array,
  filename: string
): Promise<{
  dropId: string;
  passphrase: string;
  txHash: string;
  ipfsHash: string;
  explorerUrl: string;
}> {
  try {
    // Convert Uint8Array to base64 without exhausting the call stack
    const base64Data = uint8ArrayToBase64(encryptedData);

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file: base64Data,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Upload failed with status ${response.status}`
      );
    }

    const data: UploadApiResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Upload failed");
    }

    console.log("File uploaded successfully:", {
      dropId: data.dropId,
      ipfsHash: data.ipfsHash,
      txHash: data.txHash,
    });

    return {
      dropId: data.dropId,
      passphrase: data.passphrase,
      txHash: data.txHash,
      ipfsHash: data.ipfsHash,
      explorerUrl: data.explorerUrl,
    };
  } catch (error) {
    console.error("Upload to API failed:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to upload file to API"
    );
  }
}

function uint8ArrayToBase64(data: Uint8Array): string {
  if (data.length === 0) {
    return "";
  }

  const chunkSize = 0x8000; // 32 KB chunks prevent stack overflow
  let binary = "";

  for (let offset = 0; offset < data.length; offset += chunkSize) {
    const chunk = data.subarray(offset, offset + chunkSize);
    binary += String.fromCharCode(...Array.from(chunk));
  }

  return btoa(binary);
}

/**
 * Legacy function - now handled by uploadToAPI
 * @deprecated Use uploadToAPI instead
 */
export async function uploadMetadataToBlockDAG(
  metadata: Omit<UploadMetadata, "txHash">
): Promise<string> {
  console.warn(
    "uploadMetadataToBlockDAG is deprecated. Use uploadToAPI instead."
  );
  throw new Error(
    "This function is deprecated. Use uploadToAPI which handles both file and metadata upload."
  );
}

/**
 * Claim a drop from the Syspec Drop API
 * V3: Returns binary file download by default (can be claimed unlimited times)
 * Falls back to JSON format if binary download fails
 */
export async function claimDrop(
  dropId: string,
  passphrase: string
): Promise<{
  fileName: string;
  fileContent: Uint8Array;
  mimeType?: string;
  fileType?: string;
}> {
  try {
    console.log("Claiming drop:", {
      dropId,
      passphraseLength: passphrase.length,
    });

    // Use JSON format endpoint with query parameter
    const response = await fetch(`${API_BASE_URL}/api/claim?format=json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dropId,
        passphrase,
      }),
    });

    console.log("Claim response status:", response.status);
    console.log(
      "Claim response content-type:",
      response.headers.get("Content-Type")
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Claim error response:", errorData);

      if (response.status === 400) {
        throw new Error("Invalid passphrase or Drop ID");
      } else if (response.status === 404) {
        throw new Error("Drop not found");
      }

      throw new Error(
        errorData.error || `Claim failed with status ${response.status}`
      );
    }

    // Parse JSON response
    const data: ClaimApiResponse = await response.json();

    console.log("Claim response data:", {
      success: data.success,
      fileName: data.fileName,
      fileType: data.fileType,
      mimeType: data.mimeType,
      contentLength: data.fileContent?.length,
      message: data.message,
    });

    if (!data.success) {
      throw new Error(data.message || "Failed to claim drop");
    }

    console.log("Drop claimed successfully (JSON mode):", {
      fileName: data.fileName,
      fileType: data.fileType,
      message: data.message,
    });

    // Convert base64 to Uint8Array
    try {
      if (!data.fileContent) {
        throw new Error("API response is missing file content");
      }

      const fileContent = Uint8Array.from(atob(data.fileContent), (char) =>
        char.charCodeAt(0)
      );

      console.log("File decoded successfully:", {
        fileName: data.fileName,
        fileType: data.fileType,
        mimeType: data.mimeType,
        fileSize: fileContent.length,
      });

      const sanitizedFileType = data.fileType?.trim().replace(/^\.+/, "");
      const normalizedExtension = sanitizedFileType
        ? `.${sanitizedFileType}`
        : undefined;

      let cleanFileName = data.fileName?.trim() || ``;
      if (!cleanFileName) {
        cleanFileName = `drop-${dropId.substring(0, 12)}`;
      }

      if (normalizedExtension) {
        const extensionLower = normalizedExtension.toLowerCase();
        if (!cleanFileName.toLowerCase().endsWith(extensionLower)) {
          const baseName = cleanFileName.includes(".")
            ? cleanFileName.replace(/\.[^.]+$/, "")
            : cleanFileName;
          cleanFileName = `${baseName}${normalizedExtension}`;
          console.log("Aligned filename with API fileType:", cleanFileName);
        }
        if (cleanFileName.endsWith(".bin")) {
          cleanFileName = cleanFileName.replace(/\.bin$/, normalizedExtension);
        }
      } else if (cleanFileName.endsWith(".bin")) {
        cleanFileName = cleanFileName.replace(/\.bin$/, "");
      }

      if (cleanFileName.endsWith(".bin")) {
        cleanFileName = `drop-${dropId.substring(0, 12)}`;
      }

      return {
        fileName: cleanFileName,
        fileContent,
        mimeType: data.mimeType,
        fileType: sanitizedFileType,
      };
    } catch (decodeError) {
      console.error("Base64 decode error:", decodeError);
      throw new Error("Failed to decode file content from base64");
    }
  } catch (error) {
    console.error("Claim drop failed:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to claim drop"
    );
  }
}

/**
 * Get drop status from the Syspec Drop API
 * Note: No timeout as BlockDAG network can be slow
 */
export async function getDropStatus(dropId: string): Promise<DropStatus> {
  try {
    console.log("Checking drop status:", dropId);

    const response = await fetch(`${API_BASE_URL}/api/status/${dropId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Status response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Status error response:", errorData);

      if (response.status === 404) {
        // Drop doesn't exist
        return {
          txHash: "",
          status: "expired",
          ipfsHash: undefined,
          filename: undefined,
          fileSize: undefined,
          uploadedAt: undefined,
          claimedAt: undefined,
          expiresAt: undefined,
          claimCount: 0,
        };
      }

      throw new Error(
        errorData.error || `Status check failed with status ${response.status}`
      );
    }

    const data: StatusApiResponse = await response.json();

    console.log("Status response data:", {
      success: data.success,
      dropId: data.dropId,
      exists: data.exists,
      claimed: data.claimed,
      message: data.message,
    });

    if (!data.success) {
      throw new Error(data.message || "Failed to get drop status");
    }

    // Convert API response to DropStatus format
    // If exists is not explicitly false, treat as exists (handle undefined/null)
    const exists = data.exists !== false;
    const claimed = data.claimed === true;

    let statusValue: DropStatus["status"];
    if (!exists) {
      statusValue = "expired";
    } else if (claimed) {
      statusValue = "claimed";
    } else {
      statusValue = "active";
    }

    console.log("Computed status:", { exists, claimed, statusValue });

    const status: DropStatus = {
      txHash: dropId, // Using dropId as txHash for compatibility
      status: statusValue,
      ipfsHash: data.ipfsHash,
      filename: exists ? `drop-${dropId.substring(0, 8)}.bin` : undefined,
      fileSize: undefined,
      uploadedAt: data.createdAt
        ? new Date(data.createdAt * 1000).toISOString()
        : undefined,
      claimedAt: claimed ? new Date().toISOString() : undefined,
      expiresAt: data.createdAt
        ? new Date((data.createdAt + 7 * 24 * 60 * 60) * 1000).toISOString()
        : undefined,
      claimCount: claimed ? 1 : 0,
    };

    return status;
  } catch (error) {
    console.error("Get drop status failed:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to get drop status"
    );
  }
}

/**
 * Mark drop as claimed
 * Note: Drops are NOT burned - they remain accessible for future claims
 * @deprecated This function is no longer needed as drops are persistent
 */
export async function markDropAsClaimed(dropId: string): Promise<boolean> {
  console.log("Note: Drops are persistent and not burned:", dropId);
  // Drops remain accessible after claiming
  return true;
}

/**
 * Verify ZK proof on-chain
 * Note: Currently handled by the API during claim
 */
export async function verifyZKProofOnChain(
  dropId: string,
  zkCommitment: string
): Promise<boolean> {
  console.log("ZK proof verification (handled by API):", {
    dropId,
    zkCommitment,
  });
  // The API handles ZK proof verification during claim
  return true;
}

/**
 * Legacy IPFS function - kept for backwards compatibility
 * @deprecated Use uploadToAPI instead
 */
export async function uploadToIPFS(
  encryptedData: Uint8Array,
  filename: string
): Promise<string> {
  console.warn("uploadToIPFS is deprecated. Use uploadToAPI instead.");
  const result = await uploadToAPI(encryptedData, filename);
  return result.ipfsHash;
}

/**
 * Legacy IPFS retrieval - kept for backwards compatibility
 * @deprecated Use claimDrop instead
 */
export async function retrieveFromIPFS(ipfsHash: string): Promise<Uint8Array> {
  console.warn("retrieveFromIPFS is deprecated. Use claimDrop instead.");
  throw new Error(
    "This function is deprecated. Use claimDrop with dropId and passphrase instead."
  );
}
