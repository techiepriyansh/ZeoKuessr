"use client";
import { WalletConnect } from "@/components/WalletConnect";
import { useOasis } from "./context/useOasis";
import { Game } from "@/components/Game";
import Map from "@/components/Map";

export default function Home() {
  const { connect, address, isConnected, disconnect } = useOasis();
  return (
    <div className="flex flex-col h-screen bg-black">
      <div className="h-1/6 flex flex-row justify-center items-center">
        <WalletConnect />
      </div>
      <div className="h-5/6 flex flex-row justify-center items-center">
        <Game />
      </div>
    </div>
  );
}
