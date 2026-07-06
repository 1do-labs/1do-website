import Link from "next/link";

type WhitepaperBlock =
  | { type: "subheading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "ordered"; items: string[] }
  | { type: "code"; text: string }
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
    id: "abstract",
    title: "摘要",
    blocks: [
      { type: "paragraph", text: "1Do 是新一代链上账户与应用运行平台。它的目标不是再造一个托管式应用入口，而是把账户、资产授权、签名验证和应用执行边界收敛到用户自己的地址。" },
      { type: "paragraph", text: "在 1Do 中，用户激活一次 ERC-7702 运行时后，同一个地址既是钱包，也是应用运行环境，也是 DeFi、支付、NFT、遗产和会话化应用的结算边界。应用可以独立创新，但不能把用户从自己的账户边界里搬走。" },
      { type: "list", items: ["账户跟随用户，而不是跟随某个应用。", "资产权限收敛在钱包运行时，而不是散落在代币、路由器、市场和支付合约里。", "应用通过 Core 进入，通过运行时执行，通过钱包原生授权结算。", "用户体验从理解底层合约调用，转向理解自己正在完成的动作。"] },
    ],
  },
  {
    id: "concepts",
    title: "现有概念介绍",
    blocks: [
      { type: "paragraph", text: "以太坊早期默认用户使用 EOA。EOA 没有代码、没有本地状态，也不能表达细粒度执行策略，所以 DeFi 把大量权限逻辑下沉到代币、路由器、市场、金库或应用合约里。" },
      { type: "paragraph", text: "ERC-20 approve(spender, amount) / allowance(owner, spender) 是当前 DeFi 最典型的交互模型。用户先批准路由器或应用使用某个代币，再由应用在交易、支付、订阅或结算时通过 transferFrom 拉取资产。NFT 也有类似问题：approve、setApprovalForAll 和操作员授权把用户级权限长期放在资产合约或市场合约里。" },
      { type: "subheading", text: "Uniswap" },
      { type: "paragraph", text: "Uniswap 是以太坊上最重要的去中心化交易协议之一，核心功能是让用户在 ERC-20 资产之间做自动化做市和兑换。它诞生并成长于 EOA 账户和 ERC-20 标准资产的基础之上：用户的钱包地址持有代币，交易合约或路由器通过 ERC-20 allowance 获得支出权，再把资产送入池子、完成兑换和结算。" },
      { type: "paragraph", text: "这种模式的优点是开放、可组合、无需平台托管余额，任何 ERC-20 都可以接入同一套交易路径。麻烦在于，用户首次用某个 ERC-20 交易时通常不能直接 swap，而是要先发一笔 approve，再发一笔 swap；在这个首次交互流程里，approve 通常占 2 笔用户交易中的 1 笔，也就是 50% 的交易次数和确认次数。EOA 本身不能表达“只允许这一次 swap、只允许这个报价、执行完自动清理授权”的账户策略，所以授权必须落在 token.allowance 或 Permit2 这类 spender 模型里。Permit2 和 Universal Router 改善了授权复用、签名和路由体验，但用户仍要理解自己把哪种资产、多少额度、多久期限交给了哪个外部合约。" },
      { type: "subheading", text: "OpenSea" },
      { type: "paragraph", text: "OpenSea 是主流 NFT 市场，Seaport 是其开放订单协议。NFT 市场同样建立在 EOA 和 ERC-721 / ERC-1155 的基础上：NFT 留在用户地址中，用户签署订单，市场或执行合约在成交时根据订单规则转移 NFT 和支付资产。" },
      { type: "paragraph", text: "为了让市场在未来某个时间完成成交，用户通常不能只签一笔 listing 或成交订单，还要先对 NFT 集合执行 approve 或 setApprovalForAll。它降低了后续 listing 和成交的交互成本，也让链下订单簿成为可能；但首次挂牌或首次使用市场时，授权动作本身就是额外交易、额外 gas 和额外钱包确认。operator 授权的边界是“某个合约能否转移整套集合”，而不是“某一笔订单是否成交”。如果用户误授权恶意 operator、签署伪装订单，或授权长期遗留在资产合约里，风险会覆盖整个 collection，而不只是某一次挂牌。" },
      { type: "subheading", text: "USDT 与 USDC" },
      { type: "paragraph", text: "USDT 与 USDC 是链上支付场景中最常用的美元稳定币。和通用 DeFi 交易不同，支付的核心不是撮合最优路径，而是让付款方、收款方、金额、币种、网络和有效期足够清晰，并让支付可以被网站、API、agent 或中继者可靠结算。USDT 的优势是流动性、交易对和多链覆盖极强，适合广泛的转账和结算场景；USDC 的优势是开发者工具、合规接口和可编程支付支持更完整，尤其适合 checkout、gasless payment、API 计费和企业结算。" },
      { type: "paragraph", text: "在授权模型上，很多 USDT / USDC 支付仍走 ERC-20 transfer 或 approve + transferFrom；USDC 还支持 EIP-3009 transferWithAuthorization / receiveWithAuthorization，让付款方用 EIP-712 签名授权一次具体转账，合约通过 nonce 和有效期防止重放，不需要先写入 USDC.allowance。x402 则把支付请求放到 HTTP 402 语义中，让 API、内容、AI agent 和自动化客户端可以按请求用 USDC 等稳定币付款。这些路径提升了支付可编程性，但风险不会消失：USDT / USDC 仍有链选择错误、收款地址错误、中心化发行方和冻结策略、合约兼容性、长期 allowance、签名钓鱼、facilitator 校验、前端和 agent 策略等风险。如果用户或 agent 无法看懂自己正在为哪个资源付款、付款多少、在哪条链上付款、可被谁结算，支付签名仍可能被钓鱼或滥用。" },
      { type: "subheading", text: "现有 APP 和 ERC-20 模式的风险与成本" },
      { type: "paragraph", text: "上述模式的共同基础是 EOA、ERC-20 / ERC-721 授权、外部 spender / operator、以及大量由前端和签名界面解释的用户意图。它们支撑了开放金融的早期繁荣，但也把资产权限分散在 token allowance、NFT operator、router、market、支付合约和托管平台中。成本首先体现在交互和 gas：Ledger 对 token approval 的解释也指出，approval 会作为单独交易上链并产生 gas 费用；在典型首次 ERC-20 APP 交互里，approve + execute 是 2 笔交易，approve 占首次流程交易次数的 50%。按白皮书中的常见预算，ERC-20 approve 通常约 50k-75k gas，NFT approve / setApprovalForAll 通常约 50k-100k gas；这些 gas 并不完成用户真正想要的 swap、listing 或支付，只是为后续应用执行打开权限。" },
      { type: "paragraph", text: "风险不能严谨地简化成一个固定的“被盗资金中有多少概率来自恶意授权”，因为不同报告把 stolen funds、scams、phishing、wallet drainer 和 approval phishing 分在不同口径里；更稳妥的结论是：approve 这类长期授权本身已经成为可规模化利用的攻击面。" },
      { type: "paragraph", text: "公开数据已经足够说明规模。Chainalysis 在 2023 年 12 月估算，样本地址自 2021 年 5 月以来通过 approval phishing 造成约 10 亿美元损失，其中 2022 年约 5.168 亿美元、2023 年截至 11 月约 3.746 亿美元；Chainalysis 2026 年 6 月又披露 Operation Spincaster 在多个国家处理超过 7,000 条线索，关联约 1.62 亿美元损失。Scam Sniffer 的年度报告显示，EVM 钱包 drainer 钓鱼在 2024 年造成约 4.94 亿美元损失，2025 年回落至约 8,400 万美元。这些损失并不只来自某一个项目，而是来自现有账户和资产授权范式中可复用、可伪装、可长期残留的权限。" },
      { type: "paragraph", text: "另一类常见体验是先存入平台再使用：交易平台、借贷池、金库、订单簿或托管合约先接收用户资产，然后在平台内部记账、撮合、结算或清算。这简化了应用逻辑，但用户的资产边界从自己的钱包转移到了平台合约。这同样不是抽象风险：Chainalysis 统计 2024 年 crypto platforms 被盗约 22 亿美元，DeFi 在一季度仍是最大被盗资产来源，中心化服务在二、三季度成为主要目标；2025 年上半年，cryptocurrency services 被盗已超过 21.7 亿美元，其中 Bybit 单一事件约 15 亿美元。TRM Labs 也估算 2024 年 hacks and exploits 造成约 22 亿美元损失，三年合计超过 77 亿美元。平台存入模型把多个用户的资产集中到同一服务、合约或密钥体系中，一旦业务逻辑、访问控制、私钥管理或跨链组件失守，损失会被集中放大。" },
      { type: "list", items: ["优点：模型简单，组合性强，当前 DeFi 和 NFT 市场大量依赖它启动。", "代价：授权是持久状态，交易结束后授权额度或操作员授权仍可能存在。", "代价：授权对象是支出方或操作员，不是一次具体业务动作。", "代价：approve + execute 通常是两笔交易和两次钱包确认。", "代价：平台存入模型让资产可用性和退出路径依赖平台逻辑。"] },
    ],
  },
  {
    id: "state-model",
    title: "状态模型差异",
    blocks: [
      { type: "paragraph", text: "传统 DeFi 中，用户地址主要是签名主体，状态和权限通常留在外部协议里：token allowance、NFT operator、池子、金库、订单和平台余额。" },
      { type: "diagram", variant: "traditional", language: "zh" },
      { type: "paragraph", text: "1Do 把运行时放回用户地址。`executeRuntimeApp(app, data)` 通过 delegatecall 让应用逻辑进入用户账户执行帧；`enabledApps`、nonce 和应用状态使用命名空间存储，临时资产拉取则只存在于一次执行窗口。" },
      { type: "diagram", variant: "onedo", language: "zh" },
      { type: "list", items: ["传统 DeFi：协议是状态中心，用户账户多是签名入口。", "1Do：用户地址是状态和运行时中心，应用更像可插拔逻辑。"] },
    ],
  },
  {
    id: "onedo",
    title: "1Do",
    blocks: [
      { type: "subheading", text: "账户本身就是应用的运行时" },
      { type: "paragraph", text: "1Do 的核心判断是：钱包地址本身才是真正的应用执行边界。主线账户模型基于 ERC-7702，用户连接的地址就是运行时工作地址；用户不需要把资产迁移到第二个智能钱包地址，也不需要通过铸造 NFT 或启用资产管理中间层来使用运行时应用。" },
      { type: "paragraph", text: "1Do Core 是当前统一产品入口，用来连接钱包、进入运行时应用，并打开 Dex、NFT Market、Flash Loan、Will、Session Pay 等账户能力。Core 是用户体验入口，运行时是账户执行边界；测试资产水龙头属于测试网辅助工具，不属于钱包运行时能力本身。" },
      { type: "code", text: runtimeHostInterface },
      { type: "paragraph", text: "运行时通过 ERC-8280 风格的 executeRuntimeApp(app, data) 进入应用执行，并通过本地 enableApp / disableApp 管理某个地址允许哪些应用在自己的钱包运行时中执行。全局平台门控与用户本地启用是两个不同问题；当前 Core 运行时的可执行性可以概括为：" },
      { type: "code", text: "wallet.isAppEnabled(app) && registry.isEntitled(address(0), app)" },
      { type: "list", items: ["ERC-7702：让 EOA 地址获得合约执行能力，用户不需要把资产迁移到新的智能钱包地址。", "ERC-8280：定义最小运行时应用宿主接口，executeRuntimeApp 是无需许可的触发入口。", "ERC-1271：让运行时钱包验证 EIP-712 意图、订单、支付授权和遗产计划。", "ERC-7201：用命名空间存储隔离宿主状态与应用状态，降低存储冲突风险。", "ERC-165：让前端、中继者和应用可以发现运行时、资产拉取、签名转账等能力。"] },
    ],
  },
  {
    id: "asset-layer",
    title: "资产层与钱包原生授权",
    blocks: [
      { type: "paragraph", text: "1Do 当前兼容 ERC-20 / ERC-721，因为它们仍是主流资产接口。但在合约钱包环境中，资产合约不需要承载所有用户权限。资产合约应该更像余额和归属账本，账户运行时表达用户授权、组合、会话、资产拉取和清晰签名。" },
      { type: "paragraph", text: "ERC-7196 / ERC-7561 代表更小的 token / NFT 方向：ERC-7196 移除 ERC-20 里的 transferFrom、approve、allowance；ERC-7561 移除 ERC-721 里的 approve、setApprovalForAll、getApproved、isApprovedForAll、safeTransferFrom，把用户级权限从资产合约上移到合约钱包。" },
      { type: "code", text: erc7196Interface },
      { type: "code", text: erc7561Interface },
      { type: "paragraph", text: "在当前兼容路径里，1Do 用 ERC-8284 / ERC-8285 替代长期代币授权额度和 NFT 操作员授权，把资产拉取约束在一次执行窗口中。" },
      { type: "code", text: tokenPullInterface },
      { type: "code", text: nftPullInterface },
      { type: "list", items: ["代币拉取绑定目标合约、资产和剩余额度，累计不能超过上限。", "NFT 拉取绑定目标合约、资产和 tokenId，只授权一个目标合约在一次执行中拉取一个具体 NFT。", "执行成功或回滚前必须清除上下文，执行窗口结束后任何拉取都必须失败。", "结果是不留下可复用授权额度或操作员授权。"] },
    ],
  },
  {
    id: "applications",
    title: "应用程序",
    blocks: [
      { type: "paragraph", text: "1Do Core 中的运行时应用不是把用户资产搬到新的平台账户里，而是在用户自己的钱包运行时中完成业务执行。每个应用保留自己的业务模型，但结算、签名验证、资产授权和执行边界回到同一个账户运行时。" },
      { type: "list", items: ["Dex：挂单方链下签署 EIP-712 订单，吃单方在自己的 7702 运行时中一次成交；相比 approve -> swap，Dex 不要求长期代币授权额度，也不要求用户把资产预存到交易平台。", "NFT Market：订单和市场规则由市场应用表达，NFT 或支付资产结算走钱包原生拉取；相比 setApprovalForAll，用户不需要把整个 NFT 集合长期授权给市场或聚合器。", "Flash Loan：把钱包中已启用的余额变成可组合流动性；流动性仍处在用户账户边界内，执行由运行时约束。", "Will：遗产计划保存在用户自己的账户语义内，资产在触发前仍留在钱包地址；执行人只能按计划和运行时规则处理尚未分发的资产。", "Session Pay：适合 API、AI agent、订阅和高频微支付；用户先签会话授权，后续结算授权按限额、周期和累计金额执行，不需要每次请求都重新签完整付款。"] },
      { type: "paragraph", text: "这些应用的共同优势不是某个单点 gas 数字，而是减少迁移、减少长期授权、减少平台余额、减少重复签名，并让用户始终围绕同一个账户边界理解风险。" },
    ],
  },
  {
    id: "payments",
    title: "支付与会话化结算",
    blocks: [
      { type: "paragraph", text: "支付不应该只依赖代币合约自己实现 permit，也不应该要求每个支付应用维护一套长期授权额度。1Do 把支付能力放在钱包运行时：一次性转账可以走钱包级结构化数据签名，持续或高频支付可以走 Session Pay 的会话授权与运行时应用结算。" },
      { type: "paragraph", text: "ERC-8112 / ERC-8114 对应钱包级代币 / NFT 签名转移，适合一次性或中继转账。签名域绑定钱包地址，nonce 按资产与目标维度隔离，避免把每个代币合约改造成免 gas 授权系统。" },
      { type: "code", text: erc8112Interface },
      { type: "code", text: erc8114Interface },
      { type: "list", items: ["ERC-8112：代币和原生资产的签名转账放在钱包层，tokenTransferWithSig 校验 EIP-712 + ERC-1271 后转账。", "ERC-8114：NFT 的签名转移放在钱包层，nftTransferWithSig 验签后执行 safeTransferFrom。", "Session Pay 是独立运行时应用：用户签会话授权，会话密钥产生累计结算授权，并通过 Session Pay 自身运行时结算路径执行，不依赖 IERC8112。", "x402 可以作为 HTTP 接入方式：一次性付款映射到 ERC-8112；会话化付款映射到 Session Pay 会话结算。"] },
    ],
  },
  {
    id: "execution-flow",
    title: "执行流程",
    blocks: [
      { type: "ordered", items: ["用户打开 1Do Core 或 1Do Wallet，连接当前地址。", "如果地址尚未激活运行时，先完成 ERC-7702 运行时激活。", "用户在 1Do Core 中打开 Dex、NFT Market、Flash Loan、Will、Session Pay 等运行时应用。", "用户对某个应用执行本地 enableApp；平台注册表仍独立控制全局可执行性。", "用户进入应用，签署 EIP-712 意图、订单、会话授权、遗产计划或转移授权。", "交易通过 executeRuntimeApp(...)、executeWithTokenPull(...)、tokenTransferWithSig(...) 或应用自身结算路径执行。", "执行结束后，临时拉取上下文被清除；长期权限仍留在用户自己的钱包运行时边界内。"] },
    ],
  },
  {
    id: "miscellanea",
    title: "杂项与关注",
    blocks: [
      { type: "paragraph", text: "1Do 的安全模型不是假设所有应用都可信，而是把应用能做什么限制在用户自己的钱包运行时边界内。触发执行的人可以是中继者、交易对手、维护者或普通调用者，但触发者不会因此获得钱包所有者权限。" },
      { type: "list", items: ["所有者权限与触发权限分离：任何人可以触发已启用应用，但不能冒充所有者签名或修改所有者权限。", "本地启用与注册表门控分离：用户本地启用表达账户意愿，注册表表达平台全局可执行性。", "签名验证收敛到钱包运行时：EIP-712 结构化数据通过 ERC-1271 在用户账户边界内验证。", "嵌套运行时执行会被拒绝：应用不能制造新的运行时自调用帧来绕过执行锁和调用者纪律。"] },
      { type: "paragraph", text: "1Do 不声称所有风险都会消失。更清晰的运行时边界可以减少长期授权、平台托管余额和应用自建权限系统带来的风险，但不能替代应用审计、用户判断和清晰的钱包签名展示。" },
      { type: "list", items: ["1Do 不保证每个运行时应用的业务逻辑无风险。", "注册表门控不是用户判断的替代品。", "钱包原生授权减少长期授权额度和操作员授权，但不消除钓鱼签名、错误收款地址或恶意前端风险。", "ERC-7702 可用性依赖链、钱包、RPC 和签名工具支持。", "1Do 不要求今天的生态立即放弃 ERC-20 / ERC-721；长期资产标准方向与当前兼容路径可以并行。"] },
    ],
  },
  {
    id: "gas",
    title: "Gas 与交互成本",
    blocks: [
      { type: "paragraph", text: "传统 DeFi 的成本不只是链上 gas 数字，还包括用户交互次数、长期授权风险和失败恢复成本。1Do 优先减少重复授权、减少账户迁移、减少应用自建权限系统。" },
      { type: "paragraph", text: "下面的 1Do 数字来自当前 Core 的 Forge gas 基准测试；传统路径侧为常见 gas limit 预算区间，实际值会随路由器、订单类型、资产冷热状态、链和调用数据变化。" },
      { type: "code", text: zhGasComparison },
      { type: "paragraph", text: "因此 1Do 的 gas 优化不是单点追求某个操作码更省，而是减少需要上链的步骤和残留状态：少一次 approve，少一次平台存入，少一个平台余额，少一个长期操作员授权，就少一个 gas、风险和用户理解成本的来源。" },
    ],
  },
  {
    id: "conclusion",
    title: "结论",
    blocks: [
      { type: "paragraph", text: "1Do 不是要把钱包做成一个庞大的中心化应用框架，而是要把账户能力稳定地收敛到用户地址本身。" },
      { type: "paragraph", text: "宏观上，1Do 希望用户激活一次账户运行时，就能持续扩展 DeFi、支付、NFT、遗产、会话与未来应用。工程上，1Do 用 ERC-7702、ERC-8280、ERC-8284、ERC-8285、ERC-8112、ERC-8114、ERC-1271、EIP-712 等标准，把执行边界、签名、资产授权和应用启用状态放回钱包。" },
    ],
  },
  {
    id: "references",
    title: "参考来源",
    blocks: [
      { type: "list", items: ["Uniswap Labs, Introducing Permit2 & Universal Router, 2022-11-17: https://blog.uniswap.org/permit2-and-universal-router", "OpenSea Developer Documentation, Seaport: https://docs.opensea.io/docs/seaport", "OpenSea Developer Documentation, Get listing creation actions: https://docs.opensea.io/reference/create_listing_actions", "Tether, Supported Protocols and Integration Guidelines: https://tether.to/en/supported-protocols/", "Tether, FAQs: https://tether.to/faqs/", "Circle, 4 Ways to Authorize USDC Smart Contract Interactions, 2025-09-04: https://www.circle.com/blog/four-ways-to-authorize-usdc-smart-contract-interactions-with-circle-sdk", "EIP-3009, Transfer With Authorization: https://eips.ethereum.org/EIPS/eip-3009", "Coinbase Developer Documentation, x402 Overview: https://docs.cdp.coinbase.com/x402/welcome", "x402 Documentation, How x402 Works: https://docs.x402.org/core-concepts/how-x402-works", "Zelin Li, Qin Wang, Zhipeng Wang, Five Attacks on x402 Agentic Payment Protocol, 2026-05-12: https://arxiv.org/abs/2605.11781", "Ledger Support, Understanding Ethereum Token Approvals: https://support.ledger.com/article/Ethereum-Token-Approvals-Explained", "MetaMask Help Center, What is a token approval?: https://support.metamask.io/stay-safe/safety-in-web3/what-is-a-token-approval/", "Chainalysis, Targeted Approval Phishing Scams See Explosive Growth Over Last Two Years, 2023-12-14: https://www.chainalysis.com/blog/approval-phishing-cryptocurrency-scams-2023/", "Chainalysis, Approval Phishing: From Just One Case to Full-Scale Disruption, 2026-06-17: https://www.chainalysis.com/blog/what-is-approval-phishing/", "Scam Sniffer Reports archive, 2024 and 2025 wallet drainer annual loss estimates: https://drops.scamsniffer.io/category/reports/", "Chainalysis, $2.2 Billion Stolen from Crypto Platforms in 2024, 2024-12-19: https://www.chainalysis.com/blog/crypto-hacking-stolen-funds-2025/", "Chainalysis, 2025 Crypto Crime Mid-year Update, 2025-07-17: https://www.chainalysis.com/blog/2025-crypto-crime-mid-year-update/", "TRM Labs, $2.2 billion was stolen in crypto-related hacks in 2024, 2025-03-17: https://www.trmlabs.com/resources/blog/category-deep-dive-2-2-billion-was-stolen-in-crypto-related-hacks-in-2024"] },
    ],
  },
];

