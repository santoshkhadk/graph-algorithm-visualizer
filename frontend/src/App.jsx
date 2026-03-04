import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import GraphVisualizer from './components/graph'

function App() {
  const [count, setCount] = useState(0)

  return (
  
    <>
    <GraphVisualizer></GraphVisualizer>
    </>
  )
}

export default App
