
import { FlowchartNode, FlowchartEdge } from './models';
import { SCLDocument, Concept, Relation, parseDocument } from 'scl-parser';

const doc = `
Flux Capacitor
  is in A DeLorean
  <Enables> Time Travel
  has image at https://i.imgur.com/GyMCJOW.jpg

Time Travel
  <Can Prevent> Terrorist Attacks
`;
;

// export const sclDoc: SCLDocument[] = parseDocument(doc);

// Temporary structure for construction of graph
// interface FlowchartBuildNode extends FlowchartNode {
//   concept: Concept;
// }

function concat<T>(array: T[] | undefined, item: T){
  return array ? array.concat(item) : [item];
}

export function toFlowchartModel(sclDoc: SCLDocument): FlowchartNode {
  const conceptLookup = new Map<string, Concept>();
  const nodeLookup = new Map<string, FlowchartNode>();
  const root: FlowchartNode = {
    id: sclDoc.name ? getNodeId(sclDoc.name) : 'root',
    name: sclDoc.name || 'root',
    nodes: []
  };
  nodeLookup.set('root', root);
  // created nodes
  sclDoc.concepts.forEach((concept: Concept) => {
    const id = getNodeId(concept.name);
    const node = {
      id,
      name: concept.name
    };
    conceptLookup.set(id, concept);
    nodeLookup.set(id, node);
  });

  // build tree by adding node to declared parent
  Array.from(nodeLookup.values()).forEach((node) => {
    if(node === root){
      // root will not have parent
      return;
    }

    const concept = conceptLookup.get(node.id);
    if(!concept){
      throw new Error(`Could not find concept for ${JSON.stringify(node)}`);
    }

    if(concept.parent){
      const parentId = getNodeId(concept.parent);
      let parentNode = nodeLookup.get(parentId);

      if(!parentNode) {
        // synthesize parent
        parentNode = {
          id: parentId,
          name: concept.parent.name,
          nodes: [node]
        }
        nodeLookup.set(parentId, parentNode);
      }
      parentNode.nodes = concat(parentNode.nodes, node);

    } else {
      root.nodes = concat(root.nodes, node);
    }

  });
  
  const buildNodeContent = (node: FlowchartNode, parent?: FlowchartNode) => {
    const concept = conceptLookup.get(node.id);
    if(concept){
      if(concept.relations){
        concept.relations.forEach((relation: Relation) => {
          const targetId = getNodeId(relation.target);
          let targetNode = nodeLookup.get(targetId);
          if(!targetNode){
            targetNode = {
              id: targetId,
              name: relation.target
            };
            nodeLookup.set(targetId, targetNode);
          }
          const edge: FlowchartEdge = {
            sourceId: node.id,
            targetId: targetId,
            label: relation.label
          };

          if(!parent){
            throw new Error(`Cannot add edges because node ${node.id} does not have parent`);
          }

          parent.edges = concat(parent.edges, edge);
        });
      }
    }
    if(node.nodes) {
      node.nodes.forEach(child => buildNodeContent(child, node));
    }
  };

  buildNodeContent(root, undefined);

  return root;
}

// function buildTree(concepts: Concept[]): ConceptNode {
//   const nodeLookup = new Map<string, ConceptNode>();
//   const root: ConceptNode = {
//     concept: { name: 'root' },
//     children: []
//   };
//   nodeLookup.set('root', root);

//   concepts.forEach(concept => {
//     const node = {
//       concept,
//       children: []
//     };
//     nodeLookup.set(concept.name, node);
//   });

//   // generate tree
//   nodeLookup.forEach((node) => {
//     if(node.concept.parent){
//       let parentNode = nodeLookup.get(node.concept.parent);
//       if(parentNode) {
//         parentNode.children.push(node);
//       } else {
//         // synthesize node for parent
//         parentNode = {
//           concept: {
//             name: node.concept.parent
//           },
//           children: [node]
//         };
//         // add to lookup
//         nodeLookup.set(parentNode.concept.name, parentNode);
//       }
//     } else {
//       root.children.push(node);
//     }
//   });
  
//   return root;
// }

// function iterate(node: ConceptNode, visitor: (node: ConceptNode) => {}) {
//   visitor(node);
//   node.children.forEach(child => iterate(child, visitor));
// }

// export function toFlowchartModel(sclDoc: SCLDocument): FlowchartNode {
//   const nodes: Map<string, Flowchart.LeafNode> = new Map<string, Flowchart.LeafNode>();
//   const edges: Flowchart.Edge[] = [];

//   const conceptTree = toConceptTree(sclDoc.concepts);

//   const visitNode = (node: ConceptNode) => {
//     if(node.children.length > 0){
//       const graph = {
//         name: node.concept.name,
//         id: getNodeId(node.concept.name),
//         children: [],
//         subgraphs: []
//       } as FlowchartNode;
//       node.flowchartElement = graph;
      
//       node.children.forEach((subNode) => {
//         graph
//         visitNode(node);
//       })
//     }
//   };

//   // iterate(conceptTree, (node) => {

//   // });


//   sclDoc.concepts.forEach((concept: Concept) => {
//     const nodeId = getNodeId(concept.name);



//     if(!nodes.has(nodeId)) {
//       nodes.set(nodeId, {
//         id: nodeId,
//         name: concept.name
//       });
//     }

//     if(concept.relations) {
//       concept.relations.forEach((relation: Relation) => {
//         edges.push({
//           sourceId: getNodeId(concept.name),
//           targetId: getNodeId(relation.target),
//           label: relation.label
//         })
//       });
//     }
//   });

//   return {
//     name: sclDoc.name,
//     children: [...nodes.values()],
//     edges
//   };
// }

function getNodeId(name: string){
  if(!name){
    return Math.random().toString(36).substring(7);
  }
  return name.replace(' ', '');
}

function nextChar(c: string): string {
  return String.fromCharCode(c.charCodeAt(0) + 1);
}