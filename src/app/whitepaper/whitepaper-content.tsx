import Link from "next/link";

type WhitepaperBlock =
  | { type: "subheading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "ordered"; items: string[] }
  | { type: "code"; text: string }
  | { type: "gasEvidence"; language: "zh" | "en" }
  | { type: "diagram"; variant: "traditional" | "onedo"; language: "zh" | "en" };

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
  label: string;
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

const gasEvidenceData = [
  {
    key: "v2",
    label: "Uniswap V2",
    color: "#ec4899",
    count: 974_528,
    median: 159_225,
    p05: 109_151,
    p95: 427_311,
  },
  {
    key: "v3",
    label: "Uniswap V3",
    color: "#8b5cf6",
    count: 2_239_027,
    median: 235_941,
    p05: 120_689,
    p95: 819_273,
  },
  {
    key: "v4",
    label: "Uniswap V4",
    color: "#0ea5e9",
    count: 11_325_740,
    median: 211_539,
    p05: 119_830,
    p95: 877_026,
  },
  {
    key: "seaport",
    label: "OpenSea / Seaport",
    color: "#f59e0b",
    count: 1_351_114,
    median: 211_652,
    p05: 125_015,
    p95: 1_099_671,
  },
] as const;

const onedoGasBaselines = {
  dex: [
    { label: { zh: "1Do DEX · 一笔完整交易", en: "1Do DEX · one complete transaction" }, low: 88_098, high: 137_173, median: 103_624, color: "#10b981" },
  ],
  nft: [
    { label: { zh: "1Do NFT Market · 一笔完整交易", en: "1Do NFT Market · one complete transaction" }, low: 97_722, high: 143_187, median: 117_581, color: "#10b981" },
  ],
} as const;

const approvalGasData = {
  uniswap: { label: "Uniswap ERC-20 approve", count: 1_977_726, median: 46_663, p05: 38_410, p95: 55_558, color: "#64748b" },
  opensea: { label: "OpenSea NFT approve", count: 531_648, median: 46_371, p05: 28_856, p95: 59_430, color: "#64748b" },
} as const;

const paymentGasData = {
  eip3009: { count: 148_480, median: 81_053, p05: 81_009, p95: 102_909, color: "#2775ca" },
  erc8112: { low: 51_975, high: 86_187, median: 69_081, color: "#10b981" },
} as const;

const zhSections: WhitepaperSection[] = [
  {
    id: "abstract",
    title: "摘要",
    blocks: [
      { type: "paragraph", text: "1Do 是新一代链上账户与应用运行平台。它的目标不是再造一个托管式应用入口，而是把账户、资产授权、签名验证和应用执行边界收敛到用户自己的地址。" },
      { type: "paragraph", text: "在 1Do 中，用户可以用 EOA 激活 ERC-7702 运行时，也可以使用已有智能合约账户；同一个地址既是钱包，也是应用运行环境，也是 DeFi、支付、NFT 和遗产应用的结算边界。应用可以独立创新，但不能把用户从自己的账户边界里搬走。" },
      { type: "list", items: ["账户跟随用户，而不是跟随某个应用。", "资产权限收敛在钱包运行时，而不是散落在代币、路由器、市场和支付合约里。", "应用在用户账户运行时中执行，并通过钱包原生授权结算。", "用户体验从理解底层合约调用，转向理解自己正在完成的动作。"] },
    ],
  },
  {
    id: "concepts",
    title: "现有概念介绍",
    blocks: [
      { type: "paragraph", text: "以太坊早期默认用户使用 EOA。EOA 没有代码、没有本地状态，也不能表达细粒度执行策略，所以 DeFi 把大量权限逻辑下沉到代币、路由器、市场、金库或应用合约里。" },
      { type: "paragraph", text: "ERC-20 approve(spender, amount) / allowance(owner, spender) 是当前 DeFi 最典型的交互模型。用户先批准路由器或应用使用某个代币，再由应用在交易、支付、订阅或结算时通过 transferFrom 拉取资产。NFT 也有类似问题：approve、setApprovalForAll 和操作员授权把用户级权限长期放在资产合约或市场合约里。" },
      { type: "subheading", text: "Uniswap" },
      { type: "paragraph", text: "Uniswap 通过 AMM、流动性池和路由器完成 ERC-20 兑换。它开放、可组合且不要求用户预存平台余额，但在需要新授权的典型首次交互路径中，用户通常先发送 approve，再发送 swap；approve 是这两笔用户交易中的第一笔，占该路径交易次数和确认次数的一半，而不是全部 Uniswap 主网交易的占比。Permit2 和 Universal Router 改善了授权复用、签名和路由体验，但权限仍由外部 spender 模型承载。" },
      { type: "subheading", text: "OpenSea" },
      { type: "paragraph", text: "OpenSea 等 NFT 市场通常让 NFT 在成交前留在用户地址，由用户签署挂牌或报价，再由市场合约在成交时转移 NFT 和支付资产。卖家可能需要先对单个 NFT 执行 approve，或通过 setApprovalForAll 授予整个藏品范围的操作员权限；使用 ERC-20 支付的一方也可能需要代币授权。订单本身可以链下签署，但资产转移权限仍可能长期留在 NFT 或代币合约中。" },
      { type: "subheading", text: "USDT 与 USDC" },
      { type: "paragraph", text: "USDT 与 USDC 广泛用于链上支付和 DeFi 结算。支付场景需要清晰表达付款方、收款方、金额、币种、网络和有效期，并允许网站、API、Agent 或中继者可靠提交结算。USDT 具有广泛的流动性和多链覆盖；USDC 则提供较完整的开发者工具和可编程支付支持，常用于结账、免 Gas 支付、API 计费和企业结算。" },
      { type: "paragraph", text: "在授权模型上，很多 USDT / USDC 支付仍走 ERC-20 transfer 或 approve + transferFrom；USDC 还支持 EIP-3009 transferWithAuthorization / receiveWithAuthorization，让付款方用 EIP-712 签名授权一次具体转账，合约通过 nonce 和有效期防止重放，不需要先写入 USDC.allowance。x402 则把支付请求放到 HTTP 402 语义中，让 API、内容、AI Agent 和自动化客户端可以按请求用 USDC 等稳定币付款。不过，EIP-3009 等能力是新版 USDC 等特定代币额外实现的功能，并不是 ERC-20 的通用组成部分；大部分 ERC-20 代币以及不同网络上的旧版或桥接资产并不支持相同接口。支付应用因此不能假设所有代币都具备签名转账、有效期和 nonce 等能力，通常仍要识别具体合约与网络，并为只支持基础 ERC-20 的资产保留 transfer 或 approve + transferFrom 路径。x402 统一的是支付请求和响应流程，也不会自动为底层代币补充这些合约功能。" },
      { type: "subheading", text: "现有应用和 ERC-20 模式的风险与成本" },
      { type: "paragraph", text: "上述模式支撑了 DeFi 的早期发展，但也把资产权限分散在 Token allowance、NFT operator、Router、Market、支付合约和托管平台中。交互成本首先体现在需要新授权的路径：approve + execute 是两笔交易，其中 approve 占该路径交易次数的一半。白皮书后文使用 2026 年上半年主网成功交易回执中位数比较 approve 与结算成本；这些 Gas 不完成 swap、挂牌或支付本身，只为后续执行建立权限。" },
      { type: "paragraph", text: "公开数据已经足够说明规模。Chainalysis 在 2023 年 12 月估算，样本地址自 2021 年 5 月以来通过 approval phishing 造成约 10 亿美元损失，其中 2022 年约 5.168 亿美元、2023 年截至 11 月约 3.746 亿美元；Chainalysis 2026 年 6 月又披露 Operation Spincaster 在多个国家处理超过 7,000 条线索，关联约 1.62 亿美元损失。Scam Sniffer 的年度报告显示，EVM 钱包 drainer 钓鱼在 2024 年造成约 4.94 亿美元损失，2025 年回落至约 8,400 万美元。这些损失并不只来自某一个项目，而是来自现有账户和资产授权范式中可复用、可伪装、可长期残留的权限。" },
      { type: "paragraph", text: "另一类常见体验是先存入平台再使用：交易平台、借贷池、金库、订单簿或托管合约先接收用户资产，然后在平台内部记账、撮合、结算或清算。这简化了应用逻辑，但用户的资产边界从自己的钱包转移到了平台合约。这同样不是抽象风险：Chainalysis 统计 2024 年 crypto platforms 被盗约 22 亿美元，DeFi 在一季度仍是最大被盗资产来源，中心化服务在二、三季度成为主要目标；2025 年上半年，cryptocurrency services 被盗已超过 21.7 亿美元，其中 Bybit 单一事件约 15 亿美元。TRM Labs 也估算 2024 年 hacks and exploits 造成约 22 亿美元损失，三年合计超过 77 亿美元。平台存入模型把多个用户的资产集中到同一服务、合约或密钥体系中，一旦业务逻辑、访问控制、私钥管理或跨链组件失守，损失会被集中放大。" },
      { type: "subheading", text: "优点与代价" },
      { type: "list", items: ["优点：模型简单、组合性强，适配没有代码和本地状态的 EOA 账户；当前 DeFi 和 NFT 市场大量依赖它启动。", "代价：授权是持久状态，交易结束后 allowance 或 operator 授权仍可能存在；授权对象是支出方或操作员，而不是一次具体业务动作。", "代价：approve + execute 通常意味着两笔交易和两次钱包确认，用户需要付出更多时间成本和 Gas 成本。", "代价：平台预存模型让资产可用性和退出路径依赖平台逻辑，并集中业务逻辑、访问控制、私钥管理或跨链组件失效带来的风险。"] },
    ],
  },
  {
    id: "onedo",
    title: "1Do",
    blocks: [
      { type: "subheading", text: "状态模型差异" },
      { type: "paragraph", text: "传统 DeFi 中，用户地址主要是签名主体，状态和权限通常留在外部协议里：Token allowance、NFT operator、池子、金库、订单和平台余额。" },
      { type: "diagram", variant: "traditional", language: "zh" },
      { type: "paragraph", text: "1Do 把运行时放回用户地址。`executeRuntimeApp(app, data)` 通过 delegatecall 让应用逻辑进入用户账户执行帧；`enabledApps`、nonce 和应用状态使用命名空间存储，临时资产拉取则只存在于一次执行窗口。" },
      { type: "diagram", variant: "onedo", language: "zh" },
      { type: "list", items: ["传统 DeFi：第一笔交易先在 Token 上写 allowance；第二笔交易才执行业务，allowance 可能继续存在。", "1Do：一笔交易内设置本次可拉取金额，应用逻辑进入账户执行帧；交易结束后拉取记录清除，Token 不留下 allowance。"] },
      { type: "paragraph", text: "主图只比较两种最常见路径：传统 approve / execute 两笔交易，以及 1Do Token Pull 一笔交易。核心差异是：传统路径先留下 Token 授权状态，1Do 路径只在账户运行时里创建本次交易的拉取上下文。" },
      { type: "subheading", text: "账户本身就是应用的运行时" },
      { type: "paragraph", text: "1Do 的核心判断是：钱包地址本身才是真正的应用执行边界。主线账户可以是激活 ERC-7702 运行时的用户 EOA，也可以是已经具备运行时能力的智能合约账户；用户连接的地址就是运行时工作地址，不需要把资产迁移到第二个智能钱包地址，也不需要启用资产管理中间层来使用运行时应用。" },
      { type: "paragraph", text: "DEX、NFT Market、Flash Loan、Will 等应用能力不要求用户迁移资产或进入新的平台账户；它们围绕同一个钱包运行时表达业务逻辑、签名验证和结算。测试资产水龙头属于测试网辅助工具，不属于钱包运行时能力本身。" },
      { type: "code", text: runtimeHostInterface },
      { type: "paragraph", text: "运行时通过 ERC-8280 风格的 executeRuntimeApp(app, data) 进入应用执行，并通过本地 enableApp / disableApp 管理某个地址允许哪些应用在自己的钱包运行时中执行。全局注册表门控与用户本地启用是两个不同问题；运行时应用的可执行性可以概括为：" },
      { type: "code", text: "wallet.isAppEnabled(app) && registry.isAppAllowed(app)" },
      { type: "list", items: ["ERC-7702：让 EOA 地址获得合约执行能力；智能合约账户也可以直接承载同一类运行时边界。", "ERC-8280：定义最小运行时应用宿主接口。executeRuntimeApp 无需钱包所有者亲自发送交易即可被触发，但执行仍必须通过用户本地启用、全局注册表门控，以及应用自身的签名或状态校验。", "ERC-1271：让运行时钱包验证 EIP-712 意图、订单、支付授权和遗产计划。", "ERC-7201：用命名空间存储隔离宿主状态与应用状态，降低存储冲突风险。", "ERC-165：让前端、中继者和应用可以发现运行时、资产拉取、签名转账等能力。"] },
      { type: "subheading", text: "一次性资产拉取" },
      { type: "paragraph", text: "在 1Do 运行时及兼容资产拉取接口的执行路径中，一次性资产拉取可以替代独立的 approve 交易。用户不再需要先向 Token、Router 或 Market 单独发送 approve、setApprovalForAll，也不需要建立 allowance 或 operator 权限；ERC-8284 / ERC-8285 在同一笔业务交易中创建一次性拉取上下文、完成资产转移，并在执行结束后清除。" },
      { type: "paragraph", text: "这不是在 approve 之上增加一层签名或复用授权，而是把资产授权从资产合约的持久状态整体上移到用户账户运行时。应用只获得当前目标、当前资产和当前额度或 tokenId 的执行权，不能把本次权限留到下一笔交易。" },
      { type: "code", text: tokenPullInterface },
      { type: "code", text: nftPullInterface },
      { type: "list", items: ["在兼容路径中替代独立 approve 交易：ERC-20 不再需要 approve / allowance，NFT 不再需要 approve / setApprovalForAll / operator 授权。", "授权与业务执行合并为一笔交易，不再采用 approve + execute 两笔交易路径。", "代币拉取绑定目标合约、资产和剩余额度，累计不能超过上限。", "NFT 拉取绑定目标合约、资产和 tokenId，只允许一个目标合约在一次执行中拉取一个具体 NFT。", "执行成功或回滚前清除上下文；执行窗口结束后不留下任何可复用资产授权。"] },
      { type: "subheading", text: "执行流程" },
      { type: "ordered", items: ["用户用当前地址连接钱包运行时；该地址可以是支持 ERC-7702 的 EOA，也可以是智能合约账户。", "EOA 完成一次 ERC-7702 运行时激活后即可持续使用，直至用户主动撤销或更换运行时；智能合约账户则直接使用自身运行时能力。", "用户选择 DEX、NFT Market、Flash Loan、Will 等运行时应用。", "用户对某个应用执行本地 enableApp；平台注册表仍独立控制全局可执行性。", "用户进入应用，签署 EIP-712 意图、订单、遗产计划或转移授权。", "普通运行时操作通过 executeRuntimeApp(app, data) 进入；需要代币拉取时，付款账户调用 executeWithTokenPull(target, data, asset, maxAmount)。target 可以是运行时应用，也可以是兼容 tokenPullToCaller 的传统 DeFi 合约；目标合约在该调用中按需调用 tokenPullToCaller(asset, amount)。", "执行结束后，临时拉取上下文被清除，资产合约中不留下 allowance、operator 或其他可复用授权；钱包运行时只保留用户自行管理的应用启用状态。"] },
    ],
  },
  {
    id: "minimal-tokens",
    title: "最简单的代币",
    blocks: [
      { type: "paragraph", text: "最简单的代币不是要求用户立刻放弃 ERC-20 或 ERC-721。ERC-7196 / ERC-7561 延续 ERC-20 / ERC-721 的余额、归属和基础转移语义，并由钱包运行时补足授权与组合能力。1Do 应用层按同时适配现有 ERC-20 / ERC-721 与这些简化资产标准的方向设计，资产标准变化不应要求重写应用或迁移用户资产。" },
      { type: "paragraph", text: "本节涉及的 1Do ERC 提案目前均按草案理解；接口和命名可能在评审过程中继续调整，实际集成应以对应提案仓库和部署版本为准。" },
      { type: "paragraph", text: "这让 1Do 应用层能够覆盖更广的 Token 标准：资产合约负责余额和归属，账户运行时负责组合、资产拉取和清晰签名。" },
      { type: "paragraph", text: "ERC-7196 / ERC-7561 代表更小的 Token / NFT 方向：ERC-7196 移除 ERC-20 里的 transferFrom、approve、allowance；ERC-7561 移除 ERC-721 里的 approve、setApprovalForAll、getApproved、isApprovedForAll、safeTransferFrom。" },
      { type: "paragraph", text: "与简化资产标准配套，ERC-7204 / ERC-7564 在合约钱包中定义代币 / NFT 的转移、额度和操作员管理接口；ERC-8064 / ERC-8067 进一步提供基于 EIP-712、ERC-1271、作用域 nonce 与有效期的 Permit 扩展，让这些钱包级授权可以通过链下签名由中继者提交。" },
      { type: "subheading", text: "标准关系" },
      { type: "list", items: ["资产层：ERC-7196 / ERC-7561 定义简化的代币与 NFT。", "钱包资产管理层：ERC-7204 / ERC-7564 定义钱包级转移、额度和操作员管理。", "签名授权与转移层：ERC-8064 / ERC-8067 用链下签名建立钱包级授权；ERC-8112 / ERC-8114 用链下签名执行一次明确的代币或 NFT 转移。", "运行时执行层：ERC-8280 定义应用宿主；ERC-8284 / ERC-8285 让目标合约在单次执行窗口内按需拉取代币或 NFT。"] },
      { type: "code", text: erc7196Interface },
      { type: "code", text: erc7561Interface },
    ],
  },
  {
    id: "payments",
    title: "支付",
    blocks: [
      { type: "paragraph", text: "支付不应该只依赖代币合约自己实现 permit，也不应该要求每个支付应用维护一套长期授权额度。1Do 把支付能力放在钱包运行时：一次性转账可以走钱包级结构化数据签名。" },
      { type: "paragraph", text: "ERC-8112 / ERC-8114 对应钱包级代币 / NFT 签名转移，适合一次性或中继转账。签名域绑定钱包地址，nonce 按资产与目标维度隔离；代币合约无需各自实现 permit 等签名授权逻辑，统一由钱包运行时完成验签与防重放。ERC-8112 标准能力面向 ERC-20，1Do 在此基础上扩展约定 asset == address(0) 表示原生资产。" },
      { type: "code", text: erc8112Interface },
      { type: "code", text: erc8114Interface },
      { type: "list", items: ["ERC-8112：标准定义钱包级 ERC-20 签名转移；1Do 扩展支持以 asset == address(0) 表示原生资产。tokenTransferWithSig 校验 EIP-712 + ERC-1271 后完成转账。", "ERC-8114：NFT 的签名转移放在钱包层，nftTransferWithSig 验签后执行 safeTransferFrom。", "x402 可以作为 HTTP 接入方式：一次性 ERC-20 付款可映射到 ERC-8112。"] },
      { type: "subheading", text: "Session Pay：有界的持续支付" },
      { type: "paragraph", text: "一次性签名转移适合单笔付款，但 Agent、API、订阅和高频小额结算需要在不反复唤起钱包的同时保持明确边界。Session Pay 让钱包先签署一份会话授权，固定 session key、收款方、资产、累计支出上限和到期时间；随后由 session key 对递增的累计付款额签名，任何中继者都可以提交结算。" },
      { type: "list", items: ["一次钱包授权：SessionGrant 绑定 session key、payee、token、spendLimit、sessionExpiresAt 与 salt。", "按差额结算：SettlementAuthorization 签署 newTotalPaid，合约只支付它与链上 totalPaid 的差额，旧签名不能重复扣款。", "边界始终有效：累计付款不能倒退或超过上限；会话过期或被用户主动撤销后，后续结算失败。", "支持原生资产与 ERC-20，可用于 x402 Agent 支付、API 计费、订阅和其他需要多次小额结算的场景。"] },
    ],
  },
  {
    id: "applications",
    title: "应用程序",
    blocks: [
      { type: "paragraph", text: "1Do 运行时应用不是把用户资产搬到新的平台账户里，而是在用户自己的钱包运行时中完成业务执行。每个应用保留自己的业务模型，但结算、签名验证、资产拉取和执行边界回到同一个账户运行时。" },
      { type: "subheading", text: "应用限制" },
      { type: "paragraph", text: "运行时应用通过 delegatecall 在用户账户上下文中执行，因此必须隔离存储、限制嵌套执行，并经过代码审计与注册表门控。应用保留自己的业务状态机和结算规则，但不能绕过钱包核心权限，也不能把单次资产拉取变成可复用授权。详细工程约束见“技术附录：运行时应用约束”。" },
      { type: "subheading", text: "DEX" },
      { type: "paragraph", text: "DEX 是链下签名订单与钱包结算的订单簿交易。做市方在链下签署价格、数量、有效期和 nonce 等订单条件，不必把 maker 订单长期写入链上；满足条件后，吃单方可以提交成交交易完成结算。当前基线路径以完整成交为主，使订单状态和结算结果更直接。" },
      { type: "list", items: ["相对 AMM：价格和数量由订单明确表达，成交不依赖流动性池的曲线定价；适合双方按确定条件交换资产。", "相对传统链上订单簿：订单签名可在链下传播或取消，只有成交或取消需要写链，减少挂单本身的链上状态。", "相对 Uniswap 常见首次 ERC-20 交互：吃单方可在一次运行时交易内设置本次可拉取金额并完成结算，无需预先给 router 留长期 allowance。", "相对托管交易平台：资产不进入平台余额；任何满足订单条件的地址都可以提交结算，资产只在成交时转移。"] },
      { type: "subheading", text: "NFT Market" },
      { type: "paragraph", text: "NFT Market 是面向 NFT 的链下签名订单簿，支持 NFT↔NFT 和 NFT↔Token 的撮合。订单在链下表达交易双方的资产、数量、有效期和其他条件；匹配成功后，在一笔交易中从双方钱包完成结算。NFT 和支付资产在成交前始终留在各自账户中。" },
      { type: "list", items: ["相对传统 NFT 市场的常见首次授权路径：结算可围绕订单中的具体 NFT 和支付资产进行，不需要先对整个藏品做 setApprovalForAll。", "相对长期 operator 授权：NFT 拉取绑定目标合约、NFT 合约和 tokenId，市场不能取得可复用的整套藏品转移权。", "相对 NFT↔Token 市场：同一订单簿也可表达 NFT↔NFT 的直接交换，不必先把 NFT 换成代币再完成另一笔购买。", "相对托管市场：订单、匹配和成交状态由市场应用处理，但双方资产不需要预先存入平台。"] },
      { type: "subheading", text: "Session Pay" },
      { type: "paragraph", text: "Session Pay 是面向 Agent、API 和订阅的会话式支付应用。用户只需用钱包签署一次有上限、有收款方和有效期的 SessionGrant；会话期间，session key 可以生成累计结算授权，由网站、Agent 或中继者提交，钱包无需为每笔小额付款重复弹出签名确认。" },
      { type: "list", items: ["相对无限 allowance：权限只适用于指定收款方、资产、累计额度和有效期。", "相对逐笔钱包签名：后续付款由独立 session key 授权，钱包所有者不必参与每次结算。", "相对预充值账户：资金继续留在用户钱包中，只有有效授权被结算时才转给收款方。", "相对简单自动扣款：链上记录累计已付金额，超限、过期、倒退累计值和已撤销会话都会失败。"] },
      { type: "subheading", text: "遗产" },
      { type: "paragraph", text: "Will 让用户在链下签署一份 ETH / ERC-20 加权遗嘱计划。计划包含受益人、权重、执行费、到期时间和触发方式；满足时间或失活条件后，任意执行者都可以提交计划，并把一个或多个尚未处理的资产直接分发给受益人。" },
      { type: "list", items: ["相对传统实体遗嘱或托管方案：资产在触发前继续留在用户账户，不需要预先迁移给平台、律师、多签或遗产合约。", "相对人工执行：受益人、权重、触发条件和执行费用由 EIP-712 签名计划固定，执行者不能自行改写分配规则。", "相对简单时间锁：Will 可以使用时间触发，也可以结合心跳失活与宽限期，更贴近“用户活跃时继续自管、失联后才执行”的需求。", "相对一次性全量分配：同一版本计划可以在多次交易中处理不同资产；已处理资产被记录，避免重复分发。重置计划会递增版本并使旧签名失效。"] },
      { type: "subheading", text: "Flash Loan" },
      { type: "paragraph", text: "Flash Loan 基于 EIP-3156。用户启用应用后，钱包中的 ERC-20 余额可以作为闪电贷流动性；借款、回调和归还在同一笔交易内完成，成功归还后费用按规则分配，其中属于钱包的部分记录为收益。" },
      { type: "list", items: ["相对传统闪电贷池：流动性不必先存入一个独立资金池，钱包余额本身即可在应用启用后参与提供流动性。", "相对普通借贷：闪电贷没有跨区块债务；借款人必须在同一交易的回调中归还本金和费用，否则整笔交易回滚。", "相对单纯闲置余额：钱包所有者可在不迁移资产的前提下选择提供可组合流动性，并保留费用收益的归属。"] },
      { type: "paragraph", text: "这些应用的共同优势不是某个单点 Gas 数字，而是减少迁移、减少长期授权、减少平台余额、减少重复签名，并让用户始终围绕同一个账户边界理解风险。" },
    ],
  },
  {
    id: "developer-constraints",
    title: "技术附录：运行时应用约束",
    blocks: [
      { type: "paragraph", text: "executeRuntimeApp(app, data) 通过 delegatecall 让应用代码运行在用户账户的地址、余额和存储上下文中。错误的存储写入或调用边界会直接影响用户账户，因此运行时应用需要遵守以下约束：" },
      { type: "list", items: ["持久状态使用 ERC-7201 命名空间存储，并通过 @custom:storage-location 标注存储根，避免与账户或其他应用发生存储冲突。", "应用执行地址应指向可审计的直接逻辑实现，不以 Transparent、UUPS 或 Beacon 代理构造额外 delegatecall 链。", "应用不得通过 address(this).call(...) 重新制造外部自调用帧，也不得嵌套 executeRuntimeApp；运行时使用执行锁拒绝嵌套或冲突执行。", "应用可以拥有自己的状态机、事件、错误、定价和结算规则，但不得重复实现钱包自授权、应用启用状态或另一套钱包核心权限。", "ERC-8284 / ERC-8285 的资产拉取仅在当前调用有效，并绑定 target、asset、额度或 tokenId；错误目标、错误资产、超额或嵌套拉取都会失败，调用结束后临时上下文被清除。"] },
    ],
  },
  {
    id: "concerns",
    title: "安全、费用与扩展性",
    blocks: [
      { type: "subheading", text: "安全边界" },
      { type: "paragraph", text: "1Do 的安全模型不是假设所有应用都可信，而是把应用能做什么限制在用户自己的钱包运行时边界内。触发执行的人可以是中继者、交易对手、维护者或普通调用者，但触发者不会因此获得钱包所有者权限。" },
      { type: "list", items: ["所有者权限与触发权限分离：任何人可以触发已启用应用，但不能冒充所有者签名或修改所有者权限。", "本地启用与注册表门控分离：用户本地启用表达账户意愿，注册表表达平台全局可执行性。", "签名验证收敛到钱包运行时：EIP-712 结构化数据通过 ERC-1271 在用户账户边界内验证。", "嵌套运行时执行会被拒绝：应用不能制造新的运行时自调用帧来绕过执行锁和调用者纪律。"] },
      { type: "subheading", text: "治理与恢复" },
      { type: "paragraph", text: "用户可以通过 disableApp 撤销本地应用启用状态；ERC-7702 EOA 也可以主动撤销或替换运行时代码。平台级注册表用于阻止未登记或已下线的应用继续执行。在实际部署中，注册表管理员、升级方式、紧急下线流程、审计记录和恢复方案需要公开，使用户能够判断平台门控的信任边界。" },
      { type: "paragraph", text: "1Do 不声称所有风险都会消失。更清晰的运行时边界可以减少长期授权、平台托管余额和应用自建权限系统带来的风险，但不能替代应用审计、用户判断和清晰的钱包签名展示。" },
      { type: "subheading", text: "费用与效率" },
      { type: "paragraph", text: "1Do 优化的不是单个操作码，而是完整交互路径：减少 approve、平台存入、重复确认和长期授权残留。下面保留三类代表性费用基准；外部协议结算、approve 与 USDC 支付数据采用 2026 年上半年主网成功交易回执中位数，1Do DEX / NFT 与 ERC-8112 展示本地完整交易中位数及范围。受复杂交易和高 Gas 长尾样本影响，本组外部协议结算样本的平均数比中位数高约 25%–74%，因此本文使用中位数描述典型主网交易成本。" },
      { type: "gasEvidence", language: "zh" },
      { type: "subheading", text: "可扩展性" },
      { type: "paragraph", text: "1Do 的扩展性来自账户运行时和应用逻辑的分离：账户保持同一个地址和资产边界，应用作为可启用、可禁用、可发现的运行时逻辑进入账户执行帧。新应用不需要要求用户迁移资产，也不需要每个应用都重新建立一套长期授权系统。" },
      { type: "list", items: ["应用扩展：新增应用可以围绕同一个账户运行时接入，而不是为每个应用创建新的资产账户。", "资产扩展：应用层按兼容 ERC-20 / ERC-721 的方向设计，并可继续接入更小的 Token / NFT 标准。", "前端和中继扩展：ERC-165、注册表和本地 enableApp 让应用能力更容易发现和门控。", "生态扩展：1Do 不要求外部 DeFi 立即改造；现有资产标准、兼容 Pull 路径和未来更小资产标准可以并行。"] },
    ],
  },
  {
    id: "conclusion",
    title: "结论",
    blocks: [
      { type: "paragraph", text: "1Do 不是要把钱包做成一个庞大的中心化应用框架，而是要把账户能力稳定地收敛到用户地址本身。" },
      { type: "paragraph", text: "宏观上，1Do 希望用户激活一次账户运行时，就能持续扩展 DeFi、支付、NFT、遗产与未来应用。" },
      { type: "paragraph", text: "工程基础采用既有标准：ERC-7702 提供 EOA 账户运行时能力，ERC-1271 与 EIP-712 用于合约账户签名和结构化意图，x402 作为 HTTP 支付接入方式，ERC-7201（钻石/命名空间存储）隔离账户与应用的持久状态。" },
      { type: "paragraph", text: "在应用层，ERC-8112 处理一次性签名支付，Session Pay 则展示同一运行时如何承载有收款方、有资产、有累计上限、有期限且可撤销的持续支付会话，为 Agent、API 与订阅提供无需逐笔唤起钱包的结算方式。" },
      { type: "paragraph", text: "1Do 发起的 ERC 草案按四层形成完整体系：" },
      { type: "list", items: ["资产层：ERC-7196 / ERC-7561 定义面向合约钱包的简化代币与 NFT。", "钱包资产管理层：ERC-7204 / ERC-7564 定义钱包级代币与 NFT 管理；ERC-8064 / ERC-8067 增加链下签名 Permit。", "签名转移层：ERC-8112 / ERC-8114 定义钱包级 ERC-20 代币与 NFT 签名转移；1Do 在 ERC-8112 标准能力上扩展原生资产转移。", "运行时执行层：ERC-8280 定义应用宿主与本地启用接口；ERC-8284 / ERC-8285 定义单次执行窗口内、目标绑定的代币与 NFT 拉取。"] },
      { type: "paragraph", text: "这些草案分别处理资产表达、钱包级管理、签名授权、一次性转移和运行时执行，并把用户可理解的权限与结算边界收敛到钱包运行时。" },
    ],
  },
  {
    id: "references",
    title: "参考来源",
    blocks: [
      { type: "list", items: ["Uniswap Labs, Introducing Permit2 & Universal Router, 2022-11-17: https://blog.uniswap.org/permit2-and-universal-router", "OpenSea Developer Documentation, Seaport: https://docs.opensea.io/docs/seaport", "OpenSea Developer Documentation, Get listing creation actions: https://docs.opensea.io/reference/create_listing_actions", "Tether, Supported Protocols and Integration Guidelines: https://tether.to/en/supported-protocols/", "Tether, FAQs: https://tether.to/faqs/", "Circle, 4 Ways to Authorize USDC Smart Contract Interactions, 2025-09-04: https://www.circle.com/blog/four-ways-to-authorize-usdc-smart-contract-interactions-with-circle-sdk", "EIP-3009, Transfer With Authorization: https://eips.ethereum.org/EIPS/eip-3009", "Coinbase Developer Documentation, x402 Overview: https://docs.cdp.coinbase.com/x402/welcome", "x402 Documentation, How x402 Works: https://docs.x402.org/core-concepts/how-x402-works", "Ledger Support, Understanding Ethereum Token Approvals: https://support.ledger.com/article/Ethereum-Token-Approvals-Explained", "MetaMask Help Center, What is a token approval?: https://support.metamask.io/stay-safe/safety-in-web3/what-is-a-token-approval/", "Chainalysis, Targeted Approval Phishing Scams See Explosive Growth Over Last Two Years, 2023-12-14: https://www.chainalysis.com/blog/approval-phishing-cryptocurrency-scams-2023/", "Chainalysis, Approval Phishing: From Just One Case to Full-Scale Disruption, 2026-06-17: https://www.chainalysis.com/blog/what-is-approval-phishing/", "Scam Sniffer Reports archive, 2024 and 2025 wallet drainer annual loss estimates: https://drops.scamsniffer.io/category/reports/", "Chainalysis, $2.2 Billion Stolen from Crypto Platforms in 2024, 2024-12-19: https://www.chainalysis.com/blog/crypto-hacking-stolen-funds-2025/", "Chainalysis, 2025 Crypto Crime Mid-year Update, 2025-07-17: https://www.chainalysis.com/blog/2025-crypto-crime-mid-year-update/", "TRM Labs, $2.2 billion was stolen in crypto-related hacks in 2024, 2025-03-17: https://www.trmlabs.com/resources/blog/category-deep-dive-2-2-billion-was-stolen-in-crypto-related-hacks-in-2024"] },
      { type: "list", items: ["Google Cloud Blockchain Analytics，Ethereum Mainnet 数据集：https://cloud.google.com/blockchain-analytics/docs/supported-datasets", "Google BigQuery crypto_ethereum 公共数据集：https://console.cloud.google.com/marketplace/product/ethereum/crypto-ethereum-blockchain"] },
      { type: "list", items: ["ERC-7196：Simple token, Simplified ERC-20：https://eips.ethereum.org/EIPS/eip-7196", "ERC-7561：Simple NFT, Simplified ERC-721：https://eips.ethereum.org/EIPS/eip-7561", "ERC-7204：Contract wallet management token：https://eips.ethereum.org/EIPS/eip-7204", "ERC-7564：Contract wallet management NFT：https://eips.ethereum.org/EIPS/eip-7564", "ERC-8064：Contract Wallet Management Token Permit Extension：https://github.com/1do-labs/ERCs/blob/feat/erc7204-permit/ERCS/erc-8064.md", "ERC-8067：NFT Permit Extension for Smart Wallet：https://github.com/1do-labs/ERCs/blob/feat/erc7564-permit/ERCS/erc-8067.md", "ERC-8112：Token Transfer With Signature：https://github.com/1do-labs/ERCs/blob/feat/tokentransfer-auth/ERCS/erc-8112.md", "ERC-8114：NFT Transfer With Signature：https://github.com/1do-labs/ERCs/blob/feat/nfttransfer-sig/ERCS/erc-8114.md", "ERC-8280：Contract Runtime Apps：https://github.com/1do-labs/ERCs/blob/feat/runtimeapp/ERCS/erc-8280.md", "ERC-8284：Wallet-Scoped Token Pull Execution：https://github.com/1do-labs/ERCs/blob/feat/tokenpull/ERCS/erc-8284.md", "ERC-8285：Wallet-Scoped NFT Pull Execution：https://github.com/1do-labs/ERCs/blob/feat/nftpull/ERCS/erc-8285.md", "ERC-165：Standard Interface Detection：https://eips.ethereum.org/EIPS/eip-165", "ERC-1271：Standard Signature Validation Method for Contracts：https://eips.ethereum.org/EIPS/eip-1271", "EIP-712：Typed Structured Data Hashing and Signing：https://eips.ethereum.org/EIPS/eip-712", "ERC-7201：Namespaced Storage Layout：https://eips.ethereum.org/EIPS/eip-7201", "EIP-7702：Set Code for EOAs：https://eips.ethereum.org/EIPS/eip-7702"] },
    ],
  },
];

const enSections: WhitepaperSection[] = [
  {
    id: "abstract",
    title: "Abstract",
    blocks: [
      { type: "paragraph", text: "1Do is a next-generation onchain account and application runtime platform. Its goal is not to create another custodial application surface, but to converge account authority, asset authorization, signature validation, and app execution boundaries back to the user's own address." },
      { type: "paragraph", text: "In 1Do, users can activate an ERC-7702 runtime on an EOA or use an existing smart contract account. The same address is the user's wallet, app runtime, and settlement boundary for DeFi, payments, NFTs, wills, and future applications. Apps can innovate independently, but they cannot move users out of their own account boundary." },
      { type: "list", items: ["The account follows the user, not one app.", "Asset authority converges in the wallet runtime, not across tokens, routers, markets, and payment contracts.", "Apps execute inside the user's account runtime and settle through wallet-native authorization.", "The user experience shifts from understanding low-level contract calls to understanding the action being completed."] },
    ],
  },
  {
    id: "concepts",
    title: "Existing Concepts",
    blocks: [
      { type: "paragraph", text: "Early Ethereum apps assumed EOAs. An EOA has no code, no local state, and no way to express fine-grained execution policy, so DeFi pushed permission logic down into tokens, routers, markets, vaults, and app contracts." },
      { type: "paragraph", text: "ERC-20 approve(spender, amount) plus allowance(owner, spender) is the common DeFi interaction model. The user approves a router or app first, then the app later pulls assets with transferFrom. NFTs have the same pattern: approve, setApprovalForAll, and operator approval place user-level authority in asset or marketplace contracts." },
      { type: "subheading", text: "Uniswap" },
      { type: "paragraph", text: "Uniswap uses AMMs, liquidity pools, and routers to swap ERC-20 assets. The model is open, composable, and does not require a platform-custodied balance. In a typical first-use path that needs new authorization, however, the user sends approve and then swap; approve is the first of those two user transactions and therefore half of that path's transaction and confirmation count, not half of all Uniswap mainnet transactions. Permit2 and Universal Router improve reuse, signing, and routing, but authority is still carried by an external spender model." },
      { type: "subheading", text: "OpenSea" },
      { type: "paragraph", text: "NFT markets such as OpenSea commonly keep an NFT at the user's address until fulfillment: the user signs a listing or offer, and a marketplace contract later transfers the NFT and payment asset. A seller may first approve one NFT or grant setApprovalForAll over an entire collection; an ERC-20 payer may also need token authorization. Orders can be signed offchain, while asset-transfer authority may remain persistently in the NFT or token contract." },
      { type: "subheading", text: "USDT and USDC" },
      { type: "paragraph", text: "USDT and USDC are widely used for onchain payments and DeFi settlement. A payment flow needs to make the payer, recipient, amount, asset, network, and validity clear enough for websites, APIs, agents, or relayers to settle reliably. USDT offers broad liquidity and multichain coverage, while USDC provides extensive developer tooling and programmable-payment support for checkout, gas-sponsored payment, API billing, and business settlement." },
      { type: "paragraph", text: "Many USDT / USDC payments still use ERC-20 transfer or approve plus transferFrom. USDC also supports EIP-3009 transferWithAuthorization / receiveWithAuthorization, where the payer signs EIP-712 typed data for one concrete transfer and the contract uses a nonce and validity window to prevent replay without first writing USDC.allowance. x402 moves payment requests into HTTP 402 semantics, allowing APIs, content, AI agents, and automated clients to pay per request with USDC and other stablecoins. However, capabilities such as EIP-3009 are extra features implemented by specific tokens such as newer USDC contracts, not a universal part of ERC-20. Most ERC-20 tokens, along with older or bridged assets on different networks, do not expose the same interfaces. Payment applications therefore cannot assume every token supports signed transfers, validity windows, or nonces: they generally need to identify the exact contract and network and retain transfer or approve plus transferFrom paths for basic ERC-20 assets. x402 standardizes the payment request and response flow, but it does not add these contract capabilities to the underlying token." },
      { type: "subheading", text: "Risks and Costs in Existing Apps and ERC-20 Models" },
      { type: "paragraph", text: "These models supported DeFi's early development, but they spread asset authority across token allowance, NFT operators, routers, markets, payment contracts, and custody platforms. Interaction cost first appears in paths that need new authorization: approve plus execute is two transactions, and approve is half of that path's transaction count. The benchmarks below use H1 2026 median successful mainnet receipts to compare approval and settlement costs. Approval gas does not complete the intended swap, listing, or payment; it only creates authority for later execution." },
      { type: "paragraph", text: "Public data is already large enough to matter. In December 2023, Chainalysis estimated roughly $1.0 billion lost to approval phishing from its sample since May 2021, including about $516.8 million in 2022 and $374.6 million through November 2023; in June 2026, Chainalysis also reported that Operation Spincaster processed more than 7,000 leads tied to about $162 million in losses. Scam Sniffer's annual reporting estimated about $494 million lost to EVM wallet drainer phishing in 2024, falling to about $84 million in 2025. These losses do not belong to one project; they come from reusable, disguiseable, and long-lived authority in the existing account and asset-authorization model." },
      { type: "paragraph", text: "Another common model is deposit-before-use: exchanges, lending pools, vaults, orderbooks, or custody contracts receive user assets first, then handle internal accounting, matching, settlement, or liquidation. This simplifies app logic, but moves the user's asset boundary from the wallet to the platform contract. This is not an abstract risk either: Chainalysis estimated about $2.2 billion stolen from crypto platforms in 2024, with DeFi accounting for the largest share of stolen assets in Q1 and centralized services becoming the most targeted platform type in Q2 and Q3; by mid-2025, more than $2.17 billion had already been stolen from cryptocurrency services, including the roughly $1.5 billion Bybit incident. TRM Labs also estimated about $2.2 billion lost to hacks and exploits in 2024, with more than $7.7 billion lost over three years. Deposit-based models concentrate many users' assets inside the same service, contract, or key-management system, so failures in business logic, access control, private-key management, or cross-chain components can amplify losses." },
      { type: "subheading", text: "Benefits and Costs" },
      { type: "list", items: ["Benefit: simple and composable, and well suited to EOA accounts with no code or local state; much of today's DeFi and NFT market infrastructure started this way.", "Cost: approval is persistent state, so allowance or operator approval can remain after a transaction; it authorizes a spender or operator rather than one concrete business action.", "Cost: approve plus execute often means two transactions and two wallet confirmations, adding user time and gas cost.", "Cost: deposit-based platforms make asset availability and exit paths depend on platform logic, while concentrating the risk of failures in business logic, access control, private-key management, or cross-chain components."] },
    ],
  },
  {
    id: "onedo",
    title: "1Do",
    blocks: [
      { type: "subheading", text: "State Model Difference" },
      { type: "paragraph", text: "In traditional DeFi, the user address is mostly the signer, while state and authority live in external protocols: token allowance, NFT operators, pools, vaults, orders, and platform balances." },
      { type: "diagram", variant: "traditional", language: "en" },
      { type: "paragraph", text: "1Do moves the runtime back to the user's address. `executeRuntimeApp(app, data)` delegatecalls app logic into the user-account frame; `enabledApps`, nonces, and app state use namespaced storage, while asset-pull authority exists only for one execution window." },
      { type: "diagram", variant: "onedo", language: "en" },
      { type: "list", items: ["Traditional DeFi: the first transaction writes allowance on the token; the second transaction executes the business action, and allowance may remain.", "1Do: one transaction writes a transient pull context, app logic enters the account execution frame, and the context is cleared afterward with no token allowance left behind."] },
      { type: "paragraph", text: "The main diagram compares only the two common paths: the traditional approve / execute two-transaction path and the 1Do token-pull one-transaction path. The core difference is that the traditional path leaves token authorization state first, while the 1Do path creates a pull context inside the account runtime for the current transaction." },
      { type: "subheading", text: "The Account Itself Is the App Runtime" },
      { type: "paragraph", text: "1Do's central claim is that the wallet address itself is the app execution boundary. The main account can be a user EOA with an activated ERC-7702 runtime or a smart contract account that already has runtime capability. The connected address is the runtime address; users do not need to migrate assets to a second smart-wallet address or enable an asset-management middle layer before using runtime apps." },
      { type: "paragraph", text: "Account capabilities such as Dex, NFT Market, Flash Loan, and Will do not require users to migrate assets or enter a new platform account. They express business logic, signature validation, and settlement around the same wallet runtime. Test-asset faucets are testnet support tools, not wallet-runtime capabilities themselves." },
      { type: "code", text: runtimeHostInterface },
      { type: "paragraph", text: "The runtime enters app execution through an ERC-8280-style executeRuntimeApp(app, data), while enableApp / disableApp records which apps an address allows inside its own wallet runtime. Global registry gating and user-local enablement are separate gates; runtime app executability can be summarized as:" },
      { type: "code", text: "wallet.isAppEnabled(app) && registry.isAppAllowed(app)" },
      { type: "list", items: ["ERC-7702 lets an EOA address gain executable contract behavior; smart contract accounts can also host the same kind of runtime boundary directly.", "ERC-8280 defines the minimum runtime app host surface. executeRuntimeApp can be triggered without the wallet owner submitting the transaction, but execution still has to pass local enablement, global registry gating, and the app's own signature or state rules.", "ERC-1271 lets runtime wallets validate EIP-712 intents, orders, payment authorizations, and will plans.", "ERC-7201 uses namespaced storage to isolate host state and app state.", "ERC-165 lets frontends, relayers, and apps discover runtime, pull, transfer-with-signature, and related capabilities."] },
      { type: "subheading", text: "One-Time Asset Pulls" },
      { type: "paragraph", text: "Within 1Do runtime paths and targets compatible with the asset-pull interface, one-time asset pulls can replace separate approve transactions. Users no longer send approve or setApprovalForAll to a token, router, or market, and no allowance or operator authority is created. ERC-8284 / ERC-8285 create a one-time pull context, move the asset, and clear the context inside the same business transaction." },
      { type: "paragraph", text: "This is not another signature layer on top of approve or a reusable approval wrapper. It moves asset authorization out of persistent asset-contract state and into the user's account runtime. An app receives authority only for the current target, asset, amount cap, or tokenId, and cannot carry that authority into a later transaction." },
      { type: "code", text: tokenPullInterface },
      { type: "code", text: nftPullInterface },
      { type: "list", items: ["Replaces separate approve transactions on compatible paths: ERC-20 needs no approve / allowance, while NFTs need no approve / setApprovalForAll / operator authority.", "Authorization and business execution become one transaction instead of an approve + execute sequence.", "Token pull binds target, asset, and remainingAmount; cumulative pull cannot exceed the cap.", "NFT pull binds target, asset, and tokenId; one target can pull one specific NFT during one execution.", "The context is cleared before success or revert returns, leaving no reusable asset authorization after the execution window."] },
      { type: "subheading", text: "Execution Flow" },
      { type: "ordered", items: ["The user connects the current address to a wallet runtime; the address can be an ERC-7702-capable EOA or a smart contract account.", "After one ERC-7702 runtime activation, an EOA can keep using the runtime until the user revokes or replaces it; a smart contract account uses its own runtime capability directly.", "The user selects a runtime app such as DEX, NFT Market, Flash Loan, or Will.", "The user locally enables an app with enableApp; the platform registry still controls global executability independently.", "The user enters the app and signs an EIP-712 intent, order, will plan, or transfer authorization.", "Normal runtime actions enter through executeRuntimeApp(app, data). For a token pull, the paying account calls executeWithTokenPull(target, data, asset, maxAmount). The target can be a runtime app or a traditional DeFi contract compatible with tokenPullToCaller; the target contract calls tokenPullToCaller(asset, amount) as needed during that call.", "After execution, temporary pull context is cleared and the asset contract retains no allowance, operator, or other reusable authorization; the wallet runtime keeps only app-enablement state controlled by the user."] },
    ],
  },
  {
    id: "minimal-tokens",
    title: "Minimal Tokens",
    blocks: [
      { type: "paragraph", text: "Minimal tokens do not require users to abandon ERC-20 or ERC-721. ERC-7196 / ERC-7561 retain the balance, ownership, and basic-transfer semantics of ERC-20 / ERC-721, while wallet runtimes supply authorization and composition. The 1Do app layer is designed to support existing ERC-20 / ERC-721 assets alongside these simplified standards, so a change in asset standard should not require rewriting an app or migrating user assets." },
      { type: "paragraph", text: "The 1Do ERC proposals in this section should currently be read as drafts. Interfaces and names may continue to change during review, and integrations should follow the corresponding proposal repository and deployed version." },
      { type: "paragraph", text: "This gives the 1Do app layer broad coverage across token standards: asset contracts handle balances and ownership, while the account runtime handles composition, asset pull, and clear signing." },
      { type: "paragraph", text: "ERC-7196 / ERC-7561 point toward smaller token / NFT contracts: ERC-7196 removes transferFrom, approve, and allowance from ERC-20; ERC-7561 removes approve, setApprovalForAll, getApproved, isApprovedForAll, and safeTransferFrom from ERC-721." },
      { type: "paragraph", text: "Alongside these simplified asset standards, ERC-7204 / ERC-7564 define wallet-level token / NFT transfer, allowance, and operator-management interfaces. ERC-8064 / ERC-8067 add Permit extensions based on EIP-712, ERC-1271, scoped nonces, and validity windows, allowing relayers to submit these wallet-level authorizations from offchain signatures." },
      { type: "subheading", text: "How the Standards Fit Together" },
      { type: "list", items: ["Asset layer: ERC-7196 / ERC-7561 define simplified tokens and NFTs.", "Wallet asset-management layer: ERC-7204 / ERC-7564 define wallet-level transfers, allowances, and operator management.", "Signed authorization and transfer layer: ERC-8064 / ERC-8067 establish wallet-level authorization from offchain signatures; ERC-8112 / ERC-8114 use offchain signatures for one explicit token or NFT transfer.", "Runtime execution layer: ERC-8280 defines the app host; ERC-8284 / ERC-8285 let a target pull tokens or NFTs as needed within one execution window."] },
      { type: "code", text: erc7196Interface },
      { type: "code", text: erc7561Interface },
    ],
  },
  {
    id: "payments",
    title: "Payments",
    blocks: [
      { type: "paragraph", text: "Payments should not depend only on token-specific permit support, and each payment app should not maintain its own long-lived allowance system. 1Do puts payment authority in the wallet runtime: one-off transfers can use wallet-level typed data." },
      { type: "paragraph", text: "ERC-8112 / ERC-8114 correspond to wallet-level token / NFT transfer with signature, which fits one-off or relayed transfers. The signing domain binds to the wallet address, and nonces are isolated by asset and recipient dimensions. ERC-8112 standardizes ERC-20 transfers; 1Do extends it by treating asset == address(0) as the native asset." },
      { type: "code", text: erc8112Interface },
      { type: "code", text: erc8114Interface },
      { type: "list", items: ["ERC-8112 standardizes signed ERC-20 transfer at the wallet layer; the 1Do extension also supports the native asset through asset == address(0). tokenTransferWithSig validates EIP-712 + ERC-1271 before transfer.", "ERC-8114 puts NFT transfer with signature at the wallet layer; nftTransferWithSig validates then calls safeTransferFrom.", "x402 can be an HTTP entry point: a one-off ERC-20 payment can map to ERC-8112."] },
      { type: "subheading", text: "Session Pay: Bounded Recurring Payments" },
      { type: "paragraph", text: "One-off signed transfers suit individual payments, while agents, APIs, subscriptions, and frequent micropayments need clear limits without reopening the wallet for every charge. Session Pay lets the wallet sign one session grant that fixes the session key, payee, asset, cumulative spend limit, and expiry. The session key then signs increasing cumulative payment totals, and any relayer can submit settlement." },
      { type: "list", items: ["One wallet authorization: SessionGrant binds the session key, payee, token, spendLimit, sessionExpiresAt, and salt.", "Delta settlement: SettlementAuthorization signs newTotalPaid, and the contract pays only the difference from onchain totalPaid, so an old authorization cannot charge twice.", "Persistent bounds: the cumulative total cannot decrease or exceed the limit; settlement fails after expiry or user revocation.", "Native assets and ERC-20 tokens are supported for x402 agent payments, API billing, subscriptions, and other repeated micropayment flows."] },
    ],
  },
  {
    id: "applications",
    title: "Applications",
    blocks: [
      { type: "paragraph", text: "1Do runtime apps do not move user assets into a new platform account. They execute business logic inside the user's own wallet runtime. Each app keeps its business model, while settlement, signature validation, asset pull, and execution boundaries converge in the same account runtime." },
      { type: "subheading", text: "Application Constraints" },
      { type: "paragraph", text: "Runtime apps execute with delegatecall in the user's account context, so they must isolate storage, restrict nested execution, and pass code review and registry gating. An app keeps its own business state machine and settlement rules, but cannot bypass wallet-core authority or turn a one-time asset pull into reusable permission. Detailed engineering rules appear in “Technical Appendix: Runtime App Constraints.”" },
      { type: "subheading", text: "DEX" },
      { type: "paragraph", text: "DEX is an order-book exchange built around offchain signed orders and wallet settlement. A maker signs price, amount, expiry, nonce, and other order terms offchain instead of maintaining a maker order onchain; once conditions are met, a taker can submit a fill transaction. The current baseline focuses on full fills, keeping order state and settlement outcomes direct." },
      { type: "list", items: ["Compared with an AMM: price and amount are explicit in the order, and execution does not depend on a liquidity-pool pricing curve; this suits assets exchanged on agreed terms.", "Compared with a traditional onchain order book: signed orders can be shared or cancelled offchain, while only a fill or cancellation needs an onchain state change.", "Compared with a common first ERC-20 flow in Uniswap: the taker can set the amount pullable for this transaction and settle in one runtime transaction, without leaving a router with long-lived allowance first.", "Compared with custodial exchanges: assets do not become platform balances; any address that satisfies the order conditions can submit settlement, and assets move only on a fill."] },
      { type: "subheading", text: "NFT Market" },
      { type: "paragraph", text: "NFT Market is an offchain signed order book for NFT trading, supporting NFT-to-NFT and NFT-to-token matching. An order expresses the assets, quantities, expiry, and other terms offchain; when matched, both wallets settle in one transaction. NFTs and payment assets remain in their respective accounts before fulfillment." },
      { type: "list", items: ["Compared with common first-authorization flows in traditional NFT marketplaces: settlement can be scoped to the concrete NFT and payment asset in an order, without first granting setApprovalForAll over an entire collection.", "Compared with long-lived operator approval: NFT pull binds the target contract, NFT contract, and tokenId, so the market does not receive reusable authority to move an entire collection.", "Compared with NFT-to-token marketplaces: the same order book can express a direct NFT-to-NFT exchange, without first selling an NFT for tokens and then making a separate purchase.", "Compared with custodial marketplaces: the market app handles orders, matching, and fill state, while neither side needs to pre-deposit assets into a platform."] },
      { type: "subheading", text: "Session Pay" },
      { type: "paragraph", text: "Session Pay is a session-based payment app for agents, APIs, and subscriptions. The user signs one bounded SessionGrant with a fixed payee and expiry. During the session, a session key can produce cumulative settlement authorizations for a website, agent, or relayer to submit, without another wallet popup for every micropayment." },
      { type: "list", items: ["Compared with unlimited allowance: authority is scoped to one payee, asset, cumulative limit, and validity period.", "Compared with signing every payment in the wallet: an independent session key authorizes later charges without involving the wallet owner each time.", "Compared with a prepaid platform balance: funds remain in the user's wallet and move only when a valid authorization is settled.", "Compared with simple automatic debit: the runtime records the cumulative amount paid, and rejects over-limit, expired, decreasing-total, or revoked sessions."] },
      { type: "subheading", text: "Will" },
      { type: "paragraph", text: "Will lets a user sign one weighted ETH / ERC-20 will plan offchain. The plan contains beneficiaries, weights, executor fee, expiry, and trigger mode; after a time or inactivity condition is satisfied, any executor can submit the plan and distribute one or more unprocessed assets directly to beneficiaries." },
      { type: "list", items: ["Compared with a traditional legal will or custody arrangement: assets remain in the user's account before the trigger, with no need to migrate them to a platform, lawyer, multisig, or inheritance contract first.", "Compared with manual execution: beneficiaries, weights, trigger conditions, and executor fee are fixed by an EIP-712 signed plan, so an executor cannot rewrite distribution rules.", "Compared with a simple timelock: Will can use a time trigger or combine heartbeat inactivity with a grace period, matching the need for self-custody while active and execution only after loss of activity.", "Compared with one-off full distribution: the same plan version can process different assets across several transactions; settled assets are recorded to prevent duplicate distribution. Resetting a plan increments its version and invalidates old signatures."] },
      { type: "subheading", text: "Flash Loan" },
      { type: "paragraph", text: "Flash Loan is based on EIP-3156. Once a user enables the app, ERC-20 balances in the wallet can serve as flash-loan liquidity; borrowing, callback, and repayment occur in the same transaction. After successful repayment, fees are allocated by rule, with the wallet's portion recorded as earnings." },
      { type: "list", items: ["Compared with a traditional flash-loan pool: liquidity does not need to be deposited into a separate pool; wallet balances can provide liquidity after the app is enabled.", "Compared with ordinary lending: flash loans create no cross-block debt; the borrower must return principal and fee in the same transaction callback or the entire transaction reverts.", "Compared with idle balances: a wallet owner can choose to provide composable liquidity without migrating assets and retain the economic claim to fee earnings."] },
      { type: "paragraph", text: "The shared advantage is not one isolated gas number. It is fewer migrations, fewer long-lived approvals, fewer platform balances, fewer repeated signatures, and a risk model users can understand around one account boundary." },
    ],
  },
  {
    id: "developer-constraints",
    title: "Technical Appendix: Runtime App Constraints",
    blocks: [
      { type: "paragraph", text: "executeRuntimeApp(app, data) uses delegatecall, so app code runs in the user's account address, balance, and storage context. Incorrect storage or call boundaries directly affect the account, and runtime apps therefore follow these constraints:" },
      { type: "list", items: ["Persistent state uses ERC-7201 namespaced storage and documents its storage root with @custom:storage-location to avoid collisions with the account or other apps.", "The app execution address points to directly auditable logic and does not use Transparent, UUPS, or Beacon proxies to construct another delegatecall chain.", "An app cannot manufacture an external self-call frame through address(this).call(...) or nest executeRuntimeApp; an execution lock rejects nested or conflicting execution.", "An app may own its state machine, events, errors, pricing, and settlement rules, but cannot reimplement wallet self-authorization, app enablement, or another wallet-core permission system.", "ERC-8284 / ERC-8285 pulls are valid only for the current call and bind target, asset, amount cap, or tokenId. Wrong-target, wrong-asset, over-cap, or nested pulls fail, and the temporary context is cleared when the call ends."] },
    ],
  },
  {
    id: "concerns",
    title: "Security, Cost, and Scalability",
    blocks: [
      { type: "subheading", text: "Security Boundaries" },
      { type: "paragraph", text: "1Do's security model does not assume every app is trusted. Instead, it constrains what apps can do inside the user's own wallet runtime boundary. A relayer, counterparty, keeper, or ordinary caller may trigger execution, but triggering an enabled app does not grant wallet-owner authority." },
      { type: "list", items: ["Owner authority and trigger authority are separate.", "Local enablement and registry gating are separate.", "Signature validation converges in the wallet runtime through ERC-1271 and EIP-712.", "Nested runtime execution is rejected so apps cannot bypass execution locks or caller discipline."] },
      { type: "subheading", text: "Governance and Recovery" },
      { type: "paragraph", text: "A user can revoke local app enablement through disableApp, and an ERC-7702 EOA can revoke or replace its runtime code. The platform registry prevents unregistered or delisted apps from continuing to execute. In a production deployment, registry administrators, upgrade procedures, emergency delisting, audit records, and recovery paths need to be public so users can evaluate the trust boundary of platform-level gating." },
      { type: "paragraph", text: "1Do does not claim that all risk disappears. A clearer runtime boundary can reduce risks from long-lived approval, platform-custodied balances, and app-owned permission systems, but it does not replace app audits, user judgment, or clear wallet signing displays." },
      { type: "subheading", text: "Cost and Efficiency" },
      { type: "paragraph", text: "1Do optimizes the complete interaction path rather than one opcode: fewer approvals, platform deposits, repeated confirmations, and persistent permissions. External-protocol settlement, approval, and USDC payment figures below use median successful H1 2026 mainnet receipts. 1Do DEX / NFT and ERC-8112 figures show local complete-transaction medians and ranges. Complex transactions and high-gas tails make the means in this external settlement sample about 25%–74% higher than the medians, so this whitepaper uses medians to represent typical mainnet cost." },
      { type: "gasEvidence", language: "en" },
      { type: "subheading", text: "Scalability" },
      { type: "paragraph", text: "1Do scales by separating the account runtime from app logic: the user keeps the same address and asset boundary, while apps enter as enableable, disableable, discoverable runtime logic. New apps do not need users to migrate assets, and each app does not need to recreate a long-lived approval system." },
      { type: "list", items: ["App scalability: new apps can attach to the same account runtime instead of creating a new asset account per app.", "Asset scalability: the app layer is designed for ERC-20 / ERC-721 compatibility and can support smaller token / NFT standards over time.", "Frontend and relayer scalability: ERC-165, registry gating, and local enableApp make app capabilities easier to discover and gate.", "Ecosystem scalability: 1Do does not require external DeFi to change immediately; current asset standards, compatible pull paths, and future minimal asset standards can coexist."] },
    ],
  },
  {
    id: "conclusion",
    title: "Conclusion",
    blocks: [
      { type: "paragraph", text: "1Do is not trying to turn wallets into a giant centralized app framework. It is trying to converge account capability onto the user's own address." },
      { type: "paragraph", text: "At the macro level, 1Do wants users to activate one account runtime and keep extending DeFi, payments, NFTs, wills, and future apps." },
      { type: "paragraph", text: "The engineering foundation uses existing standards: ERC-7702 provides EOA runtime capability; ERC-1271 and EIP-712 support contract-account signatures and typed intent; x402 is an HTTP payment entry point; and ERC-7201 (diamond / namespaced storage) isolates persistent account and app state." },
      { type: "paragraph", text: "At the application layer, ERC-8112 handles one-off signed payments, while Session Pay shows how the same runtime can support recurring sessions bounded by payee, asset, cumulative limit, expiry, and user revocation, giving agents, APIs, and subscriptions a settlement path without reopening the wallet for every charge." },
      { type: "paragraph", text: "The ERC drafts initiated by 1Do form four layers:" },
      { type: "list", items: ["Asset layer: ERC-7196 / ERC-7561 define simplified tokens and NFTs for contract wallets.", "Wallet asset-management layer: ERC-7204 / ERC-7564 define wallet-level token and NFT management; ERC-8064 / ERC-8067 add offchain-signature Permit flows.", "Signed-transfer layer: ERC-8112 / ERC-8114 define wallet-level signed transfers for ERC-20 tokens and NFTs; 1Do extends ERC-8112 with native-asset transfer.", "Runtime execution layer: ERC-8280 defines the app host and local-enablement interface; ERC-8284 / ERC-8285 define target-bound token and NFT pulls within one execution window."] },
      { type: "paragraph", text: "Together, these drafts address asset representation, wallet-level management, signed authorization, one-time transfer, and runtime execution, converging user-readable authority and settlement at the wallet-runtime boundary." },
    ],
  },
  {
    id: "references",
    title: "References",
    blocks: [
      { type: "list", items: ["Uniswap Labs, Introducing Permit2 & Universal Router, 2022-11-17: https://blog.uniswap.org/permit2-and-universal-router", "OpenSea Developer Documentation, Seaport: https://docs.opensea.io/docs/seaport", "OpenSea Developer Documentation, Get listing creation actions: https://docs.opensea.io/reference/create_listing_actions", "Tether, Supported Protocols and Integration Guidelines: https://tether.to/en/supported-protocols/", "Tether, FAQs: https://tether.to/faqs/", "Circle, 4 Ways to Authorize USDC Smart Contract Interactions, 2025-09-04: https://www.circle.com/blog/four-ways-to-authorize-usdc-smart-contract-interactions-with-circle-sdk", "EIP-3009, Transfer With Authorization: https://eips.ethereum.org/EIPS/eip-3009", "Coinbase Developer Documentation, x402 Overview: https://docs.cdp.coinbase.com/x402/welcome", "x402 Documentation, How x402 Works: https://docs.x402.org/core-concepts/how-x402-works", "Ledger Support, Understanding Ethereum Token Approvals: https://support.ledger.com/article/Ethereum-Token-Approvals-Explained", "MetaMask Help Center, What is a token approval?: https://support.metamask.io/stay-safe/safety-in-web3/what-is-a-token-approval/", "Chainalysis, Targeted Approval Phishing Scams See Explosive Growth Over Last Two Years, 2023-12-14: https://www.chainalysis.com/blog/approval-phishing-cryptocurrency-scams-2023/", "Chainalysis, Approval Phishing: From Just One Case to Full-Scale Disruption, 2026-06-17: https://www.chainalysis.com/blog/what-is-approval-phishing/", "Scam Sniffer Reports archive, 2024 and 2025 wallet drainer annual loss estimates: https://drops.scamsniffer.io/category/reports/", "Chainalysis, $2.2 Billion Stolen from Crypto Platforms in 2024, 2024-12-19: https://www.chainalysis.com/blog/crypto-hacking-stolen-funds-2025/", "Chainalysis, 2025 Crypto Crime Mid-year Update, 2025-07-17: https://www.chainalysis.com/blog/2025-crypto-crime-mid-year-update/", "TRM Labs, $2.2 billion was stolen in crypto-related hacks in 2024, 2025-03-17: https://www.trmlabs.com/resources/blog/category-deep-dive-2-2-billion-was-stolen-in-crypto-related-hacks-in-2024"] },
      { type: "list", items: ["Google Cloud Blockchain Analytics, Ethereum Mainnet dataset: https://cloud.google.com/blockchain-analytics/docs/supported-datasets", "Google BigQuery public crypto_ethereum dataset: https://console.cloud.google.com/marketplace/product/ethereum/crypto-ethereum-blockchain"] },
      { type: "list", items: ["ERC-7196: Simple token, Simplified ERC-20: https://eips.ethereum.org/EIPS/eip-7196", "ERC-7561: Simple NFT, Simplified ERC-721: https://eips.ethereum.org/EIPS/eip-7561", "ERC-7204: Contract wallet management token: https://eips.ethereum.org/EIPS/eip-7204", "ERC-7564: Contract wallet management NFT: https://eips.ethereum.org/EIPS/eip-7564", "ERC-8064: Contract Wallet Management Token Permit Extension: https://github.com/1do-labs/ERCs/blob/feat/erc7204-permit/ERCS/erc-8064.md", "ERC-8067: NFT Permit Extension for Smart Wallet: https://github.com/1do-labs/ERCs/blob/feat/erc7564-permit/ERCS/erc-8067.md", "ERC-8112: Token Transfer With Signature: https://github.com/1do-labs/ERCs/blob/feat/tokentransfer-auth/ERCS/erc-8112.md", "ERC-8114: NFT Transfer With Signature: https://github.com/1do-labs/ERCs/blob/feat/nfttransfer-sig/ERCS/erc-8114.md", "ERC-8280: Contract Runtime Apps: https://github.com/1do-labs/ERCs/blob/feat/runtimeapp/ERCS/erc-8280.md", "ERC-8284: Wallet-Scoped Token Pull Execution: https://github.com/1do-labs/ERCs/blob/feat/tokenpull/ERCS/erc-8284.md", "ERC-8285: Wallet-Scoped NFT Pull Execution: https://github.com/1do-labs/ERCs/blob/feat/nftpull/ERCS/erc-8285.md", "ERC-165: Standard Interface Detection: https://eips.ethereum.org/EIPS/eip-165", "ERC-1271: Standard Signature Validation Method for Contracts: https://eips.ethereum.org/EIPS/eip-1271", "EIP-712: Typed Structured Data Hashing and Signing: https://eips.ethereum.org/EIPS/eip-712", "ERC-7201: Namespaced Storage Layout: https://eips.ethereum.org/EIPS/eip-7201", "EIP-7702: Set Code for EOAs: https://eips.ethereum.org/EIPS/eip-7702"] },
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
    label: "1Do 白皮书",
    title: "新一代链上账户与应用运行平台",
    intro:
      "1Do 从现有 EOA 与 DeFi 授权模型出发，提出以用户地址为应用执行边界的钱包运行时，让 DeFi、支付、NFT、遗产和未来应用围绕同一个链上账户运行。",
    tags: ["中文", "Onchain Account", "Runtime Apps", "ERC-7702"],
    sections: zhSections,
  },
  en: {
    back: "Back to 1Do",
    contents: "On This Page",
    currentLanguage: "English",
    otherLanguage: "中文",
    otherLanguageHref: "/zh/whitepaper",
    label: "1Do Whitepaper",
    title: "1Do Protocol Whitepaper",
    intro:
      "A top-down explanation of the account vision, today's EOA and DeFi permission model, and how runtime, security boundaries, payments, gas cost, and user flows converge inside the user's wallet runtime.",
    tags: ["English", "Runtime Apps", "Security Model", "ERC-7702"],
    sections: enSections,
  },
};

type DiagramTone = "user" | "intent" | "external" | "state" | "result";

type DiagramStep = {
  step: string;
  account: readonly string[];
  token: readonly string[];
  app: readonly string[];
};

type DiagramSummary = {
  account: readonly string[];
  middle: readonly string[];
  result: readonly string[];
};

const diagramCopy = {
  zh: {
    traditionalTitle: "传统 DeFi：两笔交易",
    onedoTitle: "1Do：一笔交易",
    summaryHeaders: {
      account: "用户账户",
      middle: "外部协议",
      result: "状态归属",
    },
      headers: {
        account: "账户",
        token: "Token",
        app: "应用",
      },
    traditional: {
      summary: {
        account: ["EOA", "签名入口", "无本地运行时"],
        middle: ["DeFi Contracts", "token allowance", "订单 / 池子"],
        result: ["协议中心", "状态在外部合约"],
      },
      steps: [
        {
          step: "交易 1",
          account: ["只发起授权"],
          token: ["新增 allowance"],
          app: ["无业务状态变化"],
        },
        {
          step: "交易 2",
          account: ["发起 swap"],
          token: ["transferFrom 转移资产"],
          app: ["执行业务并更新订单状态"],
        },
        {
          step: "交易后状态",
          account: ["余额已变化"],
          token: ["allowance 可能仍存在"],
          app: ["业务状态留在应用合约"],
        },
      ],
    },
    onedo: {
      summaryHeaders: {
        account: "用户账户",
        middle: "应用逻辑",
        result: "状态归属",
      },
      headers: {
        account: "账户 / 运行时",
        token: "Token",
        app: "应用逻辑",
      },
      summary: {
        account: ["ERC-7702 Runtime", "持有资产", "执行代码"],
        middle: ["Runtime App", "delegatecall", "进入账户执行帧"],
        result: ["用户地址中心", "应用是逻辑", "状态在账户内"],
      },
      steps: [
        {
          step: "交易 1",
          account: ["为本笔交易设置可拉取金额", "在账户内执行应用逻辑"],
          token: ["完成转账"],
          app: ["作为账户内逻辑运行"],
        },
        {
          step: "交易后状态",
          account: ["拉取上下文已清除", "应用状态留在账户内"],
          token: ["余额已变化", "无 allowance 残留"],
          app: ["不持有资产或授权"],
        },
      ],
    },
  },
  en: {
    traditionalTitle: "Traditional DeFi: Two Transactions",
    onedoTitle: "1Do: One Transaction",
    summaryHeaders: {
      account: "User Account",
      middle: "External Protocol",
      result: "State Owner",
    },
      headers: {
        account: "Account",
        token: "Token",
        app: "App",
      },
    traditional: {
      summary: {
        account: ["EOA", "signing entry", "no local runtime"],
        middle: ["DeFi Contracts", "token allowance", "orders / pools"],
        result: ["protocol-centered", "state lives outside"],
      },
      steps: [
        {
          step: "Tx 1",
          account: ["Only authorizes"],
          token: ["Adds allowance"],
          app: ["No business state change"],
        },
        {
          step: "Tx 2",
          account: ["Starts swap"],
          token: ["transferFrom moves assets"],
          app: ["Executes business and updates order status"],
        },
        {
          step: "After Tx",
          account: ["Balance changed"],
          token: ["allowance may still exist"],
          app: ["business state stays in app contracts"],
        },
      ],
    },
    onedo: {
      summaryHeaders: {
        account: "User Account",
        middle: "App Logic",
        result: "State Owner",
      },
      headers: {
        account: "Account / Runtime",
        token: "Token",
        app: "App Logic",
      },
      summary: {
        account: ["ERC-7702 Runtime", "holds assets", "executes code"],
        middle: ["Runtime App", "delegatecall", "enters account frame"],
        result: ["user-address centered", "apps are logic", "state stays in account"],
      },
      steps: [
        {
          step: "Tx 1",
          account: ["sets the amount pullable in this transaction", "executes app logic inside the account"],
          token: ["completes transfer"],
          app: ["runs as in-account logic"],
        },
        {
          step: "After Tx",
          account: ["pull context is cleared", "app state remains in the account"],
          token: ["Balance changed", "no allowance remains"],
          app: ["holds no assets or authorization"],
        },
      ],
    },
  },
} as const;

function DiagramCell({ lines, tone = "state" }: { lines: readonly string[]; tone?: DiagramTone }) {
  const toneClass = {
    user: "border-pink-200/90 bg-pink-50/75",
    intent: "border-amber-200/90 bg-amber-50/75",
    external: "border-slate-200/90 bg-slate-50/80",
    state: "border-indigo-200/90 bg-indigo-50/75",
    result: "border-emerald-200/90 bg-emerald-50/75",
  }[tone ?? "state"];

  return (
    <div className={`rounded-lg border px-3 py-3 text-sm leading-5 text-[#1B0D15]/74 ${toneClass}`}>
      <ul className="space-y-1">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

function DiagramSummaryCard({ title, lines, tone }: { title: string; lines: readonly string[]; tone: DiagramTone }) {
  const toneClass = {
    user: "border-pink-200/90 bg-pink-50/75",
    intent: "border-amber-200/90 bg-amber-50/75",
    external: "border-slate-200/90 bg-slate-50/80",
    state: "border-indigo-200/90 bg-indigo-50/75",
    result: "border-emerald-200/90 bg-emerald-50/75",
  }[tone];

  return (
    <div className={`rounded-lg border px-3 py-3 ${toneClass}`}>
      <p className="text-xs font-semibold text-[#1B0D15]/48">{title}</p>
      <ul className="mt-2 space-y-1 text-sm leading-5 text-[#1B0D15]/74">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

function DiagramTable({
  title,
  summaryHeaders,
  summary,
  headers,
  steps,
  variant,
}: {
  title: string;
  summaryHeaders: { account: string; middle: string; result: string };
  summary: DiagramSummary;
  headers: { account: string; token: string; app: string };
  steps: readonly DiagramStep[];
  variant: "traditional" | "onedo";
}) {
  return (
    <div className="rounded-2xl border border-white/75 bg-white/55 p-4 shadow-[0_24px_70px_-50px_rgba(0,0,0,0.65)] backdrop-blur">
      <p className="mb-4 text-sm font-semibold text-[#1B0D15]/70">{title}</p>
      <div className="grid gap-3 md:grid-cols-3">
        <DiagramSummaryCard title={summaryHeaders.account} lines={summary.account} tone="user" />
        <DiagramSummaryCard title={summaryHeaders.middle} lines={summary.middle} tone={variant === "onedo" ? "intent" : "external"} />
        <DiagramSummaryCard title={summaryHeaders.result} lines={summary.result} tone="result" />
      </div>
      <div className="mt-5 hidden gap-3 border-t border-[#1B0D15]/10 pt-4 md:grid md:grid-cols-[9rem_1fr_1fr_1fr]">
        <div />
        <div className="rounded-lg border border-pink-200/80 bg-pink-50/70 px-3 py-2 text-center text-sm font-semibold text-[#1B0D15]/72">
          {headers.account}
        </div>
        <div className="rounded-lg border border-indigo-200/80 bg-indigo-50/70 px-3 py-2 text-center text-sm font-semibold text-[#1B0D15]/72">
          {headers.token}
        </div>
        <div className="rounded-lg border border-amber-200/80 bg-amber-50/70 px-3 py-2 text-center text-sm font-semibold text-[#1B0D15]/72">
          {headers.app}
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {steps.map((step) => (
          <div key={step.step} className="grid gap-3 md:grid-cols-[9rem_1fr_1fr_1fr]">
            <div className="flex items-center rounded-lg border border-[#1B0D15]/10 bg-white/70 px-3 py-3 text-sm font-semibold text-[#1B0D15]/70">
              {step.step}
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-[#1B0D15]/45 md:hidden">{headers.account}</p>
              <DiagramCell lines={step.account} tone="user" />
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-[#1B0D15]/45 md:hidden">{headers.token}</p>
              <DiagramCell lines={step.token} tone={variant === "onedo" ? "state" : "external"} />
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-[#1B0D15]/45 md:hidden">{headers.app}</p>
              <DiagramCell lines={step.app} tone={variant === "onedo" ? "intent" : "result"} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StateDiagram({ variant, language }: { variant: "traditional" | "onedo"; language: "zh" | "en" }) {
  const copy = diagramCopy[language];

  if (variant === "traditional") {
    return (
      <DiagramTable
        title={copy.traditionalTitle}
        summaryHeaders={copy.summaryHeaders}
        summary={copy.traditional.summary}
        headers={copy.headers}
        steps={copy.traditional.steps}
        variant="traditional"
      />
    );
  }

  return (
    <DiagramTable
      title={copy.onedoTitle}
      summaryHeaders={copy.onedo.summaryHeaders}
      summary={copy.onedo.summary}
      headers={copy.onedo.headers}
      steps={copy.onedo.steps}
      variant="onedo"
    />
  );
}

const gasEvidenceCopy = {
  zh: {
    overview: "关键费用基准",
    overviewNote: "外部协议采用 2026 年上半年主网成功交易回执中位数；1Do DEX / NFT 为补全交易固有成本的 Forge 基准，ERC-8112 为本地 Anvil 完整回执。",
    dex: "DEX 结算",
    nft: "NFT 结算",
    payment: "授权支付",
    onedoMedian: "1Do 完整交易中位数",
    range: "范围",
    localReceiptMedian: "本地完整回执中位数",
    mainnetMedian: "主网回执中位数",
    settlementGas: "结算",
    approveGas: "approve",
    total: "合计",
    approvalSample: "approve 样本",
    eip3009Label: "USDC EIP-3009",
    records: "笔",
    source: "来源：Ethereum Mainnet / BigQuery（外部协议与 USDC）· 1Do Forge Gas snapshot · ERC-8112 local Anvil receipts",
  },
  en: {
    overview: "Key cost benchmarks",
    overviewNote: "External protocols use median successful H1 2026 mainnet receipts; 1Do DEX / NFT use Forge benchmarks with full transaction overhead, and ERC-8112 uses complete local Anvil receipts.",
    dex: "DEX settlement",
    nft: "NFT settlement",
    payment: "Authorization payment",
    onedoMedian: "1Do complete-transaction median",
    range: "range",
    localReceiptMedian: "local complete-receipt median",
    mainnetMedian: "Mainnet receipt median",
    settlementGas: "settlement",
    approveGas: "approve",
    total: "total",
    approvalSample: "approve sample",
    eip3009Label: "USDC EIP-3009",
    records: "txs",
    source: "Sources: Ethereum Mainnet / BigQuery (external protocols and USDC) · 1Do Forge Gas snapshot · ERC-8112 local Anvil receipts",
  },
} as const;

function formatGas(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(value);
}

function GasEvidence({ language }: { language: "zh" | "en" }) {
  const copy = gasEvidenceCopy[language];
  const dexBaseline = onedoGasBaselines.dex[0];
  const nftBaseline = onedoGasBaselines.nft[0];
  const dexProtocols = gasEvidenceData.filter((protocol) => protocol.key !== "seaport");
  const seaport = gasEvidenceData.find((protocol) => protocol.key === "seaport");

  return (
    <div className="rounded-[1.8rem] border border-[#1B0D15]/10 bg-[#fffafc]/80 p-4 shadow-[0_24px_60px_-45px_rgba(91,33,64,0.55)] sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.14em] text-[#1B0D15]/45">{copy.overview}</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#1B0D15]/62">{copy.overviewNote}</p>
        </div>
        <span className="rounded-full border border-[#1B0D15]/10 bg-white/80 px-3 py-1 text-xs text-[#1B0D15]/55">
          2026-01-01 → 2026-06-30
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/55 p-4">
          <h4 className="font-semibold text-emerald-950/80">{copy.dex}</h4>
          <p className="mt-4 text-[11px] uppercase tracking-[0.12em] text-emerald-950/45">{copy.onedoMedian}</p>
          <p className="mt-1 font-mono text-xl font-semibold text-emerald-950/75">{formatGas(dexBaseline.median)}</p>
          <p className="mt-1 text-[11px] text-emerald-950/45">{copy.range} {formatGas(dexBaseline.low)}–{formatGas(dexBaseline.high)}</p>
          <div className="mt-4 space-y-2 border-t border-emerald-950/10 pt-3 text-xs text-emerald-950/62">
            {dexProtocols.map((protocol) => (
              <div key={protocol.key} className="rounded-lg bg-white/55 px-3 py-2">
                <p className="flex justify-between gap-3"><span>{protocol.label} {copy.settlementGas}</span><span className="font-mono">{formatGas(protocol.median)}</span></p>
                <p className="mt-1 flex justify-between gap-3 text-emerald-950/48"><span>+ {copy.approveGas}</span><span className="font-mono">{formatGas(approvalGasData.uniswap.median)}</span></p>
                <p className="mt-1 flex justify-between gap-3 border-t border-emerald-950/10 pt-1 font-semibold text-emerald-950/72"><span>{copy.total}</span><span className="font-mono">{formatGas(protocol.median + approvalGasData.uniswap.median)}</span></p>
              </div>
            ))}
            <p className="text-[11px] text-emerald-950/45">{copy.approvalSample} · {formatCount(approvalGasData.uniswap.count)} {copy.records} · {copy.mainnetMedian}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200/60 bg-amber-50/55 p-4">
          <h4 className="font-semibold text-amber-950/80">{copy.nft}</h4>
          <p className="mt-4 text-[11px] uppercase tracking-[0.12em] text-amber-950/45">{copy.onedoMedian}</p>
          <p className="mt-1 font-mono text-xl font-semibold text-amber-950/75">{formatGas(nftBaseline.median)}</p>
          <p className="mt-1 text-[11px] text-amber-950/45">{copy.range} {formatGas(nftBaseline.low)}–{formatGas(nftBaseline.high)}</p>
          <div className="mt-4 space-y-2 border-t border-amber-950/10 pt-3 text-xs text-amber-950/62">
            {seaport && (
              <div className="rounded-lg bg-white/55 px-3 py-2">
                <p className="flex justify-between gap-3"><span>{seaport.label} {copy.settlementGas}</span><span className="font-mono">{formatGas(seaport.median)}</span></p>
                <p className="mt-1 flex justify-between gap-3 text-amber-950/48"><span>+ {copy.approveGas}</span><span className="font-mono">{formatGas(approvalGasData.opensea.median)}</span></p>
                <p className="mt-1 flex justify-between gap-3 border-t border-amber-950/10 pt-1 font-semibold text-amber-950/72"><span>{copy.total}</span><span className="font-mono">{formatGas(seaport.median + approvalGasData.opensea.median)}</span></p>
              </div>
            )}
            <p className="text-[11px] text-amber-950/45">{copy.approvalSample} · {formatCount(approvalGasData.opensea.count)} {copy.records} · {copy.mainnetMedian}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200/60 bg-blue-50/55 p-4">
          <h4 className="font-semibold text-blue-950/80">{copy.payment}</h4>
          <p className="mt-4 text-[11px] uppercase tracking-[0.12em] text-blue-950/45">1Do ERC-8112 · {copy.localReceiptMedian}</p>
          <p className="mt-1 font-mono text-xl font-semibold text-blue-950/75">{formatGas(paymentGasData.erc8112.median)}</p>
          <p className="mt-1 text-[11px] text-blue-950/45">{copy.range} {formatGas(paymentGasData.erc8112.low)}–{formatGas(paymentGasData.erc8112.high)}</p>
          <div className="mt-4 border-t border-blue-950/10 pt-3 text-xs text-blue-950/62">
            <p className="flex justify-between gap-3"><span>{copy.eip3009Label} {copy.mainnetMedian}</span><span className="font-mono">{formatGas(paymentGasData.eip3009.median)}</span></p>
            <p className="mt-2 text-[11px] text-blue-950/45">P5–P95 {formatGas(paymentGasData.eip3009.p05)}–{formatGas(paymentGasData.eip3009.p95)} · {formatCount(paymentGasData.eip3009.count)} {copy.records}</p>
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] leading-5 text-[#1B0D15]/42">{copy.source}</p>
    </div>
  );
}

function renderBlock(block: WhitepaperBlock) {
  if (block.type === "subheading") {
    return <h3 className="pt-2 text-xl font-semibold tracking-tight text-[#1B0D15]">{block.text}</h3>;
  }

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

  if (block.type === "diagram") {
    return <StateDiagram variant={block.variant} language={block.language} />;
  }

  if (block.type === "gasEvidence") {
    return <GasEvidence language={block.language} />;
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
                  {copy.label}
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
