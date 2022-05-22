//SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SellYourContract is Ownable {
    address payable public ownerOfContract;

    struct SellersInfo {
        address contractBeingSold;
        address sellerAddress;
        uint256 sellPrice;
        address buyersAddress;
        bool sentContract;
    }

    struct BuyersInfo {
        address contractBeingBought;
        address buyerAddress;
        uint256 sellPrice;
        bool didPayAmount;
    }

    mapping(address => BuyersInfo) public buyers;
    mapping(address => SellersInfo) public sellers;
    mapping(address => address) public buyers2sellers;

    event SellerReady(SellersInfo seller);
    event BuyerReady(BuyersInfo buyer);
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
            amount,
            false
        );

        buyers[msg.sender] = myBuyersInfo;

        if (buyers2sellers[msg.sender] == address(0)) {
            // link buyer2seller
            buyers2sellers[msg.sender] = myBuyersInfo.contractBeingBought;
        }
        buyerSendPay(myBuyersInfo);
    }

    function buyerSendPay(BuyersInfo memory myBuyersInfo) public payable {
        // BuyersInfo memory myBuyerInfo = buyers[msg.sender]; // Buyers Information
        address mySellerLinkedAddress = buyers2sellers[msg.sender]; // Sellers Linked Address
        SellersInfo memory mySellerInfo = sellers[mySellerLinkedAddress]; // Sellers Info

        require(myBuyersInfo.buyerAddress != address(0), "Buyer Not Found");
        require(
            mySellerLinkedAddress != address(0),
            "Buyer not linked to seller"
        );
        if (mySellerInfo.sellPrice != 0) {
            require(
                mySellerInfo.sellPrice == msg.value,
                "Amount sent doesn't match"
            );
        }

        myBuyersInfo.didPayAmount = true;
        buyers[msg.sender] = myBuyersInfo;

        emit BuyerReady(myBuyersInfo);

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
            buyerAddress,
            false
        ); // Buyers Information
        sellers[msg.sender] = mySellerInfo;

        if (buyers2sellers[mySellerInfo.buyersAddress] != address(0)) {
            // does buyer information already exist?
            // if so update buyers2sellers mapping
            buyers2sellers[mySellerInfo.buyersAddress] = msg.sender;
        }

        sellerSendContract(mySellerInfo);
    }

    function sellerSendContract(SellersInfo memory mySellerInfo) internal {
        // SellersInfo memory mySellerInfo = sellers[msg.sender]; // Sellers Information
        address sellersLinkAddress = buyers2sellers[mySellerInfo.buyersAddress]; // Buyers Linked Address
        BuyersInfo memory myBuyerInfo = buyers[mySellerInfo.buyersAddress];

        require(sellersLinkAddress != address(0), "Seller not linked to buyer");
        require(
            myBuyerInfo.contractBeingBought == mySellerInfo.contractBeingSold,
            "Contract address does not match what was sent"
        );
        // call other contract and change manager ERC20

        mySellerInfo.sentContract = true;
        sellers[msg.sender] = mySellerInfo;
        emit SellerReady(mySellerInfo);
        goodToGo(mySellerInfo, myBuyerInfo);
    }

    function goodToGo(SellersInfo memory seller, BuyersInfo memory buyer)
        internal
    {
        if (seller.sentContract && buyer.didPayAmount) {
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
            emit TransactionCompleted(buyer, seller);
        } else {
            return;
        }
    }

    function getBalance() public view onlyOwner returns (uint256) {
        return address(this).balance;
    }

    function withdraw() public payable onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = (msg.sender).call{value: balance}(
            "transfered financier"
        );
        require(success, "Failed to withdraw money from contract.");
    }
}
