import dotenv from "dotenv";
dotenv.config();

import { IndexService, SignProtocolClient, OffChainSignType, OffChainRpc, SpMode } from "@ethsign/sp-sdk";
import { privateKeyToAccount } from "viem/accounts";

const METADATA_SCHEMA_ID = "SPS_BuJZ2_quhMg57q_tLgbzk";
const METADATA_INDEXING_VALUE = "rofl-gmap-images-v1";

export const signMain = async (imageBase64: string) => {
    const client = new SignProtocolClient(SpMode.OffChain, {
        signType: OffChainSignType.EvmEip712,
        account: privateKeyToAccount(process.env.PRIVATE_KEY as any),
        rpcUrl: OffChainRpc.testnet,
    });

    const attestationInfo = await client.createAttestation({
        schemaId: METADATA_SCHEMA_ID,
        data: {
            imageBase64,
        },
        indexingValue: METADATA_INDEXING_VALUE,
    });

    return attestationInfo.attestationId;
}