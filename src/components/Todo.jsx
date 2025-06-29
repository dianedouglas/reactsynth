import { FiDelete } from "react-icons/fi";
import { update_todo } from '../api/endpoints'


export function Todo({id, title, completed, deleteTodo}){



	const handleDelete = async () => {
		await deleteTodo(id);
	}

	const handleComplete = async (e) => {
		await update_todo(id, e.target.checked);
	}

	return (
		<div className="todo-container">
			<input onChange={(e) => handleComplete(e)} type="checkbox" defaultChecked={completed}/>
			<h3 className="todo-title">{title}</h3>
			<FiDelete onClick={handleDelete} className="delete" size='20px'/>
		</div>
	)
}
