
import { FlowchartNode, FlowchartEdge } from './models';
import { toFlowchartModel } from './conversion';
import { SCLDocument, Concept } from 'scl-parser';

// graph TB

//     cat(<img src='https://i.imgur.com/dR11Api.jpg' width='400' />)
//    cat -- Get message --> leadTime 

//     subgraph NIKEiD Cloud
//         leadTime(Lead Time Calculation) 
//         libraryTraits(Library Traits)

//         leadTime -- Get upper bound --> libraryTraits 
//         leadTime -- Get translated message for LT ITEM --> libraryTraits 
 
//     end

describe('toFlowchartModel', () => {
  test('converts concept', () => {
    const sclDoc: SCLDocument = {
      name: 'DOC',
      concepts: [
        { name: 'C1' }
      ]
    }
    const flowchart: FlowchartNode = toFlowchartModel(sclDoc);

    expect(flowchart).toEqual({
      id: 'DOC',
      name: 'DOC',
      nodes: [
        {
          id: 'C1',
          name: 'C1'
        }
      ]
    })
  });

  test('converts relation', () => {
    const sclDoc: SCLDocument = {
      id: 'DOC',
      name: 'DOC',
      concepts: [
        { 
          name: 'C1', 
          relations: [
            { target: 'C2', label: 'C1toC2' }
          ] 
        },
        { name: 'C2' }
      ]
    }
    const flowchart: FlowchartNode = toFlowchartModel(sclDoc);

    expect(flowchart).toEqual({
      id: 'DOC',
      name: 'DOC',
      nodes: [
        {
          id: 'C1',
          name: 'C1'
        },
        {
          id: 'C2',
          name: 'C2'
        }
      ],
      edges: [
        {
          sourceId: 'C1',
          targetId: 'C2',
          label: 'C1toC2'
        }
      ]
    })
  });

  test('converts parent-child', () => {
    const sclDoc: SCLDocument = {
      name: 'DOC',
      concepts: [
        {
          name: 'C1'
        },
        { 
          name: 'C1.1',
          parent: 'C1'
        }
      ]
    };
    const flowchart: FlowchartNode = toFlowchartModel(sclDoc);

    expect(flowchart).toEqual({
      id: 'DOC',
      name: 'DOC',
      nodes: [
        {
          id: 'C1',
          name: 'C1',
          nodes: [
            {
              id: 'C1.1',
              name: 'C1.1'
            }
          ]
        }
      ]
    });

  });
});
