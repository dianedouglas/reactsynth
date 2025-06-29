import { useState } from 'react'

export function CreateTodo({add_todo}){

	const [name, setName] = useState('')

	const handleClick = () => {
		add_todo(name)
		setName('')
	}

	return (
		<div>
			<input value={name} onChange={(e)=> setName(e.target.value)} type="text" />
			<button onClick={handleClick}> Create Item </button>
		</div>
	)
}
