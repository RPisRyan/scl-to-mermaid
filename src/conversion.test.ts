
import { FlowchartNode, FlowchartEdge } from './models';
import { toFlowchartModel } from './conversion';
import { SCLDocument, Concept } from 'scl-parser';

describe('toFlowchartModel', () => {
  test('converts concept', () => {
    const sclDoc: SCLDocument = {
      title: 'TB',
      concepts: [
        { name: 'C1' }
      ]
    }
    const flowchart: FlowchartNode = toFlowchartModel(sclDoc);

    expect(flowchart).toEqual({
      id: 'TB',
      name: 'TB',
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
      title: 'TB',
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
      id: 'TB',
      name: 'TB',
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

  test('synthesizes relation target', () => {
    const sclDoc: SCLDocument = {
      title: 'TB',
      concepts: [
        { 
          name: 'C1', 
          relations: [
            { target: 'C2', label: 'C1toC2' }
          ] 
        },
        // { name: 'C2' } this node should be synthesized
      ]
    }
    const flowchart: FlowchartNode = toFlowchartModel(sclDoc);

    expect(flowchart).toEqual({
      id: 'TB',
      name: 'TB',
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
      title: 'TB',
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
      id: 'TB',
      name: 'TB',
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

  test('converts undeclared parent', () => {
    const sclDoc: SCLDocument = {
      title: 'TB',
      concepts: [
        { 
          name: 'C1.1',
          parent: 'C1'
        }
      ]
    };
    const flowchart: FlowchartNode = toFlowchartModel(sclDoc);

    expect(flowchart).toEqual({
      id: 'TB',
      name: 'TB',
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
