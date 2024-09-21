"use client";
import React, { useEffect, useState } from "react";
import Map from "@/components/Map";
import { useOasis } from "@/app/context/useOasis";
import { ethers } from "ethers";
import * as sapphire from "@oasisprotocol/sapphire-paratime";
import { GAME_ABI } from "@/lib/abi/MessageBox";
import { IndexService } from "@ethsign/sp-sdk";

export const Game = () => {
  const contractAddress = "0x37dC56819D205a79001ECFF9A5BC1B9F4D5c279e";
  const [game, setGame] = useState("");
  const [imageId, setImageId] = useState();
  const [image, setImage] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const contract = new ethers.Contract(
      contractAddress,
      GAME_ABI,
      new ethers.BrowserProvider(window.ethereum)
    );
    contract.on("NewGameCreated", (gameId: bigint) => {
      console.log("NewGameCreated", gameId);
      setGame(gameId.toString());
    });
    contract.on("GameStarted", (gameId: bigint) => {
        setStarted(true);
    });
    contract.on("GeoLocationImageResponse", async (gameId: bigint, imageId) => {
      console.log("GeoLocationImageResponse", gameId, imageId);
      if (gameId.toString() == game) {
        setImageId(imageId);
      }
      const client = new IndexService("testnet");
      const auctionInfo = await client.queryAttestation(imageId);
      if (auctionInfo) {
        const resData = JSON.parse(auctionInfo.data);
        setImage(resData.imageBase64);
      }
    });
  }, []);

  const newGame = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = sapphire.wrap(await provider.getSigner());
    const contract = new ethers.Contract(contractAddress, GAME_ABI, signer);
    const tx = await contract.newGame();
    await tx.wait();
  };

  const joinGame = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = sapphire.wrap(await provider.getSigner());
    const contract = new ethers.Contract(contractAddress, GAME_ABI, signer);
    const tx = await contract.joinGame(game);
    await tx.wait();
    setIsJoined(true);
  };

  const startGame = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = sapphire.wrap(await provider.getSigner());
    const contract = new ethers.Contract(contractAddress, GAME_ABI, signer);
    const tx = await contract.startGame(game);
    await tx.wait();
  };
  return (
    <>
      {game ? (
        <div className="h-full w-full">
          <div className="flex flex-row justify-center items-center h-[300px] w-full">
            {image && (
              <img
                src={`data:image/jpeg;base64,${image}`}
                alt="map"
                height={300}
                width={400}
              />
            )}
          </div>
          <div className="flex flex-row justify-center items-center">
            <div className="text-2xl font-bold text-white">
              Game Code: {game}
            </div>
            <button
              onClick={isJoined ? startGame : joinGame}
              className="bg-green-500 text-white p-2 rounded me-5 mt-5"
            >
              {isJoined ? "Start Game" : "Join Game"}
            </button>
            <button
              onClick={() => setGame(null)}
              className="bg-red-500 text-white p-2 rounded mt-5"
            >
              End Game
            </button>
          </div>
          <div className="flex flex-row mt-2">
            <div className="w-3/5">
              <Map />
            </div>
            {started && image && (
              <div className="w-2/5 p-5 flex flex-col items-center">
                <input
                  type="text"
                  placeholder="Enter your Bet"
                  className="w-full p-2 rounded text-black"
                />
                <button className="bg-green-500 text-white p-2 rounded mt-5">
                  Bet
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center h-full w-full">
          <button
            onClick={() => {
              if (!window.ethereum.selectedAddress) {
                window.alert("Please connect your wallet");
                return;
              }
              newGame();
            }}
            className="bg-green-500 text-white p-2 rounded"
          >
            New Game
          </button>
          <button
            onClick={() => {
              if (!window.ethereum.selectedAddress) {
                window.alert("Please connect your wallet");
                return;
              }
              var resp = window.prompt("Enter game code");
              if (resp) {
                setGame(resp);
              }
            }}
            className="bg-black-500 text-white p-2 rounded border-white border-2 mt-4"
          >
            Join game
          </button>
        </div>
      )}
    </>
  );
};
