// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Escrow {
    address public buyer;
    address public seller;
    address public contractSold;
    address public contractBid;

    mapping(address => uint) contractHeldToPriceAsked;
    mapping(address => uint) contractWantedToPriceSent;

    event BuyerReady(address buyerAddr, uint ethSent);
    event sellerReady(address sellerAddr, address contractTransferred);
    event transactionComplete(
        address sellerAddr,
        address buyerAddr,
        address contractTransferred
    );

    function contractReceived() private returns (bool) {
        // check if contract has been transferred
    }

    function currBalance() public returns (uint256) {
        return address(this).balance;
    }

    function transferContract() private {
        //move contract
    }

    function transferEth(address _receiver) payable {
        _receiver.call.value(msg.value).gas(20317)();
    }

    function goodToSettle() public {
        require(
            contractSold == contractBid,
            "Contract requested and sent do not match"
        );
        require(
            contractHeldToPriceAsked[contractSold] ==
                contractWantedToPriceSent[contractBid],
            "Price bid, doesn't match"
        );

        if (contractReceived() && currBalance() == 0) {
            emit sellerReady(seller, contractHeldToPriceAsked[contractSold]);
        } else if (currBalance() > 0 && !contractReceived()) {
            emit BuyerReady(buyer, contractWantedToPriceSent[contractBid]);
        } else if (
            contractWantedToPriceSent[contractBid] ==
            contractHeldToPriceAsked[contractSold] &&
            contractReceived() &&
            currBalance() >= contractWantedToPriceSent[contractBid]
        ) {
            transferContract();
            transferEth(seller);
            emit transactionComplete(seller, buyer, contractSold);
        }
    }
}
