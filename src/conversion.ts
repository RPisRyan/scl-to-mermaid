
import { FlowchartNode, FlowchartEdge } from './models';
import { SCLDocument, Concept, Relation, parseDocument } from 'scl-parser';

export function toFlowchartModel(sclDoc: SCLDocument): FlowchartNode {
  const conceptLookup = new Map<string, Concept>();
  const nodeLookup = new Map<string, FlowchartNode>();
  const root: FlowchartNode = {
    id: sclDoc.title ? getNodeId(sclDoc.title) : 'root',
    name: 'TB',
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

      if(parentNode){
        parentNode.nodes = concat(parentNode.nodes, node);
      } else {
        // synthesize parent
        parentNode = {
          id: parentId,
          name: concept.parent,
          nodes: [node],
          parent: root
        }
        nodeLookup.set(parentId, parentNode);
        root.nodes = concat(root.nodes, parentNode);
      }
      node.parent = parentNode;
    } else {
      root.nodes = concat(root.nodes, node);
      node.parent = root;
    }

  });
  
  const buildNodeContent = (node: FlowchartNode, parent?: FlowchartNode) => {
    const concept = conceptLookup.get(node.id);
    if(concept){

      if(concept.image){
        const imageAttrs: [string, string][] = [];
        imageAttrs.push(['src', concept.image]);
        imageAttrs.push(['alt', concept.name]);
        if(concept.width) {
          imageAttrs.push(['width', concept.width]);
        }
        if(concept.height) {
          imageAttrs.push(['height', concept.height]);
        }
        const attrString = imageAttrs.map(attr => `${attr[0]}='${attr[1]}'`).join(' ');
        node.html = `<img ${attrString} />`;
      }

      if(concept.relations){
        concept.relations.forEach((relation: Relation) => {
          const targetId = getNodeId(relation.target);
          let targetNode = nodeLookup.get(targetId);
          if(!targetNode) {
            // synthesize target node
            targetNode = {
              id: targetId,
              name: relation.target
            };
            root.nodes.push(targetNode);
            targetNode.parent = root;
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
          
          root.edges = concat(root.edges, edge);
        });
      }
    }
    if(node.nodes) {
      node.nodes.forEach(child => buildNodeContent(child, node));
    }
  };

  buildNodeContent(root, undefined);

  removeParentRefs(root);

  return root;
}

function removeParentRefs(node: FlowchartNode){
  delete node.parent;
  if(node.nodes){
    node.nodes.forEach(removeParentRefs);
  }
}

function concat<T>(array: T[] | undefined, item: T){
  return array ? array.concat(item) : [item];
}

function getNodeId(name: string){
  if(!name){
    return Math.random().toString(36).substring(7);
  }
  return name.replace(/ /g, '');
}
