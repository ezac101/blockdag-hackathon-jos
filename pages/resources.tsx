import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Cloud, ShieldCheck, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const resourceGroups = [
  {
    title: "Getting Started",
    icon: BookOpen,
    description:
      "Kickstart secure file drops with quick-start guides and reference material.",
    links: [
      { label: "API Quickstart", href: "/docs#quickstart" },
      { label: "Sender Walkthrough", href: "/sender" },
      { label: "Receiver Checklist", href: "/receiver" },
    ],
  },
  {
    title: "Architecture",
    icon: Cloud,
    description:
      "Understand how IPFS, BlockDAG, and AES-256-GCM combine to protect every drop.",
    links: [
      { label: "System Architecture", href: "/docs#architecture" },
      { label: "Status Endpoint", href: "/status" },
      {
        label: "Architecture Whitepaper",
        href: "https://github.com/yourusername/syspec-drop/blob/main/ARCHITECTURE.md",
      },
    ],
  },
  {
    title: "Security",
    icon: ShieldCheck,
    description:
      "Review security posture, cryptographic primitives, and compliance statements.",
    links: [
      { label: "Security Overview", href: "/docs#security" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Zero-Knowledge Flow", href: "/docs#zk" },
    ],
  },
  {
    title: "Community",
    icon: Users,
    description:
      "Connect with the team, monitor releases, and request new capabilities.",
    links: [
      {
        label: "Release Notes",
        href: "https://github.com/yourusername/syspec-drop/releases",
      },
      {
        label: "Security Desk",
        href: "mailto:security@syspecdrop.io",
      },
      {
        label: "Join Discord",
        href: "https://discord.gg/syspecdrop",
      },
    ],
  },
];

export default function ResourcesPage() {
  return (
    <div className="container max-w-5xl px-4 pt-24 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <p className="text-sm uppercase tracking-wider text-blue-600 font-semibold">
          Resource Hub
        </p>
        <h1 className="mt-2 text-4xl font-bold text-gray-900">
          Everything you need to operate Syspec Drop safely
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Explore curated guides, compliance artifacts, and integration examples
          for both technical and non-technical teams.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/docs">Read the API documentation</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/faq">Visit the FAQ</Link>
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {resourceGroups.map((group) => {
          const Icon = group.icon;
          return (
            <Card key={group.title} className="border-gray-200">
              <CardHeader className="flex flex-row items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <CardTitle className="text-xl text-gray-900">
                    {group.title}
                  </CardTitle>
                  <p className="text-sm text-gray-600">{group.description}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {group.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      link.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <span>{link.label}</span>
                    <span className="text-xs text-gray-500">Open</span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
