"use client";
import { GAME_ABI } from "@/lib/abi/MessageBox";
import * as sapphire from "@oasisprotocol/sapphire-paratime";
import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";

const HARDHAT_NETWORK_ID = "23295"; // Sapphire Testnet

export const useOasis = () => {
  const [isConnected, setIsConnected] = useState(window.ethereum._isConnected);
  const [address, setAddress] = useState("");
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  useEffect(() => {
    setIsConnected(window.ethereum._isConnected );
  }, [window.ethereum]);

  const connect = useCallback(async () => {
    let p = new ethers.BrowserProvider(window.ethereum);
    setProvider(p);
    setSigner(sapphire.wrap(await p.getSigner()));
    setIsConnected(window.ethereum._isConnected);
    setAddress(window.ethereum.selectedAddress);
  }, []);

  const disconnect = useCallback(async () => {
    setIsConnected(false);
    setAddress("");
  }, []);

  return { isConnected, address, connect, disconnect, provider, signer };
};

export async function startGame() {
  const contract = new ethers.Contract(
    "0xDD167D0B201c5dB9791Dd6C400Fa89a135336974",
    GAME_ABI,
    sapphire.wrap(await provider.getSigner())
  );
  const tx = await contract.startGame("34");
  const receipt = await tx.wait();
  console.log(receipt);
}
