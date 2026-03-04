import { useState, useRef } from "react";
import axios from "axios";
import "./App.css"; // We'll add styles here

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [speed, setSpeed] = useState(500);
  const [algorithm, setAlgorithm] = useState("dijkstra");
  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);

  const svgRef = useRef(null);
  const dragNodeRef = useRef(null);

  // Add node
  const addNode = (e) => {
    if (e.target.tagName !== "svg") return;
    const rect = svgRef.current.getBoundingClientRect();
    const newNode = {
      id: nodes.length,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      color: "lightblue",
    };
    setNodes([...nodes, newNode]);
  };

  // Connect nodes
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

  // Start/End node
  const handleSetStart = (id) => setStartNode(id);
  const handleSetEnd = (id) => setEndNode(id);

  // Drag nodes
  const handleMouseDown = (e, node) => {
    e.stopPropagation();
    dragNodeRef.current = node.id;
  };

  const handleMouseMove = (e) => {
    if (dragNodeRef.current === null) return;
    const rect = svgRef.current.getBoundingClientRect();
    setNodes((prev) =>
      prev.map((n) =>
        n.id === dragNodeRef.current
          ? { ...n, x: e.clientX - rect.left, y: e.clientY - rect.top }
          : n
      )
    );
  };

  const handleMouseUp = () => {
    dragNodeRef.current = null;
  };

  // Delete node
  const handleNodeDelete = (nodeId) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((e) => e.from !== nodeId && e.to !== nodeId));
    if (startNode === nodeId) setStartNode(null);
    if (endNode === nodeId) setEndNode(null);
  };

  // Edit edge weight
  const handleEdgeDoubleClick = (idx) => {
    const newWeight = parseInt(prompt("Enter edge weight:", edges[idx].weight));
    if (!isNaN(newWeight)) {
      setEdges((prev) => prev.map((e, i) => (i === idx ? { ...e, weight: newWeight } : e)));
    }
  };

  // Run algorithm
  const runAlgorithm = async () => {
    if (nodes.length === 0 || edges.length === 0) return;

    const idToIndex = {};
    nodes.forEach((n, idx) => (idToIndex[n.id] = idx));

    const graph = nodes.map(() => []);
    edges.forEach((e) => {
      const fromIdx = idToIndex[e.from];
      const toIdx = idToIndex[e.to];
      const w = e.weight ?? 1;
      graph[fromIdx].push([toIdx, w]);
      graph[toIdx].push([fromIdx, w]);
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

      // Animate nodes
      for (let step of steps) {
        if (step.current !== undefined) {
          const nodeId = nodes[step.current].id;
          setNodes((prev) =>
            prev.map((n) => (n.id === nodeId ? { ...n, color: "orange" } : n))
          );
        }
        await new Promise((r) => setTimeout(r, speed));
      }

      // Highlight edges along path
      setEdges((prev) =>
        prev.map((e) => {
          const fromIdx = idToIndex[e.from];
          const toIdx = idToIndex[e.to];
          let inPath = false;
          for (let i = 0; i < path.length - 1; i++) {
            if (
              (path[i] === fromIdx && path[i + 1] === toIdx) ||
              (path[i] === toIdx && path[i + 1] === fromIdx)
            ) {
              inPath = true;
              break;
            }
          }
          return { ...e, color: inPath ? "red" : "black" };
        })
      );
    } catch (err) {
      console.error("API error:", err);
    }
  };
const resetGraph = () => {
  setNodes(prev =>
    prev.map(n => ({
      ...n,
      color: "lightblue"
    }))
  );

  setEdges(prev =>
    prev.map(e => ({
      ...e,
      color: "black"
    }))
  );
};

  return (
    <div className="container">
      <h1>Graph Algorithm Visualizer</h1>
      
    <div className="instructions ">
        <h2>Instructions:</h2>
        <ul>
          <li>Click on empty space to add a node.</li>
          <li>Click on one node then another to create an edge.</li>
          <li>Right-click a node to set Start (green) or End (purple).</li>
          <li>Shift + Right-click a node to delete it.</li>
          <li>click an edge to edit its weight.</li>
          <li>Drag nodes to reposition them.</li>
          <li>Select algorithm and speed, then click "Run" to visualize shortest path.</li>
        </ul>
      </div>
<div className="controls ">
        Algorithm:
        <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
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
          onChange={(e) => setSpeed(Number(e.target.value))}
        />
        Speed: {speed} ms
       <button onClick={runAlgorithm}>Run</button>
<button onClick={resetGraph}>Reset</button>
      </div>

      <svg
        ref={svgRef}
        width={1000}
        height={400}
        style={{ border: "1px solid black", marginTop: "10px" }}
        onClick={addNode}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
      {edges.map((e, idx) => {
  const from = nodes[e.from];
  const to = nodes[e.to];
  if (!from || !to) return null;

  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  // Calculate small perpendicular offset
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  const offset = 15; // distance from line
  const offsetX = -dy / length * offset;
  const offsetY = dx / length * offset;

  return (
    <g key={idx}>
      {/* Edge */}
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={e.color}
        strokeWidth={4}
        onClick={() => handleEdgeDoubleClick(idx)}
        style={{ cursor: "pointer" }}
      />

      {/* Weight label */}
      <text
        x={midX + offsetX}
        y={midY + offsetY}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="14"
        fill="black"
        style={{
          pointerEvents: "none",
          fontWeight: "bold",
          background: "white"
        }}
      >
        {e.weight}
      </text>
    </g>
  );
})}
        {nodes.map((n) => (
          <circle
            key={n.id}
            cx={n.x}
            cy={n.y}
            r={20}
            fill={n.color}
            stroke={n.id === startNode ? "green" : n.id === endNode ? "purple" : "black"}
            strokeWidth={n.id === startNode || n.id === endNode ? 3 : 1}
            onClick={(e) => { e.stopPropagation(); handleNodeClick(n.id); }}
            onContextMenu={(e) => {
              e.preventDefault();
              if (e.shiftKey) handleNodeDelete(n.id);
              else if (!startNode) handleSetStart(n.id);
              else if (!endNode) handleSetEnd(n.id);
            }}
            onMouseDown={(e) => handleMouseDown(e, n)}
          />
        ))}
      </svg>
    </div>
  );
}

export default App;