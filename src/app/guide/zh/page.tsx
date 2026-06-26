import React from "react";

const LINKS = {
  home: "/",
  app: "https://app.1do.io",
  store: "https://store.1do.io/en/apps",
  storeDex: "https://store.1do.io/en/apps/dex",
  appFaucet: "https://app.1do.io/faucet",
  appRedPacket: "https://app.1do.io/redpacket",
  appDex: "https://app.1do.io/dex",
  appNftMarket: "https://app.1do.io/nftmarket",
  sepoliaFaucet: "https://sepoliafaucet.com/",
  faucetUsdcCode: "https://sepolia.etherscan.io/address/0x78e8421FB1cB038bc63BC7450504eBe75d7d4725#code",
  faucetUsdtCode: "https://sepolia.etherscan.io/address/0x15F758653dBD7E64e20ad0AddBb4d43d773d369E#code",
};

const STEPS = [
  {
    id: "01",
    icon: "account_balance_wallet",
    title: "连接钱包并启用 1Do runtime",
    desc: "使用任意 EOA 钱包进入 1Do；如果当前地址还没启用 7702，就先完成 1Do runtime 激活。之后这个地址就能直接作为你的账户运行环境。",
    links: [{ label: "打开 1Do", href: LINKS.app }],
  },
  {
    id: "02",
    icon: "local_gas_station",
    title: "准备 Gas 并领取测试资产",
    desc: "先向 1Do 钱包转入 Sepolia 测试 ETH（gas），再到 1Do Faucet 领取测试 USDC / USDT / 1DO + NFT。",
    links: [
      { label: "Sepolia Faucet", href: LINKS.sepoliaFaucet },
      { label: "1Do Faucet", href: LINKS.appFaucet },
    ],
  },
  {
    id: "03",
    icon: "apps",
    title: "在 Store 启用 Dex",
    desc: "在 Store 中为当前地址启用 Dex。完成后，Dex 才会在你的 1Do 钱包 runtime 中出现并可用。",
    links: [
      { label: "打开 Store", href: LINKS.store },
      { label: "启用 Dex", href: LINKS.storeDex },
    ],
  },
  {
    id: "04",
    icon: "rocket_launch",
    title: "钱包内置 / Store 启用应用",
    desc: "Red Packet 是钱包内置功能；Dex、NFT Market、Flash Loan、Will、Session Pay 是 Store 启用后通过 runtime 运行的 app。",
    links: [
      { label: "Red Packet（钱包内置）", href: LINKS.appRedPacket },
      { label: "Dex（已启用应用）", href: LINKS.appDex },
      { label: "NFT Market", href: LINKS.appNftMarket },
    ],
  },
] as const;

const FAQ = [
  {
    q: "看不到 7702 激活入口",
    a: "确认当前网络是 Sepolia（11155111），并重新连接钱包后再试。激活入口只会在尚未启用 1Do runtime 的地址上出现。",
  },
  {
    q: "Faucet 或 Store 启用失败",
    a: "通常是网络不对或 gas 不足。请先确认 Sepolia 网络，并确保钱包里有少量测试 ETH。",
  },
  {
    q: "启用之后 Dex 还没显示",
    a: "等待链上确认和前端轮询同步（通常 10-30 秒），然后刷新 1Do 页面。",
  },
] as const;

const STEP_ACCENTS = [
  "from-pink-100 to-rose-100",
  "from-amber-100 to-orange-100",
  "from-sky-100 to-cyan-100",
  "from-indigo-100 to-violet-100",
] as const;

