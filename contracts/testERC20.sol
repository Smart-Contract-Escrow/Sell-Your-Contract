//SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FakeERC20 is ERC20 {
    address _owner;

    constructor(uint256 _supply) ERC20("FakeERC20", "FKERC20") {
        _mint(msg.sender, _supply * (10**decimals()));
        _owner = msg.sender;
    }

    function transferOwnership(address newOwner) public {
        require(msg.sender == _owner, "Must be owner to transer");
        _owner = newOwner;
    }

    function owner() public view returns (address) {
        return _owner;
    }
}
