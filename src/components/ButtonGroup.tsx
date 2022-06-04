export const ButtonGroup = ({
  user,
  setUserInfo
}: {
  user: string;
  setUserInfo: (str: string) => void;
}) => {
  return (
    <div className="button-container">
      <button
        onClick={() => setUserInfo("Buyer")}
        className={`${user === "Buyer" ? "button-active" : ""}`}
      >
        Buy Contract
      </button>
      <button
        onClick={() => setUserInfo("Seller")}
        className={`${user === "Seller" ? "button-active" : ""}`}
      >
        Sell Contract
      </button>
      <button
        onClick={() => setUserInfo("Delist")}
        className={`${user === "Delist" ? "button-active" : ""}`}
      >
        Delist
      </button>
    </div>
  );
};
