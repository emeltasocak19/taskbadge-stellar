import {
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  Circle,
  ClipboardList,
  ExternalLink,
  Loader2,
  RefreshCw,
  Rocket,
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

function isAccountMissing(error: unknown) {
  return readError(error).toLowerCase().includes("account not found");
}

async function fundTestnetAccount(publicKey: string) {
  const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
  if (!response.ok) {
    throw new Error("Testnet funding failed. Please try Friendbot manually.");
  }
}

export default function App() {
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState("TESTNET");
  const [selectedTask, setSelectedTask] = useState("Read Docs");
  const [hasSelectedTask, setHasSelectedTask] = useState(false);
  const [taskStatus, setTaskStatus] = useState<Record<string, boolean>>({});
  const [taskCount, setTaskCount] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [status, setStatus] = useState("Connect Freighter to track tasks");
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const connected = Boolean(address);
  const walletLabel = connected ? shortAddress(address) : "Not connected";
  const activeTask = taskOptions.find((task) => task.label === selectedTask);
  const client = useMemo(() => createTaskBadgeClient(address), [address]);
  const progressPercent = Math.min(
    100,
    Math.round((taskCount / taskOptions.length) * 100),
  );

  const refreshTaskData = useCallback(
    async (walletAddress = address, task = selectedTask) => {
      if (!walletAddress) return;

      const readClient = createTaskBadgeClient(walletAddress);
      const networkDetails = await getNetworkDetails();
      if ("error" in networkDetails && networkDetails.error) {
        throw new Error(String(networkDetails.error));
      }
      if (networkDetails.networkPassphrase !== NETWORK_PASSPHRASE) {
        throw new Error("Please switch Freighter to Testnet and connect again.");
      }

      const [statusTxs, countTx, totalTx] = await Promise.all([
        Promise.all(
          taskOptions.map(async (option) => {
            const tx = await readClient.has_task({
              user: walletAddress,
              task: option.label,
            });
            return [option.label, Boolean(tx.result)] as const;
          }),
        ),
        readClient.get_task_count({ user: walletAddress }),
        readClient.get_total_tasks(),
      ]);

      const nextStatus = Object.fromEntries(statusTxs);
      setTaskStatus(nextStatus);
      setHasSelectedTask(Boolean(nextStatus[task]));
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
      try {
        await refreshTaskData(walletAddress, selectedTask);
      } catch (refreshError) {
        if (!isAccountMissing(refreshError)) throw refreshError;

        setStatus("Funding Testnet wallet");
        await fundTestnetAccount(walletAddress);
        await refreshTaskData(walletAddress, selectedTask);
      }
      setStatus("Wallet connected");
    } catch (nextError) {
      setError(readError(nextError));
    } finally {
      setIsBusy(false);
    }
  }

  async function selectTask(task: string) {
    setSelectedTask(task);
    setHasSelectedTask(Boolean(taskStatus[task]));
    setStatus(`Selected task: ${task}`);

    if (!address) {
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
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-row">
          <div className="brand-mark">TB</div>
          <div>
            <p className="eyebrow">Stellar Progress</p>
            <h1>TaskBadge</h1>
          </div>
        </div>

        <div className="wallet-card">
          <span className="label">Wallet</span>
          <strong>{walletLabel}</strong>
          <small>{network}</small>
        </div>

        <div className="metric-stack">
          <div>
            <span>Your Badges</span>
            <strong>{taskCount}</strong>
          </div>
          <div>
            <span>Total Badges</span>
            <strong>{totalTasks}</strong>
          </div>
          <div>
            <span>Contract</span>
            <strong>{shortAddress(CONTRACT_ID)}</strong>
          </div>
        </div>

        <div className="links">
          <a href={explorerUrl} target="_blank" rel="noreferrer">
            Explorer <ExternalLink size={14} />
          </a>
          <a href={labUrl} target="_blank" rel="noreferrer">
            Stellar Lab <ExternalLink size={14} />
          </a>
        </div>
      </aside>

      <section className="board">
        <header className="board-header">
          <div>
            <p className="eyebrow">Workshop Checklist</p>
            <h2>Complete tasks, collect badges.</h2>
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
        </header>

        {error && <div className="error">{error}</div>}

        <section className="progress-panel">
          <div className="progress-copy">
            <ClipboardList size={22} />
            <div>
              <span>Progress</span>
              <strong>
                {taskCount} / {taskOptions.length} badges
              </strong>
            </div>
          </div>
          <div className="progress-track" aria-label="Task completion progress">
            <span style={{ width: `${progressPercent}%` }} />
          </div>
          <small>{status}</small>
        </section>

        <section className="workspace">
          <article className="task-list">
            <div className="section-heading">
              <BookOpen size={20} />
              <div>
                <p className="eyebrow">Tasks</p>
                <h3>Learning path</h3>
              </div>
            </div>

            {taskOptions.map((task, index) => {
              const isDone = Boolean(taskStatus[task.label]);
              const isActive = selectedTask === task.label;

              return (
                <button
                  className={[
                    "task-row",
                    isActive ? "active" : "",
                    isDone ? "done" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={task.label}
                  onClick={() => selectTask(task.label)}
                  type="button"
                >
                  <span className="task-index">
                    {isDone ? <CheckCircle2 size={18} /> : index + 1}
                  </span>
                  <span className="task-copy">
                    <strong>{task.label}</strong>
                    <small>{task.detail}</small>
                  </span>
                  <span className="task-state">
                    {isDone ? "Done" : isActive ? "Selected" : "Open"}
                  </span>
                </button>
              );
            })}
          </article>

          <article className="action-panel">
            <div className="badge-preview">
              <div className={hasSelectedTask ? "badge-token done" : "badge-token"}>
                {hasSelectedTask ? <BadgeCheck size={40} /> : <Circle size={40} />}
              </div>
              <p className="eyebrow">Selected Badge</p>
              <h3>{selectedTask}</h3>
              <p>{activeTask?.detail}</p>
            </div>

            <div className={hasSelectedTask ? "selected-box done" : "selected-box"}>
              <BadgeCheck size={18} />
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

            <dl>
              <div>
                <dt>Contract ID</dt>
                <dd>{CONTRACT_ID}</dd>
              </div>
              <div>
                <dt>Network Passphrase</dt>
                <dd>{NETWORK_PASSPHRASE}</dd>
              </div>
            </dl>
          </article>
        </section>
      </section>
    </main>
  );
}
