// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// Uncomment while developing code for testing.
import "hardhat/console.sol";

// OpenZeppelin contracts to import
// import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/access/AccessControl.sol";

contract Escrow {
    address public buyer;
    address public seller;
    address public buyerContract;
    address public sellerContract;

    struct buyerInfo {
        address buyerAddress;
        address desiredContract;
        uint bidPrice;
    }

    struct sellerInfo {
        address sellerAddress;
        address sellingContract;
        uint askPrice;
    }

    bool public isSettled;
    mapping(address => uint) public sellerAsk;
    mapping(address => uint) public buyerBid;

    constructor(
        address _buyer,
        address _buyerContract,
        uint _bidPrice,
        address _seller,
        address _sellerContract,
        uint _askPrice
    ) {
        buyer = _buyer;
        seller = _seller;
        buyerContract = _buyerContract;
        sellerContract = _sellerContract;
        buyerBid[_buyerContract] = _bidPrice;
        sellerAsk[_sellerContract] = _askPrice;
    }

    modifier onlyBuyerOrSeller() {
        require(
            msg.sender == buyer || msg.sender == seller,
            "Caller not contract buyer or seller."
        );
        _;
    }

    function goodToSettle() public {
        require(
            buyerContract == sellerContract,
            "Buyer and seller contracts do not match."
        );
        require(
            buyerBid[buyerContract] == sellerAsk[sellerContract],
            "Buyer and seller prices do not match."
        );

        // Check that buyer address has sufficient ETH for transaction
        // If yes:
        // buyer transfer ETH to seller
        // seller transfer contract to buyer

        isSettled = true;
        currentStatus();
    }

    event Cancelled(address indexed cancellingAddress);

    function cancelTransfer() external onlyBuyerOrSeller {
        require(isSettled == false, "Escrow already settled.");
        emit Cancelled(msg.sender);
    }

    event Status();

    // Parameters:
    // checks status of eth received and contract held
    function currentStatus() public {
        emit Status();
    }
}
