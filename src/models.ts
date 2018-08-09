

export interface FlowchartDiagram extends FlowchartNode {
  graphType: 'TB' | 'LR';
  styleStatements: string[];
}

export interface FlowchartNode {
  nodes?: FlowchartElement[];
  edges?: FlowchartEdge[];
}

export interface FlowchartElement extends FlowchartNode {
  id: string;
  name: string;
  parent?: FlowchartNode;
  html?: string;
}

export interface FlowchartEdge {
  sourceId: string;
  targetId: string;
  label?: string;
}
