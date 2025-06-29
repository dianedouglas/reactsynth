import { Todo } from './Todo'

export function TodoList({todo_data, deleteTodo}){
	return (
		<div className="todo">
			{todo_data.map(todo => {
				return (
					<Todo 
						id={todo.id}  
						key={todo.id} 
						completed={todo.completed} 
						title={todo.todo_name}
						deleteTodo={deleteTodo}
					/>
				)
			})}
		</div>
	)
}
