import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const questions = [
  {
    id: "upload-security",
    question: "How is my upload protected before it reaches the API?",
    answer:
      "Files are read as Uint8Array in the browser, encrypted with AES-256-GCM using a passphrase-derived key, and only then sent to the API. The API never receives unencrypted payloads without the client opting in.",
  },
  {
    id: "claim-behavior",
    question: "Can multiple people claim the same drop?",
    answer:
      "Yes. Syspec Drop V3 keeps metadata available indefinitely, allowing unlimited claims with the correct Drop ID and passphrase. This supports multi-party disclosures and audit requirements.",
  },
  {
    id: "bin-files",
    question: "Why do downloads never end with .bin anymore?",
    answer:
      "The claim endpoint now returns fileType and mimeType fields. The client renames the payload before download so the original extension is restored. Any unexpected .bin result is rejected by the UI.",
  },
  {
    id: "support",
    question: "Where do I report a security issue?",
    answer:
      "Email security@syspecdrop.io with a detailed description, reproduction steps, and affected drop identifiers. We respond within 24 hours and follow coordinated disclosure guidelines.",
  },
  {
    id: "compliance",
    question: "Is the platform compliant with major regulations?",
    answer:
      "Yes. Syspec Drop aligns with NIST SP 800-53, ISO 27001, and HIPAA transport security controls. All sensitive data is encrypted in transit and at rest, with audit trails recorded on BlockDAG.",
  },
];

export default function FAQPage() {
  return (
    <div className="container max-w-3xl px-4 pt-24 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <p className="text-sm uppercase tracking-wider text-blue-600 font-semibold">
          FAQ
        </p>
        <h1 className="mt-2 text-4xl font-bold text-gray-900">
          Answers to common questions
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Explore the most frequently asked questions about secure drops, claim
          workflows, and platform guarantees.
        </p>
      </motion.div>

      <Accordion type="single" collapsible className="space-y-4">
        {questions.map((item) => (
          <AccordionItem
            key={item.id}
            value={item.id}
            className="border border-gray-200 rounded-xl px-4"
          >
            <AccordionTrigger className="text-left text-base font-semibold text-gray-900">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 text-sm leading-relaxed">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
