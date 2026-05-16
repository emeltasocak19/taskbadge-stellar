import {
  Award,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  Loader2,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import {
  getAddress,
  getNetworkDetails,
  isConnected,
  requestAccess,
} from "@stellar/freighter-api";
import {
  CONTRACT_ID,
  createTaskBadgeClient,
  NETWORK_PASSPHRASE,
} from "./lib/taskbadge";

type TaskOption = {
  label: string;
  detail: string;
};

const taskOptions: TaskOption[] = [
  { label: "Read Docs", detail: "Study Stellar and Soroban basics" },
  { label: "Built Contract", detail: "Write a small smart contract" },
  { label: "Deploy Testnet", detail: "Deploy a contract to Stellar Testnet" },
  { label: "Joined Workshop", detail: "Complete a learning session" },
];

const explorerUrl = `https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`;
const labUrl = `https://lab.stellar.org/r/testnet/contract/${CONTRACT_ID}`;

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

function readError(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Unexpected error.";
}

export default function App() {
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState("TESTNET");
  const [selectedTask, setSelectedTask] = useState("Read Docs");
  const [hasSelectedTask, setHasSelectedTask] = useState(false);
  const [taskCount, setTaskCount] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [status, setStatus] = useState("Connect Freighter to track tasks");
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const connected = Boolean(address);
  const walletLabel = connected ? shortAddress(address) : "Not connected";
  const activeTask = taskOptions.find((task) => task.label === selectedTask);
  const client = useMemo(() => createTaskBadgeClient(address), [address]);

  const refreshTaskData = useCallback(
    async (walletAddress = address, task = selectedTask) => {
      if (!walletAddress) return;

      const readClient = createTaskBadgeClient(walletAddress);
      const [hasTaskTx, countTx, totalTx, networkDetails] = await Promise.all([
        readClient.has_task({ user: walletAddress, task }),
        readClient.get_task_count({ user: walletAddress }),
        readClient.get_total_tasks(),
        getNetworkDetails(),
      ]);

      if ("error" in networkDetails && networkDetails.error) {
        throw new Error(String(networkDetails.error));
      }

      setHasSelectedTask(Boolean(hasTaskTx.result));
      setTaskCount(Number(countTx.result));
      setTotalTasks(Number(totalTx.result));
      setNetwork(networkDetails.network ?? "TESTNET");
    },
    [address, selectedTask],
  );

  async function connectWallet() {
    setIsBusy(true);
    setError("");

    try {
      const freighter = await isConnected();
      if ("error" in freighter && freighter.error) {
        throw new Error(String(freighter.error));
      }
      if (!freighter.isConnected) {
        throw new Error("Freighter extension was not found.");
      }

      const access = await requestAccess();
      if ("error" in access && access.error) {
        throw new Error(String(access.error));
      }

      const walletAddress = access.address || (await getAddress()).address;
      if (!walletAddress) {
        throw new Error("Wallet access was not granted.");
      }

      setAddress(walletAddress);
      await refreshTaskData(walletAddress, selectedTask);
      setStatus("Wallet connected");
    } catch (nextError) {
      setError(readError(nextError));
    } finally {
      setIsBusy(false);
    }
  }

  async function selectTask(task: string) {
    setSelectedTask(task);
    setStatus(`Selected task: ${task}`);

    if (!address) {
      setHasSelectedTask(false);
      return;
    }

    setIsBusy(true);
    setError("");
    try {
      await refreshTaskData(address, task);
    } catch (nextError) {
      setError(readError(nextError));
    } finally {
      setIsBusy(false);
    }
  }

  async function completeTask() {
    if (!address) return;

    setIsBusy(true);
    setError("");
    setStatus("Waiting for Freighter signature");

    try {
      const tx = await client.complete_task({
        user: address,
        task: selectedTask,
      });
      const sent = await tx.signAndSend();

      setTaskCount(Number(sent.result));
      await refreshTaskData(address, selectedTask);
      setStatus(`${selectedTask} saved on Stellar Testnet`);
    } catch (nextError) {
      setError(readError(nextError));
      setStatus("Task could not be saved");
    } finally {
      setIsBusy(false);
    }
  }

  async function refresh() {
    if (!address) return;

    setIsBusy(true);
    setError("");
    try {
      await refreshTaskData(address, selectedTask);
      setStatus("Task data refreshed");
    } catch (nextError) {
      setError(readError(nextError));
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <main className="shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">Stellar Soroban Progress dApp</p>
          <h1>TaskBadge</h1>
        </div>
        <div className="actions">
          {connected && (
            <button
              className="icon-button"
              onClick={refresh}
              disabled={isBusy}
              title="Refresh"
              type="button"
            >
              <RefreshCw size={18} />
            </button>
          )}
          <button
            className="primary-button"
            onClick={connectWallet}
            disabled={isBusy}
            type="button"
          >
            {isBusy ? <Loader2 className="spin" size={18} /> : <Wallet size={18} />}
            {connected ? walletLabel : "Connect Freighter"}
          </button>
        </div>
      </section>

      {error && <div className="error">{error}</div>}

      <section className="hero">
        <article className="badge-card">
          <div className="badge-row">
            <span>{network}</span>
            <span>{hasSelectedTask ? "Completed" : "Open task"}</span>
          </div>
          <div className="badge-symbol">
            {hasSelectedTask ? <CheckCircle2 size={58} /> : <Award size={58} />}
          </div>
          <p className="eyebrow">Selected task</p>
          <h2>{selectedTask}</h2>
          <p className="badge-note">
            {hasSelectedTask
              ? "This wallet already holds the badge for this task."
              : activeTask?.detail}
          </p>
        </article>

        <article className="stats-card">
          <div>
            <span>Your badges</span>
            <strong>{taskCount}</strong>
          </div>
          <div>
            <span>Total badges</span>
            <strong>{totalTasks}</strong>
          </div>
          <div>
            <span>Contract</span>
            <strong>{shortAddress(CONTRACT_ID)}</strong>
          </div>
        </article>
      </section>

      <section className="workspace">
        <article className="panel task-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Complete Task</p>
              <h3>Choose a badge</h3>
            </div>
            <ClipboardCheck size={20} />
          </div>

          <div className="task-grid">
            {taskOptions.map((task) => (
              <button
                className={
                  selectedTask === task.label ? "task-option active" : "task-option"
                }
                key={task.label}
                onClick={() => selectTask(task.label)}
                type="button"
              >
                <span>{task.label}</span>
                <small>{task.detail}</small>
              </button>
            ))}
          </div>

          <div className={hasSelectedTask ? "selected-box done" : "selected-box"}>
            <ShieldCheck size={18} />
            <span>
              {connected
                ? hasSelectedTask
                  ? "Already completed"
                  : "Ready to complete"
                : "Connect wallet first"}
            </span>
          </div>

          <button
            className="primary-button full"
            onClick={completeTask}
            disabled={!connected || isBusy || hasSelectedTask}
            type="button"
          >
            {isBusy ? <Loader2 className="spin" size={18} /> : <Rocket size={18} />}
            Complete on-chain
          </button>
        </article>

        <article className="panel contract-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Smart Contract</p>
              <h3>Task registry</h3>
            </div>
            <Award size={20} />
          </div>

          <dl>
            <div>
              <dt>Contract ID</dt>
              <dd>{CONTRACT_ID}</dd>
            </div>
            <div>
              <dt>Network Passphrase</dt>
              <dd>{NETWORK_PASSPHRASE}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{status}</dd>
            </div>
          </dl>

          <div className="links">
            <a href={explorerUrl} target="_blank" rel="noreferrer">
              Explorer <ExternalLink size={14} />
            </a>
            <a href={labUrl} target="_blank" rel="noreferrer">
              Stellar Lab <ExternalLink size={14} />
            </a>
          </div>
        </article>
      </section>
    </main>
  );
}
