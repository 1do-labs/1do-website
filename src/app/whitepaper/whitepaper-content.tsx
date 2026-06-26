import Link from "next/link";

type WhitepaperBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "ordered"; items: string[] }
  | { type: "code"; text: string };

type WhitepaperSection = {
  id: string;
  title: string;
  blocks: WhitepaperBlock[];
};

type WhitepaperCopy = {
  back: string;
  contents: string;
  currentLanguage: string;
  otherLanguage: string;
  otherLanguageHref: string;
  title: string;
  intro: string;
  tags: string[];
  sections: WhitepaperSection[];
};

const runtimeHostInterface = `interface IERC8280 {
    event AppEnabled(address indexed host, address indexed app);
    event AppDisabled(address indexed host, address indexed app);

    function executeRuntimeApp(address app, bytes calldata data)
        external
        payable
        returns (bytes memory result);

    function enableApp(address app) external;
    function disableApp(address app) external;
    function isAppEnabled(address app) external view returns (bool);
}`;

const tokenPullInterface = `interface IERC8284 {
    function executeWithTokenPull(
        address target,
        bytes calldata data,
        address asset,
        uint256 maxAmount
    ) external;

    function tokenPullToCaller(address asset, uint256 amount) external;
}`;

const nftPullInterface = `interface IERC8285 {
    function executeWithNftPull(
        address target,
        bytes calldata data,
        address asset,
        uint256 tokenId
    ) external;

    function nftPullToCaller(address asset, uint256 tokenId) external;
}`;

const erc8112Interface = `interface IERC8112 {
    function tokenTransferNonce(address asset, address to)
        external
        view
        returns (uint256);

    function tokenTransferWithSig(
        address asset,
        address to,
        uint256 value,
        uint256 deadline,
        bytes calldata signature
    ) external returns (bool success);
}`;

const erc8114Interface = `interface IERC8114 {
    function nftTransferNonce(address asset, uint256 tokenId)
        external
        view
        returns (uint256);

    function nftTransferWithSig(
        address asset,
        address to,
        uint256 tokenId,
        uint256 deadline,
        bytes calldata signature
    ) external returns (bool success);
}`;

const erc7196Interface = `interface IERC7196 {
    event Transfer(address indexed from, address indexed to, uint256 value);

    function totalSupply() external view returns (uint256 total);
    function balanceOf(address owner) external view returns (uint256 balance);
    function transfer(address to, uint256 value) external returns (bool success);
}`;

const erc7561Interface = `interface IERC7561 {
    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );

    function balanceOf(address owner) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
    function transferFrom(address from, address to, uint256 tokenId) external;
}`;

const zhGasComparison = `场景                         传统路径 gas limit 预算              1Do 当前基准
Dex vs Uniswap               approve 50k-75k + swap 150k-220k    token/token 222,705
                             合计约 200k-295k，2 次确认          native/token 150,923
                                                                  token/native 145,244

NFTMarket vs OpenSea/Seaport approve/setApprovalForAll 50k-100k   NFT/token 210,728
                             + fulfill 250k-450k                 NFT/NFT 200,140
                             合计约 300k-550k，常见为 2 次确认

支付 vs USDC 自带授权        EIP-3009 / transferWithAuthorization ERC-8112 首笔 70,425
                             常见预算约 80k-110k                 同 asset/to 第二笔 16,869`;

const enGasComparison = `Scenario                     Traditional gas-limit budget          Current 1Do benchmark
Dex vs Uniswap               approve 50k-75k + swap 150k-220k    token/token 222,705
                             about 200k-295k, 2 confirmations    native/token 150,923
                                                                  token/native 145,244

NFTMarket vs OpenSea/Seaport approve/setApprovalForAll 50k-100k   NFT/token 210,728
                             + fulfill 250k-450k                 NFT/NFT 200,140
                             about 300k-550k, often 2 confirmations

Payments vs USDC-native auth EIP-3009 / transferWithAuthorization ERC-8112 first transfer 70,425
                             commonly budgeted around 80k-110k   second same asset/to 16,869`;

