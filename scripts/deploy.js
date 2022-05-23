async function main() {
  const EscrowFactory = await ethers.getContractFactory("Escrow");
  escrow = await EscrowFactory.deploy();
  await escrow.deployed();

  console.log("escrow deployed too", escrow.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
