import { FiDelete } from "react-icons/fi";

export function Todo({id, title, completed}){
	return (
		<div className="todo-container">
			<input type="checkbox" defaultChecked={completed}/>
			<h3 className="todo-title">{title}</h3>
			<FiDelete className="delete" size='20px'/>
		</div>
	)
}
