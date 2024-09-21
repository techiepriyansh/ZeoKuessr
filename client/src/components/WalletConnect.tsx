"use client";
import { useOasis } from "@/app/context/useOasis";
import React from "react";

export const WalletConnect = () => {
  const { connect, disconnect } = useOasis();
  return (
    <button
      onClick={() => {
        connect();
      }}
      className="bg-blue-500 text-white p-2 rounded"
    >
      {window.ethereum.selectedAddress
        ? window.ethereum.selectedAddress
        : "Connect"}
    </button>
  );
};
