// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@oasisprotocol/sapphire-contracts/contracts/Sapphire.sol";

contract MessageBox {
    string private _message;
    address public author;

	bytes public pk;
	bytes private sk;

	constructor() {
		bytes memory seed = Sapphire.randomBytes(32, "");
		Sapphire.SigningAlg alg = Sapphire.SigningAlg.Secp256k1PrehashedKeccak256;
		(pk, sk) = Sapphire.generateSigningKeyPair(alg, seed); // Public/Secret key
	}

	function getPublicKey() external view returns (bytes memory) {
		return pk;
	}

    function setMessage(string calldata in_message) external {
        _message = in_message;
        author = msg.sender;
    }

    function message() external view returns (string memory) {
      if (msg.sender!=author) {
        revert("not allowed");
      }
      return _message;
    }
}
