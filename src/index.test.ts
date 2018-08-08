import { toFlowchart } from "./index";

describe('toFlowchart', () => {

  test('serializes SCL doc', () => {

    const scl = `
Flux Capacitor
  is in A DeLorean
  <Enables> Time Travel

Time Travel
  <Can Prevent> Getting Shot By Libyans
`;

    const expected = `
graph TB
   TimeTravel(Time Travel)
   GettingShotByLibyans(Getting Shot By Libyans)
   FluxCapacitor -- Enables --> TimeTravel
   TimeTravel -- Can Prevent --> GettingShotByLibyans

   subgraph A DeLorean
      FluxCapacitor(Flux Capacitor)
   end
`;

    const flowchart = toFlowchart(scl);
    expect(flowchart.trim()).toEqual(expected.trim());
    
  });


  test('serializes another SCL doc', () => {

    const scl = `
Library Traits
  is in NIKEiD Cloud

NIKEiD Tools
  is in NIKEiD Terrestrial
  <Save EN Messages> Library Traits
    `;

    const expected = `
graph TB
   NIKEiDTools -- Save EN Messages --> LibraryTraits

   subgraph NIKEiD Terrestrial
      NIKEiDTools(NIKEiD Tools)
   end

   subgraph NIKEiD Cloud
      LibraryTraits(Library Traits)
   end
    `;

    const flowchart = toFlowchart(scl);
    expect(flowchart.trim()).toEqual(expected.trim());

  });

  test('concept synthesized for relation target should be in root', () => {

    const scl = `
Concept C1
  is in Group G1
  <Relation C1C2> Concept C2`;

    const expected = `
graph TB
   ConceptC2(Concept C2)
   ConceptC1 -- Relation C1C2 --> ConceptC2

   subgraph Group G1
      ConceptC1(Concept C1)
   end
    `;

    const flowchart = toFlowchart(scl);
    expect(flowchart.trim()).toEqual(expected.trim());

  });

  test('all edges should be added to root', () => {

    const scl = `
Concept C1
  <Relation R1> Concept C2
 
Concept C2
  is in Group G1
  <Relation R2> Concept C3
   `;

    const expected = `
graph TB
   ConceptC1(Concept C1)
   ConceptC3(Concept C3)
   ConceptC1 -- Relation R1 --> ConceptC2
   ConceptC2 -- Relation R2 --> ConceptC3

   subgraph Group G1
      ConceptC2(Concept C2)
   end
    `;

    const flowchart = toFlowchart(scl);
    expect(flowchart.trim()).toEqual(expected.trim());

  });

});
