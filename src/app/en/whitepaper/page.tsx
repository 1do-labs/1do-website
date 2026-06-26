import type { Metadata } from "next";
import { WhitepaperContent } from "../../whitepaper/whitepaper-content";

export const metadata: Metadata = {
  title: "1Do Protocol Whitepaper | 1Do",
  description:
    "The 1Do protocol whitepaper: wallet address as the app execution boundary, wallet runtime, app registry, and wallet-native asset model.",
};

export default function WhitepaperEnPage() {
  return <WhitepaperContent language="en" />;
}
