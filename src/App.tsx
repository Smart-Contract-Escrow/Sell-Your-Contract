import "./App.css";
import { BigNumber, ethers } from "ethers";
import React, { useEffect, useState } from "react";
import contractAbi from "./utils/Escrow.json";
import TestERC20Contract from "./utils/ITestERC20.json";
import { ExternalProvider } from "@ethersproject/providers";
import address from "./addresses.json";
import { CheckMark } from "./components/CheckMark";
import { getCurrentAccount } from "./utils/WebCommon";

import { ConnectWalletContainer } from "./components/ConnectWalletContainer";
import { ButtonGroup } from "./components/ButtonGroup";
import { UserForm } from "./components/UserForm";

import nft1 from "./nft1.webp";
import nft2 from "./nft2.png";

const { escrow: CONTRACT_ADDRESS = "" } = address;

declare global {
  interface Window {
    ethereum: ExternalProvider;
  }
}

function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState("Seller");
  const [transContract, setTransContract] = useState(false);
  const [readyForBuyer, setReadyForBuyer] = useState(false);
  const [paymentSent, setPaymentSent] = useState(false);
  const [contractPurchasePrice, setContractPurchasePrice] = useState("");

  useEffect(() => {
    const accountSet = async () => {
      setCurrentAccount(await getCurrentAccount());
    };
    accountSet();
  }, []);

  async function submit(e: React.SyntheticEvent) {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      contractBeingSold: { value: string };
      sellPrice: { value: string };
      buyerAddress: { value: string };
      reset: () => null;
    };

    if (user === "Seller") {
      console.log("target", target.contractBeingSold.value);
      const contractBeingSold = target.contractBeingSold.value;
      const buyerAddress = target.buyerAddress.value;
      const sellPrice = ethers.utils.parseEther(target.sellPrice.value);
      setContractPurchasePrice(target.sellPrice.value);

      // First transfer contract ownership to contract
      if (await transferContractOwnership(contractBeingSold)) {
        setTransContract(true);
        setContractDetail(contractBeingSold, buyerAddress, sellPrice, target);
      } else {
        setTransContract(false);
        alert("transfer of ownership failed");
      }
    } else if (user === "Delist") {
      console.log("target", target.contractBeingSold.value);
      const contractBeingSold = target.contractBeingSold.value;
      delist(contractBeingSold, target);
    } else {
      const contractBeingSold = target.contractBeingSold.value;
      const sellPrice = ethers.utils.parseEther(target.sellPrice.value);
      sendEth(sellPrice, contractBeingSold, target);
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
          setReadyForBuyer(true);
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
  async function delist(contractBeingSold: string, target: any) {
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

        let tx = await contract.delist(contractBeingSold);

        // Listen for event
        contract.on("ContractDelisted", (from, message, timestamp) => {
          console.log("got event", message, from, timestamp);

          setTransContract(false);
          setReadyForBuyer(false);
          setPaymentSent(false);
          alert(
            "Received info: delisted contract " +
              from.contractBeingSold +
              " and returned to seller."
          );
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
      alert("Delist failed!");
      console.log("error: ", error);
    } finally {
      setLoading(false);
    }
  }

  async function sendEth(
    purchasePrice: BigNumber,
    contractBeingPurchased: string,
    target: { reset: () => null }
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

        let tx = await contract.buyerSendPay(contractBeingPurchased, {
          value: purchasePrice
        });

        // Listen for event
        contract.on("TransactionCompleted", (from, message, timestamp) => {
          console.log("got event", message, from, timestamp);
          setPaymentSent(true);
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
      target.reset();
    }
  }

  // Render methods

  const renderConnectedContainer = () => (
    <div className="App">
      <div className="group-card">
        <div
          className={`card card-buyer ${
            user === "Buyer" ? "card-scale" : "card-gray"
          } `}
        >
          <div>
            <img style={{ width: "125px" }} src={nft1} alt="image2" />
            <div>Buyer</div>
          </div>
          <div className="card-text">
            <div className="card-text__check">
              <CheckMark fill={readyForBuyer ? "green" : "darkgray"} />
              <span style={{ color: readyForBuyer ? "green" : "darkgray" }}>
                Ready To Send Payment
              </span>
            </div>
            <div className="card-text__check">
              <CheckMark fill={paymentSent ? "green" : "darkgray"} />
              <span style={{ color: paymentSent ? "green" : "darkgray" }}>
                Payment Sent
              </span>
            </div>
            <div className="card-text__check">
              <CheckMark fill={paymentSent ? "green" : "darkgray"} />
              <span style={{ color: paymentSent ? "green" : "darkgray" }}>
                Contract Received
              </span>
            </div>
          </div>
        </div>
        <div
          className={`card card-seller ${
            user === "Seller" || user === "Delist" ? "card-scale" : "card-gray"
          } `}
        >
          <div>
            <img style={{ width: "125px" }} src={nft2} alt="image1" />
            <div>Seller</div>
          </div>
          <div className="card-text">
            <div className="card-text__check">
              <CheckMark fill={transContract ? "green" : "darkgray"} />
              <span style={{ color: transContract ? "green" : "darkgray" }}>
                Transfered Contract To Escrow
              </span>
            </div>
            <div className="card-text__check">
              <CheckMark fill={readyForBuyer ? "green" : "darkgray"} />
              <span style={{ color: readyForBuyer ? "green" : "darkgray" }}>
                Ready For Buyer
              </span>
            </div>
            <div className="card-text__check">
              <CheckMark fill={paymentSent ? "green" : "darkgray"} />
              <span style={{ color: paymentSent ? "green" : "darkgray" }}>
                Received Payment
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className={`button-group ${loading ? "is-blurred" : ""}`}>
        <ButtonGroup user={user} setUserInfo={setUserInfo} />
      </div>
      <div>
        {user && (
          <UserForm
            loading={loading}
            submit={submit}
            user={user}
            contractPurchasePrice={contractPurchasePrice}
            setContractPurchasePrice={setContractPurchase}
          />
        )}
      </div>
    </div>
  );

  function setUserInfo(user: string) {
    setUser(user);
  }

  function setContractPurchase(price: string) {
    setContractPurchasePrice(price);
  }

  return (
    <div className="app-container">
      {!currentAccount && <ConnectWalletContainer />}
      {/* Render the input form if an account is connected */}
      {currentAccount && renderConnectedContainer()}
    </div>
  );
}

export default App;
