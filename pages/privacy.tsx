const sections = [
  {
    title: "Overview",
    body: [
      "Syspec Drop safeguards whistleblower communications by minimizing personal data processing. This privacy notice explains what we collect, why it is required, and the controls available to senders and receivers.",
    ],
  },
  {
    title: "Data We Collect",
    body: [
      "Uploads: Encrypted file payloads, generated Drop IDs, IPFS content identifiers, and BlockDAG transaction hashes.",
      "Credentials: Passphrases are generated and stored client-side. We never persist passphrases server-side.",
      "Telemetry: Aggregated uptime metrics, API latency, and error rates with no IP addresses or device fingerprints.",
    ],
  },
  {
    title: "How We Use Data",
    body: [
      "Fulfill secure file sharing requests, including decrypting and streaming files during claim operations.",
      "Maintain verifiable audit trails for compliance, ensuring drops remain immutable on BlockDAG.",
      "Detect abuse patterns such as credential stuffing and denial-of-service attacks.",
    ],
  },
  {
    title: "Data Retention",
    body: [
      "Encrypted payloads and associated metadata remain available to honor unlimited claims.",
      "Operational logs are retained for 30 days and purged automatically.",
      "Security incident artifacts are stored for the duration of the investigation and deleted afterward.",
    ],
  },
  {
    title: "Security Controls",
    body: [
      "AES-256-GCM encryption for all files, both in transit and at rest via IPFS storage nodes.",
      "Zero-knowledge commitments ensure passphrases are never disclosed to the platform.",
      "Strict access controls, hardware security modules, and continuous configuration monitoring.",
    ],
  },
  {
    title: "Your Rights",
    body: [
      "Right to deletion: request permanent removal of an encrypted payload by emailing privacy@syspecdrop.io.",
      "Right to access: obtain a copy of metadata we maintain about your drop.",
      "Right to restriction: suspend automated analysis of a drop pending review.",
    ],
  },
  {
    title: "Contact",
    body: [
      "Reach the privacy desk at privacy@syspecdrop.io. Include the Drop ID or transaction hash so we can process your request quickly.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-4xl px-4 pt-24 pb-16">
      <header className="mb-12 text-center">
        <p className="text-sm uppercase tracking-wider text-blue-600 font-semibold">
          Privacy Policy
        </p>
        <h1 className="mt-2 text-4xl font-bold text-gray-900">
          Protecting anonymity and personal data
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Updated October 2025. Syspec Drop adheres to global privacy standards
          while enabling anonymous disclosures.
        </p>
      </header>

      <div className="space-y-10 text-gray-700">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-2xl font-semibold text-gray-900">
              {section.title}
            </h2>
            <div className="mt-4 space-y-3">
              {section.body.map((paragraph) => (
                <p key={paragraph} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
