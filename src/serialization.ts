import { FlowchartElement, FlowchartDiagram, FlowchartNode } from "./models";

type Block = StructuredBlock | string;

interface StructuredBlock {
  pre: string[];
  main: Block[];
  post: string[];
}

function serializeBlock(block: StructuredBlock, indentString: string): string[] {

  if(typeof block === 'undefined'){
    return [];
  }

  const lines = [];
    block.pre.forEach(l => lines.push(l));
    block.main.forEach((child) => {
      if(typeof child === 'string'){
        lines.push(indentString + child);
      } else {
        const childLines = serializeBlock(child, indentString);
        if(childLines.length > 0){
          lines.push('');
        }
        childLines.forEach((childLine) => {
          lines.push(indentString + childLine);
        });
      }
    })
    block.post.forEach(l => lines.push(l));
  return lines;
}

export function serialize(flowchart: FlowchartDiagram): string {
  const diagramBlock = nodeToBlock(flowchart) as StructuredBlock;
  return serializeBlock(diagramBlock, '   ').join('\n');
}

function nodeToBlock(node: FlowchartNode, parent?: FlowchartNode): Block {
  const childNodes = node.nodes && [...node.nodes];

  const asElement = node as FlowchartElement;
  const asDiagram = node as FlowchartDiagram;
  const isDiagramNode = Boolean(asDiagram.graphType);
  
  if(asElement.html){
    return `${asElement.id}(${asElement.html})`;
  }

  if(!childNodes){
    return `${asElement.id}(${asElement.name})`;
  }

  childNodes.sort(c => c.nodes && c.nodes.length > 0 ? 1 : 0);

  const block: StructuredBlock = {
    pre: [],
    post: [],
    main: []
  };

  if(parent) {
    block.pre.push(`subgraph ${asElement.name}`);
    block.post.push(`end`);
  } else {
    block.pre.push(`graph ${asDiagram.graphType}`);
  }

  const structuredChildren = [];
  childNodes.forEach((childNode) => {
    const childBlock = nodeToBlock(childNode, node);
    if(typeof childBlock === 'string'){
      // immediately push literal
      block.main.push(childBlock);
    } else {
      // save structured block for later
      structuredChildren.push(childBlock);
    }
  });

  if(node.edges){
    const edgeLines = node.edges.map((edge) => {
      if(edge.label) {
        return `${edge.sourceId} -- ${edge.label} --> ${edge.targetId}`;
      } else {
        return `${edge.sourceId} --> ${edge.targetId}`;
      }
    });
    block.main = block.main.concat(edgeLines);
  }

  // structured children at end of main
  block.main = block.main.concat(structuredChildren);

  if(isDiagramNode){
    block.main = block.main.concat(asDiagram.styleStatements);
  }

  return block;  
}
