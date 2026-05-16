import { signTransaction } from "@stellar/freighter-api";
import * as TaskBadge from "taskbadge";

export const RPC_URL =
  import.meta.env.VITE_SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org";

export const CONTRACT_ID = TaskBadge.networks.testnet.contractId;
export const NETWORK_PASSPHRASE = TaskBadge.networks.testnet.networkPassphrase;

export function createTaskBadgeClient(publicKey?: string) {
  return new TaskBadge.Client({
    ...TaskBadge.networks.testnet,
    rpcUrl: RPC_URL,
    publicKey,
    signTransaction: (
      xdr: string,
      options?: { networkPassphrase?: string; address?: string },
    ) =>
      signTransaction(xdr, {
        ...options,
        address: publicKey,
        networkPassphrase: NETWORK_PASSPHRASE,
      }),
  });
}
