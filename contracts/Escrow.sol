// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// Uncomment while developing code for testing.
// import "hardhat/console.sol";

// OpenZeppelin contracts to import
// import "@openzeppelin/contracts/access/Ownable.sol";
// import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SetToken} from "@setprotocol/set-protocol-v2/contracts/interfaces/ISetToken.sol";

// Details: https://github.com/SetProtocol/set-protocol-v2
// Usage: https://github.com/zeriontech/defi-sdk/blob/interactive/contracts/adapters/tokenSets/TokenSetsTokenAdapter.sol

// Open Questions and Tasks:
// 1. How to create TokenSet from address within Solidity using interfaces?
// 2. How to check buyer has sufficient ETH to make the purchase?
// 3. Emit events for front-end
// 4. Gas Optimization
// 5. Security

contract Escrow {
    struct EscrowContract {
        address buyerAddress;
        address desiredContract;
        uint price;
    }

    mapping(address => EscrowContract) escrowContracts;

    constructor() {}

    receive() external payable {}

    function create(
        address _sellerAddress,
        address _buyerAddress,
        address _desiredContract,
        uint _askPrice
    ) external {
        require(msg.sender == _sellerAddress, "Sender is not the seller.");
        require(_bidPrice > 0, "Price is less than or equal to zero ETH.");
        // check that smart contract is ownable or is TokenSet
        EscrowContract memory newEscrow = EscrowContract(
            _buyerAddress,
            _desiredContract,
            _askPrice
        );
        escrowContracts[_sellerAddress] = newEscrow;

        // emit
        sendSellerContract(_sellerAddress, _desiredContract);
    }

    function sendSellerContract(
        address _sellerAddress,
        address _desiredContract
    ) internal {
        SetToken TokenSet = SetToken(_desiredContract);
        require(
            msg.sender == Tokenset.manager(),
            "Seller does not own contract."
        );
        (bool sent, ) = Tokenset.setManager(address(this));

        // Emit
    }

    function sendBuyerPayment(
        address _sellerAddress,
        address _buyerAddress,
        address _desiredContract,
        uint _bidPrice
    ) public payable {
        require(
            escrowContracts[_sellerAddress].buyerAddress != address(0),
            "Contract is not for sale."
        );
        require(msg.sender == _buyerAddress, "Sender is not the buyer.");

        require(
            _buyerAddress == escrowContracts[_sellerAddress].buyerAddress,
            "Buyer is not authorized by seller to purchase contract."
        );
        require(
            _bidPrice == escrowContracts[_sellerAddress].price,
            "Bid price is too low."
        );
        // buyer details must match seller details
        // buyer must have sufficient ETH to settle transaction
        (bool sent, ) = address(this).call{value: _bidPrice}("");
        settle(_sellerAddress);
    }

    function settle(address _sellerAddress) public payable {
        // transfer ETH from escrow contract to seller
        // set manager of TokenSet from escrow to buyer
        delete escrowContracts[_sellerAddress];

        // emit
    }

    function cancel(address _sellerAddress) public {
        require(
            escrowContracts[_sellerAddress].buyerAddress != address(0),
            "Contract does not exist."
        );
        require(
            msg.sender == _sellerAddress,
            "Only seller can cancel the escrow before settlement."
        );

        // only if escrow not settled (or must exist)

        // return contract to seller
        SetToken Tokenset = SetToken(
            escrowContracts[_sellerAddress].desiredContract
        );
        (bool sent, ) = Tokenset.setManager(_sellerAddress);

        // deletes escrow contract
        delete escrowContracts[_sellerAddress];
    }
}
