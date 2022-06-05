// TODO: Move to hook
export const connectWallet = async () => {
  try {
    const { ethereum } = window as any;

    if (!ethereum) {
      alert("Get MetaMask -> https://metamask.io/");
      return;
    }

    await ethereum.request({
      method: "eth_requestAccounts"
    });
  } catch (error) {
    console.log(error);
  }
};

export const getCurrentAccount = async () => {
  const { ethereum } = window as any;
  const accounts = await ethereum.request({ method: "eth_accounts" });

  if (accounts && Array.isArray(accounts)) {
    // Here you can access accounts[0]
    console.log("Connected", accounts[0] as number);
    return accounts[0];
  } else {
    // Handle errors here if accounts is not valid.
    console.log("invalid account!");
    return;
  }
};
