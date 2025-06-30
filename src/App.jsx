import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'

import './App.css'

import { TodoList } from './components/TodoList'
import { CreateTodo } from './components/CreateTodo'
import { Osc1 } from './components/synth/Osc1'

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
  const [todos, setTodos] = useState([])
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
    frequency: osc1.frequency.value,
    detune: osc1.detune.value,
    type: osc1.type
  })

  const [filterSettings, setFilterSettings] = useState({
    frequency: filter.frequency.value,
    Q: filter.Q.value,
    type: filter.type
  })

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
    setFilterSettings({...filterSettings, [id]: value})
  }

  const changeFilterType = (e) => {
    let {id} = e.target;
    filter.type = id;
    setFilterSettings({...filterSettings, type: id})
  }

  return (
    <>
      <div className='App'>
        <div className='app-container'>
          <h1>React Synth</h1>
          <button onClick={() => {osc1.start()}}>start</button>
          <button onClick={() => {osc1.stop()}}>stop</button>
          <Osc1 
            settings={osc1Settings}
            changeSettings={changeOsc1} 
            changeType={changeOsc1Type}
            filterSettings={filterSettings}
            changeFilterSettings={changeFilter} 
            changeFilterType={changeFilterType}
          />
        </div>
      </div>
    </>
  )
}

export default App
