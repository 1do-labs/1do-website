# 1Do Website (`1do-website`)

Official landing page for the 1Do Account ecosystem, linking to the 1Do App / Core, Labs, and whitepaper.

## Project Overview

This is a **Next.js 16.1.1** application using **React 19** and **Tailwind CSS v4**. It serves as the static entry point for users to discover 1Do, a Web3 account runtime centered around smart accounts (ERC-7204).

The visual design mirrors `1do-core` (the main dApp), featuring a signature pink background, frosted glass effects, and Space Grotesk typography.

### Key Technologies
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, CSS Variables, Custom "frosted glass" effects
- **Fonts:** Space Grotesk (local), Material Symbols Outlined (local)

## Getting Started

### Scripts
- **Development:** `npm run dev` (Starts at port 3000)
- **Build:** `npm run build`
- **Start:** `npm run start`
- **Lint:** `npm run lint`

### Installation
```bash
npm install
```

## Architecture & Conventions

### Directory Structure
- `src/app/`: Next.js App Router source.
  - `page.tsx`: The main landing page containing all sections (Hero, Highlights, Steps, Core Apps, Labs).
  - `globals.css`: Defines CSS variables (`--brand-*`), font faces, and utility classes like `.frosted-glass`.
  - `layout.tsx`: Root layout.
- `public/`: Static assets including fonts (`fonts/`) and icons.

### Design System
The project uses a specific design language defined in `src/app/globals.css`:
- **Colors:** Defined as CSS variables (e.g., `--brand-primary`, `--brand-secondary`, `--brand-accent`). The palette is primarily pink (`#FEE7F3`, `#F9A8D4`) and dark purple/black (`#1B0D15`).
- **UI Components:**
  - **Frosted Glass:** Use the `.frosted-glass` class for cards and containers.
  - **Icons:** Material Symbols Outlined are used via span classes (e.g., `<span className="material-symbols-outlined">icon_name</span>`).
  - **Typography:** Space Grotesk is the primary font.
- **Background:** An animated background with floating blobs is implemented in `page.tsx` using `.background-container` and `.shape*` classes.

### Content Management
- **Links:** External links (App / Core, Labs, Docs) are managed in the `LINKS` constant at the top of `src/app/page.tsx`.
- **Text:** Content is static within `page.tsx`, designed to reflect the capabilities of the underlying 1Do ecosystem (1Do Account, deployments, SDK).

## Important Files
- `src/app/page.tsx`: Primary source of content and structure.
- `src/app/globals.css`: Global styles, font definitions, and theme variables.
- `package.json`: Dependencies and scripts.
