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
osc1.connect(gain1);
gain1.connect(out);

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
  const [osc1Freq, setOsc1Freq] = useState(osc1.frequency.value)

  const changeOsc1Freq = (e) => {
    let {value} = e.target;
    osc1.frequency.value = value;
    setOsc1Freq(value);
  }



  return (
    <>
      <div className='App'>
        <div className='app-container'>
          <h1>React Synth</h1>
          <button onClick={() => {osc1.start()}}>start</button>
          <button onClick={() => {osc1.stop()}}>stop</button>
          <Osc1 freq={osc1Freq} changeFreq={changeOsc1Freq}/>
        </div>
      </div>
    </>
  )
}

export default App
