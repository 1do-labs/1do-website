import type { Metadata } from "next";
import LegalPage from "../legal-page";

export const metadata: Metadata = {
  title: "Support | 1Do",
  description: "Support resources for 1Do wallet.",
};

export default function SupportPage() {
  return (
    <LegalPage
      eyebrow="Support"
      title="1Do Support"
      updated="June 23, 2026"
      intro="Find help for 1Do Wallet, EVM accounts, and the 1Do on-chain smart account runtime."
      sections={[
        {
          title: "Contact support",
          body: [
            "For product support, email support@1do.io.",
            "Include your browser, extension version, network, transaction hash if available, and a short description of the issue. Never send your Secret Recovery Phrase or private keys.",
          ],
        },
        {
          title: "What 1Do supports",
          body: [
            "1Do supports EVM-compatible networks only.",
            "1Do lets users create or import an EVM wallet and upgrade supported accounts to their own on-chain smart account runtime using EIP-7702 delegation.",
          ],
        },
        {
          title: "Common help topics",
          body: [
            "Create or import a wallet, connect to EVM dapps, review transactions, send assets, edit gas fees, and manage supported networks.",
            "If a dapp connection or transaction does not appear, check the selected account, selected network, and site connection permissions.",
          ],
        },
        {
          title: "Smart account runtime",
          body: [
            "The 1Do runtime is an on-chain smart account runtime for the user's account. It is not a custodial account and does not transfer ownership of private keys to 1Do.",
            "When enabled, supported EVM accounts can delegate to the 1Do runtime for smart account features. Users should review upgrade and transaction confirmations before approving.",
          ],
        },
        {
          title: "Safety",
          body: [
            "1Do will never ask for your Secret Recovery Phrase or private keys.",
            "Blockchain transactions are public and irreversible once confirmed. Always verify recipient addresses, websites, and transaction details.",
          ],
        },
        {
          title: "Legal and privacy",
          body: [
            "Privacy Policy: https://1do.io/privacy",
            "Terms of Use: https://1do.io/terms",
          ],
        },
      ]}
    />
  );
}
