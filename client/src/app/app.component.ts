import { Component, OnInit } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import * as cytoscape from 'cytoscape'
import { Node, SourceNode, CompanyCollection } from './entities'

@Component({
    selector: 'app-root',
    template: '<div id="cy"></div>',
    styleUrls: ['app.component.less', 'cy.less']
})
export class AppComponent implements OnInit {
    constructor(private http: HttpClient) { }

    ngOnInit() {
        this.http.get<SourceNode[]>('http://10.37.129.2:8088/api/flows').subscribe(data => {
            const $container = $('div#cy')
            const elements = this.toElementsDefinition(data)
            const style = __webpack_require__('./src/app/cy.less')
            
            const cy = cytoscape({
                container: $container[0],
                elements,
                style: style
            })

            const central = cy.$('[name="台灣大昌華嘉股份有限公司"]')
            central.addClass('central')

            const layout = cy.layout({
                name: 'cose',
                stop: () => {
                    cy.zoom(1)
                    cy.center(central)
                }
            })
            layout.run()
        })
    }

    private toElementsDefinition(sourceNodes: SourceNode[]): cytoscape.ElementsDefinition {
        const nodes: cytoscape.NodeDefinition[] = []
        const edges: cytoscape.EdgeDefinition[] = []
        const nodeMap: { [key: string]: CyNode } = {}
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
                    data: new EdgeData(source.data, target.data)
                }
                edges.push(edge)
            })
        })

        return {
            nodes,
            edges
        }
    }
}

class NodeData implements cytoscape.NodeDataDefinition {
    id: string
    name: string
    regno: string
    instCode: string

    constructor(node: Node) {
        this.id = node.name
        this.name = node.name
        this.regno = node.regno
        this.instCode = node.instCode
    }
}

class EdgeData implements cytoscape.EdgeDataDefinition {
    id: string
    source: string
    target: string

    constructor(source: NodeData, target: NodeData) {
        this.id = `${source.id}-${target.id}`
        this.source = source.id
        this.target = target.id
    }
}

class CyNode implements cytoscape.NodeDefinition {
    data: NodeData
}