export function Osc1({changeFreq, freq}){
	return (
		<div>
			<input 
			type="range" 
			id="frequency" 
			max="2000"
			value={freq}
			onChange={changeFreq}></input>
		</div>
	)
}
