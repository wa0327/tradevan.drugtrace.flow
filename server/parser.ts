import { WorkSheet } from 'xlsx'

export function parseFlowSheet(sheet: WorkSheet) {
    let db: { [key: string]: Node } = {}

    for (let rowIndex = 2; ; rowIndex++) {
        let a = <Cell>sheet[`A${rowIndex}`]
        let b = <Cell>sheet[`B${rowIndex}`]
        let c = <Cell>sheet[`C${rowIndex}`]
        let d = <Cell>sheet[`D${rowIndex}`]
        let e = <Cell>sheet[`E${rowIndex}`]
        let f = <Cell>sheet[`F${rowIndex}`]

        if (c == null || c.v == null) {
            break
        }

        let name = strip(c.v)
        let source = db[name] = db[name] || <Node>{
            regno: a.v,
            instCode: b.v,
            name,
            children: {}
        }

        let child = <Node>{
            regno: d ? d.v : null,
            instCode: e.v,
            name: strip(f.v)
        }
        source.children[child.name] = child;
    }

    return db
}

export function parseCompanySheet(sheet: WorkSheet) {
    let db: { [index: string]: Company } = {}

    for (let rowIndex = 2; ; rowIndex++) {
        let a = <Cell>sheet[`A${rowIndex}`]
        let b = <Cell>sheet[`B${rowIndex}`]
        let c = <Cell>sheet[`C${rowIndex}`]
        let d = <Cell>sheet[`D${rowIndex}`]
        let e = <Cell>sheet[`E${rowIndex}`]

        if (b == null || b.v == null) {
            break
        }

        let instCodes = c.v.split('、')
        let purchaseLots = d ? parseLots(d.v) : []
        let saleLots = e ? parseLots(e.v) : []

        let company = <Company>{
            uno: a.v,
            name: strip(b.v),
            instCodes,
            purchaseLots,
            saleLots
        }

        db[company.name] = company
    }

    return db

    function parseLots(raw: string) {
        return raw
            .split('、')
            .map(s => {
                let result = /([A-Z0-9]{6})\((\d+)\)/.exec(s)
                if (result) {
                    return <Lot>{
                        no: result[1],
                        qty: parseInt(result[2])
                    }
                }
                return null
            })
            .filter(lot => lot != null)
    }
}

function strip(value: string) {
    return value.replace(/\"|\'/, '').trim()
}

export interface Cell {
    v: string
}

export interface Node {
    regno: string
    instCode: string
    name: string
    children: { [key: string]: Node }
}

export interface Lot {
    no: string
    qty: number
}

export class Company {
    uno: string
    name: string
    instCodes: string[]
    purchaseLots: Lot[]
    saleLots: Lot[]
}