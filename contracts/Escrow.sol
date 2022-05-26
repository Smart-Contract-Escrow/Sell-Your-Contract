//SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

/// @dev use interface to interact with a deployed and ownable contract
interface ITestERC20 {
    function transferOwnership(address addr) external;
    function owner() external returns (address);
}

/// @title An Escrow Protocol

contract Escrow {
    address payable internal ownerOfContract;
    // create a struct to group contract being sold, seller, buyer, and price together
    struct EscrowContracts {
        address contractBeingSold;
        address sellerAddress;
        uint256 sellPrice;
        address buyersAddress;
    }
    // create a struct for buyer information
    struct BuyersInfo {
        address contractBeingBought;
        address buyerAddress;
        uint256 sellPrice;
    }

    // use mapping to keep track of EscrowContracts struct
    mapping(address => EscrowContracts) public escrowDetails;

    // emit an event when seller is ready
    event SellerReady(EscrowContracts seller);

    // emit an event when the transaction is completed
    event TransactionCompleted(BuyersInfo buyer, EscrowContracts seller);

    constructor() {
        ownerOfContract = payable(msg.sender);
    }

    /// @dev seller fills in contract transaction details and transfer the contract ownership to the escrow
    function setContractDetail(
        address contractBeingSold,
        uint256 sellPrice,
        address buyerAddress
    ) external {
        address sellerAddress = msg.sender;

        EscrowContracts memory mySellerInfo = EscrowContracts(
            contractBeingSold,
            sellerAddress,
            sellPrice,
            buyerAddress
        );

        escrowDetails[mySellerInfo.contractBeingSold] = mySellerInfo;

        emit SellerReady(mySellerInfo);
    }

    /// @dev only buyer can check the listed price of the contract
    function getSellerAmount(address myContract) public view returns (uint256) {
        EscrowContracts memory seller = escrowDetails[myContract];
        require(
            seller.buyersAddress == msg.sender,
            "Only buyer can see amount"
        );
        return seller.sellPrice;
    }

    /// @dev buyer send payment to the seller after seller provides contract transaction details
    function buyerSendPay(address contractBeingBought) external payable {
        uint256 amount = msg.value;
        address buyerAddress = msg.sender;

        require(amount != 0, "Buyer did not send any amount");

        BuyersInfo memory myBuyersInfo = BuyersInfo(
            contractBeingBought,
            buyerAddress,
            amount
        );

        EscrowContracts memory mySellerInfo = escrowDetails[
            myBuyersInfo.contractBeingBought
        ];
        // check if the contract ownership has transferred to the escrow contract
        require(ITestERC20(contractBeingBought).owner() == address(this), "Seller has not transferred ownership to the escrow");

        require(
            escrowDetails[contractBeingBought].buyersAddress == msg.sender,
            "Seller address did not match buyer"
        );
        // call goodToGo function once buyer sends payment
        goodToGo(mySellerInfo, myBuyersInfo);
    }

    /// @dev buyer sends payment to seller, escrow contract transfer the contract ownership to buyer
    function goodToGo(EscrowContracts memory seller, BuyersInfo memory buyer)
        internal
    {
        require(
            seller.sellPrice == buyer.sellPrice,
            "Sell price doesn't match buy price"
        );
        require(
            seller.contractBeingSold == buyer.contractBeingBought,
            "Contract sold and bought not the same"
        );

        // buyer sends payment to seller
        (bool sent, ) = seller.sellerAddress.call{value: buyer.sellPrice}("");
        require(sent, "Payment Failed to seller address");

        // use interface to transfer ownership to buyer
        ITestERC20(seller.contractBeingSold).transferOwnership(buyer.buyerAddress);

        // emit an event when transaction completed
        emit TransactionCompleted(buyer, seller);

        // delete stored contract transaction details
        delete escrowDetails[seller.contractBeingSold];
    }
}
