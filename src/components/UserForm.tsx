import { useState } from "react";
import { Loading } from "./Loading";
import { DelistForm } from "./forms/DelistForm";
import { BuyForm } from "./forms/BuyForm";
import { SellForm } from "./forms/SellForm";
import { useLoading } from "../contexts/contexts";

export const UserForm = ({ user }: { user: string }) => {
  const [loading] = useLoading();
  const [contractPurchasePrice, setContractPurchasePrice] = useState("");

  function setContractPurchase(price: string) {
    setContractPurchasePrice(price);
  }

  return (
    <div className="tabs ">
      <div
        className={`nes-container with-title  ${loading ? "is-blurred" : ""}`}
      >
        <h1 className="title">Enter Your Information Below</h1>
        {user === "Seller" ? (
          <SellForm setContractPurchasePrice={setContractPurchase} />
        ) : user === "Delist" ? (
          <DelistForm />
        ) : (
          <BuyForm
            contractPurchasePrice={contractPurchasePrice}
            setContractPurchasePrice={setContractPurchasePrice}
          />
        )}
      </div>
      {loading && <Loading />}
    </div>
  );
};
