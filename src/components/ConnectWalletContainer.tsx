import { connectWallet } from "../utils/WebCommon";
export function ConnectWalletContainer() {
  return (
    <div
      className="connect-wallet-container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "5vh"
      }}
    >
      <h3>Sell Your Smart Contract</h3>
      <br></br>
      {/* Call the connectWallet function we just wrote when the button is clicked */}
      <button onClick={connectWallet}>Connect Wallet</button>
      <br></br>
      <p>
        <i>Trustless escrow for smart contracts.</i>
      </p>
    </div>
  );
}
