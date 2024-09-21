// Emulate ROFL because of issues with running vanilla ROFL
import { GAME_ABI } from './game_abi';
import { gmapMain, getDistanceBwLocationSeeds } from './gmap';
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
            console.log(`[INFO] Processing CALC_POOL_PARTITION for Game ID: ${offchainTx.gameId}`)

            console.log(offchainTx.args)

            const locationSeed = offchainTx.args[0];
            const numUsers = parseInt(offchainTx.args[1].slice(2), 16);

            console.log(`[INFO] Location Seed: ${locationSeed}`);
            console.log(`[INFO] Number of Users: ${numUsers}`);

            let userGuesses = offchainTx.args[2].slice(2);
            let userAmounts = offchainTx.args[3].slice(2);

            const userWeights = [];
            let poolAmount = 0;
            for (let i = 0; i < numUsers; i++) {
                const userGuess = '0x' + userGuesses.slice(i * 64, (i + 1) * 64);
                const userAmount = parseInt(userAmounts.slice(i * 64, (i + 1) * 64), 16);

                console.log(`[INFO] User ${i} Guess: ${userGuess}`);
                console.log(`[INFO] User ${i} Amount: ${userAmount}`);

                const distance = getDistanceBwLocationSeeds(locationSeed, userGuess);

                console.log(`[INFO] User ${i} Distance: ${distance}`)

                const weight = userAmount / distance;
                userWeights.push(weight);
                poolAmount += userAmount;
            }

            const totalWeight = userWeights.reduce((a, b) => a + b, 0);

            const poolPartition = [];
            for (let i = 0; i < numUsers; i++) {
                const userPartition = Math.floor(poolAmount * userWeights[i] / totalWeight);
                const userPartitionHex = '0x' + BigInt(userPartition).toString(16).padStart(64, '0');
                poolPartition.push(userPartitionHex);
            }

            console.log(poolPartition);

            const tx = await contract.sendResultFromOffchain(offchainTx.id, poolPartition);
            const receipt = await tx.wait();
            console.log(receipt);

            break;
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
