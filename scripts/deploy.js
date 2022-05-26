const { ethers } = require("hardhat");
const fs = require("fs").promises;

async function main() {
  const EscrowFactory = await ethers.getContractFactory("Escrow");
  escrow = await EscrowFactory.deploy();
  await escrow.deployed();

  const ERC20EscrowFactory = await ethers.getContractFactory("FakeERC20");
  escrowERC20 = await ERC20EscrowFactory.deploy(10);
  await escrowERC20.deployed();

  console.log("escrow deployed too", escrow.address);
  console.log("ERC20 escrow deployed too", escrowERC20.address);

  await writeToFile(escrow.address, escrowERC20.address);
}

async function writeToFile(escrow, erc20) {
  const escrowInfo = {
    escrow,
    erc20
  };

  const data = JSON.stringify(escrowInfo);

  // write JSON string to a file
  await fs.writeFile("src/addresses.json", data);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
