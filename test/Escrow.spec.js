const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Escrow", function () {
  let escrowContract;
  let testERC20Contract;

  let buyerAccount;
  let sellerAccount;
  let owner;
  const sellAmount = "2000000000000000000";

  beforeEach(async () => {
    // signers
    const accounts = await ethers.getSigners();

    sellerAccount = accounts[0];
    buyerAccount = accounts[1];

    const testERC20Factory = await ethers.getContractFactory("TestERC20");
    testERC20Contract = await testERC20Factory.deploy(10000000);
    await testERC20Contract.deployed();

    const escrowFactory = await ethers.getContractFactory("Escrow");
    escrowContract = await escrowFactory.deploy();
    await escrowContract.deployed();
    owner = escrowContract.address;

  });

  it("should create seller info", async function () {
    // connect as seller

    const seller = escrowContract.connect(sellerAccount);

    await seller.setContractDetail(
      testERC20Contract.address,
      sellAmount,
      buyerAccount.address
    );

    const { contractBeingSold, buyersAddress } = await seller.escrowDetails(
      testERC20Contract.address
    );

    expect(contractBeingSold).to.equal(testERC20Contract.address);
    expect(buyersAddress).to.equal(buyerAccount.address);
  });

  it("should fail if buyer doesnt send amount", async function () {
    await expect(
      escrowContract
        .connect(buyerAccount)
        .buyerSendPay(testERC20Contract.address, sellAmount)
    ).to.be.revertedWith("Buyer did not send any amount");
  });

	// describe("setContractDetails", function () {

	// 	it("should revert when contract is not owned by escrow", async function () {
	// 		await expect(
	// 			escrowContract
  //         .connect(sellerAccount)
  //         .setContractDetails()
	// 		).to.be.revertedWith("Seller has not transferred the ownership to the escrow.");
	// 	});

	// 	it("should emit SellerReady event when escrow contract details are created", async function () {
	// 		await expect(
  //       escrowContract
  //         .connect(sellerAccount)
  //         .setContractDetails()) 
	// 			  .to.emit(escrow, "SellerReady")
	// 			.withArgs(); 
	// 	});
	// });

});



