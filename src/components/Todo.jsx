import { FiDelete } from "react-icons/fi";

export function Todo({id, title, completed, deleteTodo}){

	const handleDelete = () => {
		deleteTodo(id);
	}

	return (
		<div className="todo-container">
			<input type="checkbox" defaultChecked={completed}/>
			<h3 className="todo-title">{title}</h3>
			<FiDelete onClick={handleDelete} className="delete" size='20px'/>
		</div>
	)
}