const zhSections: WhitepaperSection[] = [
  {
    id: "vision",
    title: "一次激活，账户即平台",
    blocks: [
      { type: "paragraph", text: "1Do 的愿景是把钱包从“签名工具”推进到“用户自己的链上执行环境”。用户不应该为了交易、支付、订阅、遗嘱、NFT 市场或未来的新应用反复迁移资产、创建新账户、理解每个 app 的权限系统。" },
      { type: "paragraph", text: "在 1Do 中，一个地址就是用户的账户、资产边界和应用运行边界。用户激活一次 runtime，之后不断给同一个地址增加能力：发现 app、启用 app、执行 app、签署意图、完成结算。" },
      { type: "paragraph", text: "更具体地说，1Do 想实现的是“账户即平台”：用户的地址既是钱包，也是 app runtime，也是支付与 DeFi 的结算边界。app 不再要求用户把资产转移到平台账户、vault 或托管合约里才能使用，而是围绕用户自己的账户运行。" },
      { type: "list", items: ["账户应该跟随用户，而不是跟随某个 app。", "资产权限应该收敛在钱包，而不是散落在 token、router、市场和支付合约里。", "app 应该独立创新，但不能重新定义用户钱包的核心信任边界。", "用户体验应该从“理解合约调用”走向“理解我要完成的动作”。"] },
    ],
  },
  {
    id: "core-design",
    title: "核心设计观点：Less is More",
    blocks: [
      { type: "paragraph", text: "1Do 的核心设计观点是 less is more：资产合约更小，app 边界更清楚，wallet runtime 承担真正属于账户的权限能力。减少一层中间账户、减少一类长期授权、减少一套 app 自建权限系统，通常比增加抽象更重要。" },
      { type: "list", items: ["资产层少做事：token / NFT 负责余额和归属，不把所有用户级权限塞进资产合约。", "账户层多负责：签名验证、授权边界、session、pull context、app enablement 都收敛到用户自己的 wallet runtime。", "app 层保持独立：Dex、NFT Market、Will、Session Pay 保留业务规则，但不复制 wallet-core。", "交互层减少步骤：优先一次签名、一次执行、一次结算，而不是 approve -> deposit -> execute -> withdraw。", "安全层减少残留：执行结束后不留下可复用 allowance、operator approval 或平台托管余额。"] },
    ],
  },
  {
    id: "eoa-and-defi",
    title: "EOA 账户与当前 DeFi",
    blocks: [
      { type: "paragraph", text: "以太坊早期默认用户使用 EOA。EOA 没有代码、没有本地状态，也不能表达细粒度执行策略，所以 DeFi 只能把大量权限逻辑下沉到 token、router、market、vault 或 app 合约里。" },
      { type: "paragraph", text: "ERC-20 的 approve(spender, amount) / allowance(owner, spender) 是当前 DeFi 最典型的交互模型。用户先批准 router 或 app 使用某个 token，再由 app 在 swap、支付、订阅或结算时 transferFrom 拉取资产。" },
      { type: "paragraph", text: "另一类常见 DeFi 体验是“先把资产转到平台里再使用”：用户把资产 deposit 到交易平台、借贷池、vault、订单簿或托管合约，之后平台内部再记账、撮合、结算或清算。这让平台更容易做业务逻辑，但用户的资产边界从自己的钱包转移到了平台合约。" },
      { type: "list", items: ["优点：模型简单、组合性强，Uniswap、聚合器、USDC 支付和很多托管式收款流程都依赖它启动。", "代价：授权是持久状态，交易结束后 allowance 仍可能存在。", "代价：授权对象是 spender 合约，不是一次具体业务执行。", "代价：approve 和业务调用通常是两笔交易，用户要付两次 gas、看两次钱包弹窗。", "代价：deposit 模型要求用户先把资产移入平台合约，资产可用性和退出路径依赖平台逻辑。", "代价：钱包很难解释“这个授权未来能做什么”。"] },
      { type: "paragraph", text: "NFT 也有同样问题：approve、setApprovalForAll、operator approval 和 safeTransferFrom 把用户级权限塞进 NFT 合约或市场合约。EOA 时代这样做是合理的工程妥协，但在 ERC-7702 和合约钱包成熟后，权限有机会回到用户自己的账户 runtime。" },
    ],
  },
  {
    id: "asset-direction",
    title: "资产标准方向",
    blocks: [
      { type: "paragraph", text: "1Do 当前兼容 ERC-20 / ERC-721，因为它们仍是主流资产接口。但长期看，合约钱包环境不需要把所有用户权限都塞进资产合约。资产合约应该更像“余额和归属账本”，账户 runtime 才应该表达用户授权、组合、session、pull 和清晰签名。" },
      { type: "paragraph", text: "ERC-7196 / ERC-7561 表达的是更小的 token / NFT 方向：ERC-7196 移除 ERC-20 里的 transferFrom、approve、allowance；ERC-7561 移除 ERC-721 里的 approve、setApprovalForAll、getApproved、isApprovedForAll、safeTransferFrom，把这些用户级权限从资产合约上移到合约钱包。" },
      { type: "code", text: erc7196Interface },
      { type: "code", text: erc7561Interface },
      { type: "list", items: ["ERC-7196 的缘由：ERC-20 allowance 是 EOA 时代的妥协，长期授权、无限授权和 spender 风险都来自资产合约承担了用户权限状态。", "ERC-7196 的好处：token 合约只保留 totalSupply、balanceOf、transfer 和 Transfer event，资产层更接近单纯账本，逻辑更小，审计面更窄，也更容易被钱包 runtime、pull 标准和支付标准复用。", "ERC-7561 的缘由：ERC-721 approval / operator approval 把 NFT 用户权限长期放在资产合约里，市场、聚合器或 operator 出问题时会把单个业务风险放大成账户级资产风险。", "ERC-7561 的好处：NFT 合约只保留 ownerOf、balanceOf、transferFrom 和 Transfer event，授权从“某个 operator 长期可动我的 NFT”变成“我的钱包 runtime 在一次具体执行中验证并放行”。", "ERC-7196 / ERC-7561 不是要求今天废弃 ERC-20 / ERC-721，而是给合约钱包时代提供更清晰的分层：资产合约记录资产事实，账户 runtime 表达用户意图、权限、限额、会话和撤销。"] },
    ],
  },
  {
    id: "onedo-account",
    title: "1Do 账户模型",
    blocks: [
      { type: "paragraph", text: "1Do 的核心判断是：钱包地址本身才是真正的应用执行边界。当前主线没有第二个 predicted smart wallet，也没有 app NFT 启用模型；用户不需要先迁移资产、创建新钱包地址、mint app NFT，或启用单独的资产管理 app 才能使用 1Do runtime apps。" },
      { type: "paragraph", text: "主线账户模型基于 ERC-7702：用户连接的地址就是 runtime 工作地址。runtime 通过 ERC-8280 风格的 executeRuntimeApp(app, data) 进入 app 执行，并通过本地 enableApp / disableApp 管理这个地址启用了哪些 app。" },
      { type: "code", text: runtimeHostInterface },
      { type: "paragraph", text: "全局平台 gating 与用户本地启用是两个不同问题。平台 registry 决定某个 app logic 是否允许运行；用户钱包本地状态决定这个地址是否启用了该 app。当前 core runtime 的可执行性可以概括为：" },
      { type: "code", text: "wallet.isAppEnabled(app) && registry.isEntitled(address(0), app)" },
      { type: "paragraph", text: "这些 ERC 的缘由是一致的：EOA 缺少代码和状态，传统 app 只能把权限放进外部合约；1Do 通过 7702 runtime 把代码、状态、签名验证和 app enablement 放回用户地址。" },
      { type: "list", items: ["ERC-7702：缘由是让 EOA 地址获得合约执行能力；好处是用户不需要把资产迁移到新 smart wallet 地址，连接地址就是工作地址。", "ERC-8280：缘由是 smart account 需要一个最小 runtime app host 标准；机制是 enableApp / disableApp / isAppEnabled 管理本地启用状态，executeRuntimeApp 作为 permissionless trigger 入口。", "ERC-8280 的好处：任何 relayer、counterparty、keeper 或 executor 都可以触发已启用 app，但触发者不会获得 wallet-owner authority；app 在 host context 中运行，返回值和 revert data 透传，nested runtime execution 被拒绝。", "ERC-1271：缘由是合约账户不能用 EOA ecrecover 假设；好处是 runtime 钱包可以验证 EIP-712 intent、订单、支付授权和遗产计划。", "ERC-7201：缘由是 runtime host 与多个 app 共享执行环境时容易产生 storage collision；好处是 host state 和每个 app state 使用独立 namespaced storage，避免 app 覆盖账户核心状态。", "ERC-165：用于 runtime、pull、transfer-with-sig、permit 等能力发现，让前端、relayer 和 app 可以用 supportsInterface 检测钱包支持哪些标准。"] },
    ],
  },
  {
    id: "runtime-app-standards",
    title: "Runtime App 标准与限定",
    blocks: [
      { type: "paragraph", text: "1Do 允许 app 保留自己的业务逻辑，但 runtime app 必须遵守账户边界。app 可以定义订单、价格、结算、过期、事件和错误；不能重新实现一套 wallet-core 权限系统。" },
      { type: "list", items: ["必须通过 runtime 入口执行：主路径是 executeRuntimeApp(app, data)。", "必须尊重本地启用：平台全局上架不等于某个钱包自动启用。", "必须尊重 registry：被平台 block 的 app 不应继续执行。", "不能依赖长期 token allowance 或 NFT operator approval 作为主结算路径。", "不能制造新的 external self-call frame 来绕过 runtime caller discipline。", "app 状态可以放在 app 合约里，但用户权限、签名验证、pull 上下文和执行锁属于 wallet runtime。"] },
      { type: "paragraph", text: "这些限定的好处是把 app 创新和账户安全分层：Dex、NFT Market、Flash Loan、Will、Session Pay 可以各自演化，但它们都不能把用户从自己的钱包边界里“搬走”。" },
    ],
  },
  {
    id: "onedo-defi",
    title: "1Do DeFi：意图、结算与有界授权",
    blocks: [
      { type: "paragraph", text: "1Do DeFi 不试图把所有交易都变成一个统一 AMM。Dex 是 intent 型 runtime app：maker 链下签 EIP-712 订单，relay 链下分发，buyer 通过自己的 7702 runtime 在链上成交。" },
      { type: "paragraph", text: "1Do 的关键变化不是“没有授权”，而是把授权从长期 allowance 改成执行局部、有边界、可读的 wallet-native 授权。ERC-8284 / ERC-8285 对应 token / NFT pull：app 在一次执行中收取资产，但不会留下可复用 allowance 或 operator approval。" },
      { type: "code", text: tokenPullInterface },
      { type: "code", text: nftPullInterface },
      { type: "list", items: ["ERC-8284：缘由是替代长期 token allowance；机制是 executeWithTokenPull(target, data, asset, maxAmount) 创建临时 pull context，绑定 target、asset、remainingAmount。", "ERC-8284 的好处：target 可以在执行中决定实际收取多少，但 tokenPullToCaller 只能由绑定 target 调用，累计 pull 不能超过 cap，执行成功或回滚前必须清除上下文。", "ERC-8285：缘由是替代长期 NFT operator approval；机制是 executeWithNftPull(target, data, asset, tokenId) 只授权一个 target 在一次执行中拉取一个具体 NFT。", "ERC-8285 的好处：nftPullToCaller 必须匹配 target、asset、tokenId，执行窗口结束后任何 pull 都必须失败，避免留下可复用 operator 权限。", "Dex：优先走 executeWithTokenPull(...)，当前主线 signed order 是 full-fill-only。", "NFT Market：订单语义属于 market app，结算走 wallet-native pull。", "Flash Loan：按 ERC-3156 暴露 flash lender / borrower 语义，让钱包余额成为可启用的流动性能力。", "EIP-712 用于订单、intent 和授权签名；ERC-7730 用于把签名或交易展示成更清晰的人类可读意图。"] },
    ],
  },
  {
    id: "payments",
    title: "1Do 支付：一次授权与会话化结算",
    blocks: [
      { type: "paragraph", text: "支付不应该只依赖 token 合约自己实现 permit，也不应该要求每个支付 app 维护一套长期 allowance。1Do 把支付能力放在钱包 runtime：用户可以签 wallet-level typed data，之后由 relayer 或 session key 完成提交与结算。" },
      { type: "paragraph", text: "ERC-8112 / ERC-8114 对应 wallet-level token / NFT transfer with signature。签名域绑定 wallet 地址，nonce 按资产与目标维度隔离，避免把每个 token 合约改造成 gasless 授权系统。" },
      { type: "code", text: erc8112Interface },
      { type: "code", text: erc8114Interface },
      { type: "list", items: ["ERC-8112：缘由是把 token/native transfer with signature 放在钱包层；机制是 tokenTransferNonce(asset, to) 按 (asset, to) 隔离 nonce，tokenTransferWithSig 校验 EIP-712 + ERC-1271 后转账。", "ERC-8112 的好处：任意 ERC-20 都能获得 gasless / relayed transfer 能力，不要求 token 合约支持 EIP-3009、permit 或自定义签名标准。", "ERC-8114：缘由是把 NFT transfer with signature 放在钱包层；机制是 nftTransferNonce(asset, tokenId) 按 (asset, tokenId) 隔离 nonce，nftTransferWithSig 验签后 safeTransferFrom。", "ERC-8114 的好处：任意 ERC-721 都能被钱包层签名转移，不要求 NFT 合约自己实现新签名标准；nonce 在外部 transfer 前递增，降低签名复用风险。", "Red Packet、Gift、Pay 属于钱包原生能力，不是 Store runtime app。", "Session Pay 是 runtime app：用户签 session grant，session key 产生累计 settlement authorization，适合 API、AI agent、订阅和微支付。", "ERC-1271 负责 runtime 钱包签名验证；EIP-712 负责结构化授权内容。"] },
      { type: "paragraph", text: "x402 可以作为 1Do 支付的 HTTP 接入方式：资源服务器先返回 402 Payment Required 和付款要求；客户端钱包根据要求生成 1Do wallet-level payment authorization；facilitator 或商户后端提交 tokenTransferWithSig 或 Session Pay settlement；确认后客户端重试请求并获得资源。这样 x402 负责 HTTP 层的付款协商，1Do runtime 负责链上授权、nonce、session 和结算边界。" },
      { type: "list", items: ["面向一次性 API / 内容付费：可直接映射到 ERC-8112 tokenTransferWithSig。", "面向 AI agent、订阅和高频微支付：更适合映射到 Session Pay，用户先签 session grant，后续请求按限额与累计结算执行。", "面向只接受 USDC EIP-3009 的 x402 服务：可以通过 facilitator / adapter 兼容；1Do 主线仍倾向 wallet-level 授权，避免把 gasless 能力绑定到单个 token 标准。"] },
    ],
  },
  {
    id: "will",
    title: "遗产与长期账户能力",
    blocks: [
      { type: "paragraph", text: "1Do 的账户模型不仅服务即时交易，也服务长期账户安排。Will 是 runtime app：用户在自己的 wallet runtime 中创建遗产计划，定义受益人、权重、触发条件、执行人费用和版本。" },
      { type: "paragraph", text: "遗产功能的核心不是把资产提前转移到遗产平台，而是在用户自己的账户边界内保存可验证的计划。触发条件满足后，executor 可以按计划执行尚未处理的资产分发。" },
      { type: "list", items: ["用户资产在触发前仍保留在自己的 wallet 地址。", "计划可以使用 EIP-712 typed data 表达，便于用户理解和签名。", "ERC-1271 让 runtime wallet 验证遗产计划签名。", "app 负责遗产业务规则；wallet runtime 负责账户权限、执行边界和签名验证。"] },
    ],
  },
  {
    id: "gas-comparison",
    title: "Gas 与交互成本对比",
    blocks: [
      { type: "paragraph", text: "传统 DeFi 的成本不只是链上 gas 数字，还包括用户交互次数、长期授权风险和失败恢复成本。1Do 优先减少重复授权、减少账户迁移、减少 app 自建权限系统。" },
      { type: "paragraph", text: "下面的 1Do 数字来自当前 core Forge gas benchmark；Uniswap、OpenSea / Seaport、USDC 自带授权侧为常见 gas limit 预算区间，实际值会随 router、订单类型、资产冷热状态、链和 calldata 变化。支付行同时列出首笔与同一 asset/to 第二笔：第二笔避开 ERC-20 接收方余额槽、wallet nonce 槽从 0 到非 0 的成本，更接近高频支付热路径。" },
      { type: "code", text: zhGasComparison },
      { type: "list", items: ["Dex vs Uniswap：Uniswap 类路径常见是 approve -> swap 两步；1Do Dex 的 maker 订单在链下签名，buyer 在 runtime 中一次成交，token pull 不留下 allowance。", "NFTMarket vs OpenSea：传统 NFT 市场常见需要 approve 或 setApprovalForAll，再 fulfill order；1Do NFTMarket 用订单签名 + wallet-native pull，避免长期 operator approval。", "支付 vs USDC 自带授权：USDC EIP-3009 能解决 USDC 自身 gasless transfer，但能力绑定在 USDC 合约；1Do ERC-8112 把签名转账放在 wallet runtime，因此任意 ERC-20 都可走同一钱包授权模型。", "x402：x402 减少的是 HTTP 支付协商成本；1Do 可以把 x402 的 payment payload 接到 ERC-8112 或 Session Pay，从而减少账号体系、API key、月结和每次独立授权的复杂度。"] },
      { type: "paragraph", text: "因此 1Do 的 gas 优化不是单点追求“某个 opcode 更省”，而是减少需要上链的步骤和残留状态：少一次 approve，少一次 deposit，少一个平台余额，少一个长期 operator，就少一个 gas、风险和用户理解成本的来源。" },
    ],
  },
  {
    id: "flows",
    title: "典型交互流程",
    blocks: [
      { type: "ordered", items: ["用户打开 1Do Wallet，连接当前地址。", "如果地址尚未激活 runtime，先完成 ERC-7702 runtime 激活。", "用户在 Store 发现 Dex、NFT Market、Flash Loan、Will、Session Pay 等 runtime apps。", "用户对某个 app 执行本地 enableApp；平台 registry 仍独立控制全局可执行性。", "用户进入 app，签署 EIP-712 intent、订单、session grant、will plan 或 transfer authorization。", "交易通过 executeRuntimeApp(...)、executeWithTokenPull(...)、tokenTransferWithSig(...) 等 runtime 路径执行。", "执行结束后，临时 pull 上下文被清除；长期权限仍留在用户自己的 wallet runtime 边界内。"] },
    ],
  },
  {
    id: "conclusion",
    title: "结论",
    blocks: [
      { type: "paragraph", text: "1Do 不是要把钱包做成一个庞大的中心化应用框架，而是要把账户能力稳定地收敛到用户地址本身。" },
      { type: "paragraph", text: "宏观上，1Do 希望用户激活一次账户 runtime，就能持续扩展 DeFi、支付、NFT、遗嘱、会话与未来 app。工程上，1Do 用 ERC-7702、ERC-8280、ERC-8284、ERC-8285、ERC-8112、ERC-8114、ERC-1271、EIP-712 等标准，把执行边界、签名、资产授权和 app enablement 放回钱包。" },
    ],
  },
];

