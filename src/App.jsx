import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'

import './App.css'

import { TodoList } from './components/TodoList'
import { CreateTodo } from './components/CreateTodo'

import { get_todos, create_todo } from './api/endpoints'

function App() {
  const [todos, setTodos] = useState([])

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
    setTodos([todo, ...todos])
  }

  return (
    <>
      <div className='App'>
        <div className='app-container'>
          <h1>Basic Todo App</h1>
          <CreateTodo add_todo={createTodo}/>
          <TodoList todo_data={todos}/>
        </div>
      </div>
    </>
  )
}

export default App
