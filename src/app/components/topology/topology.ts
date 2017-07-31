import * as model from "./topologymodel";
import * as d3 from "d3";

export class TopologyViz {

    visualization: any = null;
    el: string;

    nodes: model.INode[] = [];
    links: model.ILink[] = [];
    temp: model.ILink[] = [];

    nodeMap: any = {};
    linkMap: any = {};

    link: any;
    node: any;
    nodelabel: any;
    linklabel: any;

    rect: any;

    simulation: any = null;
    canvas: any = null;
    tooltip: any = null;

    radius = 10;
    width: number = 1200;
    height: number = 760;

    // zoom settings
    min_zoom: number = 0.1;
    max_zoom: number = 7;
    zoom: any = d3.zoom().scaleExtent([this.min_zoom, this.max_zoom]);
    g: any;

    focus_node: any = null;
    highlight_node: any = null;
    highlight_color: string = "blue";



    constructor(el: string) {
        this.el = el;
        this.link = this.temp;
    }

    onmounted() {
        let svg = d3.select(this.el),
            // width = +svg.attr("width"),
            // height = +svg.attr("height");
            width = this.width,
            height = this.height;

        this.canvas = svg;
        let self = this;

        // apply cursor style and zoom functionality
        svg.style("cursor", "move");
        svg.call(d3.zoom().on("zoom", function () {
            self.g.attr("transform", d3.event.transform);
        }))
            .append("g");

        this.g = d3.select("g");

        this.simulation = d3.forceSimulation()
            .force("charge", d3.forceManyBody().strength(-400))
            .force("link", d3.forceLink().id((d: any) => d.id).distance(100).strength(1))
            .force("x", d3.forceX(width / 2))
            .force("y", d3.forceY(height / 2))
            .alphaTarget(0.1)
            // .force("link", d3.forceLink().id((d: any) => d.id).strength(0.5))
            // .force("charge", d3.forceManyBody())
            // .force("center", d3.forceCenter(width / 2, height / 2))
            // .alphaTarget(0.1)
            .on("tick", () => self.ticked());

        let arrowSquare = this.radius + 1;

        this.g.append("defs").selectAll("marker")
            .data(["arrow"])
            .enter().append("marker")
            .attr("id", function (d) { return d; })
            .attr("refX", this.radius + (this.radius / 2) - 3.0) // right at end of line
            .attr("refY", (this.radius / 2))  // half the distance
            .attr("markerWidth", arrowSquare)
            .attr("markerHeight", arrowSquare)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,0 L0," + arrowSquare + "L" + (arrowSquare / 2) + "," + (arrowSquare / 2) + " L0,0")
            .style("stroke", "#282828")
            .style("fill", "#282828")
            .style("opacity", "1.0");

        // this.rect = svg.append("g")
        //     .attr("transform", "translate(10,10)")
        //     .call(d3.drag()
        //         .on("start", self.dragStart)
        //         .on("drag", self.dragMove)
        //         .on("end", self.dragEnd));

        // this.rect.append("rect")
        //     .attr("width", width / 4)
        //     .attr("height", height / 4)
        //     .style("cursor", "move")
        //     .style("fill", "none");

        // svg.append("rect")
        //     .attr("width", width / 2)
        //     .attr("height", height / 2)
        //     .attr("id", "rectHandler")
        //     .attr("x", width / 4)
        //     .attr("y", height / 4)
        //     .style("fill", "none")
        //     .style("cursor", "move")
        //     .style("pointer-events", "all")
        //     .style("background-color", "#eee")
        //     .call(d3.drag()
        //         .on("start", () => self.dragStart())
        //         .on("drag", () => self.dragMove())
        //         .on("end", () => self.dragEnd()))
        //     .call(d3.zoom()
        //         .scaleExtent([1 / 2, 4])
        //         .on("zoom", () => self.zoomed()));

        this.link = this.g.append("g")
            .attr("class", "links")
            .style("marker-end", "url(#arrow)")
            .selectAll("line")
            .data(this.nodes);

        this.linklabel = this.g.append("g")
            .attr("class", "linklabels")
            .attr("fill", "Black")
            .attr("dy", ".35em")
            .selectAll(".linklabel")
            .data(this.link);

        this.node = this.g.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(this.nodes);

        this.nodelabel = this.g.append("g")
            .attr("class", "nodelabels")
            .selectAll(".nodelabel")
            .data(this.nodes);

        this.tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip");
        this.restart();
    }

    // split and group by host id
    splitHost() {
        console.log("split host");
        let self = this;
        self.simulation
            .force("x", d3.forceX(function (d) {
                return d.group * 300;
            }))
            .alphaTarget(0.5)
            .restart();
    }

