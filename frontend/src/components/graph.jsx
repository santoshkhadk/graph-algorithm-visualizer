// import { useState, useEffect } from "react";
// import axios from "axios";

// function App() {
//   const [nodes, setNodes] = useState([]);
//   const [edges, setEdges] = useState([]);
//   const [selectedNode, setSelectedNode] = useState(null);
//   const [speed, setSpeed] = useState(500);
//   const [algorithm, setAlgorithm] = useState("dijkstra");

//   // Add node
//   const addNode = (e) => {
//     const rect = e.target.getBoundingClientRect();
//     setNodes([...nodes, {
//       id: nodes.length,
//       x: e.clientX - rect.left,
//       y: e.clientY - rect.top,
//       color: "lightblue"
//     }]);
//   };

//   // Connect nodes by clicking one then another
//   const handleNodeClick = (id) => {
//     if (selectedNode === null) {
//       setSelectedNode(id);
//     } else if (selectedNode !== id) {
//       setEdges([...edges, { from: selectedNode, to: id, color: "black", weight: 1 }]);
//       setSelectedNode(null);
//     } else {
//       setSelectedNode(null);
//     }
//   };

//   // Animate shortest path
//   const runAlgorithm = async () => {
//     // build adjacency list
//     const graph = nodes.map(() => []);
//     edges.forEach(e => {
//       graph[e.from].push([e.to, e.weight]);
//       graph[e.to].push([e.from, e.weight]); // undirected
//     });

//     const start = 0;
//     const end = nodes.length - 1;

//     const res = await axios.post("http://127.0.0.1:8000/api/run/", {
//       graph, start, end, algorithm
//     });

//     const { steps, path } = res.data;

//     // animate path
//     for (let step of steps) {
//       if (step.current !== undefined) {
//         setNodes(prev => prev.map(n => n.id === step.current ? { ...n, color: "orange" } : n));
//       }
//       await new Promise(r => setTimeout(r, speed));
//     }

//     // highlight shortest path
//     setEdges(prev => prev.map(e => path.includes(e.from) && path.includes(e.to) ? { ...e, color: "red" } : e));
//   };

//   return (
//     <div>
//       <h1>Graph Algorithm Visualizer</h1>
//       <div>
//         Algorithm:
//         <select value={algorithm} onChange={e => setAlgorithm(e.target.value)}>
//           <option value="dijkstra">Dijkstra</option>
//           <option value="astar">A*</option>
//           <option value="bellman-ford">Bellman-Ford</option>
//         </select>
//         <input type="range" min="100" max="2000" step="100" value={speed}
//           onChange={e => setSpeed(Number(e.target.value))} />
//         Speed: {speed} ms
//         <button onClick={runAlgorithm}>Run</button>
//       </div>

//       <svg width={800} height={600} style={{ border: "1px solid black" }} onClick={addNode}>
//         {edges.map((e, idx) => (
//           <line key={idx}
//             x1={nodes[e.from]?.x} y1={nodes[e.from]?.y}
//             x2={nodes[e.to]?.x} y2={nodes[e.to]?.y}
//             stroke={e.color} strokeWidth={4}
//           />
//         ))}
//         {nodes.map(n => (
//           <circle key={n.id} cx={n.x} cy={n.y} r={20} fill={n.color}
//             onClick={(e) => { e.stopPropagation(); handleNodeClick(n.id); }}
//           />
//         ))}
//       </svg>
//     </div>
//   );
// }

// export default App;