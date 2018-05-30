import { Component, OnInit } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { forkJoin } from 'rxjs/observable/forkJoin'
import * as cytoscape from 'cytoscape'
import { Core, ElementsDefinition, NodeDefinition, NodeDataDefinition, NodeCollection, EdgeDefinition, EdgeDataDefinition, EdgeCollection } from 'cytoscape'
import * as cola from 'cytoscape-cola'
import * as cose_bilkent from 'cytoscape-cose-bilkent'
import { Node, SourceNode, CompanyCollection, Company } from './entities'

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.less', 'cy.less']
})
export class AppComponent implements OnInit {
    constructor(private http: HttpClient) { }

    companies: CompanyCollection
    company: Company
    central: NodeCollection
    $companyDlg: JQuery<HTMLElement>

    ngOnInit() {
        this.initCytoscape()
        this.initDialogs()
    }

    private initCytoscape() {
        cytoscape.use(<any>cola)
        cytoscape.use(<any>cose_bilkent)

        forkJoin(
            this.http.get<SourceNode[]>('http://10.37.129.2:8088/api/flows'),
            this.http.get<CompanyCollection>('http://10.37.129.2:8088/api/companies')
        ).subscribe(dataArray => {
            const $container = $('div#cy')
            const elements = this.convert(dataArray[0])
            const style = __webpack_require__('./src/app/cy.less')

            const cy = cytoscape({
                container: $container[0],
                elements,
                style: style,
            })

            this.central = cy.$('[id="台灣大昌華嘉股份有限公司"]')
            this.central.addClass('central')
            this.layout(cy)
            this.bindEvents(cy)
            this.companies = dataArray[1]
        })
    }

    private convert(sourceNodes: SourceNode[]): ElementsDefinition {
        const nodes: NodeDefinition[] = []
        const edges: EdgeDefinition[] = []
        const nodeMap: { [key: string]: NodeDefinition } = {}
        sourceNodes.forEach(sourceNode => {
            const source = {
                data: new NodeData(sourceNode)
            }
            nodes.push(source)
            nodeMap[source.data.id] = source

            sourceNode.targets.forEach(node => {
                const data = new NodeData(node)
                let target = nodeMap[data.id]
                if (target == null) {
                    target = { data }
                    nodes.push(target)
                    nodeMap[data.id] = target
                }

                const edge = {
                    data: {
                        id: `${source.data.id}-${data.id}`,
                        source: source.data.id,
                        target: data.id
                    }
                }
                edges.push(edge)
            })
        })

        return {
            nodes,
            edges
        }
    }

    private layout(cy: Core) {
        cy.layout({
            name: 'cose-bilkent',
            idealEdgeLength: 200,
            stop: () => {
                cy.zoom(1)
                cy.center(this.central)
            }
        }).run()
    }

    private bindEvents(cy: Core) {
        cy.on('select unselect', 'node', () => {
            const selected = cy.elements('node:selected')
            const outgoers = selected.outgoers()
            const targets = outgoers.targets()
            const all = selected.union(outgoers).union(targets)
            all.addClass('highlight')
            cy.elements().not(all).removeClass('highlight')
        })

        cy.on('select', 'node', event => {
            const target = <NodeCollection>event.target
            const data = <NodeData>target.data()
            const company = this.companies[data.node.name]
            if (company) {
                this.company = company
                this.$companyDlg.dialog('open')
            } else {
                alert(`查無 ${data.node.name} 的資料。`)
            }
        })
    }

    private initDialogs() {
        this.$companyDlg = $('div#company-dialog').dialog({
            autoOpen: false,
            draggable: true,
            width: 300,
            height: 700,
            resizable: false,
            position: { my: 'right top', at: 'right top', of: window }
        });
    }
}

class NodeData implements NodeDataDefinition {
    readonly node: Node
    readonly id: string
    readonly label: string

    constructor(node: Node) {
        this.node = node
        this.id = node.name

        if (node.regno) {
            this.label = `${node.regno}  ${this.truncate(node.name)}`
        } else {
            this.label = this.truncate(node.name)
        }
    }

    private truncate(name: string) {
        if (name.length > 5) {
            return name.substring(0, 5) + '...'
        }
        return name
    }
}