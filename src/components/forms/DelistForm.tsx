import address from "../../addresses.json";
import { ethers } from "ethers";
import contractAbi from "../../utils/Escrow.json";

const { escrow: CONTRACT_ADDRESS = "" } = address;
export const DelistForm = ({
  setLoading,
  setTransContract,
  setReadyForBuyer,
  setPaymentSent
}: {
  setLoading: (e: boolean) => void;
  setTransContract: (val: boolean) => void;
  setReadyForBuyer: (val: boolean) => void;
  setPaymentSent: (e: boolean) => void;
}) => {
  async function submit(e: React.SyntheticEvent) {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      contractBeingSold: { value: string };
      reset: () => null;
    };

    console.log("target", target.contractBeingSold.value);
    const contractBeingSold = target.contractBeingSold.value;
    delist(contractBeingSold, target);
  }

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

  return (
    <form spellCheck="false" autoComplete="off" onSubmit={submit}>
      <div>
        <label>Contract To Cancel:</label>
        <input required type="text" name="contractToCancel" />
      </div>
      <button>Submit</button>
    </form>
  );
};