const enSections: WhitepaperSection[] = [
  {
    id: "vision",
    title: "Activate Once, Account as Platform",
    blocks: [
      { type: "paragraph", text: "1Do's vision is to move the wallet from a signing tool into the user's own onchain execution environment. Users should not need to migrate assets, create new accounts, or relearn a new permission model for every trading, payment, subscription, will, NFT market, or future app flow." },
      { type: "paragraph", text: "In 1Do, one address is the user's account, asset boundary, and app execution boundary. The user activates a runtime once, then keeps adding capability to the same address: discover apps, enable apps, execute apps, sign intents, and settle transactions." },
      { type: "paragraph", text: "More concretely, 1Do wants account-as-platform: the user's address is the wallet, the app runtime, and the settlement boundary for payments and DeFi. Apps should not require users to move assets into platform accounts, vaults, or custody contracts before they can use them." },
      { type: "list", items: ["The account should follow the user, not one app.", "Asset authority should converge in the wallet, not scatter across tokens, routers, markets, and payment contracts.", "Apps should innovate independently without redefining the wallet trust boundary.", "The user experience should move from understanding contract calls to understanding the action being completed."] },
    ],
  },
  {
    id: "core-design",
    title: "Core Design: Less Is More",
    blocks: [
      { type: "paragraph", text: "1Do's core design view is less is more: smaller asset contracts, clearer app boundaries, and wallet runtime ownership of account authority. Removing one intermediate account, one class of long-lived approval, or one app-owned permission system often matters more than adding another abstraction." },
      { type: "list", items: ["The asset layer should do less: tokens and NFTs record balances and ownership instead of carrying every user-level permission feature.", "The account layer should own more: signature validation, authority boundaries, sessions, pull context, and app enablement converge in the user's wallet runtime.", "The app layer stays independent: Dex, NFT Market, Will, and Session Pay keep their business rules without copying wallet-core logic.", "The interaction layer removes steps: prefer one signature, one execution, and one settlement over approve -> deposit -> execute -> withdraw.", "The safety layer leaves less residue: after execution, no reusable allowance, operator approval, or platform-custodied balance should remain."] },
    ],
  },
  {
    id: "eoa-and-defi",
    title: "EOA Accounts and Current DeFi",
    blocks: [
      { type: "paragraph", text: "Early Ethereum apps assumed EOAs. An EOA has no code, no local state, and no way to express fine-grained execution policy, so DeFi pushed a large amount of permission logic down into tokens, routers, markets, vaults, and app contracts." },
      { type: "paragraph", text: "ERC-20 approve(spender, amount) plus allowance(owner, spender) is the most common interaction model in today's DeFi. The user approves a router or app first, then the app later pulls assets with transferFrom during a swap, payment, subscription, or settlement." },
      { type: "paragraph", text: "Another common DeFi experience is moving assets into a platform before using it: users deposit into an exchange, lending pool, vault, orderbook, or custody contract, and the platform then handles internal accounting, matching, settlement, or liquidation. That simplifies app logic but moves the user's asset boundary from their wallet to the platform contract." },
      { type: "list", items: ["Benefit: simple and composable; Uniswap, aggregators, USDC payments, and custodial collection flows were bootstrapped this way.", "Cost: approval is persistent state that can remain after the transaction is done.", "Cost: approval is granted to a spender contract, not to one concrete business action.", "Cost: approve plus execution is often two transactions and two wallet prompts.", "Cost: deposit-based platforms require users to move assets into platform contracts, making availability and exit paths depend on platform logic.", "Cost: wallets rarely explain what an approval may enable in the future."] },
      { type: "paragraph", text: "NFTs have the same pattern: approve, setApprovalForAll, operator approval, and safeTransferFrom put user-level authority into NFT contracts or marketplaces. That was a reasonable EOA-era engineering compromise, but ERC-7702 and contract wallets make it possible to move authority back to the user's own account runtime." },
    ],
  },
  {
    id: "asset-direction",
    title: "Asset Standard Direction",
    blocks: [
      { type: "paragraph", text: "1Do remains compatible with ERC-20 and ERC-721 because they are still the dominant asset interfaces. But in a contract-wallet environment, asset contracts do not need to carry every user-permission feature. Asset contracts should become closer to balance and ownership ledgers, while the account runtime expresses authorization, composition, sessions, pull flows, and clear signing." },
      { type: "paragraph", text: "ERC-7196 / ERC-7561 point toward smaller token / NFT contracts: ERC-7196 removes transferFrom, approve, and allowance from ERC-20; ERC-7561 removes approve, setApprovalForAll, getApproved, isApprovedForAll, and safeTransferFrom from ERC-721, moving user-level authority upward into contract wallets." },
      { type: "code", text: erc7196Interface },
      { type: "code", text: erc7561Interface },
      { type: "list", items: ["ERC-7196 exists because ERC-20 allowance is an EOA-era compromise; long-lived approvals, unlimited approvals, and spender risk all come from asset contracts carrying user authority state.", "ERC-7196 benefits: the token contract keeps totalSupply, balanceOf, transfer, and Transfer event, making the asset layer closer to a ledger, reducing logic and audit surface, and making it easier for wallet runtimes, pull standards, and payment standards to reuse the same asset.", "ERC-7561 exists because ERC-721 approval / operator approval keeps NFT user authority in the asset contract, turning a marketplace, aggregator, or operator failure into broader account-asset risk.", "ERC-7561 benefits: the NFT contract keeps ownerOf, balanceOf, transferFrom, and Transfer event; authorization moves from “this operator can keep moving my NFTs” to “my wallet runtime validates and releases this specific execution”.", "ERC-7196 / ERC-7561 do not require today's ecosystem to abandon ERC-20 / ERC-721. They define a cleaner contract-wallet-era layering: asset contracts record asset facts, while the account runtime expresses user intent, authority, limits, sessions, and revocation."] },
    ],
  },
  {
    id: "onedo-account",
    title: "The 1Do Account",
    blocks: [
      { type: "paragraph", text: "1Do's core claim is that the wallet address itself is the app execution boundary. The current mainline product has no second predicted smart wallet and no app NFT enablement model; users do not need to migrate assets, create a new wallet address, mint an app NFT, or enable a separate asset-manager app before using 1Do runtime apps." },
      { type: "paragraph", text: "The main account path is ERC-7702: the connected address is the runtime address. The runtime enters app execution through an ERC-8280-style executeRuntimeApp(app, data), while enableApp / disableApp records which apps this address has enabled locally." },
      { type: "code", text: runtimeHostInterface },
      { type: "paragraph", text: "Global platform gating and user-local enablement are separate gates. The platform registry decides whether an app logic is allowed to run; the wallet's local state decides whether this address enabled that app. In the current core runtime, executability is summarized as:" },
      { type: "code", text: "wallet.isAppEnabled(app) && registry.isEntitled(address(0), app)" },
      { type: "paragraph", text: "The reason behind these ERCs is consistent: EOAs lack code and local state, so traditional apps placed authority in external contracts. 1Do uses a 7702 runtime to bring code, state, signature validation, and app enablement back to the user's address." },
      { type: "list", items: ["ERC-7702 exists to let an EOA address gain executable contract behavior; the benefit is that users do not need to migrate assets to a new smart-wallet address, because the connected address is the working address.", "ERC-8280 exists to standardize the minimum runtime app host surface; enableApp / disableApp / isAppEnabled manage local enablement and executeRuntimeApp is the permissionless trigger entry point.", "ERC-8280 benefits: any relayer, counterparty, keeper, or executor can trigger an enabled app without gaining wallet-owner authority; app execution happens in host context, return data and revert data are bubbled, and nested runtime execution is rejected.", "ERC-1271 exists because contract accounts cannot rely on EOA ecrecover assumptions; the benefit is runtime-wallet validation for EIP-712 intents, orders, payment authorizations, and will plans.", "ERC-7201 exists because runtime hosts and multiple apps can share one execution environment; the benefit is independent namespaced storage for host state and each app state, reducing the chance that an app overwrites account-core state.", "ERC-165 supports capability discovery for runtime, pull, transfer-with-signature, and permit interfaces, so frontends, relayers, and apps can detect which standards a wallet supports."] },
    ],
  },
  {
    id: "runtime-app-standards",
    title: "Runtime App Standards and Limits",
    blocks: [
      { type: "paragraph", text: "1Do lets apps keep their own business logic, but runtime apps must respect the account boundary. Apps may define orders, pricing, settlement, expiry, events, and errors; they must not recreate a separate wallet-core permission system." },
      { type: "list", items: ["Execution must go through the runtime entry point: the main path is executeRuntimeApp(app, data).", "Apps must respect local enablement: global listing does not automatically enable an app for a wallet.", "Apps must respect registry gating: a platform-blocked app should not continue executing.", "Apps must not depend on long-lived token allowance or NFT operator approval as the main settlement path.", "Apps must not manufacture new external self-call frames to bypass runtime caller discipline.", "App state may live in app contracts, but user authority, signature validation, pull context, and execution locks belong in the wallet runtime."] },
      { type: "paragraph", text: "These limits separate app innovation from account safety: Dex, NFT Market, Flash Loan, Will, and Session Pay can evolve independently, while none of them can move the user out of their own wallet boundary." },
    ],
  },
  {
    id: "onedo-defi",
    title: "1Do DeFi: Intents, Settlement, and Bounded Authority",
    blocks: [
      { type: "paragraph", text: "1Do DeFi does not try to turn every trade into one AMM. Dex is an intent-based runtime app: makers sign EIP-712 orders offchain, relays distribute intents offchain, and buyers settle onchain through their own 7702 runtime." },
      { type: "paragraph", text: "The key change is not the absence of authorization, but replacing long-lived allowance with execution-local, bounded, wallet-native authorization. ERC-8284 / ERC-8285 correspond to token / NFT pull: the app can collect assets during one execution without leaving reusable allowance or operator approval behind." },
      { type: "code", text: tokenPullInterface },
      { type: "code", text: nftPullInterface },
      { type: "list", items: ["ERC-8284 exists to replace long-lived token allowance; executeWithTokenPull(target, data, asset, maxAmount) creates a temporary pull context bound to target, asset, and remainingAmount.", "ERC-8284 benefits: the target can decide the final amount during execution, but tokenPullToCaller can only be called by the bound target, cumulative pulls cannot exceed the cap, and context must be cleared before success or revert returns.", "ERC-8285 exists to replace long-lived NFT operator approval; executeWithNftPull(target, data, asset, tokenId) authorizes one target to pull one specific NFT during one execution.", "ERC-8285 benefits: nftPullToCaller must match target, asset, and tokenId; after the execution window ends, every pull for that context must fail, avoiding reusable operator authority.", "Dex prefers executeWithTokenPull(...), and the current signed-order path is full-fill-only.", "NFT Market keeps market-specific order semantics while settlement uses wallet-native pull.", "Flash Loan exposes ERC-3156 flash lender / borrower semantics, turning enabled wallet balances into a liquidity capability.", "EIP-712 represents orders, intents, and authorizations; ERC-7730 helps present signatures or transactions as clearer human-readable intents."] },
    ],
  },
  {
    id: "payments",
    title: "1Do Payments: One Authorization and Session Settlement",
    blocks: [
      { type: "paragraph", text: "Payments should not depend only on token-specific permit support, and each payment app should not maintain its own long-lived allowance system. 1Do puts payment authority in the wallet runtime: the user signs wallet-level typed data, then a relayer or session key can submit and settle." },
      { type: "paragraph", text: "ERC-8112 / ERC-8114 correspond to wallet-level token / NFT transfer with signature. The signing domain binds to the wallet address, and nonces are isolated by asset and recipient dimensions, avoiding the need to turn every token contract into a gasless authorization carrier." },
      { type: "code", text: erc8112Interface },
      { type: "code", text: erc8114Interface },
      { type: "list", items: ["ERC-8112 exists to put token/native transfer with signature at the wallet layer; tokenTransferNonce(asset, to) scopes nonce by (asset, to), and tokenTransferWithSig validates EIP-712 + ERC-1271 before transfer.", "ERC-8112 benefits: arbitrary ERC-20 tokens gain gasless or relayed transfer support without requiring EIP-3009, permit, or any custom signature feature in the token contract.", "ERC-8114 exists to put NFT transfer with signature at the wallet layer; nftTransferNonce(asset, tokenId) scopes nonce by (asset, tokenId), and nftTransferWithSig validates then safeTransferFroms.", "ERC-8114 benefits: arbitrary ERC-721 NFTs can be transferred by wallet-level signature without each NFT contract implementing a new signature standard; nonce increments before external transfer reduce signature-reuse risk.", "Red Packet, Gift, and Pay are wallet-native capabilities, not Store runtime apps.", "Session Pay is a runtime app: the user signs a session grant, the session key produces cumulative settlement authorizations, and the model fits APIs, AI agents, subscriptions, and micropayments.", "ERC-1271 validates runtime wallet signatures; EIP-712 structures the authorization content."] },
      { type: "paragraph", text: "x402 can be an HTTP entry point for 1Do payments: the resource server returns 402 Payment Required and payment requirements; the client wallet creates a 1Do wallet-level payment authorization; a facilitator or merchant backend submits tokenTransferWithSig or Session Pay settlement; after confirmation, the client retries and receives the resource. x402 handles HTTP payment negotiation, while the 1Do runtime handles onchain authorization, nonces, sessions, and settlement boundaries." },
      { type: "list", items: ["For one-off API or content payments, the flow can map directly to ERC-8112 tokenTransferWithSig.", "For AI agents, subscriptions, and high-frequency micropayments, Session Pay is a better fit: the user signs a session grant once, then later requests settle within limits and cumulative authorization.", "For x402 services that only accept USDC EIP-3009, a facilitator or adapter can bridge compatibility; the 1Do mainline still prefers wallet-level authorization so gasless payment capability is not tied to one token standard."] },
    ],
  },
  {
    id: "will",
    title: "Will and Long-Term Account Capability",
    blocks: [
      { type: "paragraph", text: "1Do's account model is not only for immediate transactions. Will is a runtime app: the user creates an inheritance plan inside their own wallet runtime, defining beneficiaries, weights, trigger conditions, executor fees, and plan version." },
      { type: "paragraph", text: "The point of the inheritance feature is not to move assets into an inheritance platform ahead of time. The plan remains verifiable at the user's account boundary. Once trigger conditions are met, an executor can settle unprocessed assets according to the plan." },
      { type: "list", items: ["Assets remain at the user's wallet address before the trigger.", "The plan can be expressed as EIP-712 typed data so the user can understand and sign it.", "ERC-1271 lets the runtime wallet validate will-plan signatures.", "The app owns inheritance business rules; the wallet runtime owns account authority, execution boundary, and signature validation."] },
    ],
  },
  {
    id: "gas-comparison",
    title: "Gas and Interaction Cost Comparison",
    blocks: [
      { type: "paragraph", text: "The cost of traditional DeFi is not only raw chain gas. It also includes the number of user interactions, persistent approval risk, and the cost of recovering from failed or stale permissions. 1Do prioritizes fewer repeated approvals, fewer account migrations, and fewer app-owned permission systems." },
      { type: "paragraph", text: "The 1Do numbers below come from the current core Forge gas benchmarks. The Uniswap, OpenSea / Seaport, and USDC-native authorization side is shown as common gas-limit budget ranges; actual values vary by router, order type, hot or cold asset state, chain, and calldata. The payments row shows both the first transfer and the second transfer for the same asset/to pair: the second transfer avoids zero-to-nonzero ERC-20 recipient balance and wallet nonce slots, so it better represents a hot high-frequency payment path." },
      { type: "code", text: enGasComparison },
      { type: "list", items: ["Dex vs Uniswap: Uniswap-style paths commonly require approve -> swap; 1Do Dex has the maker sign offchain and the buyer settle once through runtime, with token pull leaving no allowance behind.", "NFTMarket vs OpenSea: traditional NFT markets commonly require approve or setApprovalForAll before order fulfillment; 1Do NFTMarket uses signed orders plus wallet-native pull, avoiding long-lived operator approval.", "Payments vs USDC-native authorization: USDC EIP-3009 solves gasless transfer for USDC itself, but the capability is tied to the USDC contract; 1Do ERC-8112 puts signed transfer in the wallet runtime so arbitrary ERC-20 assets can use one wallet authorization model.", "x402: x402 reduces HTTP payment negotiation cost; 1Do can connect x402 payment payloads to ERC-8112 or Session Pay, reducing accounts, API keys, monthly billing, and repeated standalone authorization."] },
      { type: "paragraph", text: "So 1Do's gas optimization is not only about making one opcode cheaper. It removes steps and residue: one less approve, one less deposit, one less platform balance, and one less long-lived operator are each fewer sources of gas cost, risk, and user confusion." },
    ],
  },
  {
    id: "flows",
    title: "Typical Interaction Flow",
    blocks: [
      { type: "ordered", items: ["The user opens 1Do Wallet and connects the current address.", "If the address has not activated runtime yet, the user activates the ERC-7702 runtime.", "The user discovers runtime apps such as Dex, NFT Market, Flash Loan, Will, and Session Pay in Store.", "The user locally enables an app with enableApp; the platform registry still controls global executability independently.", "The user enters the app and signs an EIP-712 intent, order, session grant, will plan, or transfer authorization.", "The transaction executes through runtime paths such as executeRuntimeApp(...), executeWithTokenPull(...), or tokenTransferWithSig(...).", "After execution, temporary pull context is cleared; long-term authority remains inside the user's own wallet runtime boundary."] },
    ],
  },
  {
    id: "conclusion",
    title: "Conclusion",
    blocks: [
      { type: "paragraph", text: "1Do is not trying to turn wallets into a giant centralized app framework. It is trying to converge account capability onto the user's own address." },
      { type: "paragraph", text: "At the macro level, 1Do wants users to activate one account runtime and keep extending DeFi, payments, NFTs, wills, sessions, and future apps. At the engineering level, 1Do uses standards such as ERC-7702, ERC-8280, ERC-8284, ERC-8285, ERC-8112, ERC-8114, ERC-1271, and EIP-712 to move execution boundaries, signatures, asset authority, and app enablement back into the wallet." },
    ],
  },
];

