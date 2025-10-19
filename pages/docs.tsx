import { motion } from "framer-motion";
import {
  Code,
  Download,
  FileText,
  Network,
  Shield,
  Upload,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const endpoints = [
  {
    name: "Upload File",
    method: "POST",
    path: "/api/upload",
    icon: Upload,
    description:
      "Accepts encrypted or plain binary (base64 string) payload and returns drop credentials and transaction metadata.",
    request: `{
  "file": "<base64 encoded payload>"
}`,
    response: `{
  "success": true,
  "dropId": "d1f2e3c4",
  "ipfsHash": "bafy...",
  "passphrase": "quantum-sphinx",
  "txHash": "0x123...",
  "explorerUrl": "https://explorer.blockdag.io/tx/0x123",
  "message": "Upload completed"
}`,
  },
  {
    name: "Claim File (JSON)",
    method: "POST",
    path: "/api/claim?format=json",
    icon: Download,
    description:
      "Returns decrypted file as base64 content together with file type, mime type, and transaction hash.",
    request: `{
  "dropId": "d1f2e3c4",
  "passphrase": "quantum-sphinx"
}`,
    response: `{
  "success": true,
  "fileName": "drop-d1f2e3c4.docx",
  "fileContent": "UEsDBBQABgAIAAAAIQD...",
  "fileType": "docx",
  "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "txHash": "0x8aae...",
  "message": "Drop claimed successfully. File decrypted."
}`,
  },
  {
    name: "Drop Status",
    method: "GET",
    path: "/api/status/:dropId",
    icon: Network,
    description:
      "Provides real-time state of the drop without mutating or burning metadata. Useful for dashboards and automation.",
    request: "GET /api/status/d1f2e3c4",
    response: `{
  "success": true,
  "dropId": "d1f2e3c4",
  "exists": true,
  "claimed": false,
  "ipfsHash": "bafy...",
  "createdAt": 1699888000,
  "message": "Drop is active"
}`,
  },
];

export default function DocumentationPage() {
  return (
    <div className="container max-w-5xl px-4 pt-24 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-14"
      >
        <p className="text-sm uppercase tracking-widest text-blue-600 font-semibold">
          Documentation
        </p>
        <h1 className="mt-3 text-4xl font-bold text-gray-900">
          Syspec Drop API Reference
        </h1>
        <p className="mt-4 text-lg text-gray-600" id="quickstart">
          Syspec Drop is a BlockDAG-backed whistleblower platform. Integrate via
          a simple REST interface, handle passphrases securely, and never store
          decrypted content on your infrastructure.
        </p>
      </motion.div>

      <section id="architecture" className="mb-16 space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          High-Level Architecture
        </h2>
        <p className="text-gray-600">
          Uploads are AES-256-GCM encrypted in the browser, notarized on the
          BlockDAG ledger, and stored on IPFS for durability. Claim operations
          verify passphrases via the smart contract, decrypt server-side, and
          stream files back over HTTPS.
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-2">
          <li>
            Client generates passphrase entropy and derives symmetric keys.
          </li>
          <li>
            API persists encrypted payload to IPFS with content addressing.
          </li>
          <li>
            BlockDAG contract locks metadata and exposes a provable audit trail.
          </li>
          <li>
            Claim endpoint enforces passphrase verification and returns
            decrypted bytes.
          </li>
          <li>
            Status endpoint tracks lifecycle and supports unlimited claims.
          </li>
        </ul>
      </section>

      <section className="mb-16 space-y-6" id="endpoints">
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <Code className="h-5 w-5 text-blue-600" />
          REST Endpoints
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {endpoints.map((endpoint) => {
            const Icon = endpoint.icon;
            return (
              <Card key={endpoint.path} className="border-gray-200">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-gray-900">
                      {endpoint.name}
                    </CardTitle>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                      {endpoint.method}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Icon className="h-4 w-4 text-blue-500" />
                    <span>{endpoint.path}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {endpoint.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Sample Request
                    </p>
                    <pre className="mt-2 overflow-x-auto rounded-lg bg-gray-900 p-4 text-xs text-gray-100">
                      <code>{endpoint.request}</code>
                    </pre>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Sample Response
                    </p>
                    <pre className="mt-2 overflow-x-auto rounded-lg bg-gray-900 p-4 text-xs text-gray-100">
                      <code>{endpoint.response}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section id="security" className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Security, Compliance, and Best Practices
        </h2>
        <p className="text-gray-600">
          Syspec Drop aligns with NIST SP 800-53, ISO 27001, and HIPAA guidance
          for encrypted file transfer. Adhere to these recommendations when
          embedding the platform into your workflows.
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-2">
          <li>
            Always deliver passphrases out-of-band using a trusted
            communications channel.
          </li>
          <li>
            Rotate drop credentials regularly and monitor the BlockDAG explorer
            for unusual activity.
          </li>
          <li>
            Consider air-gapped handling for ultra-sensitive disclosures and
            enable strict device hygiene.
          </li>
          <li>
            Do not proxy claim responses; stream files directly to the end-user
            to avoid storing plaintext server-side.
          </li>
        </ul>
      </section>

      <section id="zk" className="mt-16 space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Zero-Knowledge Commitment Flow
        </h2>
        <p className="text-gray-600">
          During upload, Syspec Drop produces a zk commitment from the sender
          passphrase. When a receiver claims the drop, the commitment verifies
          knowledge of the original secret without revealing it. This preserves
          anonymity while preventing brute-force attempts against the API.
        </p>
      </section>
    </div>
  );
}
