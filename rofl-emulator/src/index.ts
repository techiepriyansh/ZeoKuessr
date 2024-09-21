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

async function main() {
    const provider = new JsonRpcProvider(SAPPHIRE_TESTNET_CONFIG.url);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, GAME_ABI, provider);
    
    const mainLoop = async () => {
        const offchainTx = await contract.getFirstPendingOffchainTx();
        
        switch (offchainTx.op) {
            case OP_NULL: {
                console.log(`[INFO] No pending offchain transactions`);
                break;
            }
            case OP_GET_GEO_LOCATION_IMAGE: {
                const locationSeed = offchainTx.args[0];
                const imageBase64 = await gmapMain(locationSeed);
                const imageId = await signMain(imageBase64);
                console.log(`[INFO] Image ID: ${imageId}`);
                break;
            }
            case OP_CALC_POOL_PARTITION: {
            }
            default: {
                console.log(`[ERROR] Unknown operation: ${offchainTx.op}`)
            }
        }
    }

    while (true) {
        await mainLoop();
        await new Promise(resolve => setTimeout(resolve, LOOP_INTERVAL));
    }
}

main().then(() => process.exit(0)).catch(error => {
    console.error(error);
    process.exit(1);
});
