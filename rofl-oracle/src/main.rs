use oasis_runtime_sdk::{crypto::signature::secp256k1::PublicKey, modules::rofl::app::prelude::*, types::address::SignatureAddressSpec};
use ethabi::{self, ethereum_types::U256};
/// Address where the oracle contract is deployed.
// #region oracle-contract-address
const ORACLE_CONTRACT_ADDRESS: &str = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // TODO: Replace with your contract address.
// #endregion oracle-contract-address

struct OracleApp;

#[async_trait]
impl App for OracleApp {
    /// Application version.
    const VERSION: Version = sdk::version_from_cargo!();

    /// Identifier of the application (used for registrations).
    // #region app-id
    fn id() -> AppId {
        "rofl1qqn9xndja7e2pnxhttktmecvwzz0yqwxsquqyxdf".into() // TODO: Replace with your application ID.
    }
    // #endregion app-id

    /// Return the consensus layer trust root for this runtime; if `None`, consensus layer integrity
    /// verification will not be performed (e.g. Localnet).
    // #region consensus-trust-root
    fn consensus_trust_root() -> Option<TrustRoot> {
        // The trust root below is for Sapphire Testnet at consensus height 22110615.
        // Some(TrustRoot {
        //     height: 22110615,
        //     hash: "95d1501f9cb88619050a5b422270929164ce739c5d803ed9500285b3b040985e".into(),
        //     runtime_id: "000000000000000000000000000000000000000000000000a6d1e3ebf60dff6c".into(),
        //     chain_context: "0b91b8e4e44b2003a7c5e23ddadb5e14ef5345c0ebcb3ddcae07fa2f244cab76"
        //         .to_string(),
        // })

        None
    }
    // #endregion consensus-trust-root

    async fn run(self: Arc<Self>, _env: Environment<Self>) {
        // We are running now!
        println!("Hello ROFL world!");
    }

    async fn on_runtime_block(self: Arc<Self>, env: Environment<Self>, _round: u64) {
        // This gets called for each runtime block. It will not be called again until the previous
        // invocation returns and if invocation takes multiple blocks to run, those blocks will be
        // skipped.
        if let Err(err) = self.run_oracle(env).await {
            println!("Failed to submit observation: {:?}", err);
        }
    }
}

impl OracleApp {
    /// Fetch stuff from remote service via HTTPS and publish it on chain.
    async fn run_oracle(self: Arc<Self>, env: Environment<Self>) -> Result<()> {
        // Fetch data from remote service.
        println!("WOW!");
        
        let observation = tokio::task::spawn_blocking(move || -> Result<_> {
            println!("SHIKA1!");
            
            // Request some data from Coingecko API.
            let rsp: serde_json::Value = rofl_utils::https::agent()
            .get("https://www.binance.com/api/v3/ticker/price?symbol=ROSEUSDT")
            .call()?
            .body_mut()
            .read_json()?;
        
            println!("SHIKA2!");
            
            // Extract price and convert to integer.
            let price = rsp
            .pointer("/price")
            .ok_or(anyhow::anyhow!("price not available"))?
            .as_str().unwrap()
            .parse::<f64>()?;
            let price = (price * 1_000_000.0) as u128;
        
            println!("SHIKA3!");
            Ok(price)
        }).await??;

        // let observation = tokio::task::spawn_blocking(move || -> Result<_> {
        //     // Request some data from Coingecko API.
        //     let rsp: serde_json::Value = serde_json::Value::String
        //         (rofl_utils::https::agent()
        //         .get("https://cock-sg24.free.beeceptor.com/")
        //         .call()?
        //         .body_mut()
        //         .read_to_string()?);

        //     Ok(rsp)
        // }).await??; 

        println!("ZAMN");
        println!("lfg: {:?}", observation);
        // let mut tx = self.new_transaction(

        // // Prepare the oracle contract call.
        //     "evm.Call",
        //     module_evm::types::Call {
        //         address: ORACLE_CONTRACT_ADDRESS.parse().unwrap(),
        //         value: 0.into(),
        //         data: [
        //             ethabi::short_signature("submitObservation", &[ethabi::ParamType::Uint(128)])
        //                 .to_vec(),
        //             ethabi::encode(&[ethabi::Token::Uint(observation.into())]),
        //         ]
        //         .concat(),
        //     },
        // );
        // tx.set_fee_gas(200_000);

        // // Submit observation on chain.env
        // env.client().sign_and_submit_tx(env.signer(), tx).await?;

        // let sdk_pub_key = PublicKey::from_bytes(env.signer().public_key().as_bytes()).unwrap();
        // let res = env.client().query(
        //     0,
        //     "evm.SimulateCall",
        //     module_evm::types::SimulateCallQuery {
        //         gas_price: 10.into(),
        //         gas_limit: 100_000,
        //         caller: module_evm::derive_caller::from_sigspec(&SignatureAddressSpec::Secp256k1Eth(sdk_pub_key)).unwrap(),
        //         address: None,
        //         value: 0.into(),
        //         data: [
        //           ethabi::short_signature("getFirstPendingOffchainTx", &[]).to_vec(),
        //           ethabi::encode(&[]),
        //         ].concat(),
        //     },
        // ).await?;

        
        let mut tx_id: U256 = U256::from(12345);
        let result: Vec<Vec<u8>> = vec![
            vec![0x01, 0x02, 0x03],  // First byte array
            vec![0x04, 0x05],        // Second byte array
            ];
            
        println!("ENGINIGGER PUSH 1");
        
        let mut tx = self.new_transaction(
            "evm.Call",
            module_evm::types::Call {
                address: ORACLE_CONTRACT_ADDRESS.parse().unwrap(),
                value: 0.into(),
                data: [
                    // Short signature for sendResultFromOffchain(uint256, bytes[])
                    ethabi::short_signature("sendResultFromOffchain", &[ethabi::ParamType::Uint(256), ethabi::ParamType::Array(Box::new(ethabi::ParamType::Bytes))])
                    .to_vec(),
                    
                    // Encode the txId and result parameters
                    ethabi::encode(&[
                        ethabi::Token::Uint(tx_id.into()), // txId as a 256-bit uint
                        ethabi::Token::Array(result.iter().map(|r| ethabi::Token::Bytes(r.clone())).collect()), // result as an array of bytes
                        ]),
                        ]
                        .concat(),
                    },
                );
        
        println!("ENGINIGGER PUSH 2");
        
        tx.set_fee_gas(200_000);
                
        // Submit observation on chain.
        env.client().sign_and_submit_tx(env.signer(), tx).await?;
        
        println!("ENGINIGGER PUSH 3");

        Ok(())
    }
}

fn main() {
    // println!("entry point");
    OracleApp.start();
}
