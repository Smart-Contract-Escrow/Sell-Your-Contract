//SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

/// @dev use interface to interact with a deployed and ownable contract
interface ITestERC20 {
    function transferOwnership(address addr) external;

    function owner() external view returns (address);
}

/// @title Sell Your Contract Escrow Protocol

contract Escrow {
    enum Status {
        sold,
        pending
    }
    // create a struct  to hold escrow information
    struct EscrowItem {
        address contractItem;
        address seller;
        address buyer;
        uint256 price;
        Status status;
    }

    // creat a mapping to keep track of EscrowItem struct
    mapping(address => EscrowItem) public escrowDetails;

    // emit an event when seller is ready
    event SellerReady(EscrowItem seller);

    // emit an event when the transaction is completed
    event TransactionCompleted(EscrowItem EscrowItem);

    // emit an event if a contract is delisted
    // TODO: if we add notify buyer feature, send buyer address here as well?
    event ContractDelisted(EscrowItem canceledSeller);

    /// @dev seller sends contract transaction details
    function setContractDetail(
        address contractBeingSold,
        uint256 sellPrice,
        address buyerAddress
    ) external {
        // check if contract is owned by escrow
        require(
            ITestERC20(contractBeingSold).owner() == address(this),
            "Seller has not transferred the ownership to the escrow"
        );

        EscrowItem memory mySellerInfo = EscrowItem(
            contractBeingSold,
            msg.sender,
            buyerAddress,
            sellPrice,
            Status.pending
        );

        // fill in escrow details
        escrowDetails[contractBeingSold] = mySellerInfo;

        // emit seller is ready
        emit SellerReady(mySellerInfo);
    }

    /// @dev buyer sends payment to the seller after seller provides contract transaction details and transferred ownership
    function buyerSendPay(address contractBeingBought) external payable {
        // require buyer sends payment
        require(msg.value != 0, "Buyer did not send any payment");

        // check if the contract ownership has transferred to the escrow contract
        require(
            ITestERC20(contractBeingBought).owner() == address(this),
            "Seller has not transferred ownership to the escrow"
        );

        // check if the intended buyer address correct
        require(
            escrowDetails[contractBeingBought].buyer == msg.sender,
            "Buyer address did not match seller"
        );

        EscrowItem memory contractInfo = escrowDetails[contractBeingBought];

        // call goodToGo function after buyer sends payment
        goodToGo(contractInfo);
    }

    /// @dev buyer sends payment to seller, escrow transfers the ownership to buyer
    function goodToGo(EscrowItem memory escrowContract) internal {
        require(
            escrowContract.price == msg.value,
            "Buyer did not send correct payment amount"
        );

        // buyer sends payment to seller
        (bool sent, ) = escrowContract.seller.call{value: escrowContract.price}(
            ""
        );
        require(sent, "Payment failed to send to seller address");

        // use interface to transferownership to buyer
        ITestERC20(escrowContract.contractItem).transferOwnership(
            escrowContract.buyer
        );

        // emit an event when transaction is completed
        emit TransactionCompleted(escrowContract);

        escrowContract.status = Status.sold;
    }

    /// @dev only buyer can check the listed price of the contract
    function getSellerAmount(address myContract) public view returns (uint256) {
        EscrowItem memory seller = escrowDetails[myContract];

        require(seller.buyer == msg.sender, "Only buyer can see the price");

        return seller.price;
    }

    /// @dev cancel/delist flow, should only be able to be called by the seller
    function delist(address contractToDelist) external {
        EscrowItem memory contractDetails = escrowDetails[contractToDelist];
        require(contractDetails.seller == msg.sender, "Only seller can delist");
        // transfer ownership back to the seller
        ITestERC20(contractToDelist).transferOwnership(contractDetails.seller);
        delete escrowDetails[contractToDelist];
        emit ContractDelisted(contractDetails);
    }
}
