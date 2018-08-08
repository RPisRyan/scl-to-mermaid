# scl-to-mermaid

Converts System Context Language to [Mermaid flowchart format](https://mermaidjs.github.io/flowchart.html).

## Overview

System Context Language (SCL) is a simple language for expressing concepts and relationships.

```
Flux Capacitor
  is in A DeLorean
  <Enables> Time Travel

Time Travel
  <Can Prevent> Getting Shot By Libyans
```

This library can convert SCL document to [Mermaid flowchart format](https://mermaidjs.github.io/flowchart.html):

```
graph TB
   TimeTravel(Time Travel)
   GettingShotByLibyans(Getting Shot By Libyans)
   FluxCapacitor -- Enables --> TimeTravel
   TimeTravel -- Can Prevent --> GettingShotByLibyans

   subgraph A DeLorean
      FluxCapacitor(Flux Capacitor)
   end
```

## Setup

`npm install`

## Usage

```javascript
import { toFlowchart } from 'scl-to-mermaid'

var flowchart = toFlowchart(sclDocument);
```

## Tests

`npm run tests`
