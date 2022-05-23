const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Escrow", function () {
	let escrow;
	let buyer;
	let seller;
	let thirdParty;
	let buyerContractAddress;
	let sellerContractAddress;

	beforeEach("deploy contract", async () => {
		const accounts = await ethers.getSigners();

		buyer = accounts[0];
		seller = accounts[1];
		thirdParty = accounts[2];
		buyerContractAddress = accounts[3].address;
		sellerContractAddress = accounts[4].address;
		randomAddress = accounts[5].address;

		const Escrow = await ethers.getContractFactory("Escrow");
		escrow = await Escrow.deploy(buyer.address, buyerContractAddress, 300, seller.address, sellerContractAddress, 300);
		escrow2 = 
		await escrow.deployed();
	});

	describe("goodToSettle", function () {

		it("should revert when buyer and seller request different contracts", async function () {
			await expect(
				escrow.connect(buyer).goodToSettle()
			).to.be.revertedWith("Buyer and seller contracts do not match.");
		});

		it("should revert when buyer and seller prices are not equal", async function () {
			await expect(
				escrow.connect(buyer).goodToSettle()
			).to.be.revertedWith("Buyer and seller prices do not match.");
		});		

		it("should emit current status when escrow is successfully executed", async function () {
			await expect(escrow.connect(buyer).goodToSettle()) 
				.to.emit(escrow, "Status")
				.withArgs(); 
		});
	});

	describe("cancelTransfer", function () {

		it("should revert when caller address is not buyer or seller", async function () {
			await expect(
				escrow.connect(thirdParty).cancelTransfer()
			).to.be.revertedWith("Caller not contract buyer or seller.");
		});
		
		it("should revert when escrow contract is already settled", async function () {
			await escrow.connect(buyer).goodToSettle();
			await expect(
				escrow.connect(buyer).cancelTransfer()
			).to.be.revertedWith("Escrow already settled.");
		});

		it("should emit Cancelled event when escrow is cancelled", async function () {
			await expect(escrow.connect(buyer).cancelTransfer()) 
				.to.emit(escrow, "Cancelled")
				.withArgs(buyer.address); 

			await expect(escrow.connect(seller).cancelTransfer()) 
				.to.emit(escrow, "Cancelled")
				.withArgs(seller.address); 		
		});
	});		

});
