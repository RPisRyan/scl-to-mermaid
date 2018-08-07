import { toFlowchart } from "./index";

const scl = `
Flux Capacitor
  is in A DeLorean
  <Enables> Time Travel

Time Travel
  <Can Prevent> Getting Shot By Libyans
`;

const expected = `
graph root
  TimeTravel(Time Travel)
  GettingShotByLibyans(Getting Shot By Libyans)
  TimeTravel -- Can Prevent --> GettingShotByLibyans

  subgraph A DeLorean
    FluxCapacitor(Flux Capacitor)
    FluxCapacitor -- Enables --> TimeTravel
  end
`;

describe('toFlowchart', () => {

  test('serializes SCL doc', () => {
    const flowchart = toFlowchart(scl);
    expect(flowchart.trim()).toEqual(expected.trim());
    
  });

});
