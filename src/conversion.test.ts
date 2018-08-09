import { FlowchartElement, FlowchartEdge, FlowchartDiagram } from './models';
import { toFlowchartModel } from './conversion';
import { Concept } from 'scl-parser';

describe('toFlowchartModel', () => {
  test('converts concept', () => {
    expectConvertResult(
      [
        { name: 'C1' }
      ],
      [
        {
          id: 'C1',
          name: 'C1'
        }
      ]
    );
  });

  test('converts relation', () => {
    expectConvertResult(
      [
        { 
          name: 'C1', 
          relations: [
            { target: 'C2', label: 'C1toC2' }
          ] 
        },
        { name: 'C2' }
      ],
      [
        {
          id: 'C1',
          name: 'C1'
        },
        {
          id: 'C2',
          name: 'C2'
        }
      ],
      [
        {
          sourceId: 'C1',
          targetId: 'C2',
          label: 'C1toC2'
        }
      ]
    );
  });

  test('synthesizes relation target', () => {
    expectConvertResult(
      [
        { 
          name: 'C1', 
          relations: [
            { target: 'C2', label: 'C1toC2' }
          ] 
        },
        // { name: 'C2' } this node should be synthesized
      ],
      [
        {
          id: 'C1',
          name: 'C1'
        },
        {
          id: 'C2',
          name: 'C2'
        }
      ],
      [
        {
          sourceId: 'C1',
          targetId: 'C2',
          label: 'C1toC2'
        }
      ]
    );
  });

  test('converts parent-child', () => {
    expectConvertResult(
      [
        {
          name: 'C1'
        },
        { 
          name: 'C1.1',
          parent: 'C1'
        }
      ],
      [
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
      ],
    );
  });

  test('converts undeclared parent', () => {
    expectConvertResult(
      { 
        name: 'C1.1',
        parent: 'C1'
      },
      [
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
      ],
    );
  });

  test('converts image', () => {
    expectConvertResult(
      { 
        name: 'Concept with image',
        image: 'img/cat.jpg',
        width: '400',
        height: '300'
      }, 
      [
        {
          id: 'Conceptwithimage',
          name: 'Concept with image',
          html: `<img src='img/cat.jpg' alt='Concept with image' width='400' height='300' />`
        }
      ]
    );
  });

});

function expectConvertResult(conceptsInput: Concept | Concept[], 
  expectedElements: FlowchartElement[], 
  expectedEdges?: FlowchartEdge[]){
  const concepts: Concept[] = conceptsInput instanceof Array ? conceptsInput : [ conceptsInput ];
  const flowchart: FlowchartDiagram = toFlowchartModel({
    concepts
  });
  expect(flowchart.nodes).toEqual(expectedElements);
  expect(flowchart.edges).toEqual(expectedEdges || []);
}
