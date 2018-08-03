
import { FlowchartNode, FlowchartEdge } from './models';
import { SCLDocument, Concept, Relation, parseDocument } from 'scl-parser';

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

function concat<T>(array: T[] | undefined, item: T){
  return array ? array.concat(item) : [item];
}

function getNodeId(name: string){
  if(!name){
    return Math.random().toString(36).substring(7);
  }
  return name.replace(' ', '');
}
