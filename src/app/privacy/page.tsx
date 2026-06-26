import type { Metadata } from "next";
import LegalPage from "../legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy | 1Do",
  description: "Privacy policy for 1Do wallet and website.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy Policy"
      title="Privacy Policy"
      updated="April 23, 2026"
      intro="1Do is self-custodial wallet software and an app platform for smart accounts. This policy explains what information may be processed when you use 1Do websites, wallet software, and related services."
      sections={[
        {
          title: "Self-custody first",
          body: [
            "1Do does not ask for, store, or manage your Secret Recovery Phrase, private keys, wallet password, or signing keys. You are responsible for keeping those credentials secure.",
            "Blockchain transactions, addresses, balances, signatures, and contract interactions are public or visible to the networks, RPC providers, block explorers, and applications you use.",
          ],
        },
        {
          title: "Information we may process",
          body: [
            "When you visit 1Do websites, standard web hosting logs may process information such as IP address, browser type, device information, requested URL, and timestamps for security, reliability, abuse prevention, and diagnostics.",
            "When you use wallet software, your selected RPC endpoint, connected websites, token lists, block explorers, price providers, or other third-party services may receive network requests needed to provide wallet functionality.",
            "If you contact us or submit feedback, we may process the contact information and content you provide so we can respond.",
          ],
        },
        {
          title: "Information we do not sell",
          body: [
            "We do not sell personal information. We do not use your Secret Recovery Phrase or private keys because we do not collect them.",
            "We do not intentionally collect payment card information through the wallet extension. Any third-party application you connect to is governed by its own privacy practices.",
          ],
        },
        {
          title: "Third-party services",
          body: [
            "1Do may rely on third-party infrastructure such as RPC providers, hosting providers, block explorers, token metadata providers, price feeds, faucet providers, and decentralized applications.",
            "Those services may process your IP address, wallet address, transaction data, and request metadata according to their own policies. You can reduce exposure by choosing trusted RPC endpoints and reviewing each connected app.",
          ],
        },
        {
          title: "Security and retention",
          body: [
            "We apply reasonable technical and organizational measures for the services we operate. No software or network service can be guaranteed to be completely secure.",
            "Website logs and operational data are retained only as long as reasonably needed for security, diagnostics, legal compliance, or service operation.",
          ],
        },
        {
          title: "Contact",
          body: [
            "For privacy questions, product support, or security reports, contact support@1do.io.",
          ],
        },
      ]}
    />
  );
}
