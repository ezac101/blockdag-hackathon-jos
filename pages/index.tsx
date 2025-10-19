import type { ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  Lock,
  Zap,
  Eye,
  Database,
  Package,
  Upload,
  Download,
  CheckCircle,
} from "lucide-react";
import { CardStack, CardStackItem } from "@/components/ui/card-stack";
import { FloatingOrbs, ParticleOrbit } from "@/components/ui/particle-effects";
import { Meteors } from "@/components/ui/meteors";
import ColourfulText from "@/components/ui/colourful-text";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  type FAQItem = {
    question: string;
    answer: ReactNode;
  };
  const chainMailHighlights = [
    "No signup, wallet-based",
    "End-to-end encrypted",
    "Immutable records",
  ];

  const features: CardStackItem[] = [
    {
      id: 1,
      title: "No IDs Required",
      description:
        "Zero identification. No accounts, no emails, no tracking. Complete anonymity.",
      icon: <Eye className="h-12 w-12" />,
    },
    {
      id: 2,
      title: "Quantum-Secure Encryption",
      description:
        "Post-quantum cryptography protects against future quantum computer attacks.",
      icon: <Lock className="h-12 w-12" />,
    },
    {
      id: 3,
      title: "Decentralized Storage",
      description:
        "Files stored on IPFS. No central server can access or censor your data.",
      icon: <Database className="h-12 w-12" />,
    },
    {
      id: 4,
      title: "BlockDAG Immutable",
      description:
        "Tamper-proof metadata on distributed ledger. Verifiable and permanent.",
      icon: <Package className="h-12 w-12" />,
    },
    {
      id: 5,
      title: "Zero-Knowledge Proofs",
      description:
        "Claim files without revealing identity or creating links between parties.",
      icon: <Zap className="h-12 w-12" />,
    },
    {
      id: 6,
      title: "Persistent Storage",
      description:
        "Files remain accessible on IPFS. Claim them anytime with your credentials.",
      icon: <Shield className="h-12 w-12" />,
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Sender Uploads",
      description:
        "Encrypt file with passphrase, upload to IPFS, store metadata on BlockDAG.",
    },
    {
      step: "2",
      title: "Share Passphrase",
      description:
        "Securely share the generated passphrase through your chosen secure channel.",
    },
    {
      step: "3",
      title: "Receiver Claims",
      description:
        "Enter passphrase, verify with ZK proof, download and decrypt file locally.",
    },
    {
      step: "4",
      title: "Access Anytime",
      description:
        "File remains accessible. Download again anytime with the same credentials.",
    },
  ];

  const faqs: FAQItem[] = [
    {
      question: "How secure is the encryption?",
      answer:
        "We use post-quantum cryptography (libsodium) with NIST-approved algorithms. All encryption happens client-side in your browser, ensuring your passphrase never leaves your device.",
    },
    {
      question: "Can anyone trace my upload or download?",
      answer:
        "No. We don't collect IPs, require accounts, or create any identifiable links. Zero-Knowledge Proofs ensure claiming a file doesn't reveal your identity. Use Tor for additional network-level anonymity.",
    },
    {
      question: "What happens if I lose the passphrase?",
      answer:
        "The file is permanently inaccessible. We cannot recover it. The passphrase is the only key, and we never store it. Make sure to securely share and backup your passphrase.",
    },
    {
      question: "Is this compliant with legal standards?",
      answer:
        "The platform implements NIST/ISO security standards. However, users are responsible for ensuring their use complies with local laws. This tool is designed for legitimate whistleblowing and secure communication.",
    },
    {
      question: "How long do files stay available?",
      answer:
        "Files remain accessible on IPFS indefinitely as long as the network maintains them. You can claim your drop multiple times using the same Drop ID and passphrase.",
    },
    {
      question: "What is ChainMail?",
      answer:
        "ChainMail is a decentralized email protocol built on BlockDAG smart contracts. Every message is end-to-end encrypted with OpenPGP and persisted immutably via IPFS so your communications stay censorship-resistant and verifiable.",
    },
    {
      question: "What features does ChainMail provide?",
      answer: (
        <ul className="list-disc space-y-2 pl-5">
          <li>
            OpenPGP encryption on every email before it ever leaves your
            browser.
          </li>
          <li>
            Immutable metadata recorded on-chain through dedicated smart
            contracts.
          </li>
          <li>
            Encrypted payloads stored on IPFS for decentralised durability.
          </li>
          <li>
            MetaMask wallet authentication plus on-chain public key registry for
            seamless key exchange.
          </li>
          <li>
            Gasless relay service using meta-transactions so recipients can
            communicate without holding native tokens.
          </li>
        </ul>
      ),
    },
    {
      question: "What powers the ChainMail stack?",
      answer: (
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Frontend built with Next.js 15, React 19, TypeScript, Tailwind CSS,
            Radix UI, and Lucide Icons.
          </li>
          <li>
            Blockchain integrations handled via Ethers.js v6 and Solidity
            contracts on BlockDAG.
          </li>
          <li>
            Encryption implemented with OpenPGP.js, mirrored to IPFS using the
            HTTP API.
          </li>
        </ul>
      ),
    },
    {
      question: "What do I need before using ChainMail?",
      answer: (
        <ul className="list-disc space-y-2 pl-5">
          <li>Node.js 18 or newer with your package manager of choice.</li>
          <li>A MetaMask or compatible Web3 wallet for signing.</li>
          <li>
            Access to a supported blockchain network (testnet or mainnet).
          </li>
          <li>
            An IPFS node or gateway connectivity to persist encrypted payloads.
          </li>
        </ul>
      ),
    },
  ];

  return (
    <div className="relative bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400">
        {/* Enhanced Meteors Effect */}
        <div className="absolute inset-0 overflow-hidden">
          <Meteors number={40} className="opacity-80" />
        </div>

        {/* Background Image on Right Side */}
        <div className="absolute right-0 top-0 bottom-0 w-[55%] hidden lg:block">
          <div className="relative w-full h-full">
            <Image
              src="/referral-hero.webp"
              alt="Secure File Sharing"
              fill
              className="object-cover object-right opacity-20"
              priority
            />
          </div>
        </div>

        <div className="container relative z-10 px-4 py-12">
          {/* Centered Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block mb-6 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20"
            >
              <span className="text-white/90 text-sm font-medium">
                100% Anonymous Secure File Sharing
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight"
            >
              Secure communication system for text and files
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-lg md:text-xl text-white/90 mb-8 max-w-3xl mx-auto"
            >
              Share sensitive files without revealing identities. Military-grade
              encryption, decentralized storage, and zero-knowledge privacy.
              Inspired by Julian Assange.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/sender">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30 shadow-lg"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Send Anonymous Drop
                </Button>
              </Link>
              <Link href="/receiver">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Claim a Drop
                </Button>
              </Link>
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50"
                asChild
              >
                <a
                  href="https://chainmail-delta.vercel.app/login"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Send Anonymous Emails
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ChainMail Spotlight */}
      <section id="chainmail" className="py-20 bg-white">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center justify-center gap-2 px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-4">
              <span role="img" aria-label="ChainMail">
                📧
              </span>
              <span>ChainMail</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Decentralized Email
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              ChainMail extends Syspec Drop&apos;s trustless architecture to
              wallet-native messaging, delivering end-to-end encrypted
              communications without centralized custody.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              {chainMailHighlights.map((highlight) => (
                <div
                  key={highlight}
                  className="flex items-start gap-3 p-6 rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-1" />
                  <p className="text-gray-700 font-medium">{highlight}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              End-to-end encrypted file sharing with zero-knowledge privacy
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 text-2xl font-bold mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Client-Side Encryption
              </h3>
              <p className="text-gray-600">
                Your browser encrypts the file with AES-256-GCM before upload. A
                unique passphrase is generated and never sent to our servers.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 text-2xl font-bold mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Decentralized Storage
              </h3>
              <p className="text-gray-600">
                Encrypted file chunks are distributed across IPFS nodes.
                Zero-knowledge proof is recorded on BlockDAG ledger for
                verification.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 text-2xl font-bold mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Secure Retrieval
              </h3>
              <p className="text-gray-600">
                Recipient uses Drop ID and passphrase to fetch and decrypt. File
                is decrypted client-side only - we never see the contents.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features CardStack */}
      <section className="py-20 bg-blue-50">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Security Assurances
            </h2>
            <p className="text-gray-600 text-lg">
              Military-grade security meets absolute anonymity
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            <CardStack items={features} className="max-w-2xl" />
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="container px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 text-lg">
              Everything you need to know about secure anonymous drops
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left hover:text-blue-600 transition-colors text-gray-900">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-50">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Ready to Drop Securely?
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              No accounts. No tracking. Just secure, anonymous file sharing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sender">
                <Button
                  size="lg"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Start Sending
                </Button>
              </Link>
              <Link href="/status">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Check Drop Status
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
