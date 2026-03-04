import { useState } from "react";
import axios from "axios";

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [speed, setSpeed] = useState(500);
  const [algorithm, setAlgorithm] = useState("dijkstra");
  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);

  // Add node
  const addNode = (e) => {
    const rect = e.target.getBoundingClientRect();
    const newNode = {
      id: nodes.length,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      color: "lightblue",
    };
    setNodes([...nodes, newNode]);
  };

  // Connect nodes by clicking one then another
  const handleNodeClick = (id) => {
    if (selectedNode === null) {
      setSelectedNode(id);
    } else if (selectedNode !== id) {
      setEdges([...edges, { from: selectedNode, to: id, color: "black", weight: 1 }]);
      setSelectedNode(null);
    } else {
      setSelectedNode(null);
    }
  };

  // Set start/end nodes
  const handleSetStart = (id) => setStartNode(id);
  const handleSetEnd = (id) => setEndNode(id);

  // Run shortest path algorithm
  const runAlgorithm = async () => {
    if (nodes.length === 0 || edges.length === 0) return;

    const idToIndex = {};
    nodes.forEach((n, idx) => { idToIndex[n.id] = idx; });

    const graph = nodes.map(() => []);
    edges.forEach(e => {
      const fromIdx = idToIndex[e.from];
      const toIdx = idToIndex[e.to];
      graph[fromIdx].push([toIdx, e.weight ?? 1]);
      graph[toIdx].push([fromIdx, e.weight ?? 1]); // undirected
    });

    const startIdx = idToIndex[startNode ?? nodes[0].id];
    const endIdx = idToIndex[endNode ?? nodes[nodes.length - 1].id];

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/run/", {
        graph,
        start: startIdx,
        end: endIdx,
        algorithm,
      });

      const { steps, path } = res.data;
      console.log("hello")
     console.log(steps,path)
      // Animate node visits
      for (let step of steps) {
        if (step.current !== undefined) {
          const nodeId = nodes[step.current].id;
          setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, color: "orange" } : n));
        }
        await new Promise(r => setTimeout(r, speed));
      }

      // Highlight shortest path edges
      setEdges(prev => prev.map(e => {
        const fromIdx = idToIndex[e.from];
        const toIdx = idToIndex[e.to];
        let inPath = false;
        for (let i = 0; i < path.length - 1; i++) {
          if ((path[i] === fromIdx && path[i+1] === toIdx) || (path[i] === toIdx && path[i+1] === fromIdx)) {
            inPath = true;
            break;
          }
        }
        return { ...e, color: inPath ? "red" : "black" };
      }));

    } catch (err) {
      console.error("API error:", err);
    }
  };

  return (
    <div>
      <h1>Graph Algorithm Visualizer</h1>
      <div style={{ marginBottom: "10px" }}>
        Algorithm:
        <select value={algorithm} onChange={e => setAlgorithm(e.target.value)}>
          <option value="dijkstra">Dijkstra</option>
          <option value="astar">A*</option>
          <option value="bellman-ford">Bellman-Ford</option>
        </select>
        <input
          type="range"
          min="100"
          max="2000"
          step="100"
          value={speed}
          onChange={e => setSpeed(Number(e.target.value))}
        />
        Speed: {speed} ms
        <button onClick={runAlgorithm}>Run</button>
      </div>

      <svg
        width={800}
        height={600}
        style={{ border: "1px solid black" }}
        onClick={addNode}
      >
        {/* Draw edges */}
        {edges.map((e, idx) => (
          <line
            key={idx}
            x1={nodes[e.from]?.x}
            y1={nodes[e.from]?.y}
            x2={nodes[e.to]?.x}
            y2={nodes[e.to]?.y}
            stroke={e.color}
            strokeWidth={4}
          />
        ))}

        {/* Draw nodes */}
        {nodes.map(n => (
          <circle
            key={n.id}
            cx={n.x}
            cy={n.y}
            r={20}
            fill={n.color}
            stroke={n.id === startNode ? "green" : n.id === endNode ? "purple" : "black"}
            strokeWidth={n.id === startNode || n.id === endNode ? 3 : 1}
            onClick={(e) => {
              e.stopPropagation();
              handleNodeClick(n.id);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              if (!startNode) handleSetStart(n.id);
              else if (!endNode) handleSetEnd(n.id);
            }}
          />
        ))}
      </svg>
      <p>Right-click nodes to set Start (green) / End (purple)</p>
    </div>
  );
}

export default App;