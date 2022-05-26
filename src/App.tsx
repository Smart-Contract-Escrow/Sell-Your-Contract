import "./App.css";
import { BigNumber, ethers } from "ethers";
import React, { useState } from "react";
import contractAbi from "./utils/Escrow.json";
import fakeERC20Contract from "./utils/FakeERC20.json";
import { ExternalProvider } from "@ethersproject/providers";
import address from "./addresses.json";

const { escrow: CONTRACT_ADDRESS, erc20: ERC20_CONTRACT_ADDRESS } = address;

declare global {
  interface Window {
    ethereum: ExternalProvider;
  }
}

function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.SyntheticEvent) {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      contractBeingSold: { value: string };
      sellPrice: { value: string };
      buyerAddress: { value: string };
      reset: () => null;
    };
    const contractBeingSold = target.contractBeingSold.value;
    const buyerAddress = target.buyerAddress.value;
    const sellPrice = BigNumber.from(target.buyerAddress.value);

    // First transfer contract ownership to contract
    if (await transferContractOwnership(contractBeingSold)) {
      setContractDetail(contractBeingSold, buyerAddress, sellPrice, target);
    } else {
      alert("transfer of ownership failed");
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
          ERC20_CONTRACT_ADDRESS,
          fakeERC20Contract.abi,
          signer
        );
        let owner = await contract.getOwner();
        console.log("owner of contract", owner);
        if (owner !== (await signer.getAddress())) {
          alert("Error! Cannot send contract if you are not owner!");
        }
        console.log("signer.getAddress()", await signer.getAddress());

        // transfer owner
        let tx = await contract.transferOwner(CONTRACT_ADDRESS);
        const receipt = await tx.wait();
        if (receipt.status === 1) {
          console.log("new owner", await contract.getOwner());
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
        console.log("go ther");

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
      <div className="nes-container with-title">
        <h1 className="title">Enter Your Information Below</h1>
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
      {loading && (
        <h1 style={{ color: "red", marginTop: "2rem" }}>
          Please Wait Sending Transaction...
        </h1>
      )}
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
