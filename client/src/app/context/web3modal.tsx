"use client";
//@ts-ignore
import { createAppKit } from "@reown/appkit/react";
//@ts-ignore
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
//@ts-ignore
import { mainnet, arbitrum } from "@reown/appkit/networks";

// 1. Get projectId at https://cloud.reown.com
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;

// 2. Set Ethers adapters
const Adapter = new EthersAdapter();

// 3. Create a metadata object
const metadata = {
  name: "My Website",
  description: "My Website description",
  url: "https://mywebsite.com", // origin must match your domain & subdomain
  icons: ["https://avatars.mywebsite.com/"],
};

const oasisSapphire = {
    chainId: 23295,
    name: 'Oasis Sapphire',
    currency: 'ROSE',
    explorerUrl: 'https://explorer.sapphire.oasis.dev',
    rpcUrl: 'https://explorer.oasis.io/testnet/sapphire'
  }

// 4. Create the AppKit instance
createAppKit({
  adapters: [Adapter],
  metadata: metadata,
  networks: [mainnet, arbitrum],
  projectId,
});

export function AppKit({ children }: { children: React.ReactNode }) {
  return children;
}
