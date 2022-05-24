const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Escrow", function () {
  let escrowContract;
  let fakeERC20Contract;

  let buyerAccount;
  let sellerAccount;
  let owner;
  const sellAmount = "2000000000000000000";

  beforeEach(async () => {
    // signers
    const accounts = await ethers.getSigners();

    sellerAccount = accounts[0];
    buyerAccount = accounts[1];

    const fakeERC20Factory = await ethers.getContractFactory("FakeERC20");
    fakeERC20Contract = await fakeERC20Factory.deploy(10);
    await fakeERC20Contract.deployed();

    const escrowFactory = await ethers.getContractFactory("Escrow");
    escrowContract = await escrowFactory.deploy();
    await escrowContract.deployed();
    owner = escrowContract.address;
  });

  it("should create seller info", async function () {
    // connect as seller

    const seller = escrowContract.connect(sellerAccount);

    await seller.setContractDetail(
      fakeERC20Contract.address,
      sellAmount,
      buyerAccount.address
    );

    const { contractBeingSold, buyersAddress } = await seller.escrowDetails(
      fakeERC20Contract.address
    );

    expect(contractBeingSold).to.equal(fakeERC20Contract.address);
    expect(buyersAddress).to.equal(buyerAccount.address);
  });

  it("should fail if buyer doesnt send amount", async function () {
    await expect(
      escrowContract
        .connect(buyerAccount)
        .setBuyersInfo(fakeERC20Contract.address)
    ).to.be.revertedWith("Buyer did not send any amount");
  });
});
