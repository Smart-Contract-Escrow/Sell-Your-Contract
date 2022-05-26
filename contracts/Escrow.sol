//SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

/// @dev use interface to interact with a deployed and ownable contract
interface ITestERC20 {
    function transferOwnership(address addr) external;

    function owner() external view returns (address);
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

    //emit an event when the transaction is completed
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

        sellerSendContract(mySellerInfo);
    }

    /// @dev seller transfer ownership to the escrow
    function sellerSendContract(EscrowContracts memory mySellerInfo) internal {
        // Transfer done externally

        // check if contract is the new owner if not revert
        address erc20Owner = ITestERC20(mySellerInfo.contractBeingSold).owner();
        require(
            erc20Owner == address(this),
            "Owner of contract is not escrow account"
        );

        escrowDetails[mySellerInfo.contractBeingSold] = mySellerInfo;
        emit SellerReady(mySellerInfo);
    }

    /// @dev checks if an asset is owned by the escrow contract
    /// usage: for when the ownership of an Ownable contract is transferred by the seller to the escrow contract
    function checkOwnershipofOwnable(address contractToTransfer)
        internal
        view
        returns (bool)
    {
        require(
            ITestERC20(contractToTransfer).owner() == address(this),
            "this contract has not yet been transferred to the escrow contract"
        );
        return (ITestERC20(contractToTransfer).owner() == address(this));
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
    function buyerSendPay(address contractBeingBought, uint256 pricePaid)
        external
        payable
    {
        uint256 amount = pricePaid;
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
        (bool sent, ) = seller.sellerAddress.call{value: seller.sellPrice}("");
        require(sent, "Payment Failed to seller address");

        // use interface to transferownership to buyer
        ITestERC20(seller.contractBeingSold).transferOwnership(
            buyer.buyerAddress
        );

        // emit an event when transaction completed
        emit TransactionCompleted(buyer, seller);

        // delete stored contract transaction details
        delete escrowDetails[seller.contractBeingSold];
    }
}