    // combine all the forces
    combineHost() {
        console.log("combine host");
        let self = this;
        self.simulation
            .force("charge", d3.forceManyBody().strength(-400))
            .force("link", d3.forceLink().id((d: any) => d.id).distance(100).strength(1))
            .force("x", d3.forceX(this.width / 2))
            .force("y", d3.forceY(this.height / 2))
            .alphaTarget(0.1)
            .on("tick", () => self.ticked());
    }

    // hide the link association
    hideLinks() {
        console.log("hide links");
        if (this.links.length < 1) {
            console.log(this.links);
            this.restart();
        } else {
            console.log(this.link);
            this.temp = this.links;
            this.links = [];
            this.restart();
        }
    }

    // show the link association
    showLinks() {
        console.log("show links");
        this.links = this.temp;
        this.restart();
    }

    // change force based on input range
    updateForce(input) {
        // console.log(input);
        this.simulation
            .force("link").strength(+input);
        this.simulation
            .alpha(1)
            .restart();
    }


    graphLoaded(graph: model.IGraph) {

        for (let index = 0; index < graph.nodes.length; index++) {
            let node = graph.nodes[index];
            if (!this.nodeMap.hasOwnProperty(node.id)) {
                this.nodeMap[node.id] = node;
                this.nodes.push(node);
            } else {
                this.nodeMap[node.id] = node;
            }
        }

        for (let index = 0; index < graph.links.length; index++) {
            let link = graph.links[index];
            if (!this.nodeMap.hasOwnProperty(link.source) || !this.nodeMap.hasOwnProperty(link.target)) {
                // ignore links that reference we don't know about
                continue;
            }

            if (!this.linkMap.hasOwnProperty(link.id)) {
                this.linkMap[link.id] = link;
                this.links.push(link);
            }
        }

        this.restart();
    }

    updateLink(flow: model.IFlow) {
        let self = this;
        if (!this.linkMap.hasOwnProperty(flow.id)) {
            this.linkMap[flow.id] = flow;
            this.links.push(flow);
        } else {
            let link = this.linkMap[flow.id];

            if (flow.hasOwnProperty("inBytes")) {
                link.inBytes = flow.inBytes;
            }

            if (flow.hasOwnProperty("outBytes")) {
                link.outBytes = flow.outBytes;
            }
        }

        this.restart();
    }

    restart() {
        let self = this;

        // Apply the general update pattern to the nodes.
        self.node = this.node.data(self.nodes, (d: any) => d.id);
        self.node.exit().remove();
        self.node = self.node.enter().append("circle")
            .attr("r", 12)
            .style("fill", (d: any) => self.color(d))
            .on("mouseover", function (d: any) {
                console.log(d3.select(this));
                let inner_self = this;
                // d3.select(this).style("fill", "red");
                self.mouseover(d, inner_self);
            })
            .on("mouseout", (d: any) => self.mouseout(d)).merge(self.node);

        self.node.call(d3.drag()
            .on("start", (d: any) => self.dragstarted(d))
            .on("drag", (d: any) => self.dragged(d))
            .on("end", (d: any) => self.dragended(d)));

        // Apply the general update pattern to the links.
        self.link = self.link.data(self.links);
        self.link.exit().remove();
        self.link = self.link.enter().append("svg:path").merge(self.link);

        // Apply the general update pattern to the labels.
        self.nodelabel = self.nodelabel.data(self.nodes, (d: any) => d.id);
        self.nodelabel.exit().remove();
        self.nodelabel = self.nodelabel.enter()
            .append("text")
            .attr("x", (d: any) => d.x)
            .attr("y", (d: any) => d.y)
            .text((d: any) => d.name)
            .merge(self.nodelabel);

        self.linklabel = self.linklabel.data(self.links);
        self.linklabel.exit().remove();
        self.linklabel = self.linklabel.enter()
            .append("text")
            .attr("id", function (d: any) { return d.id; })
            .text((l: any) => {
                let inBytes = null;
                let outBytes = null;

                if (l.hasOwnProperty("inBytes")) {
                    inBytes = l.inBytes;
                }

                if (l.hasOwnProperty("outBytes")) {
                    outBytes = l.outBytes;
                }

                outBytes = self.formatBytes(outBytes);
                inBytes = self.formatBytes(inBytes);

                if (inBytes !== "" && outBytes !== "") {
                    return inBytes + " / " + outBytes;
                } else if (inBytes !== "") {
                    return inBytes + " in";
                } else if (outBytes !== "") {
                    return outBytes + " out";
                }
            })
            .merge(self.linklabel);

        // Update and restart the simulation.
        self.simulation.nodes(self.nodes);
        self.simulation.force("link").links(self.links);
        self.simulation.alpha(1).restart();
    }

