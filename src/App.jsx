import { useState, useEffect, useRef } from 'react'
import reactLogo from './assets/react.svg'

import './App.css'

import { TodoList } from './components/TodoList'
import { CreateTodo } from './components/CreateTodo'
import { SynthSettings } from './components/synth/SynthSettings'
import ReverbControls from './components/synth/Reverb'
import Osc from './context/Osc'
import RippleCanvas from './components/RippleCanvas'
import { get_todos, create_todo, delete_todo } from './api/endpoints'

let actx = new AudioContext();
let out = actx.destination;
let osc = actx.createOscillator();
let gain = actx.createGain();
let filter = actx.createBiquadFilter();
osc.connect(gain);
gain.connect(filter);
// filter.connect(out);

function App() {
  const [todos, setTodos] = useState([]);
  // ************* Todo List stuff
  // run this code to fetch todos on page load or whenever something in brackets changes.
  useEffect(() => {
    const fetchTodos = async () => {
      const todos = await get_todos();
      setTodos(todos);
      console.log(todos);
    }
    fetchTodos();
  }, [])

  const createTodo = async (todo_name) => {
    const todo = await create_todo(todo_name);
    // update client side, update state by adding new todo.
    setTodos([todo, ...todos]);
  }

  const deleteTodo = async (id) => {
    const todo = await delete_todo(id);
    // handle client side, update state by filtering out todo.
    setTodos(todos.filter(todo => todo.id !== id));
  }


  // ************** Audio stuff

  const [synthSettings, setSynthSettings] = useState({
    frequency: 1,
    detune: osc.detune.value,
    type: osc.type
  })

  const [filterSettings, setFilterSettings] = useState({
    frequency: 589,
    Q: filter.Q.value,
    type: "lowpass"
  })

  const [rippleSpeed, setRippleSpeed] = useState(25);

  const changeSynthSettings = (e) => {
    let {value, id} = e.target;
    osc[id].value = value;
    setSynthSettings({...synthSettings, [id]: value})
  }

  const changeFilterSettings = (e) => {
    let {value, id} = e.target;
    filter[id].value = value;
    setFilterSettings({...filterSettings, [id]: value})
  }

  const newNote = (rippleSettings, circlesRef, synthSettingsRef) => {
    // rippleSettings does not need a ref 
    // a RippleCanvas useEffect creates a new interval to call this method with new values, removing the old one.
    const currentSynthSettings = synthSettingsRef.current;
    const currentCircles = circlesRef.current;
    new Osc(actx, gain, currentSynthSettings.frequency, rippleSettings, currentCircles);
  }

  return (
    <>
      <div className='App'>
        <div className='app-container'>
          <h1>Rain Synth</h1>
          <RippleCanvas 
            playNote={newNote} 
            onRippleSpeedChange={setRippleSpeed} 
            filterSettings={filterSettings}
            synthSettings={synthSettings}
          />
          <SynthSettings 
            synthSettings={synthSettings}
            changeSynthSettings={changeSynthSettings} 
            filterSettings={filterSettings}
            changeFilterSettings={changeFilterSettings} 
          />
          <ReverbControls
            audioCtx={actx}
            inputNode={filter}
            outputNode={actx.destination}
            rippleSpeed={rippleSpeed}
          />
        </div>
      </div>
    </>
  )
}

export default App
