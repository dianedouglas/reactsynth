export function Filter({settings, changeType, changeSettings}){
	let {type, frequency, Q} = settings;
	return (
		<div>
			<input 
				type="range" 
				id="frequency" 
				max="1000"
				value={frequency}
				onChange={changeSettings}>
			</input>
			<input 
				type="range" 
				id="Q" 
				value={Q}
				max="15"
				step="0.01"
				onChange={changeSettings}>
			</input>
			<button className={`${type==="lowpass" && 'active'}`} id="lowpass" onClick={changeType}> lowpass </button>
			<button className={`${type==="highpass" && 'active'}`} id="highpass" onClick={changeType}> highpass </button>
			<button className={`${type==="notch" && 'active'}`} id="notch" onClick={changeType}> notch </button>
		</div>
	)
}
