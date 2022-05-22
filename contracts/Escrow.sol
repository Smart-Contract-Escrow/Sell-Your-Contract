//SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SellYourContract is Ownable {
    address payable public ownerOfContract;

    struct SellersInfo {
        address contractBeingSold;
        address sellerAddress;
        uint256 sellPrice;
        address buyersAddress;
    }

    struct BuyersInfo {
        address contractBeingBought;
        address buyerAddress;
        uint256 sellPrice;
    }

    mapping(address => SellersInfo) public sellers;

    event SellerReady(SellersInfo seller);
    event TransactionCompleted(BuyersInfo buyer, SellersInfo seller);

    constructor() {
        ownerOfContract = payable(msg.sender);
    }

    function setBuyersInfo(address contractBeingBought) external payable {
        uint256 amount = msg.value; //amount sent
        address buyerAddress = msg.sender; //buyer address

        require(amount != 0, "Buyer did not send any amount");

        BuyersInfo memory myBuyersInfo = BuyersInfo(
            contractBeingBought,
            buyerAddress,
            amount
        );

        // verify sellers information matches buyers information, seller must go first
        require(
            sellers[contractBeingBought].buyersAddress == msg.sender,
            "Seller address did not match buyer"
        );

        buyerSendPay(myBuyersInfo);
    }

    function buyerSendPay(BuyersInfo memory myBuyersInfo) public payable {
        SellersInfo memory mySellerInfo = sellers[
            myBuyersInfo.contractBeingBought
        ]; // Sellers Info

        goodToGo(mySellerInfo, myBuyersInfo);
    }

    function setSellersInfo(
        address contractBeingSold,
        uint256 sellPrice,
        address buyerAddress
    ) external {
        address sellerAddress = msg.sender;

        SellersInfo memory mySellerInfo = SellersInfo(
            contractBeingSold,
            sellerAddress,
            sellPrice,
            buyerAddress
        ); // Buyers Information

        sellerSendContract(mySellerInfo);
    }

    function sellerSendContract(SellersInfo memory mySellerInfo) internal {
        // TODO:
        // call other contract and change manager ERC20
        // revert if error

        sellers[mySellerInfo.contractBeingSold] = mySellerInfo;
        emit SellerReady(mySellerInfo);
    }

    function goodToGo(SellersInfo memory seller, BuyersInfo memory buyer)
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
        // good to go send values
        // transfer
        payable(seller.sellerAddress).transfer(buyer.sellPrice);

        // TODO:
        // transfer ERC 20 contract ownership to buyer

        emit TransactionCompleted(buyer, seller);
        delete sellers[seller.contractBeingSold];
    }

    function getBalance() public view onlyOwner returns (uint256) {
        return address(this).balance;
    }

    function getSellerAmount(address myContract) public view returns (uint256) {
        SellersInfo memory seller = sellers[myContract];
        require(
            seller.buyersAddress == msg.sender,
            "Only buyer can see amount"
        );
        return seller.sellPrice;
    }

    function withdraw() public payable onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = (msg.sender).call{value: balance}(
            "transfered financier"
        );
        require(success, "Failed to withdraw money from contract.");
    }
}
