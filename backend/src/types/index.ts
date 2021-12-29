import { Contract, Gateway, Network } from "fabric-network";

export interface NetworkObj {
    contract: Contract
    network: Network
    gateway: Gateway
}

export const isNetworkObj = (networkObj: NetworkObj | { error: unknown }): networkObj is NetworkObj => {
    return 'contract' in networkObj;
}

export const isErrorObj = (errorObj: { error: string } | any): errorObj is { error: any } => {
    return 'error' in errorObj;
}