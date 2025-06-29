import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'

import './App.css'

import { TodoList } from './components/TodoList'
import { CreateTodo } from './components/CreateTodo'

import { get_todos, create_todo, delete_todo } from './api/endpoints'

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
    // update client side, update state by adding new todo.
    setTodos([todo, ...todos]);
  }

  const deleteTodo = async (id) => {
    const todo = await delete_todo(id);
    // handle client side, update state by filtering out todo.
    setTodos(todos.filter(todo => todo.id !== id));
  }

  return (
    <>
      <div className='App'>
        <div className='app-container'>
          <h1>Basic Todo App</h1>
          <small>You are running this application in <b>{process.env.NODE_ENV}</b> mode.</small>
          <CreateTodo add_todo={createTodo}/>
          <TodoList todo_data={todos} deleteTodo={deleteTodo}/>
        </div>
      </div>
    </>
  )
}

export default App
