export function Filter({settings, changeSettings}){
	let {type, frequency, Q} = settings;
	return (
		<div>
			<div>
				<label htmlFor="frequency">Brightness</label>
				<input 
					type="range" 
					id="frequency"
					name="frequency"
					max="1000"
					value={frequency}
					onChange={changeSettings}>
				</input>
			</div>
			<div>
				<label htmlFor="Q">Intensity</label>
				<input 
					type="range" 
					id="Q"
					name="Q"
					value={Q}
					max="3"
					step="0.01"
					onChange={changeSettings}>
				</input>
			</div>
		</div>
	)
}
