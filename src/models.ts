// graph TB

//     cat(<img src='https://i.imgur.com/dR11Api.jpg' width='400' />)
//    cat -- Get message --> leadTime 

//     subgraph NIKEiD Cloud
//         leadTime(Lead Time Calculation) 
//         libraryTraits(Library Traits)

//         leadTime -- Get upper bound --> libraryTraits 
//         leadTime -- Get translated message for LT ITEM --> libraryTraits 
 
//     end


export interface FlowchartNode {
  id: string;
  name: string;
  nodes?: FlowchartNode[];
  edges?: FlowchartEdge[];
  parent?: FlowchartNode;
  html?: string;
}

export interface FlowchartEdge {
  sourceId: string;
  targetId: string;
  label?: string;
}
