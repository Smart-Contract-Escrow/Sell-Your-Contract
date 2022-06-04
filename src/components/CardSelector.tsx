import { useEvents } from "../contexts/contexts";
import { CheckMark } from "./CheckMark";
import nft1 from "../nft1.webp";
import nft2 from "../nft2.png";

export function CardSelector({ user }: { user: string }) {
  const [checks] = useEvents();
  const { transContract, readyForBuyer, paymentSent } = checks;
  return (
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
  );
}
