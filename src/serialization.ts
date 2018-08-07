import { FlowchartNode } from "./models";

// graph TB

//     cat(<img src='https://i.imgur.com/dR11Api.jpg' width='400' />)
//    cat -- Get message --> leadTime 

//     subgraph NIKEiD Cloud
//         leadTime(Lead Time Calculation) 
//         libraryTraits(Library Traits)

//         leadTime -- Get upper bound --> libraryTraits 
//         leadTime -- Get translated message for LT ITEM --> libraryTraits 
 
//     end

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

export function serialize(node: FlowchartNode): string {
  // const lookup = createNodeLookup(node);
  const rootBlock = nodeToBlock(node) as StructuredBlock;
  return serializeBlock(rootBlock, '  ').join('\n');
}

function nodeToBlock(node: FlowchartNode, parent?: FlowchartNode): Block {
  const childNodes = node.nodes && [...node.nodes];

  if(!childNodes){
    return `${node.id}(${node.name})`;
  }

  childNodes.sort(c => c.nodes && c.nodes.length > 0 ? 1 : 0);

  const block: StructuredBlock = {
    pre: [],
    post: [],
    main: []
  };

  if(parent) {
    block.pre.push(`subgraph ${node.name}`);
    block.post.push(`end`);
  } else {
    block.pre.push(`graph ${node.name}`);
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

  return block;  
}
