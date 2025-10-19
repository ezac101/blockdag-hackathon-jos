"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Search,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Flame,
} from "lucide-react";
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
import { CardStack, CardStackItem } from "@/components/ui/card-stack";
import { getDropStatus } from "@/lib/api-client";
import { formatDate, truncate } from "@/lib/utils";
import type { DropStatus } from "@/lib/api-client";

export default function StatusPage() {
  const router = useRouter();
  const [dropId, setDropId] = useState((router.query.id as string) || "");
  const [status, setStatus] = useState<DropStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!dropId || dropId.length < 10) {
      toast({
        title: "Invalid Drop ID",
        description: "Please enter a valid Drop ID.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const dropStatus = await getDropStatus(dropId);
      setStatus(dropStatus);

      if (dropStatus.status === "active") {
        toast({
          title: "Drop found!",
          description: "This drop is active and ready to be claimed.",
          variant: "success",
        });
      }
    } catch (error) {
      console.error("Status check error:", error);
      toast({
        title: "Status check failed",
        description:
          error instanceof Error
            ? error.message
            : "Could not retrieve drop status",
        variant: "destructive",
      });
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const troubleshootingTips: CardStackItem[] = [
    {
      id: 1,
      title: "Using Tor Browser",
      description:
        "For maximum anonymity, access Syspec Drop through Tor Browser to hide your IP address.",
    },
    {
      id: 2,
      title: "Passphrase Storage",
      description:
        "Never store passphrases in plain text. Use encrypted password managers or secure physical storage.",
    },
    {
      id: 3,
      title: "Network Issues",
      description:
        "If IPFS retrieval is slow, try a different IPFS gateway or wait for better network conditions.",
    },
    {
      id: 4,
      title: "Expired Drops",
      description:
        "Drops expire after 7 days by default. Check the expiration date before attempting to claim.",
    },
    {
      id: 5,
      title: "Burn After Reading",
      description:
        "Once claimed, drops are permanently deleted. Make sure to save the file before closing.",
    },
  ];

  const getStatusIcon = (statusType: DropStatus["status"]) => {
    switch (statusType) {
      case "active":
        return <CheckCircle className="h-6 w-6 text-primary" />;
      case "claimed":
        return <CheckCircle className="h-6 w-6 text-blue-500" />;
      case "expired":
        return <XCircle className="h-6 w-6 text-yellow-500" />;
      case "pending":
        return <Clock className="h-6 w-6 text-blue-500" />;
      default:
        return <Clock className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getStatusColor = (statusType: DropStatus["status"]) => {
    switch (statusType) {
      case "active":
        return "text-primary";
      case "claimed":
        return "text-blue-500";
      case "expired":
        return "text-yellow-500";
      case "pending":
        return "text-blue-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="container pt-24 pb-12 px-4 max-w-5xl mx-auto bg-white min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Drop Status Explorer
          </h1>
          <p className="text-gray-600 text-lg">
            Track your anonymous drops on the BlockDAG ledger.
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Search className="h-5 w-5 text-blue-600" />
              Search by Drop ID
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter the Drop ID provided after uploading a drop.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                glow
                type="text"
                placeholder="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
                value={dropId}
                onChange={(e) => setDropId(e.target.value)}
                className="flex-1 font-mono text-sm"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {status && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="mb-8 border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    {getStatusIcon(status.status)}
                    Drop Status
                  </CardTitle>
                  <span
                    className={`text-sm font-medium uppercase ${getStatusColor(
                      status.status
                    )}`}
                  >
                    {status.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Transaction Hash */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Transaction Hash
                      </p>
                      <p className="font-mono text-sm">
                        {truncate(status.txHash, 20)}
                      </p>
                    </div>
                    {status.ipfsHash && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          IPFS Hash
                        </p>
                        <p className="font-mono text-sm">
                          {truncate(status.ipfsHash, 20)}
                        </p>
                      </div>
                    )}
                    {status.filename && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Filename
                        </p>
                        <p className="text-sm">{status.filename}</p>
                      </div>
                    )}
                  </div>

                  {/* Timeline */}
                  <div className="space-y-3">
                    {status.uploadedAt && (
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Uploaded</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(new Date(status.uploadedAt))}
                          </p>
                        </div>
                      </div>
                    )}

                    {status.claimedAt && (
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">First Claimed</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(new Date(status.claimedAt))}
                          </p>
                        </div>
                      </div>
                    )}

                    {status.expiresAt && status.status === "active" && (
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <div className="h-2 w-2 rounded-full bg-yellow-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Expires</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(new Date(status.expiresAt))}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-border">
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`https://explorer.example.com/tx/${status.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        View on Explorer
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>

                    {status.status === "active" && (
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                        asChild
                      >
                        <Link href="/receiver">Claim This Drop</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Troubleshooting Tips */}
        <section className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 gradient-text">
              Troubleshooting Tips
            </h2>
            <p className="text-muted-foreground">
              Common solutions for using Syspec Drop securely
            </p>
          </div>

          <div className="flex justify-center">
            <CardStack
              items={troubleshootingTips}
              className="max-w-2xl"
              interval={5000}
            />
          </div>
        </section>

        {/* Quick Links */}
        <section className="mt-16">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Need Help?</CardTitle>
              <CardDescription className="text-gray-600">
                Explore our documentation and resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-start gap-2"
                  asChild
                >
                  <Link href="/docs">
                    <span className="font-semibold">Documentation</span>
                    <span className="text-xs text-muted-foreground">
                      Complete guide to using Syspec Drop
                    </span>
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-start gap-2"
                  asChild
                >
                  <a
                    href="https://github.com/yourusername/syspec-drop"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="font-semibold">GitHub Repository</span>
                    <span className="text-xs text-muted-foreground">
                      View source code and contribute
                    </span>
                  </a>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-start gap-2"
                  asChild
                >
                  <Link href="/faq">
                    <span className="font-semibold">FAQ</span>
                    <span className="text-xs text-muted-foreground">
                      Frequently asked questions
                    </span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </motion.div>
    </div>
  );
}
