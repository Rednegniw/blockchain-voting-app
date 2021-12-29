export interface ErrorMessage {
    error: string
}

export interface SuccessMessage {
    success: string
}

export type ContractRequest = Promise<Buffer>