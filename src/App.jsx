import { useState, useEffect, useRef } from 'react'
import reactLogo from './assets/react.svg'

import './App.css'

import { TodoList } from './components/TodoList'
import { CreateTodo } from './components/CreateTodo'
import { Osc1 } from './components/synth/Osc1'
import Osc from './context/Osc'
import RippleCanvas from './components/RippleCanvas'
import { get_todos, create_todo, delete_todo } from './api/endpoints'

let actx = new AudioContext();
let out = actx.destination;
let osc1 = actx.createOscillator();
let gain1 = actx.createGain();
let filter = actx.createBiquadFilter();
osc1.connect(gain1);
gain1.connect(filter);
filter.connect(out);

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

  const [osc1Settings, setOsc1Settings] = useState({
    frequency: 1,
    detune: osc1.detune.value,
    type: osc1.type
  })

  const [filterSettings, setFilterSettings] = useState({
    frequency: filter.frequency.value,
    Q: filter.Q.value,
    type: "lowpass"
  })

  const osc1SettingsRef = useRef(osc1Settings);

  const changeOsc1 = (e) => {
    let {value, id} = e.target;
    osc1[id].value = value;
    setOsc1Settings({...osc1Settings, [id]: value})
  }

  const changeOsc1Type = (e) => {
    let {id} = e.target;
    osc1.type = id;
    setOsc1Settings({...osc1Settings, type: id})
  }

  const changeFilter = (e) => {
    let {value, id} = e.target;
    filter[id].value = value;
    console.log('filter ' + value);
    setFilterSettings({...filterSettings, [id]: value})
  }

  const changeFilterType = (e) => {
    let {id} = e.target;
    filter.type = id;
    setFilterSettings({...filterSettings, type: id})
  }

  useEffect(() => {
    osc1SettingsRef.current = osc1Settings;
  }, [osc1Settings]);

  const newNote = (rippleSettings, circlesRef) => {
    // rippleSettings does not need a ref 
    // a RippleCanvas useEffect creates a new interval to call this method with new values, removing the old one.
    const currentSettings = osc1SettingsRef.current;
    const currentCircles = circlesRef.current;
    new Osc(actx, gain1, currentSettings.frequency, rippleSettings, currentCircles);
  }

  return (
    <>
      <div className='App'>
        <div className='app-container'>
          <h1>Rain Synth</h1>
          <RippleCanvas playNote={newNote}/>
          <Osc1 
            settings={osc1Settings}
            changeSettings={changeOsc1} 
            filterSettings={filterSettings}
            changeFilterSettings={changeFilter} 
          />
        </div>
      </div>
    </>
  )
}

export default App
