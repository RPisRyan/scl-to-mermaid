import { toFlowchartModel } from './conversion';
import { serialize } from './serialization';
import { parseDocument } from 'scl-parser';

export * from './conversion';

export function toFlowchart(scl: string): string {
  const sclDoc = parseDocument(scl);
  const flowchartModel = toFlowchartModel(sclDoc);
  return serialize(flowchartModel);
}
