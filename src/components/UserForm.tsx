import { SyntheticEvent } from "react";
import { Loading } from "./Loading";
import address from "../addresses.json";

const { escrow: CONTRACT_ADDRESS = "" } = address;
export const UserForm = ({
  loading,
  submit,
  user,
  contractPurchasePrice,
  setContractPurchasePrice
}: {
  loading: boolean;
  submit: (e: SyntheticEvent<Element, Event>) => Promise<void>;
  user: string;
  contractPurchasePrice: string;
  setContractPurchasePrice: (e: string) => void;
}) => {
  return (
    <div className="tabs ">
      <div
        className={`nes-container with-title  ${loading ? "is-blurred" : ""}`}
      >
        <h1 className="title">Enter Your Information Below</h1>
        <form spellCheck="false" autoComplete="off" onSubmit={submit}>
          {user === "Seller" ? (
            <div>
              <label>Contract To Sell:</label>
              <input required type="text" name="contractBeingSold" />
              <label>Sell Price (eth):</label>
              <input required type="decimal" name="sellPrice" />
              <label>Buyer Address:</label>
              <input required type="text" name="buyerAddress" />
            </div>
          ) : user === "Delist" ? (
            <div>
              <label>Contract To Cancel:</label>
              <input required type="text" name="contractToCancel" />
            </div>
          ) : (
            <div>
              <label>Contract To Purchase:</label>
              <input required type="text" name="contractBeingSold" />
              <label>Buy Price (eth):</label>
              <input
                required
                type="decimal"
                name="sellPrice"
                value={contractPurchasePrice}
                onChange={(e) => setContractPurchasePrice(e.target.value)}
                disabled={+contractPurchasePrice > 0}
              />
              <label>Escrow Address:</label>
              <input
                required
                type="text"
                name="escrowddress"
                value={CONTRACT_ADDRESS ?? ""}
                disabled
              />
            </div>
          )}
          <button>Submit</button>
        </form>
      </div>
      {loading && <Loading />}
    </div>
  );
};
