export interface Node {
    regno: string
    instCode: string
    name: string
}

export interface SourceNode extends Node {
    targets: Node[]
}

export interface Lot {
    no: string
    qty: number
}

export interface Company {
    uno: string
    name: string
    instCodes: string[]
    purchaseLots: Lot[]
    saleLots: Lot[]
}

export interface CompanyCollection {
    [key: string]: Company
}