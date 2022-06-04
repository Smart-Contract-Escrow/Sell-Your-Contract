import address from "../../addresses.json";
import { BigNumber, ethers } from "ethers";
import contractAbi from "../../utils/Escrow.json";
import TestERC20Contract from "../../utils/ITestERC20.json";

const { escrow: CONTRACT_ADDRESS = "" } = address;
export const SellForm = ({
  setTransContract,
  setContractPurchasePrice,
  setLoading,
  setReadyForBuyer
}: {
  setTransContract: (val: boolean) => void;
  setContractPurchasePrice: (e: string) => void;
  setLoading: (val: boolean) => void;
  setReadyForBuyer: (val: boolean) => void;
}) => {
  async function submit(e: React.SyntheticEvent) {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      contractBeingSold: { value: string };
      sellPrice: { value: string };
      buyerAddress: { value: string };
      reset: () => null;
    };

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
  }

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
  return (
    <form spellCheck="false" autoComplete="off" onSubmit={submit}>
      <div>
        <label>Contract To Sell:</label>
        <input required type="text" name="contractBeingSold" />
        <label>Sell Price (eth):</label>
        <input required type="decimal" name="sellPrice" />
        <label>Buyer Address:</label>
        <input required type="text" name="buyerAddress" />
      </div>
      <button>Submit</button>
    </form>
  );
};
