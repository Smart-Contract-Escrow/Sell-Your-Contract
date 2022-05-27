import "./App.css";
import { BigNumber, ethers } from "ethers";
import React, { useState } from "react";
import contractAbi from "./utils/Escrow.json";
import TestERC20Contract from "./utils/ITestERC20.json";
import { ExternalProvider } from "@ethersproject/providers";
import address from "./addresses.json";

import nft1 from "./nft1.webp";
import nft2 from "./nft2.png";

const { escrow: CONTRACT_ADDRESS, erc20: ERC20_CONTRACT_ADDRESS } = address;

declare global {
  interface Window {
    ethereum: ExternalProvider;
  }
}

function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState("");

  async function submit(e: React.SyntheticEvent) {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      contractBeingSold: { value: string };
      sellPrice: { value: string };
      buyerAddress: { value: string };
      reset: () => null;
    };

    if (user === "seller") {
      console.log("target", target.contractBeingSold.value);
      const contractBeingSold = target.contractBeingSold.value;
      const buyerAddress = target.buyerAddress.value;
      const sellPrice = BigNumber.from(target.sellPrice.value);

      // First transfer contract ownership to contract
      if (await transferContractOwnership(contractBeingSold)) {
        setContractDetail(contractBeingSold, buyerAddress, sellPrice, target);
      } else {
        alert("transfer of ownership failed");
      }
    } else {
      const contractBeingSold = target.contractBeingSold.value;
      const sellPrice = BigNumber.from(target.sellPrice.value);
      sendEth(CONTRACT_ADDRESS, sellPrice, contractBeingSold);
    }
  }

  // TODO: Refactor to hook
  async function transferContractOwnership(
    contractBeingSold: string
  ): Promise<boolean> {
    try {
      setLoading(true);
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          contractBeingSold,
          TestERC20Contract.abi,
          signer
        );
        let owner = await contract.owner();
        console.log("owner of contract", owner);
        if (owner !== (await signer.getAddress())) {
          alert("Error! Cannot send contract if you are not owner!");
        }
        console.log("signer.getAddress()", await signer.getAddress());

        // transfer owner
        let tx = await contract.transferOwnership(CONTRACT_ADDRESS);
        const receipt = await tx.wait();
        if (receipt.status === 1) {
          console.log("new owner", await contract.owner());
          return true;
        } else {
          alert("transaction failed! please try again");
          return false;
        }
      }
    } catch (e) {
      console.log("e", e);
      return false;
    } finally {
      setLoading(false);
    }
    return false;
  }

  // TODO: Move to hook
  async function setContractDetail(
    contractBeingSold: string,
    buyerAddress: string,
    sellPrice: BigNumber,
    target: any
  ) {
    try {
      setLoading(true);
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          contractAbi.abi,
          signer
        );

        let tx = await contract.setContractDetail(
          contractBeingSold,
          sellPrice,
          buyerAddress
        );

        // Listen for event
        contract.on("SellerReady", (from, message, timestamp) => {
          console.log("got event", message, from, timestamp);
          alert("Received info: selling contract " + from.contractBeingSold);
        });

        // wait for transaction to go through
        const receipt = await tx.wait();
        if (receipt.status === 1) {
          console.log("worked!");
          target.reset();
        } else {
          alert("transaction failed! please try again");
        }
      }
    } catch (error) {
      console.log("error: ", error);
    } finally {
      setLoading(false);
    }
  }

  // TODO: Move to hook
  const connectWallet = async () => {
    try {
      const { ethereum } = window as any;

      if (!ethereum) {
        alert("Get MetaMask -> https://metamask.io/");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts"
      });

      if (accounts && Array.isArray(accounts)) {
        // Here you can access accounts[0]
        setCurrentAccount(accounts[0]);
        console.log("Connected", accounts[0] as number);
      } else {
        // Handle errors here if accounts is not valid.
        console.log("invalid account!");
        return;
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  async function sendEth(
    escrowAddress: string,
    purchasePrice: BigNumber,
    contractBeingPurchased: string
  ) {
    try {
      console.log("purchase price", purchasePrice);
      setLoading(true);
      const { ethereum } = window as any;
      if (ethereum) {
        await ethereum.send("eth_requestAccounts");
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          contractAbi.abi,
          signer
        );

        let tx = await contract.buyerSendPay(
          contractBeingPurchased,
          purchasePrice,
          {
            value: purchasePrice
          }
        );

        // Listen for event
        contract.on("TransactionCompleted", (from, message, timestamp) => {
          console.log("got event", message, from, timestamp);
          alert("Received info: That transaction is complete");
        });

        // wait for transaction to go through
        const receipt = await tx.wait();
        if (receipt.status === 1) {
          console.log("worked!");
        } else {
          alert("transaction failed! please try again");
        }
      }
    } catch (error) {
      console.log("error: ", error);
    } finally {
      setLoading(false);
    }
  }

  // Render methods
  const renderNotConnectedContainer = () => (
    <div
      className="connect-wallet-container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "5vh"
      }}
    >
      <h3>Sell Your Smart Contract</h3><br></br>
      {/* Call the connectWallet function we just wrote when the button is clicked */}
      <button onClick={connectWallet}>Connect Wallet</button>
      <br></br>
      <p><i>Trustless escrow for smart contracts.</i></p>
    </div>
  );

  const renderButtonGroup = () => {
    return (
      <div className="button-container">
        <button onClick={() => setUser("buyer")}>Buy Contract</button>
        <button onClick={() => setUser("seller")}>Sell Contract</button>
      </div>
    );
  };

  const renderUserForm = () => {
    return (
      <div>
        <h3>{`${user} Contract`}</h3>
        <div className="nes-container with-title">
          <h1 className="title">Enter Your Information Below</h1>
          <form onSubmit={submit}>
            {user === "seller" ? (
              <div>
                <label>Contract Being Sold:</label>
                <input required type="text" name="contractBeingSold" />
                <label>Sell Price:</label>
                <input required type="decimal" name="sellPrice" />
                <label>Buyer Address:</label>
                <input required type="text" name="buyerAddress" />
              </div>
            ) : (
              <div>
                <label>Contract Being Purchased:</label>
                <input required type="text" name="contractBeingSold" />
                <label>Buy Price:</label>
                <input required type="decimal" name="sellPrice" />
                <label>Escrow Address:</label>
                <input
                  required
                  type="text"
                  name="escrowddress"
                  value={CONTRACT_ADDRESS}
                  disabled
                />
              </div>
            )}
            <button>Submit</button>
          </form>
        </div>
        {loading && (
          <h1 style={{ color: "red", marginTop: "2rem" }}>
            Please Wait Sending Transaction...
          </h1>
        )}
      </div>
    );
  };

  const renderConnectedContainer = () => (
    <div className="App">
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: "1px solid grey"
          }}
        >
          <div>
            <img style={{ width: "225px" }} src={nft1} alt="image2" />
            <div>Buyer</div>
          </div>
          <div>Sent Ethereum</div>
        </div>
        <div></div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: "1px solid grey"
          }}
        >
          <div>
            <img style={{ width: "225px" }} src={nft2} alt="image1" />
            <div>Seller</div>
          </div>
          <div>Pending Transfer</div>
        </div>
      </div>
      <div className="button-group">{renderButtonGroup()}</div>
      <div>{user && renderUserForm()}</div>
    </div>
  );

  return (
    <div className="app-container">
      {!currentAccount && renderNotConnectedContainer()}
      {/* Render the input form if an account is connected */}
      {currentAccount && renderConnectedContainer()}
    </div>
  );
}

export default App;
