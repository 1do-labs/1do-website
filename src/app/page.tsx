import React from "react";
import Image from "next/image";

const LINKS = {
  app: "https://app.1do.io",
  appFaucet: "https://app.1do.io/faucet",
  appRedPacket: "https://app.1do.io/redpacket",
  appPeerDex: "https://app.1do.io/peerdex",
  peerdexStandalone: "https://peerdex.vercel.app",
  store: "https://store.1do.io",
  storeApps: "https://store.1do.io/en/apps",
  storePeerDex: "https://store.1do.io/en/apps/peerdex",
  chineseGuide: "/guide/zh",
  docs: "https://docs.1do.io",
  labs: "https://labs.1do.io",
  sdk: "https://www.npmjs.com/package/@1doapp/sdk",
  sepoliaFaucet: "https://sepoliafaucet.com/",
  faucetUsdcCode: "https://sepolia.etherscan.io/address/0x9d4b951592c31dc042efDC4E1F8aE00718b96fe1#code",
  faucetUsdtCode: "https://sepolia.etherscan.io/address/0xdd7468f993c52fcF43Cef80c9a4e042de4920F2d#code",
};

const APPS = [
  { name: "PeerDex", icon: "/apps/peerdex.svg" },
  { name: "Flashman", icon: "/apps/flashman.svg" },
  { name: "CloseSky", icon: "/apps/closesky.svg" },
  { name: "CryptoWill", icon: "/apps/cryptowill.svg" },
  { name: "BlinkPay", icon: "/apps/blinkpay.svg" },
];

const BEGINNER_STEPS = [
  {
    id: "01",
    icon: "account_balance_wallet",
    title: "Connect your wallet",
    desc: "Use any EOA wallet to enter 1Do. If your address has not activated 7702 yet, enable the 1Do runtime first.",
    links: [{ label: "Open 1Do", href: LINKS.app }],
  },
  {
    id: "02",
    icon: "local_gas_station",
    title: "Fund Gas and Claim Test Assets",
    desc: "Fund your 1Do wallet with Sepolia ETH, then claim USDC/USDT/1DO + NFT assets in 1Do Faucet.",
    links: [
      { label: "Sepolia Faucet", href: LINKS.sepoliaFaucet },
      { label: "1Do Faucet", href: LINKS.appFaucet },
    ],
  },
  {
    id: "03",
    icon: "token",
    title: "Mint PeerDex App NFT in Store",
    desc: "In Store, mint PeerDex App NFT so it can appear and run in your account workspace.",
    links: [
      { label: "Open Store", href: LINKS.storeApps },
      { label: "Mint PeerDex", href: LINKS.storePeerDex },
    ],
  },
  {
    id: "04",
    icon: "rocket_launch",
    title: "System vs App NFT vs Standalone",
    desc: "Red Packet is ready in 1Do. Wallet PeerDex needs App NFT mint. PeerDex Standalone is separate.",
    links: [
      { label: "Red Packet (System APP)", href: LINKS.appRedPacket },
      { label: "Wallet PeerDex (App NFT)", href: LINKS.appPeerDex },
      { label: "PeerDex Standalone", href: LINKS.peerdexStandalone },
    ],
  },
] as const;

const STEP_ACCENTS = [
  "from-pink-100 to-rose-100",
  "from-amber-100 to-orange-100",
  "from-sky-100 to-cyan-100",
  "from-indigo-100 to-violet-100",
] as const;

const TROUBLESHOOTING = [
  {
    q: "7702 activation is not available",
    a: "Reconnect your wallet and make sure your network is Sepolia before enabling the 1Do runtime.",
  },
  {
    q: "Faucet or Mint failed",
    a: "Check gas balance first. This flow runs on Ethereum Sepolia testnet.",
  },
  {
    q: "PeerDex not visible after mint",
    a: "Wait for confirmation and refresh 1Do after 10-30 seconds.",
  },
] as const;

