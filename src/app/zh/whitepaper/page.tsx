import type { Metadata } from "next";
import { WhitepaperContent } from "../../whitepaper/whitepaper-content";

export const metadata: Metadata = {
  title: "1Do 协议白皮书 | 1Do",
  description:
    "1Do 协议白皮书：钱包地址作为应用执行边界、wallet runtime、app 注册表与 wallet-native 资产模型。",
};

export default function WhitepaperZhPage() {
  return <WhitepaperContent language="zh" />;
}