const enSections: WhitepaperSection[] = [
  {
    id: "abstract",
    title: "Abstract",
    blocks: [
      { type: "paragraph", text: "1Do is a next-generation onchain account and application runtime platform. Its goal is not to create another custodial application surface, but to converge account authority, asset authorization, signature validation, and app execution boundaries back to the user's own address." },
      { type: "paragraph", text: "After activating an ERC-7702 runtime, the same address becomes the user's wallet, app runtime, and settlement boundary for DeFi, payments, NFTs, wills, sessions, and future applications. Apps can innovate independently, but they cannot move users out of their own account boundary." },
      { type: "list", items: ["The account follows the user, not one app.", "Asset authority converges in the wallet runtime, not across tokens, routers, markets, and payment contracts.", "Apps enter through Core, execute through runtime, and settle through wallet-native authorization.", "The user experience shifts from understanding low-level contract calls to understanding the action being completed."] },
    ],
  },
  {
    id: "concepts",
    title: "Existing Concepts",
    blocks: [
      { type: "paragraph", text: "Early Ethereum apps assumed EOAs. An EOA has no code, no local state, and no way to express fine-grained execution policy, so DeFi pushed permission logic down into tokens, routers, markets, vaults, and app contracts." },
      { type: "paragraph", text: "ERC-20 approve(spender, amount) plus allowance(owner, spender) is the common DeFi interaction model. The user approves a router or app first, then the app later pulls assets with transferFrom. NFTs have the same pattern: approve, setApprovalForAll, and operator approval place user-level authority in asset or marketplace contracts." },
      { type: "subheading", text: "Uniswap" },
      { type: "paragraph", text: "Uniswap is one of Ethereum's most important decentralized exchange protocols. Its core function is automated market making and swapping between ERC-20 assets. It was built in the EOA-account and ERC-20-asset environment: the user's wallet address holds tokens, a trading contract or router receives ERC-20 allowance, and the protocol moves assets into pools to complete swaps and settlement." },
      { type: "paragraph", text: "The strength of this model is openness, composability, and no platform-custodied balance. Almost any ERC-20 can enter the same trading path. The friction is that a user's first interaction with a given ERC-20 usually cannot be a direct swap: it is first an approve transaction, then a swap transaction. In that first-use flow, approve is commonly 1 of 2 user transactions, or 50% of the transaction and confirmation count. An EOA cannot natively express an account policy such as “only this swap, only this quote, and clear authorization after execution,” so authority has to live in token.allowance or in a spender model such as Permit2. Permit2 and Universal Router improve reuse, signing, and routing, but users still need to understand which asset, amount, duration, and external contract they are authorizing." },
      { type: "subheading", text: "OpenSea" },
      { type: "paragraph", text: "OpenSea is a major NFT marketplace, and Seaport is its open order protocol. NFT markets also come from the EOA plus ERC-721 / ERC-1155 model: NFTs remain at the user's address, the user signs an order, and the marketplace or execution contract transfers the NFT and payment asset when the order is fulfilled." },
      { type: "paragraph", text: "To let the market complete a sale later, users commonly cannot only sign one listing or fulfillment order; they also need approve or setApprovalForAll on the NFT collection first. This lowers later listing and fulfillment friction and makes offchain orderbooks possible, but first-time marketplace use still includes an extra transaction, extra gas, and an extra wallet confirmation. The operator-approval boundary is “can this contract transfer the collection,” not “is this one order being filled.” If a user approves a malicious operator, signs a disguised order, or leaves approval behind, the risk can cover the whole collection rather than one listing." },
      { type: "subheading", text: "USDT and USDC" },
      { type: "paragraph", text: "USDT and USDC are two of the most widely used dollar stablecoins for onchain payments. Unlike general DeFi trading, payment is less about routing through the best market and more about making payer, recipient, amount, asset, network, and validity clear enough for websites, APIs, agents, or relayers to settle reliably. USDT's strength is broad liquidity, trading-pair coverage, and multichain distribution, making it useful for transfers and settlement across many venues. USDC's strength is developer tooling, compliance interfaces, and programmable-payment support, especially for checkout, gasless payment, API billing, and business settlement." },
      { type: "paragraph", text: "Many USDT / USDC payments still use ERC-20 transfer or approve plus transferFrom. USDC also supports EIP-3009 transferWithAuthorization / receiveWithAuthorization, where the payer signs EIP-712 typed data for one concrete transfer and the contract uses a nonce and validity window to prevent replay without first writing USDC.allowance. x402 moves payment requests into HTTP 402 semantics, allowing APIs, content, AI agents, and automated clients to pay per request with USDC and other stablecoins. These paths improve payment programmability, but risk does not disappear: USDT / USDC still involve wrong-chain transfers, wrong recipients, centralized issuer and freezing policies, contract compatibility, long-lived allowance, signature phishing, facilitator verification, frontends, and agent policy. If a user or agent cannot clearly understand what resource is being paid for, how much is being paid, which chain is used, and who can settle it, payment signatures can still be phished or abused." },
      { type: "subheading", text: "Risks and Costs in Existing Apps and ERC-20 Models" },
      { type: "paragraph", text: "The shared base across these models is EOA accounts, ERC-20 / ERC-721 approvals, external spenders / operators, and user intent interpreted through frontends and signing interfaces. This base enabled early open finance, but it also spreads asset authority across token allowance, NFT operators, routers, markets, payment contracts, and custody platforms. The first cost is interaction and gas: Ledger's token-approval explainer notes that each approval is a separate onchain transaction with its own gas fee; in a typical first ERC-20 app flow, approve plus execute means 2 transactions, so approve is 50% of the transaction count. In the common gas budgets used in this whitepaper, ERC-20 approve is usually about 50k-75k gas, while NFT approve / setApprovalForAll is usually about 50k-100k gas. That gas does not complete the user's intended swap, listing, or payment; it only opens permission for later app execution." },
      { type: "paragraph", text: "The risk should not be reduced to one fixed probability such as “what percentage of stolen funds comes from malicious approvals,” because reports use different denominators for stolen funds, scams, phishing, wallet drainers, and approval phishing. The conservative conclusion is that approve-style long-lived authorization has become a scalable attack surface." },
      { type: "paragraph", text: "Public data is already large enough to matter. In December 2023, Chainalysis estimated roughly $1.0 billion lost to approval phishing from its sample since May 2021, including about $516.8 million in 2022 and $374.6 million through November 2023; in June 2026, Chainalysis also reported that Operation Spincaster processed more than 7,000 leads tied to about $162 million in losses. Scam Sniffer's annual reporting estimated about $494 million lost to EVM wallet drainer phishing in 2024, falling to about $84 million in 2025. These losses do not belong to one project; they come from reusable, disguiseable, and long-lived authority in the existing account and asset-authorization model." },
      { type: "paragraph", text: "Another common model is deposit-before-use: exchanges, lending pools, vaults, orderbooks, or custody contracts receive user assets first, then handle internal accounting, matching, settlement, or liquidation. This simplifies app logic, but moves the user's asset boundary from the wallet to the platform contract. This is not an abstract risk either: Chainalysis estimated about $2.2 billion stolen from crypto platforms in 2024, with DeFi accounting for the largest share of stolen assets in Q1 and centralized services becoming the most targeted platform type in Q2 and Q3; by mid-2025, more than $2.17 billion had already been stolen from cryptocurrency services, including the roughly $1.5 billion Bybit incident. TRM Labs also estimated about $2.2 billion lost to hacks and exploits in 2024, with more than $7.7 billion lost over three years. Deposit-based models concentrate many users' assets inside the same service, contract, or key-management system, so failures in business logic, access control, private-key management, or cross-chain components can amplify losses." },
      { type: "list", items: ["Benefit: simple and composable; much of today's DeFi and NFT market infrastructure started this way.", "Cost: approval is persistent state that may remain after the transaction.", "Cost: approval targets a spender or operator, not one concrete business action.", "Cost: approve plus execute often means two transactions and two wallet confirmations.", "Cost: deposit-based platforms make availability and exit paths depend on platform logic."] },
    ],
  },
  {
    id: "state-model",
    title: "State Model Difference",
    blocks: [
      { type: "paragraph", text: "In traditional DeFi, the user address is mostly the signer, while state and authority live in external protocols: token allowance, NFT operators, pools, vaults, orders, and platform balances." },
      { type: "diagram", variant: "traditional", language: "en" },
      { type: "paragraph", text: "1Do moves the runtime back to the user's address. `executeRuntimeApp(app, data)` delegatecalls app logic into the user-account frame; `enabledApps`, nonces, and app state use namespaced storage, while asset-pull authority exists only for one execution window." },
      { type: "diagram", variant: "onedo", language: "en" },
      { type: "list", items: ["Traditional DeFi: the protocol is the state center; the user account is usually the signing entry point.", "1Do: the user address is the state and runtime center; apps become pluggable logic."] },
    ],
  },
  {
    id: "onedo",
    title: "1Do",
    blocks: [
      { type: "subheading", text: "The Account Itself Is the App Runtime" },
      { type: "paragraph", text: "1Do's core claim is that the wallet address itself is the app execution boundary. The main account path is ERC-7702: the connected address is the runtime address; users do not need to migrate assets to a second smart-wallet address, mint an NFT, or enable an asset-management middle layer before using runtime apps." },
      { type: "paragraph", text: "1Do Core is the unified product entry for connecting the wallet, entering runtime apps, and opening account capabilities such as Dex, NFT Market, Flash Loan, Will, and Session Pay. Core is the user experience surface; runtime is the account execution boundary. Test-asset faucets are testnet support tools, not wallet-runtime capabilities themselves." },
      { type: "code", text: runtimeHostInterface },
      { type: "paragraph", text: "The runtime enters app execution through an ERC-8280-style executeRuntimeApp(app, data), while enableApp / disableApp records which apps an address allows inside its own wallet runtime. Global platform gating and user-local enablement are separate gates; current core runtime executability can be summarized as:" },
      { type: "code", text: "wallet.isAppEnabled(app) && registry.isEntitled(address(0), app)" },
      { type: "list", items: ["ERC-7702 lets an EOA address gain executable contract behavior without migrating assets to a new smart-wallet address.", "ERC-8280 defines the minimum runtime app host surface; executeRuntimeApp is the permissionless trigger entry point.", "ERC-1271 lets runtime wallets validate EIP-712 intents, orders, payment authorizations, and will plans.", "ERC-7201 uses namespaced storage to isolate host state and app state.", "ERC-165 lets frontends, relayers, and apps discover runtime, pull, transfer-with-signature, and related capabilities."] },
    ],
  },
  {
    id: "asset-layer",
    title: "Asset Layer and Wallet-Native Authorization",
    blocks: [
      { type: "paragraph", text: "1Do remains compatible with ERC-20 and ERC-721 because they are still the dominant asset interfaces. But in a contract-wallet environment, asset contracts do not need to carry every user-permission feature. Asset contracts should behave more like balance and ownership ledgers, while the account runtime expresses authorization, composition, sessions, pull flows, and clear signing." },
      { type: "paragraph", text: "ERC-7196 / ERC-7561 point toward smaller token / NFT contracts: ERC-7196 removes transferFrom, approve, and allowance from ERC-20; ERC-7561 removes approve, setApprovalForAll, getApproved, isApprovedForAll, and safeTransferFrom from ERC-721, moving user-level authority upward into contract wallets." },
      { type: "code", text: erc7196Interface },
      { type: "code", text: erc7561Interface },
      { type: "paragraph", text: "In the current compatible path, 1Do uses ERC-8284 / ERC-8285 to replace long-lived token allowance and NFT operator approval with pull contexts scoped to one execution window." },
      { type: "code", text: tokenPullInterface },
      { type: "code", text: nftPullInterface },
      { type: "list", items: ["Token pull binds target, asset, and remainingAmount; cumulative pull cannot exceed the cap.", "NFT pull binds target, asset, and tokenId; one target can pull one specific NFT during one execution.", "Context must be cleared before success or revert returns; after the execution window ends, pulls must fail.", "The result is no reusable allowance or operator approval left behind."] },
    ],
  },
  {
    id: "applications",
    title: "Applications",
    blocks: [
      { type: "paragraph", text: "Runtime apps in 1Do Core do not move user assets into a new platform account. They execute business logic inside the user's own wallet runtime. Each app keeps its business model, while settlement, signature validation, asset authorization, and execution boundaries converge in the same account runtime." },
      { type: "list", items: ["Dex: makers sign EIP-712 orders offchain, and buyers settle once through their own 7702 runtime. Compared with approve -> swap, Dex does not require long-lived token allowance or pre-depositing assets into a trading platform.", "NFT Market: order and market rules live in the market app, while NFT or payment settlement uses wallet-native pull. Compared with setApprovalForAll, users do not need to grant a marketplace or aggregator long-term authority over an entire NFT collection.", "Flash Loan: enabled wallet balances become composable liquidity while remaining inside the user's account boundary.", "Will: inheritance plans remain inside the user's account semantics, and assets stay at the wallet address before the trigger; an executor can only process undistributed assets according to the plan and runtime rules.", "Session Pay: built for APIs, AI agents, subscriptions, and high-frequency micropayments. The user signs a session grant once, and later settlement authorizations execute within limits, periods, and cumulative amounts."] },
      { type: "paragraph", text: "The shared advantage is not one isolated gas number. It is fewer migrations, fewer long-lived approvals, fewer platform balances, fewer repeated signatures, and a risk model users can understand around one account boundary." },
    ],
  },
  {
    id: "payments",
    title: "Payments and Session Settlement",
    blocks: [
      { type: "paragraph", text: "Payments should not depend only on token-specific permit support, and each payment app should not maintain its own long-lived allowance system. 1Do puts payment authority in the wallet runtime: one-off transfers can use wallet-level typed data, while continuous or high-frequency payments can use Session Pay session grants and runtime app settlement." },
      { type: "paragraph", text: "ERC-8112 / ERC-8114 correspond to wallet-level token / NFT transfer with signature, which fits one-off or relayed transfers. The signing domain binds to the wallet address, and nonces are isolated by asset and recipient dimensions." },
      { type: "code", text: erc8112Interface },
      { type: "code", text: erc8114Interface },
      { type: "list", items: ["ERC-8112 puts token/native transfer with signature at the wallet layer; tokenTransferWithSig validates EIP-712 + ERC-1271 before transfer.", "ERC-8114 puts NFT transfer with signature at the wallet layer; nftTransferWithSig validates then safeTransferFroms.", "Session Pay is an independent runtime app: session grants and cumulative settlement authorizations execute through Session Pay's own runtime settlement path, not through IERC8112.", "x402 can be an HTTP entry point: one-off payments map to ERC-8112; session payments map to Session Pay session settlement."] },
    ],
  },
  {
    id: "execution-flow",
    title: "Execution Flow",
    blocks: [
      { type: "ordered", items: ["The user opens 1Do Core or 1Do Wallet and connects the current address.", "If the address has not activated runtime yet, the user activates the ERC-7702 runtime.", "The user opens runtime apps such as Dex, NFT Market, Flash Loan, Will, and Session Pay in 1Do Core.", "The user locally enables an app with enableApp; the platform registry still controls global executability independently.", "The user enters the app and signs an EIP-712 intent, order, session grant, will plan, or transfer authorization.", "The transaction executes through executeRuntimeApp(...), executeWithTokenPull(...), tokenTransferWithSig(...), or the app's own settlement path.", "After execution, temporary pull context is cleared; long-term authority remains inside the user's own wallet runtime boundary."] },
    ],
  },
  {
    id: "miscellanea",
    title: "Miscellanea and Concerns",
    blocks: [
      { type: "paragraph", text: "1Do's security model does not assume every app is trusted. Instead, it constrains what apps can do inside the user's own wallet runtime boundary. A relayer, counterparty, keeper, or ordinary caller may trigger execution, but triggering an enabled app does not grant wallet-owner authority." },
      { type: "list", items: ["Owner authority and trigger authority are separate.", "Local enablement and registry gating are separate.", "Signature validation converges in the wallet runtime through ERC-1271 and EIP-712.", "Nested runtime execution is rejected so apps cannot bypass execution locks or caller discipline."] },
      { type: "paragraph", text: "1Do does not claim that all risk disappears. A clearer runtime boundary can reduce risks from long-lived approval, platform-custodied balances, and app-owned permission systems, but it does not replace app audits, user judgment, or clear wallet signing displays." },
      { type: "list", items: ["1Do does not guarantee that every runtime app's business logic is risk-free.", "Registry gating is not a substitute for user judgment.", "Wallet-native authorization reduces long-lived allowance and operator approval, but does not remove phishing signatures, wrong recipient addresses, or malicious frontend risk.", "ERC-7702 availability depends on chain, wallet, RPC, and signing-tool support.", "1Do does not require today's ecosystem to immediately abandon ERC-20 or ERC-721."] },
    ],
  },
  {
    id: "gas",
    title: "Gas and Interaction Cost",
    blocks: [
      { type: "paragraph", text: "The cost of traditional DeFi is not only raw chain gas. It also includes user interactions, persistent approval risk, and the cost of recovering from failed or stale permissions. 1Do prioritizes fewer repeated approvals, fewer account migrations, and fewer app-owned permission systems." },
      { type: "paragraph", text: "The 1Do numbers below come from the current core Forge gas benchmarks. Traditional paths are shown as common gas-limit budget ranges; actual values vary by router, order type, asset state, chain, and calldata." },
      { type: "code", text: enGasComparison },
      { type: "paragraph", text: "So 1Do's gas optimization is not only about making one opcode cheaper. It removes steps and residue: one less approve, one less deposit, one less platform balance, and one less long-lived operator are each fewer sources of gas cost, risk, and user confusion." },
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
  {
    id: "references",
    title: "References",
    blocks: [
      { type: "list", items: ["Uniswap Labs, Introducing Permit2 & Universal Router, 2022-11-17: https://blog.uniswap.org/permit2-and-universal-router", "OpenSea Developer Documentation, Seaport: https://docs.opensea.io/docs/seaport", "OpenSea Developer Documentation, Get listing creation actions: https://docs.opensea.io/reference/create_listing_actions", "Tether, Supported Protocols and Integration Guidelines: https://tether.to/en/supported-protocols/", "Tether, FAQs: https://tether.to/faqs/", "Circle, 4 Ways to Authorize USDC Smart Contract Interactions, 2025-09-04: https://www.circle.com/blog/four-ways-to-authorize-usdc-smart-contract-interactions-with-circle-sdk", "EIP-3009, Transfer With Authorization: https://eips.ethereum.org/EIPS/eip-3009", "Coinbase Developer Documentation, x402 Overview: https://docs.cdp.coinbase.com/x402/welcome", "x402 Documentation, How x402 Works: https://docs.x402.org/core-concepts/how-x402-works", "Zelin Li, Qin Wang, Zhipeng Wang, Five Attacks on x402 Agentic Payment Protocol, 2026-05-12: https://arxiv.org/abs/2605.11781", "Ledger Support, Understanding Ethereum Token Approvals: https://support.ledger.com/article/Ethereum-Token-Approvals-Explained", "MetaMask Help Center, What is a token approval?: https://support.metamask.io/stay-safe/safety-in-web3/what-is-a-token-approval/", "Chainalysis, Targeted Approval Phishing Scams See Explosive Growth Over Last Two Years, 2023-12-14: https://www.chainalysis.com/blog/approval-phishing-cryptocurrency-scams-2023/", "Chainalysis, Approval Phishing: From Just One Case to Full-Scale Disruption, 2026-06-17: https://www.chainalysis.com/blog/what-is-approval-phishing/", "Scam Sniffer Reports archive, 2024 and 2025 wallet drainer annual loss estimates: https://drops.scamsniffer.io/category/reports/", "Chainalysis, $2.2 Billion Stolen from Crypto Platforms in 2024, 2024-12-19: https://www.chainalysis.com/blog/crypto-hacking-stolen-funds-2025/", "Chainalysis, 2025 Crypto Crime Mid-year Update, 2025-07-17: https://www.chainalysis.com/blog/2025-crypto-crime-mid-year-update/", "TRM Labs, $2.2 billion was stolen in crypto-related hacks in 2024, 2025-03-17: https://www.trmlabs.com/resources/blog/category-deep-dive-2-2-billion-was-stolen-in-crypto-related-hacks-in-2024"] },
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
      "1Do 从现有 EOA 与 DeFi 授权模型出发，提出以用户地址为应用执行边界的钱包运行时，让 DeFi、支付、NFT、遗产、会话和未来应用围绕同一个链上账户运行。",
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
      "A top-down explanation of the account vision, today's EOA and DeFi permission model, and how 1Do Core, runtime, security boundaries, payments, gas cost, and user flows converge inside the user's wallet runtime.",
    tags: ["English", "Core", "Security Model", "ERC-7702"],
    sections: enSections,
  },
};

type DiagramNodeProps = {
  eyebrow: string;
  title: string;
  lines: readonly string[];
  tone?: "user" | "intent" | "external" | "state" | "result";
};

const diagramCopy = {
  zh: {
    traditionalTitle: "传统 DeFi：状态与权限外置",
    onedoTitle: "1Do：用户地址就是状态和运行时",
    arrows: {
      external: "approve / deposit / execute",
      runtime: "executeRuntimeApp(app, data)",
      delegate: "delegatecall",
    },
    traditional: {
      user: { eyebrow: "用户账户", title: "EOA", lines: ["签名", "无本地运行时"] },
      external: { eyebrow: "外部协议", title: "DeFi Contracts", lines: ["allowance / operator", "pool / vault / order"] },
      result: { eyebrow: "状态归属", title: "协议中心", lines: ["用户是入口", "状态在外部合约"] },
    },
    onedo: {
      user: { eyebrow: "用户账户", title: "ERC-7702 Runtime", lines: ["持有资产", "执行代码", "保存状态"] },
      app: { eyebrow: "应用逻辑", title: "Runtime App", lines: ["delegatecall", "进入用户执行帧"] },
      result: { eyebrow: "状态归属", title: "用户地址中心", lines: ["应用是逻辑", "状态在用户地址"] },
      state: { eyebrow: "状态层", title: "Storage", lines: ["ERC-7201 持久状态", "EIP-1153 临时拉取"] },
    },
  },
  en: {
    traditionalTitle: "Traditional DeFi: State And Authority Outside The User",
    onedoTitle: "1Do: The User Address Is State And Runtime",
    arrows: {
      external: "approve / deposit / execute",
      runtime: "executeRuntimeApp(app, data)",
      delegate: "delegatecall",
    },
    traditional: {
      user: { eyebrow: "User Account", title: "EOA", lines: ["signer", "no local runtime"] },
      external: { eyebrow: "External Protocols", title: "DeFi Contracts", lines: ["allowance / operator", "pool / vault / order"] },
      result: { eyebrow: "State Owner", title: "Protocol-Centered", lines: ["user is the entry", "state lives outside"] },
    },
    onedo: {
      user: { eyebrow: "User Account", title: "ERC-7702 Runtime", lines: ["holds assets", "executes code", "stores state"] },
      app: { eyebrow: "App Logic", title: "Runtime App", lines: ["delegatecall", "user-account frame"] },
      result: { eyebrow: "State Owner", title: "User-Address Centered", lines: ["apps are logic", "state stays with user"] },
      state: { eyebrow: "State Layer", title: "Storage", lines: ["ERC-7201 persistent state", "EIP-1153 transient pull"] },
    },
  },
} as const;

function DiagramNode({ eyebrow, title, lines, tone = "state" }: DiagramNodeProps) {
  const toneClass = {
    user: "border-pink-300/80 bg-pink-50/80",
    intent: "border-amber-300/80 bg-amber-50/80",
    external: "border-slate-300/80 bg-slate-50/85",
    state: "border-indigo-300/80 bg-indigo-50/80",
    result: "border-emerald-300/80 bg-emerald-50/80",
  }[tone];

  return (
    <div className={`min-h-[108px] rounded-lg border px-4 py-3 shadow-[0_18px_40px_-32px_rgba(0,0,0,0.45)] ${toneClass}`}>
      <p className="text-[11px] font-semibold uppercase text-[#1B0D15]/45">{eyebrow}</p>
      <p className="mt-1 text-base font-semibold text-[#1B0D15]">{title}</p>
      <ul className="mt-2 space-y-1 text-sm leading-5 text-[#1B0D15]/70">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

function DiagramArrow({ label }: { label?: string }) {
  return (
    <div className="flex min-h-8 items-center justify-center text-[#1B0D15]/45">
      <div className="hidden h-px flex-1 bg-[#1B0D15]/20 md:block" />
      {label ? <span className="mx-2 rounded-full bg-white/70 px-2 py-1 text-[11px] font-medium text-[#1B0D15]/60">{label}</span> : null}
      <span className="material-symbols-outlined !text-[22px]">arrow_forward</span>
      <div className="hidden h-px flex-1 bg-[#1B0D15]/20 md:block" />
    </div>
  );
}

function StateDiagram({ variant, language }: { variant: "traditional" | "onedo"; language: "zh" | "en" }) {
  const copy = diagramCopy[language];

  if (variant === "traditional") {
    const diagram = copy.traditional;
    return (
      <div className="rounded-2xl border border-white/75 bg-white/55 p-4 shadow-[0_24px_70px_-50px_rgba(0,0,0,0.65)] backdrop-blur">
        <p className="mb-4 text-sm font-semibold text-[#1B0D15]/70">{copy.traditionalTitle}</p>
        <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <DiagramNode {...diagram.user} tone="user" />
          <DiagramArrow label={copy.arrows.external} />
          <DiagramNode {...diagram.external} tone="external" />
          <DiagramArrow />
          <DiagramNode {...diagram.result} tone="result" />
        </div>
      </div>
    );
  }

  const diagram = copy.onedo;
  return (
    <div className="rounded-2xl border border-white/75 bg-white/55 p-4 shadow-[0_24px_70px_-50px_rgba(0,0,0,0.65)] backdrop-blur">
      <p className="mb-4 text-sm font-semibold text-[#1B0D15]/70">{copy.onedoTitle}</p>
      <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <DiagramNode {...diagram.user} tone="user" />
        <DiagramArrow label={copy.arrows.runtime} />
        <DiagramNode {...diagram.app} tone="intent" />
        <DiagramArrow label={copy.arrows.delegate} />
        <DiagramNode {...diagram.result} tone="result" />
      </div>
      <div className="mt-3">
        <DiagramNode {...diagram.state} tone="state" />
      </div>
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