export default function Home() {
  return (
    <div className="relative w-full overflow-hidden selection:bg-pink-500/30 selection:text-pink-900">
      {/* 极简背景 - 还原清爽感 */}
      <div className="background-container opacity-60">
        <div className="background-shape shape1 mix-blend-multiply" />
        <div className="background-shape shape2 mix-blend-multiply" />
        <div className="background-shape shape3 mix-blend-multiply" />
      </div>

      {/* 顶部导航 */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 py-4 sm:py-5 pointer-events-none mix-blend-darken">
        <div className="pointer-events-auto flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
          <Image src="/onedo-icon.svg" alt="1Do" width={28} height={28} className="shrink-0" />
          <span className="font-bold tracking-tight text-xl">1Do</span>
        </div>
        
        <div className="pointer-events-auto hidden md:flex items-center gap-8 text-sm font-medium tracking-wide text-[#1B0D15]">
          <a href={LINKS.store} className="hover:text-indigo-600 transition-colors">STORE</a>
          <a href={LINKS.docs} className="hover:text-indigo-600 transition-colors">DOCS</a>
          <a href={LINKS.labs} className="hover:text-indigo-600 transition-colors">LABS</a>
        </div>
      </nav>

      <main className="relative z-10 w-full pb-12">
        
        {/* HERO SECTION */}
        <section className="min-h-screen flex flex-col justify-center px-4 sm:px-10 pt-10 sm:pt-20">
          
          <div className="relative flex flex-col items-start">
            {/* 行 1: 1DO - 还原纯色高级感 */}
            <h1 className="text-[26vw] leading-[0.75] font-bold tracking-tighter text-[#1B0D15] mix-blend-overlay opacity-90 select-none ml-[-1vw]">
              1DO
            </h1>
            
            {/* 行 2: SMART ACCOUNT */}
            <h1 className="text-[11vw] sm:text-[12vw] leading-[0.9] font-bold tracking-tighter text-outline hover:text-[#1B0D15] cursor-default select-none transition-colors duration-700 mt-2 sm:mt-0">
              SMART ACCOUNT
            </h1>

            {/* 右侧浮动的 Runtime 定义 - 此处增加颜色点缀 */}
            <div className="absolute top-[5%] right-0 max-w-[180px] sm:max-w-xs text-right hidden lg:block">
              <span className="block text-xs font-bold uppercase tracking-widest text-pink-600">
                WEB3 ACCOUNT RUNTIME
                <br />
                & DAPP STORE
              </span>
            </div>
            
            {/* 圆形 CTA - 保持之前好评的粉色阴影，但去除内部复杂渐变 */}
            <a 
              href={LINKS.app}
              target="_blank" 
              rel="noreferrer"
              className="absolute right-[5%] top-[65%] sm:top-auto sm:bottom-[10%] w-28 h-28 sm:w-48 sm:h-48 rounded-full bg-[#1B0D15] text-white flex items-center justify-center text-center p-4 
              shadow-[0_20px_50px_-10px_rgba(236,72,153,0.3)] hover:shadow-[0_30px_60px_-10px_rgba(236,72,153,0.5)] hover:scale-105 transition-all duration-500 group z-20 overflow-hidden"
            >
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-xs sm:text-lg font-medium opacity-80">Launch</span>
                <span className="text-lg sm:text-3xl font-bold italic">Runtime</span>
                <span className="material-symbols-outlined mt-1 text-base sm:text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-30 transition-opacity duration-700"></div>
            </a>
          </div>

          <div className="mt-12 sm:mt-8 sm:pl-4">
            <p className="text-sm font-mono opacity-60 tracking-tight">Universal EVM support. Compatible with any account</p>
          </div>
        </section>

        {/* CONTENT GRID */}
        <section className="px-4 sm:px-10 mt-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-min">
            
            {/* 1. 1DO STORE (7列) */}
            <div id="store" className="md:col-span-7 frosted-glass rounded-[3rem] p-8 sm:p-12 min-h-[420px] flex flex-col group relative overflow-hidden card-hover-effect">
               <div className="relative z-10 flex-1 flex flex-col">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-white/60 border border-white/40 flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-2xl opacity-60">apps</span>
                    </div>
                    <div>
                       <span className="block text-xs font-mono uppercase tracking-widest opacity-40">Ecosystem</span>
                       <span className="font-medium text-sm text-[#1B0D15]/70">1Do Store</span>
                    </div>
                 </div>
                 
                 <p className="text-3xl font-medium text-[#1B0D15] tracking-tight leading-tight mb-8">
                   Your Dapp. Your NFT.
                 </p>
               </div>
               
               {/* App Icons */}
               <div className="mt-auto flex flex-wrap gap-3 relative z-10">
                  {APPS.map((app) => (
                    <a 
                      key={app.name} 
                      href={LINKS.store} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/50 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    >
                       <Image src={app.icon} alt={app.name} width={20} height={20} />
                       <span className="text-sm font-medium text-[#1B0D15]">{app.name}</span>
                    </a>
                  ))}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-black/5 bg-white/20 text-xs opacity-50 hover:bg-white hover:opacity-100 transition-all cursor-pointer">
                    +
                  </div>
               </div>
            </div>

            {/* 2. CORE / SMART ACCOUNT (5列) */}
            <div id="core" className="md:col-span-5 frosted-glass rounded-[3rem] p-8 sm:p-12 min-h-[420px] flex flex-col group relative overflow-hidden card-hover-effect">
               <div className="relative z-10 flex-1 flex flex-col">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100/50 flex items-center justify-center shadow-sm">
                       <span className="material-symbols-outlined text-2xl text-indigo-900/70">hub</span>
                    </div>
                    <div>
                       <span className="block text-xs font-mono uppercase tracking-widest opacity-40">Infrastructure</span>
                       <span className="font-medium text-sm text-[#1B0D15]/70">1Do Account</span>
                    </div>
                 </div>
                 
                 <p className="text-3xl font-medium text-[#1B0D15] tracking-tight leading-tight opacity-80">
                   Your Account. Your Apps. Your World.
                 </p>
               </div>
               
               <div className="mt-auto w-full h-px bg-gradient-to-r from-indigo-900/10 to-transparent"></div>
               <a
                 href={LINKS.app}
                 target="_blank"
                 rel="noreferrer"
                 className="mt-6 inline-flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/50 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
               >
                 <Image src="/onedo-icon.svg" alt="1Do" width={20} height={20} />
                 <span className="text-sm font-medium text-[#1B0D15]">1Do</span>
               </a>
            </div>

            {/* 3. DEVELOPERS (8列) - 保持深色高级感 */}
            <a href={LINKS.sdk} target="_blank" rel="noreferrer" className="md:col-span-8 bg-[#0F080C] text-white rounded-[3rem] p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between !border-none group relative overflow-hidden md:h-[240px] hover:bg-[#1a1216] transition-colors duration-500">
               <div className="relative z-10 max-w-lg">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="p-1.5 bg-white/10 rounded-lg">
                        <span className="material-symbols-outlined text-xl text-white/90">terminal</span>
                     </div>
                     <span className="font-mono text-xs border border-white/10 bg-white/5 px-2 py-1 rounded text-white/60">npm i @1doapp/sdk</span>
                  </div>
                  <h3 className="text-3xl font-light tracking-tight mb-2">Developers</h3>
               </div>
               
               {/* 装饰箭头 */}
               <div className="w-14 h-14 rounded-full border border-white/10 bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all mt-6 sm:mt-0 self-end sm:self-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">arrow_forward</span>
               </div>
            </a>

            {/* 4. LABS (4列) */}
            <a href={LINKS.labs} target="_blank" rel="noreferrer" id="labs" className="md:col-span-4 frosted-glass rounded-[3rem] p-8 flex flex-col justify-between card-hover-effect group md:h-[240px] relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/50 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity opacity-50 group-hover:opacity-80"></div>

               <div className="flex items-center justify-between relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100/50 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
                      <span className="material-symbols-outlined text-2xl text-purple-900/60">science</span>
                  </div>
                  <span className="material-symbols-outlined text-xl opacity-30 group-hover:rotate-45 transition-transform">arrow_outward</span>
               </div>
               
               <div className="relative z-10 mt-4">
                 <h3 className="text-3xl font-light tracking-tight mb-1 text-[#1B0D15]">Labs</h3>
                 <p className="text-sm opacity-60 font-medium text-[#1B0D15]/80 leading-tight font-mono">
                   Redefine Web3
                 </p>
               </div>
            </a>

          </div>
        </section>

        {/* BEGINNER GUIDE */}
        <section id="beginner-guide" className="px-4 sm:px-10 mt-8">
          <div className="frosted-glass rounded-[3rem] p-6 sm:p-10 relative overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.62),rgba(255,255,255,0.35))]">
            <div className="absolute -top-16 -right-20 w-60 h-60 rounded-full bg-gradient-to-br from-pink-200/40 to-indigo-200/40 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-12 w-64 h-64 rounded-full bg-gradient-to-br from-emerald-200/25 to-cyan-200/20 blur-3xl pointer-events-none" />
            <div className="absolute inset-0 opacity-20 pointer-events-none [background-image:radial-gradient(circle_at_1px_1px,rgba(27,13,21,0.18)_1px,transparent_0)] [background-size:18px_18px]" />

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono tracking-widest uppercase bg-white/60 border border-white/60 text-[#1B0D15]/70">
                    Quick Start
                  </span>
                  <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-[#1B0D15]">
                    1Do Onboarding Tutorial
                  </h2>
                  <p className="mt-2 text-sm text-[#1B0D15]/65 max-w-3xl">
                    Start from any EOA wallet, create your 1Do wallet (which is your smart account), then complete the app flow.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <a
                    href={LINKS.app}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-full bg-[#1B0D15] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Open 1Do
                  </a>
                  <a
                    href={LINKS.store}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-full bg-white/70 border border-white/70 text-[#1B0D15] text-sm font-medium hover:bg-white transition-colors"
                  >
                    Open Store
                  </a>
                  <a
                    href={LINKS.chineseGuide}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-full bg-white/70 border border-white/70 text-[#1B0D15] text-sm font-medium hover:bg-white transition-colors"
                  >
                    Chinese Guide
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-white/45 rounded-[2rem] border border-white/60 p-5 sm:p-7">
                  <div className="relative">
                    <div className="absolute left-[1.4rem] top-0 bottom-0 w-px bg-gradient-to-b from-[#1B0D15]/25 via-[#1B0D15]/10 to-transparent" />
                    <div className="space-y-7">
                      {BEGINNER_STEPS.map((step, index) => (
                        <article key={step.id} className="relative pl-14">
                          <span className="absolute left-0 top-2 w-11 h-11 rounded-2xl bg-[#1B0D15] text-white flex items-center justify-center shadow-lg shadow-black/20">
                            <span className="material-symbols-outlined !text-[18px]">{step.icon}</span>
                          </span>
                          <div className="group rounded-2xl bg-white/75 border border-white/80 px-4 py-4 sm:px-5 sm:py-5 shadow-[0_14px_34px_-22px_rgba(17,12,34,0.45)] transition-all duration-300 hover:-translate-y-1 hover:bg-white">
                            <div className="flex items-center justify-between gap-3">
                              <h3 className="text-base sm:text-lg font-semibold text-[#1B0D15]">
                                {step.title}
                              </h3>
                              <span className={`inline-flex shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r ${STEP_ACCENTS[index]} text-[#1B0D15]/75`}>
                                STEP {step.id}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-[#1B0D15]/75 leading-relaxed">
                              {step.desc}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {step.links.map((link) => (
                                <a
                                  key={`${step.id}-${link.label}`}
                                  href={link.href}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/80 border border-white/90 text-xs font-medium text-[#1B0D15] hover:bg-[#1B0D15] hover:text-white transition-colors"
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

                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-[linear-gradient(145deg,#120a0f,#22131c)] text-white rounded-[2rem] p-5 sm:p-6 border border-white/10 shadow-[0_30px_60px_-35px_rgba(0,0,0,0.6)]">
                    <h3 className="text-base font-semibold">App Types: System / App NFT / Standalone Platform</h3>
                    <p className="mt-1 text-xs text-white/70">Runs on Ethereum Sepolia testnet. System and App NFT run in Runtime; Standalone is separate.</p>

                    <div className="mt-4 space-y-3">
                      <div className="rounded-2xl bg-white/10 border border-white/10 p-3">
                        <p className="text-xs uppercase tracking-widest text-white/60">System App</p>
                        <p className="mt-1 text-sm font-medium">Red Packet (Runtime)</p>
                        <p className="mt-1 text-xs text-white/70">Available by default inside 1Do, no mint required.</p>
                      </div>
                      <div className="rounded-2xl bg-white/10 border border-white/10 p-3">
                        <p className="text-xs uppercase tracking-widest text-white/60">App NFT</p>
                        <p className="mt-1 text-sm font-medium">PeerDex (Wallet App)</p>
                        <p className="mt-1 text-xs text-white/70">Mint in Store first, then it appears inside 1Do.</p>
                      </div>
                      <div className="rounded-2xl bg-white/10 border border-white/10 p-3">
                        <p className="text-xs uppercase tracking-widest text-white/60">Standalone Platform</p>
                        <p className="mt-1 text-sm font-medium">PeerDex Standalone Trading Platform</p>
                        <p className="mt-1 text-xs text-white/70">Separate from wallet-embedded wallet apps.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-white/80 to-white/55 rounded-[2rem] border border-white/70 p-5 sm:p-6 shadow-[0_15px_35px_-24px_rgba(30,27,75,0.5)]">
                    <h3 className="text-base font-semibold text-[#1B0D15]">Troubleshooting</h3>
                    <div className="mt-3 space-y-2">
                      {TROUBLESHOOTING.map((item) => (
                        <details key={item.q} className="group rounded-xl bg-white/75 border border-white/80 px-3 py-2">
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
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-10 px-6 sm:px-10 border-t border-black/5 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 opacity-60">
           <div>
              <p className="font-bold tracking-tight text-lg text-[#1B0D15]">1Do</p>
              <p className="text-xs mt-1">© {new Date().getFullYear()} 1Do. All rights reserved.</p>
           </div>
           <div className="flex gap-6 text-sm font-medium text-[#1B0D15]">
              <a href="https://github.com/1do-labs/" className="hover:text-black transition-colors">GitHub</a>
              <a href="https://x.com/1do-labs" className="hover:text-black transition-colors">Twitter</a>
           </div>
        </footer>

      </main>
    </div>
  );
}
