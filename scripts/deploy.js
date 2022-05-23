async function main() {
    const EscrowFactory = await ethers.getContractFactory("Escrow");
    escrowContract = await EscrowFactory.deploy();
    await escrowContract.deployed();
  
    console.log("Escrow Contract deployed to:", escrowContract.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  