    formatBytes(bytes: any) {
        if (bytes === null || bytes === 0) {
            return "";
        }

        if (bytes < 1024) {
            return bytes + "b";
        }

        bytes = (bytes / 1024).toFixed(1) + "KB";
        return bytes;
    }

    ticked() {
        try {
            this.node.attr("cx", (d: any) => d.x)
                .attr("cy", (d: any) => d.y);

            this.link.attr("d", function (d: any) {
                let dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y,
                    dr = Math.sqrt(dx * dx + dy * dy);
                return "M" +
                    d.source.x + "," +
                    d.source.y + "A" +
                    dr + "," + dr + " 0 0,1 " +
                    d.target.x + "," +
                    d.target.y;
            });

            this.nodelabel.attr("x", (d: any) => d.x)
                .attr("y", (d: any) => d.y - 16);

            // this.linklabel.attr("transform", function (d: any) {
            //     return "translate(" + (d.source.x + d.target.x) / 2 + "," + (d.source.y + d.target.y) / 2 + ")";
            // });

            this.linklabel.attr("transform", function (d: any) {
                let angle = Math.atan((d.source.y - d.target.y) / (d.source.x - d.target.x)) * 180 / Math.PI;
                return "translate(" + [((d.source.x + d.target.x) / 2), ((d.source.y + d.target.y) / 2)]
                    + ")rotate(" + angle + ")";
            });

        } catch (e) {
            console.error("tick[" + e + "]");
        }
    }

    zoomed() {
        // this.node.attr("transform", d3.event.transform);
        // this.link.attr("transform", d3.event.transform);
        // this.linklabel.attr("transform", d3.event.transform);
        // this.canvas.selectAll("text").attr("transform", d3.event.transform);
    }

    // boiler plate d3 click and drag functions
    dragstarted(d: any) {
        if (!d3.event.active) {
            this.simulation.alphaTarget(0.3).restart();
        }
        d.fx = d.x;
        d.fy = d.y;
    }

    dragged(d: any) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;

        // make boundaries
        if (d.fx < 0) {
            d.fx = 0;
        }
        if (d.fx > this.width) {
            d.fx = this.width;
        }
        if (d.fy < 0) {
            d.fy = 0;
        }
        if (d.fy > this.height) {
            d.fy = this.height;
        }
    }

    dragended(d: any) {
        if (!d3.event.active) {
            this.simulation.alphaTarget(0);
        }
    }

    dragStart() {
        console.log("start");
    }

    dragMove() {
        console.log("move");

        let source = d3.select("#rectHandler");

        let positionX = source.attr("x");
        let offsetX = event["offsetX"];
        let clientX = event["clientX"];
        let screenX = event["screenX"];
        let offsetY = event["offsetY"];
        let clientY = event["clientY"];

        let data = screenX - clientX;
        let data2 = screenX - positionX;

        console.log(event);

        // if (data < 30) {
        //     console.log("STOP");
        // }
    }

    dragEnd() {
        console.log("end");

    }

    mouseover(d: any, i: any) {
        // change cursor to pointer
        this.canvas.style("cursor", "pointer");
        // MUST GET THE RIGHT THIS FOR CALL BACK FUNCTIONS
        console.log("inner", i);
        d3.select(i).style("stroke", "blue");
        // let node_data = this.node.data();
        // d3.select(i).attr("fill", "red");
        // let test = d3.select(i);
        // console.log(d3.select(i));
        // d3.select(this).style("stroke", "blue");
        // for (let i in node_data) {
        //     if (node_data[i].id === d.id) {
        //         this.node.style("stroke", "blue");
        //     }
        // }
        // this.node.style("stroke", "blue");
        this.tooltip.transition()
            .duration(200)
            .style("opacity", 20);

        this.tooltip.html(this.getTooltip(d))
            .style("left", (d3.event.pageX + 30) + "px")
            .style("top", (d3.event.pageY - 12) + "px");
    }

    mouseout(d: any) {
        // change cursor back to move
        this.canvas.style("cursor", "move");
        this.tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    }

    getTooltip(node: any) {
        return "Host: " + this.nodeMap[node.id].server;
    }

    color(node: any) {
        let maxLength = 32;
        let i = this.map(node.group, 0, 100, 0, 255);
        let f = 0.3;
        let r = Math.round(Math.sin(f * i + 0) * 127 + 128);
        let g = Math.round(Math.sin(f * i + 2) * 127 + 128);
        let b = Math.round(Math.sin(f * i + 4) * 127 + 128);
        return "rgb(" + r + "," + g + "," + b + ")";
    }

    map(x: number, in_min: number, in_max: number, out_min: number, out_max: number) {
        return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }
}
