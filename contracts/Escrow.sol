// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// Uncomment while developing code for testing.
import "hardhat/console.sol";

// OpenZeppelin functions to import
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
// import "@openzeppelin/contracts/utils/Strings.sol";
// import "@openzeppelin/contracts/utils/Base64.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
// import "hardhat/console.sol";

contract Escrow {

    mapping(address => uint) public sellerAsk;
    mapping(address => uint) public buyerBid;    
    address public buyer;
    address public seller;

    constructor {

    }

    event Settled();

    function goodToSettle() {

    }

    event Cancelled();

    function cancelTransfer() {

    }

    event Status();

    function currentStatus() view {

    }

}

