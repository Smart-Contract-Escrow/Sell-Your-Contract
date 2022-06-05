import address from "../../addresses.json";
import { BigNumber, ethers } from "ethers";
import contractAbi from "../../utils/Escrow.json";
import { useEvents, useLoading } from "../../contexts/contexts";

const { escrow: CONTRACT_ADDRESS = "" } = address;
export const BuyForm = ({
  contractPurchasePrice,
  setContractPurchasePrice
}: {
  contractPurchasePrice: string;
  setContractPurchasePrice: (e: string) => void;
}) => {
  const [, setLoading] = useLoading();
  const [checks, setChecks] = useEvents();
  const { transContract, readyForBuyer } = checks;

  function setPaymentSent(val: boolean) {
    setChecks({ transContract, readyForBuyer, paymentSent: val });
  }

  async function submit(e: React.SyntheticEvent) {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      contractBeingSold: { value: string };
      sellPrice: { value: string };
      reset: () => null;
    };

    const contractBeingSold = target.contractBeingSold.value;
    const sellPrice = ethers.utils.parseEther(target.sellPrice.value);
    sendEth(sellPrice, contractBeingSold, target);
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

  return (
    <form spellCheck="false" autoComplete="off" onSubmit={submit}>
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
      <button>Submit</button>
    </form>
  );
};
