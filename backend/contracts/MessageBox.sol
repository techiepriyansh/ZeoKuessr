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

struct GameState {
	uint256 gameId;
	bytes locationSeed;
}

contract MessageBox {
	mapping(uint256 => GameState) private gameStates;
	uint256 private gameIdEnd = 1;

	mapping(uint256 => OffchainTx) private offchainTxs;

	uint256 private txIdStart = 1;
	uint256 private txIdEnd = 1;

	event NewGameCrated(uint256 indexed gameId);

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
		if (txIdStart == txIdEnd) {
			return OffchainTx(0, 0, new bytes[](0));
		}
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

	function genRandLocationSeed() internal view returns (bytes memory) {
		bytes memory seed = Sapphire.randomBytes(32, "");
		return seed;
	}

	function getRandGeoLocation(bytes memory locationSeed) internal returns (uint256) {
		bytes[] memory args = new bytes[](1);
		args[0] = locationSeed;
		return callOffchain(OP_GET_GEO_LOCATION_IMAGE, args);
	}

	function startGame(uint256 gameId) external {
		// access restricted to one of the players
		// update the state of the game using gameId
		bytes memory locationSeed = genRandLocationSeed();
		gameStates[gameId].locationSeed = locationSeed;
		uint256 txId = getRandGeoLocation(locationSeed);
		emit GeoLocationImageRequest(gameId, txId);
	}

	function newGame() external {
		uint256 gameId = gameIdEnd++;
		gameStates[gameId] = GameState(gameId, new bytes(0));
		emit NewGameCrated(gameId);
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
