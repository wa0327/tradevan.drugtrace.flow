import { readFile, WorkSheet } from 'xlsx'
import { Node, SourceNode, Company, Lot, CompanyCollection } from './src/app/entities'
import { Express } from 'express'

const workbook = readFile('data.xlsx')
const flowSheet = workbook.Sheets[workbook.SheetNames[0]]
const flows = parseFlowSheet(flowSheet)
const companySheet = workbook.Sheets[workbook.SheetNames[1]]
const companies = parseCompanySheet(companySheet)

export function appHook(app: Express) {
    app.get(['/api/flows', '/api/companies'], (req, res) => {
        let data: any

        switch (req.url) {
            case '/api/flows':
                data = flows
                break

            case '/api/companies':
                data = companies
                break
        }

        if (data) {
            res.setHeader('CONTENT-TYPE', 'application/json')
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.write(JSON.stringify(data))
            res.statusCode = 200
        } else {
            res.statusCode = 404
        }

        res.end()
    })
}

function parseFlowSheet(sheet: WorkSheet): SourceNode[] {
    let db: { [key: string]: SourceNode } = {}

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
        let source = db[name] = db[name] || <SourceNode>{
            regno: a.v,
            instCode: b.v,
            name,
            targets: []
        }

        let target = <Node>{
            regno: d ? d.v : null,
            instCode: e.v,
            name: strip(f.v)
        }
        source.targets.push(target)
    }

    let result = []
    for (const key in db) {
        result.push(db[key])
    }

    return result
}

function parseCompanySheet(sheet: WorkSheet) {
    let db: CompanyCollection = {}

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
        let salesLots = e ? parseLots(e.v) : []

        let company = <Company>{
            uno: a.v,
            name: strip(b.v),
            instCodes,
            purchaseLots,
            salesLots
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

interface Cell {
    v: string
}