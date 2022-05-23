import "./App.css";
import { BigNumber, ethers } from "ethers";
import React, { useState } from "react";
import contractAbi from "./utils/Escrow.json";
import { ExternalProvider } from "@ethersproject/providers";

const CONTRACT_ADDRESS = "0x348484FBdC29e4Dc963279d5aAbD74F3F4b57828";

declare global {
  interface Window {
    ethereum: ExternalProvider;
  }
}

function App() {
  const [currentAccount, setCurrentAccount] = useState("");

  function submit(e: React.SyntheticEvent) {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      contractBeingSold: { value: string };
      sellPrice: { value: string };
      buyerAddress: { value: string };
    };
    console.log("target", target.contractBeingSold.value);
    const contractBeingSold = target.contractBeingSold.value;
    const buyerAddress = target.buyerAddress.value;
    const sellPrice = BigNumber.from(target.buyerAddress.value);

    // alert(target.contractBeingSold.value);
    setSellersInfo(contractBeingSold, buyerAddress, sellPrice);
  }

  async function setSellersInfo(
    contractBeingSold: string,
    buyerAddress: string,
    sellPrice: BigNumber
  ) {
    try {
      // TODO: SET LOADING HERE
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          contractAbi.abi,
          signer
        );

        let tx = await contract.setSellersInfo(
          contractBeingSold,
          sellPrice,
          buyerAddress
        );
        // wait for transaction to go through
        const receipt = await tx.wait();
        if (receipt.status === 1) {
          alert("Transaction successful!");
        } else {
          alert("Transaction failed! Please try again");
        }
      }
    } catch (error) {
      console.log("error: ", error);
    }
  }

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
    }
  };

  // Render methods
  const renderNotConnectedContainer = () => (
    <div
      className="connect-wallet-container"
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <h3>Escrow App Services</h3>

      {/* Call the connectWallet function we just wrote when the button is clicked */}
      <button onClick={connectWallet}>Connect Wallet</button>
    </div>
  );

  const renderConnectedContainer = () => (
    <div className="App">
      <h3>Sell Your Contract</h3>
      <form onSubmit={submit}>
        <div>
          <label>Contract Being Sold:</label>
          <input required type="text" name="contractBeingSold" />
          <label>Sell Price:</label>
          <input required type="number" name="sellPrice" />
          <label>Buyer Address:</label>
          <input required type="text" name="buyerAddress" />
        </div>
        <button>Submit</button>
      </form>
    </div>
  );

  return (
    <>
      {!currentAccount && renderNotConnectedContainer()}
      {/* Render the input form if an account is connected */}
      {currentAccount && renderConnectedContainer()}
    </>
  );
}

export default App;
