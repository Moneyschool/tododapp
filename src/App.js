import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { abi } from "./abi";
import { contractAddress } from "./constants";

function App() {
  const inputRef = useRef();
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  function instance() {
    if (!window.ethereum) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(contractAddress, abi, signer);
    setContract(contract);
  }

  async function connectWallet() {
    if (!window.ethereum) return;
    const accountArray = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    if (accountArray.length > 0) {
      setAccount(accountArray[0]);
    }
  }

  async function checkWalletConnected() {
    if (!window.ethereum) return;
    const accountArray = await window.ethereum.request({
      method: "eth_accounts",
    });
    if (accountArray.length > 0) {
      setAccount(accountArray[0]);
    }
  }

  async function getTasks() {
    if (account && contract) {
      try {
        const result = await contract.getTasks();
        setTasks(result);
      } catch (error) {
        console.log(error.message);
      }
    }
  }

  async function updateTask(i) {
    if (account && contract) {
      try {
        setLoading(true);
        const transaction = await contract.updateTask(i);
        const receipt = await transaction.wait();
        if (receipt.status) {
          getTasks();
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    }
  }

  async function createNewTask(e) {
    e.preventDefault();
    if (account && contract) {
      if (!inputRef.current.value) return;
      try {
        setLoading(true);
        const transaction = await contract.createTask(inputRef.current.value);
        const receipt = await transaction.wait();
        if (receipt.status) {
          getTasks();
          inputRef.current.value = "";
          setLoading(false);
        }
      } catch (error) {
        console.log(error.message);
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    checkWalletConnected();
    instance();
  }, []);

  useEffect(() => {
    getTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, contract]);

  return (
    <>
      {loading && (
        <div className="h-screen w-full absolute top-0 left-0 bg-slate-900 flex items-center justify-center text-white">
          Transaction still in progress...
        </div>
      )}
      <div className="h-screen w-screen bg-slate-800">
        <div className="flex items-center justify-between h-20 bg-slate-900 px-8">
          <div className="text-white font-bold">Todo DApp</div>
          <div>
            {account !== "" ? (
              <div className="text-white">
                {account.slice(0, 4)}...{account.slice(37)}
              </div>
            ) : (
              <button
                className="bg-slate-600 rounded-full py-2 px-5 text-white"
                onClick={connectWallet}
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
        <div className="max-w-[800px] w-[800px] mx-auto px-8 pt-[20px]">
          <div className="text-white text-2xl mb-3 border-b border-slate-600 pb-3">
            Tasks
          </div>
          <form onSubmit={createNewTask}>
            <div className="flex items-center w-full">
              <input
                type="text"
                ref={inputRef}
                className="flex-[0.7] mr-3 bg-slate-100"
                placeholder="Create New Todo"
              />
              <button
                type="submit"
                className="rounded-full bg-slate-600 text-white py-2 px-5 flex-[0.3]"
              >
                Submit
              </button>
            </div>
          </form>
          <div className="mt-3">
            {tasks.map((task, i) => {
              return (
                <div
                  className="flex justify-between items-center mt-3 h-12"
                  key={i}
                >
                  <div className={`text-white ${task[2] && "line-through"}`}>
                    {task[1]}
                  </div>
                  {!task[2] && (
                    <button
                      className="rounded-full bg-slate-600 text-white py-2 px-5"
                      onClick={(e) => updateTask(i)}
                    >
                      Complete task
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
