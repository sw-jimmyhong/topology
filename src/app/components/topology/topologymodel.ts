export interface IGraph {
    nodes: INode[];
    links: ILink[];
}

// container
export interface INode {
    id: string;
    name: string;
    group: number; // host id
    server: string;
}

// actual link = states
export interface ILink {
    id: string;
    source: string;
    target: string;
    inBytes: number;
    outBytes: number;
}

// traffic b/w nodes
export interface IFlow {
    id: string;
    source: string;
    target: string;
    inBytes: number;
    outBytes: number;
}