const copyByLanguage: Record<"zh" | "en", WhitepaperCopy> = {
  zh: {
    back: "返回 1Do",
    contents: "本页内容",
    currentLanguage: "中文",
    otherLanguage: "English",
    otherLanguageHref: "/en/whitepaper",
    title: "1Do 协议白皮书",
    intro:
      "从宏观账户愿景出发，解释 EOA 与当前 DeFi 的授权模型，再介绍 1Do 如何把账户、DeFi、支付、gas 成本与交互流程收敛到用户自己的 wallet runtime。",
    tags: ["中文", "宏观愿景", "EOA / DeFi", "ERC-7702"],
    sections: zhSections,
  },
  en: {
    back: "Back to 1Do",
    contents: "On This Page",
    currentLanguage: "English",
    otherLanguage: "中文",
    otherLanguageHref: "/zh/whitepaper",
    title: "1Do Protocol Whitepaper",
    intro:
      "A top-down explanation of the account vision, today's EOA and DeFi permission model, and how 1Do brings accounts, DeFi, payments, gas cost, and user flows back into the wallet runtime.",
    tags: ["English", "Macro Vision", "EOA / DeFi", "ERC-7702"],
    sections: enSections,
  },
};

function renderBlock(block: WhitepaperBlock) {
  if (block.type === "paragraph") {
    return <p className="text-[15px] sm:text-base leading-8 text-[#1B0D15]/78">{block.text}</p>;
  }

  if (block.type === "code") {
    return (
      <pre className="overflow-x-auto rounded-2xl bg-[#160d13] px-4 py-4 text-sm text-white shadow-[0_18px_45px_-28px_rgba(0,0,0,0.8)]">
        <code>{block.text}</code>
      </pre>
    );
  }

  const ListTag = block.type === "ordered" ? "ol" : "ul";

  return (
    <ListTag className="space-y-2 pl-5 text-[15px] sm:text-base leading-8 text-[#1B0D15]/76 marker:text-[#1B0D15]/45">
      {block.items.map((item) => (
        <li key={item} className={block.type === "ordered" ? "list-decimal" : "list-disc"}>
          {item}
        </li>
      ))}
    </ListTag>
  );
}