export default function ChineseGuidePage() {
  return (
    <div className="relative min-h-screen overflow-hidden selection:bg-pink-500/30 selection:text-pink-900">
      <div className="background-container opacity-60">
        <div className="background-shape shape1 mix-blend-multiply" />
        <div className="background-shape shape2 mix-blend-multiply" />
        <div className="background-shape shape3 mix-blend-multiply" />
      </div>

      <main className="relative z-10 px-4 sm:px-10 py-10 sm:py-14">
        <div className="max-w-6xl mx-auto space-y-6">
          <a
            href={LINKS.home}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-white/70 text-sm font-medium text-[#1B0D15] hover:bg-white transition-colors"
          >
            <span className="material-symbols-outlined !text-base">arrow_back</span>
            返回官网
          </a>

          <section className="frosted-glass rounded-[2.4rem] p-6 sm:p-8 bg-[linear-gradient(180deg,rgba(255,255,255,0.66),rgba(255,255,255,0.36))]">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono tracking-widest uppercase bg-white/65 border border-white/70 text-[#1B0D15]/70">
              Chinese Guide
            </span>
            <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-[#1B0D15]">
              1Do 官网中文指导
            </h1>
            <p className="mt-2 text-sm text-[#1B0D15]/65">
              官网路径：`/guide/zh`。从连接钱包、激活 1Do runtime，到 Store 启用 Dex，再到打开运行在账户内的应用，按步骤完成即可。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={LINKS.app}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-full bg-[#1B0D15] text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                打开 1Do
              </a>
              <a
                href={LINKS.store}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-full bg-white/70 border border-white/70 text-[#1B0D15] text-sm font-medium hover:bg-white transition-colors"
              >
                打开 Store
              </a>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 frosted-glass rounded-[2rem] p-5 sm:p-7 bg-white/50 border border-white/70">
              <div className="relative">
                <div className="absolute left-[1.4rem] top-0 bottom-0 w-px bg-gradient-to-b from-[#1B0D15]/25 via-[#1B0D15]/10 to-transparent" />
                <div className="space-y-7">
                  {STEPS.map((step, index) => (
                    <article key={step.id} className="relative pl-14">
                      <span className="absolute left-0 top-2 w-11 h-11 rounded-2xl bg-[#1B0D15] text-white flex items-center justify-center shadow-lg shadow-black/20">
                        <span className="material-symbols-outlined !text-[18px]">{step.icon}</span>
                      </span>
                      <div className="rounded-2xl bg-white/80 border border-white/90 px-4 py-4 sm:px-5 sm:py-5 shadow-[0_14px_34px_-22px_rgba(17,12,34,0.45)]">
                        <div className="flex items-center justify-between gap-3">
                          <h2 className="text-base sm:text-lg font-semibold text-[#1B0D15]">{step.title}</h2>
                          <span className={`inline-flex shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r ${STEP_ACCENTS[index]} text-[#1B0D15]/75`}>
                            STEP {step.id}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-[#1B0D15]/75 leading-relaxed">{step.desc}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {step.links.map((link) => (
                            <a
                              key={`${step.id}-${link.label}`}
                              href={link.href}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/85 border border-white/95 text-xs font-medium text-[#1B0D15] hover:bg-[#1B0D15] hover:text-white transition-colors"
                            >
                              {link.label}
                              <span className="material-symbols-outlined !text-sm">open_in_new</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[linear-gradient(145deg,#120a0f,#22131c)] text-white rounded-[2rem] p-5 sm:p-6 border border-white/10 shadow-[0_30px_60px_-35px_rgba(0,0,0,0.6)]">
                <h3 className="text-base font-semibold">应用类型：钱包内置 / Store 启用</h3>
                <p className="mt-1 text-xs text-white/70">运行在以太坊 Sepolia 测试网。钱包内置能力默认可用，Store 启用应用通过 1Do runtime 运行。</p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-white/10 border border-white/10 p-3">
                    <p className="text-xs uppercase tracking-widest text-white/60">钱包内置</p>
                    <p className="mt-1 text-sm font-medium">Red Packet</p>
                    <p className="mt-1 text-xs text-white/70">默认可用，属于 1Do 钱包内置路径，无需先在 Store 启用。</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 border border-white/10 p-3">
                    <p className="text-xs uppercase tracking-widest text-white/60">Store 启用</p>
                    <p className="mt-1 text-sm font-medium">Dex / NFT Market / Flash Loan / Will / Session Pay</p>
                    <p className="mt-1 text-xs text-white/70">需先在 Store 启用，随后在你的 1Do 钱包中可用。</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white/85 to-white/60 rounded-[2rem] border border-white/80 p-5 sm:p-6 shadow-[0_15px_35px_-24px_rgba(30,27,75,0.5)]">
                <h3 className="text-base font-semibold text-[#1B0D15]">常见问题</h3>
                <div className="mt-3 space-y-2">
                  {FAQ.map((item) => (
                    <details key={item.q} className="group rounded-xl bg-white/80 border border-white/90 px-3 py-2">
                      <summary className="cursor-pointer text-sm font-medium text-[#1B0D15] list-none flex items-center justify-between gap-2">
                        <span>{item.q}</span>
                        <span className="material-symbols-outlined !text-base text-[#1B0D15]/50 group-open:rotate-45 transition-transform">add</span>
                      </summary>
                      <p className="mt-2 text-xs text-[#1B0D15]/75">{item.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
