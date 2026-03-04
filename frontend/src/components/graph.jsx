import React, { useState, useEffect } from "react";
import axios from "axios";

const sampleGraph = {
  A: { B: 4, C: 2 },
  B: { A: 4, C: 5, D: 10 },
  C: { A: 2, B: 5, D: 3 },
  D: { B: 10, C: 3 }
};

function GraphVisualizer() {
  const [algorithm, setAlgorithm] = useState("dijkstra");
  const [steps, setSteps] = useState([]);
  const [path, setPath] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);

  const runAlgo = async () => {
    const res = await axios.post("http://localhost:8000/api/run/", {
      graph: sampleGraph,
      start: "A",
      end: "D",
      algorithm: algorithm,
      heuristic: { A: 7, B: 6, C: 2, D: 0 }
    });

    setSteps(res.data.steps);
    setPath(res.data.path);
    setStepIndex(0);
  };

  useEffect(() => {
    if (steps.length === 0) return;

    const interval = setInterval(() => {
      setStepIndex(prev => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [steps]);

  const currentStep = steps[stepIndex];

  return (
    <div>
      <h2>Shortest Path Visualizer</h2>

      <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
        <option value="dijkstra">Dijkstra</option>
        <option value="astar">A*</option>
        <option value="bellman-ford">Bellman-Ford</option>
      </select>

      <button onClick={runAlgo}>Run</button>

      <div style={{ marginTop: 20 }}>
        <h3>Step: {stepIndex}</h3>
        {currentStep && (
          <pre>{JSON.stringify(currentStep, null, 2)}</pre>
        )}
      </div>

      <div>
        <h3>Final Path:</h3>
        <p>{path.join(" → ")}</p>
      </div>
    </div>
  );
}

export default GraphVisualizer;