export function WhitepaperContent({ language }: { language: "zh" | "en" }) {
  const copy = copyByLanguage[language];

  return (
    <div className="relative min-h-screen overflow-hidden selection:bg-pink-500/30 selection:text-pink-900">
      <div className="background-container opacity-60">
        <div className="background-shape shape1 mix-blend-multiply" />
        <div className="background-shape shape2 mix-blend-multiply" />
        <div className="background-shape shape3 mix-blend-multiply" />
      </div>

      <main className="relative z-10 px-4 py-8 sm:px-10 sm:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-medium text-[#1B0D15] transition-colors hover:bg-white"
            >
              <span className="material-symbols-outlined !text-base">arrow_back</span>
              {copy.back}
            </Link>
            <Link
              href={copy.otherLanguageHref}
              className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-medium text-[#1B0D15] transition-colors hover:bg-white"
            >
              <span className="material-symbols-outlined !text-base">translate</span>
              {copy.otherLanguage}
            </Link>
          </div>

          <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <article className="rounded-[2.4rem] border border-white/75 bg-white/72 px-5 py-7 shadow-[0_24px_70px_-44px_rgba(30,27,75,0.55)] backdrop-blur-3xl sm:px-9 sm:py-10">
              <header className="border-b border-[#1B0D15]/10 pb-8">
                <span className="inline-flex items-center rounded-full border border-white/80 bg-white/70 px-3 py-1 text-xs font-mono uppercase tracking-widest text-[#1B0D15]/66">
                  Whitepaper
                </span>
                <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-[#1B0D15] sm:text-6xl">
                  {copy.title}
                </h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-[#1B0D15]/72">{copy.intro}</p>
                <div className="mt-6 flex flex-wrap gap-2 text-xs text-[#1B0D15]/62">
                  {copy.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-[#1B0D15]/10 bg-white/65 px-3 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
              </header>

              <div className="mt-8 space-y-10">
                {copy.sections.map((section) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-8 border-b border-[#1B0D15]/8 pb-10 last:border-b-0 last:pb-0"
                  >
                    <h2 className="text-2xl font-semibold tracking-tight text-[#1B0D15] sm:text-3xl">
                      {section.title}
                    </h2>
                    <div className="mt-4 space-y-4">
                      {section.blocks.map((block, index) => (
                        <div key={`${section.id}-${index}`}>{renderBlock(block)}</div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </article>

            <aside className="lg:sticky lg:top-8 lg:self-start">
              <nav className="rounded-[1.7rem] border border-white/75 bg-white/68 p-5 shadow-[0_18px_55px_-38px_rgba(30,27,75,0.6)] backdrop-blur-2xl">
                <p className="text-xs font-mono uppercase tracking-widest text-[#1B0D15]/50">{copy.contents}</p>
                <ol className="mt-4 space-y-2">
                  {copy.sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="block rounded-xl px-3 py-2 text-sm leading-snug text-[#1B0D15]/68 transition-colors hover:bg-white/70 hover:text-[#1B0D15]"
                      >
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
}
