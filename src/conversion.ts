
import { FlowchartElement, FlowchartEdge, FlowchartDiagram, FlowchartNode } from './models';
import { SCLDocument, Concept, Relation, parseDocument } from 'scl-parser';

export function toFlowchartModel(sclDoc: SCLDocument): FlowchartDiagram {
  const conceptLookup = new Map<string, Concept>();
  const nodeLookup = new Map<string, FlowchartElement>();
  const root: FlowchartDiagram = {
    graphType: 'TB',
    nodes: [],
    edges: [],
    styleStatements: []
  };

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
  
  const buildNodeContent = (element: FlowchartElement, parent?: FlowchartNode) => {
    const concept = conceptLookup.get(element.id);
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
        element.html = `<img ${attrString} />`;
        if(root.styleStatements.length === 0){
          root.styleStatements.push('classDef inlineImage fill:none,stroke:none');
        }
        root.styleStatements.push(`class ${element.id} inlineImage`);
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
            sourceId: element.id,
            targetId: targetId,
            label: relation.label
          };

          if(!parent){
            throw new Error(`Cannot add edges because node ${element.id} does not have parent`);
          }
          
          root.edges = concat(root.edges, edge);
        });
      }
    }

    buildNodeChildren(element);
  };

  const buildNodeChildren = (container: FlowchartNode, parent?: FlowchartNode) => {
    if(container.nodes) {
      container.nodes.forEach(child => buildNodeContent(child, container));
    }
  }

  buildNodeChildren(root);

  removeParentRefs(root);

  return root;
}

function removeParentRefs(node: FlowchartNode){
  if((node as FlowchartElement).parent) {
    delete (node as FlowchartElement).parent;
  }
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
