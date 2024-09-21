// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@oasisprotocol/sapphire-contracts/contracts/Sapphire.sol";

uint256 constant OP_GET_GEO_LOCATION_IMAGE = 1; // getGeoLocationImage(locationSeed bytes)
uint256 constant OP_CALC_POOL_PARTITION = 2; // calcPoolPartition(gameId uint256, poolAmount uint256, locationSeed bytes, numUser uint256, userGuesses bytes[])

struct OffchainTx {
	uint256 id;
	uint256 op;
	bytes[] args;
}

contract MessageBox {
	mapping(uint256 => OffchainTx) private offchainTxs;

	uint256 private txIdStart = 1;
	uint256 private txIdEnd = 1;

	event GeoLocationImageRequest(uint256 indexed gameId, uint256 txId);
	event GeoLocationImageResponse(uint256 indexed txId, string imageId);

	function callOffchain(uint256 op, bytes[] memory args) internal returns (uint256) {
		uint256 txId = txIdEnd++;
		OffchainTx memory offchainTx = OffchainTx(txId, op, args);
		offchainTxs[txId] = offchainTx;
		return txId;
	}

	function getFirstPendingOffchainTx() external view returns (OffchainTx memory) {
		// TODO: access restricted to the ROFL
		return offchainTxs[txIdStart];
	}

	function sendResultFromOffchain(uint256 txId, bytes[] memory result) external {
		// TODO: access restricted to the ROFL
		require(txId == txIdStart, "txId does not match the first pending tx");
		OffchainTx memory offchainTx = offchainTxs[txId];
		if (offchainTx.op == OP_GET_GEO_LOCATION_IMAGE) {
			// (imageId string)
			emit GeoLocationImageResponse(txId, string(result[0]));
		} else if (offchainTx.op == OP_CALC_POOL_PARTITION) {
			// (gameId uint256, uint256[] partitionAmounts)
		}
		delete offchainTxs[txId];
		txIdStart++;
	}

	function genRandLocationSeed() external view returns (bytes memory) {
		bytes memory seed = Sapphire.randomBytes(32, "");
		return seed;
	}

	function getRandGeoLocation() internal returns (uint256) {
		return callOffchain(OP_GET_GEO_LOCATION_IMAGE, new bytes[](0));
	}

	function startGame(uint256 gameId) external {
		// access restricted to one of the players
		// update the state of the game using gameId
		uint256 txId = getRandGeoLocation();
		emit GeoLocationImageRequest(gameId, txId);
	}


    // function setMessage(string calldata in_message) external {
    //     _message = in_message;
    //     author = msg.sender;
    // }

    // function message() external view returns (string memory) {
    //   if (msg.sender!=author) {
    //     revert("not allowed");
    //   }
    //   return _message;
    // }
}
