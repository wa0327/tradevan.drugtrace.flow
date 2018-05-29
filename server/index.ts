import { readFile } from 'xlsx'
import { parseFlowSheet, parseCompanySheet } from './parser'
import { createServer } from 'http'

const workbook = readFile('data.xlsx')
const flowSheet = workbook.Sheets[workbook.SheetNames[0]]
const flows = parseFlowSheet(flowSheet)
const companySheet = workbook.Sheets[workbook.SheetNames[1]]
const companies = parseCompanySheet(companySheet)

const port = 8080
const server = createServer((req, res) => {
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
        res.write(JSON.stringify(data))
        res.statusCode = 200
    } else {
        res.statusCode = 404
    }

    res.end()
})
server.listen(port)
console.log(`server is listening on ${port}`)