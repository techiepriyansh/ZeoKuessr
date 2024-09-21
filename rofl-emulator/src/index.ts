// Emulate ROFL because of issues with running vanilla ROFL
import { GAME_ABI } from './game_abi';
import { gmapMain } from './gmap';
import { signMain } from './sign';

import { ethers, JsonRpcProvider } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const OP_NULL = 0n;
const OP_GET_GEO_LOCATION_IMAGE = 1n; // getGeoLocationImage(locationSeed bytes)
const OP_CALC_POOL_PARTITION = 2n; // calcPoolPartition(gameId uint256, poolAmount uint256, locationSeed bytes, numUser uint256, userGuesses bytes[])

const LOOP_INTERVAL = 6000;

const PRIVATE_KEY = process.env.PRIVATE_KEY;

const CONTRACT_ADDRESS = process.env.SAPPHIRE_GAME_CONTRACT_ADDRESS;
const SAPPHIRE_TESTNET_CONFIG = {
    url: 'https://testnet.sapphire.oasis.dev',
    chainId: 0x5aff,
}

const mainLoop = async () => {
    const provider = new JsonRpcProvider(SAPPHIRE_TESTNET_CONFIG.url);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, GAME_ABI, wallet);
    const offchainTx = await contract.getFirstPendingOffchainTx();

    switch (offchainTx.op) {
        case OP_NULL: {
            console.log(`[INFO] No pending offchain transactions`);
            break;
        }
        case OP_GET_GEO_LOCATION_IMAGE: {
            console.log(`[INFO] Processing GET_GEO_LOCATION_IMAGE for Game ID: ${offchainTx.gameId}`)

            const locationSeed = offchainTx.args[0];
            const imageBase64 = await gmapMain(locationSeed);
            const imageId = await signMain(imageBase64);
            
            console.log(`[INFO] Image ID: ${imageId}`);

            const imageIdHex = ethers.hexlify(ethers.toUtf8Bytes(imageId));
            const tx = await contract.sendResultFromOffchain(offchainTx.id, [imageIdHex]);
            const receipt = await tx.wait();
            console.log(receipt);

            break;
        }
        case OP_CALC_POOL_PARTITION: {
            // console.log(`[INFO] Processing CALC_POOL_PARTITION for Game ID: ${offchainTx.gameId}`)

            // const locationSeed = offchainTx.args[0];
            // const numUsers = parseInt(offchainTx.args[1], 16);

            // const userWeights = [];

            // for (let i = 0; i < numUsers; i++) {
            //     const userGuess = offchainTx.args[2].slice(i * 32, (i + 1) * 32);
            //     const userAmount = parseInt(offchainTx.args[3].slice(i * 32, (i + 1) * 32), 16);
            // }
        }
        default: {
            console.log(`[ERROR] Unknown operation: ${offchainTx.op}`)
        }
    }
}

async function main() {
    while (true) {
        await mainLoop();
        await new Promise(resolve => setTimeout(resolve, LOOP_INTERVAL));
    }
}

const command = process.argv.slice(2).pop();

switch (command) {
    case "loop": {
        main().then(() => process.exit(0)).catch(error => {
            console.error(error);
            process.exit(1);
        });
        break;
    }
    case "serve": {
        console.log(`Not implemented yet!`)
    }
}
