import "./App.css";
import { useEffect, useState } from "react";
import { ExternalProvider } from "@ethersproject/providers";
import { CheckMark } from "./components/CheckMark";
import { getCurrentAccount } from "./utils/WebCommon";

import { ConnectWalletContainer } from "./components/ConnectWalletContainer";
import { ButtonGroup } from "./components/ButtonGroup";
import { UserForm } from "./components/UserForm";
import { useLoading, useEvents } from "./contexts/contexts";

import nft1 from "./nft1.webp";
import nft2 from "./nft2.png";

declare global {
  interface Window {
    ethereum: ExternalProvider;
  }
}

function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [loading] = useLoading();
  const [user, setUser] = useState("Seller");
  const [checks] = useEvents();
  const { transContract, readyForBuyer, paymentSent } = checks;

  useEffect(() => {
    const accountSet = async () => {
      setCurrentAccount(await getCurrentAccount());
    };
    accountSet();
  }, []);

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
      <div>{user && <UserForm user={user} />}</div>
    </div>
  );

  function setUserInfo(user: string) {
    setUser(user);
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
