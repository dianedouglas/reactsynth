import { useState } from 'react'

export function CreatePreset({add_preset}){

	const [name, setName] = useState('')

	const handleClick = () => {
		add_preset(name)
		setName('')
	}

	return (
		<div>
			<input value={name} onChange={(e)=> setName(e.target.value)} type="text" />
			<button onClick={handleClick}> Save New Preset </button>
		</div>
	)
}
