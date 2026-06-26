import type { Metadata } from "next";
import LegalPage from "../legal-page";

export const metadata: Metadata = {
  title: "Terms of Use | 1Do",
  description: "Terms of use for 1Do wallet and website.",
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Terms of Use"
      title="Terms of Use"
      updated="April 23, 2026"
      intro="These terms apply to your use of 1Do websites, wallet software, smart-account runtime features, and related materials. By using 1Do, you agree to use the software responsibly and at your own risk."
      sections={[
        {
          title: "Self-custodial software",
          body: [
            "1Do is self-custodial software. You control your accounts, private keys, Secret Recovery Phrase, signatures, transaction approvals, smart-account configuration, and any custom delegate or EIP-7702 logic you enable.",
            "1Do cannot recover lost keys, reverse blockchain transactions, cancel finalized transactions, or guarantee the behavior of third-party contracts or applications.",
          ],
        },
        {
          title: "Your responsibilities",
          body: [
            "You are responsible for verifying transaction details, contract addresses, RPC endpoints, connected applications, network selection, and custom delegate code before approval.",
            "You must comply with applicable laws and must not use 1Do to violate rights, perform fraud, distribute malware, attack networks, or abuse third-party services.",
          ],
        },
        {
          title: "No financial advice",
          body: [
            "1Do does not provide investment, financial, legal, tax, or trading advice. Any token, application, price, balance, or transaction display is informational and may be incomplete or inaccurate.",
            "You are solely responsible for evaluating risks before interacting with digital assets, smart contracts, bridges, swaps, faucets, or applications.",
          ],
        },
        {
          title: "Third-party applications and networks",
          body: [
            "1Do may connect you to third-party networks, RPC providers, block explorers, token metadata services, price feeds, websites, and decentralized applications.",
            "Those services are not controlled by 1Do and may have their own terms, fees, outages, security risks, or privacy practices.",
          ],
        },
        {
          title: "Software availability",
          body: [
            "1Do may change, suspend, or discontinue features at any time. Testnet features, experimental EIP-7702 functionality, and developer tools may change without notice.",
            "The software is provided on an as-is and as-available basis, without warranties to the maximum extent permitted by law.",
          ],
        },
        {
          title: "Contact",
          body: [
            "For terms, privacy, support, or security questions, contact support@1do.io.",
          ],
        },
      ]}
    />
  );
}
