import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
if (typeof window !== "undefined") {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export const networks = {
    testnet: {
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: "CARFQ2FENKLDNAM4IDIWVUDVN7HMEJAQA3745FDS7V4P2HC6OMCLLX4W",
    }
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAEAAAAAAAAABFRhc2sAAAACAAAAEwAAABAAAAABAAAAAAAAAAlUYXNrQ291bnQAAAAAAAABAAAAEwAAAAAAAAAAAAAAClRvdGFsVGFza3MAAA==",
            "AAAAAAAAAAAAAAAIaGFzX3Rhc2sAAAACAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAEdGFzawAAABAAAAABAAAAAQ==",
            "AAAAAAAAAAAAAAANY29tcGxldGVfdGFzawAAAAAAAAIAAAAAAAAABHVzZXIAAAATAAAAAAAAAAR0YXNrAAAAEAAAAAEAAAAE",
            "AAAAAAAAAAAAAAAOZ2V0X3Rhc2tfY291bnQAAAAAAAEAAAAAAAAABHVzZXIAAAATAAAAAQAAAAQ=",
            "AAAAAAAAAAAAAAAPZ2V0X3RvdGFsX3Rhc2tzAAAAAAAAAAABAAAABA=="]), options);
        this.options = options;
    }
    fromJSON = {
        has_task: (this.txFromJSON),
        complete_task: (this.txFromJSON),
        get_task_count: (this.txFromJSON),
        get_total_tasks: (this.txFromJSON)
    };
}
