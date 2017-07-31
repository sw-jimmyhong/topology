import { Component, OnInit } from '@angular/core';
import { TopologyViz } from "./topology";
import * as TopologyModel from "./topologymodel";
import { Http } from "@angular/http";
// import "./topology.less";
// importing test data
import { NODES, LINKS } from './data';

@Component({
  selector: 'app-topology',
  templateUrl: './topology.component.html',
  styleUrls: ['./topology.component.css']
})
export class TopologyComponent implements OnInit {

  constructor() {
  }

  viz: TopologyViz;

  graph: TopologyModel.IGraph = {
    nodes: [],
    links: []
  };


  ngOnInit() {
    let self = this;
    self.viz = new TopologyViz("#viz");
    self.viz.onmounted();
    self.onload();
  }

  onUpdate(newInventory: TopologyModel.IGraph) {

    let self = this;
    if (newInventory != null) {
      self.viz.graphLoaded(newInventory);
    }
  }

  // button click events
  eventClick(event) {
    let self = this;
    let input = event.target.id;
    if (input === "split") {
      self.viz.splitHost();
    }
    if (input === "combine") {
      self.viz.combineHost();
    }
    if (input === "hide") {
      self.viz.hideLinks();
    }
    if (input === "show") {
      self.viz.showLinks();
    }
  }

  inputChange(event) {
    console.log("on change");
    let self = this;
    self.viz.updateForce(event.target.value);
  }

  onload() {
    let self = this;

    // This should moved to a the topology controller.
    // let graph: TopologyModel.IGraph = {
    //   nodes: [],
    //   links: []
    // };

    for (let n of NODES) {
      let node: TopologyModel.INode = {
        id: n.id,
        name: n.name,
        group: n.group,
        server: n.server
      };
      this.graph.nodes.push(node);
    }
    for (let l of LINKS) {
      let link: TopologyModel.ILink = {
        id: l.id,
        source: l.source,
        target: l.target,
        inBytes: l.inBytes,
        outBytes: l.outBytes
      };

      this.graph.links.push(link);
    }
    self.viz.graphLoaded(this.graph);
  }
}
