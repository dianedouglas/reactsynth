import { useState } from 'react'
import { FiDelete } from "react-icons/fi";
import { update_todo } from '../api/endpoints'


export function Todo({id, title, completed, deleteTodo}){

	const [isChecked, setChecked] = useState(completed)

	const handleDelete = async () => {
		await deleteTodo(id);
	}

	const handleComplete = async (e) => {
		await update_todo(id, !isChecked);
		setChecked(!isChecked);
	}

	return (
		<div className="todo-container">
			<input onClick={handleComplete} type="checkbox" defaultChecked={isChecked}/>
			<h3 className="todo-title">{title}</h3>
			<FiDelete onClick={handleDelete} className="delete" size='20px'/>
		</div>
	)
}
