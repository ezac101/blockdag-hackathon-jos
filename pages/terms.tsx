const commitments = [
  {
    title: "Acceptance of Terms",
    points: [
      "By accessing Syspec Drop you agree to these Terms of Service and the Privacy Policy.",
      "If you represent an organization, you confirm you have authority to bind that organization.",
    ],
  },
  {
    title: "Permitted Use",
    points: [
      "Use the platform to exchange encrypted information lawfully and responsibly.",
      "Do not attempt to infiltrate other users' drops, disrupt service availability, or reverse engineer the platform.",
    ],
  },
  {
    title: "Accounts and Credentials",
    points: [
      "Syspec Drop operates without user accounts. Protect passphrases and drop IDs shared with you.",
      "You acknowledge that anyone in possession of valid credentials can retrieve the corresponding drop.",
    ],
  },
  {
    title: "Content Ownership",
    points: [
      "Senders retain full ownership of uploaded files. Syspec Drop does not claim rights over the content.",
      "You warrant that you have the legal right to disclose any material you upload.",
    ],
  },
  {
    title: "Security Responsibilities",
    points: [
      "We employ AES-256-GCM, IPFS storage, and BlockDAG notarization. You remain responsible for safeguarding passphrases and claimant environments.",
      "Notify security@syspecdrop.io immediately if you suspect credential compromise or data exposure.",
    ],
  },
  {
    title: "Service Availability",
    points: [
      "We aim for 99.9% uptime but do not guarantee uninterrupted access. Scheduled maintenance notices are posted on the status dashboard.",
      "We may suspend the service to mitigate active threats or comply with legal orders.",
    ],
  },
  {
    title: "Limitations of Liability",
    points: [
      'Syspec Drop is provided "as is" without warranties of any kind.',
      "To the fullest extent permitted by law, our aggregate liability shall not exceed USD $100.",
    ],
  },
  {
    title: "Updates",
    points: [
      "We may revise these terms to reflect new features or regulatory requirements. Material changes are announced via the status page and email alerts.",
      "Continued use after updates constitutes acceptance of the revised terms.",
    ],
  },
];

export default function TermsOfServicePage() {
  return (
    <div className="container max-w-4xl px-4 pt-24 pb-16">
      <header className="mb-12 text-center">
        <p className="text-sm uppercase tracking-wider text-blue-600 font-semibold">
          Terms of Service
        </p>
        <h1 className="mt-2 text-4xl font-bold text-gray-900">
          Conditions for using Syspec Drop
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Effective October 2025. Review these commitments before transmitting
          or retrieving sensitive disclosures.
        </p>
      </header>

      <div className="space-y-10 text-gray-700">
        {commitments.map((section) => (
          <section key={section.title}>
            <h2 className="text-2xl font-semibold text-gray-900">
              {section.title}
            </h2>
            <ul className="mt-4 space-y-2 list-disc list-inside">
              {section.points.map((point) => (
                <li key={point} className="leading-relaxed">
                  {point}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
