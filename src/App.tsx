import "./App.css";
import { useEffect, useState } from "react";
import { ExternalProvider } from "@ethersproject/providers";
import { getCurrentAccount } from "./utils/WebCommon";

import { ConnectWalletContainer } from "./components/ConnectWalletContainer";
import { ButtonGroup } from "./components/ButtonGroup";
import { CardSelector } from "./components/CardSelector";

import { UserForm } from "./components/UserForm";
import { useLoading } from "./contexts/contexts";
declare global {
  interface Window {
    ethereum: ExternalProvider;
  }
}

function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [loading] = useLoading();
  const [user, setUser] = useState("Seller");

  useEffect(() => {
    const accountSet = async () => {
      setCurrentAccount(await getCurrentAccount());
    };
    accountSet();
  }, []);

  // Render methods

  const renderConnectedContainer = () => (
    <div className="App">
      <CardSelector user={user} />
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
