import { Filter } from './Filter'

export function Osc1({changeSettings, changeType, settings, changeFilterSettings, changeFilterType, filterSettings}){
	let {type, frequency, detune} = settings;
	return (
		<div>
			<input 
				type="range" 
				id="frequency" 
				max="2000"
				value={frequency}
				onChange={changeSettings}>
			</input>
			<input 
				type="range" 
				id="detune" 
				value={detune}
				onChange={changeSettings}>
			</input>
			<button className={`${type==="sine" && 'active'}`} id="sine" onClick={changeType}> sine </button>
			<button className={`${type==="sawtooth" && 'active'}`} id="sawtooth" onClick={changeType}> sawtooth </button>
			<button className={`${type==="triangle" && 'active'}`} id="triangle" onClick={changeType}> triangle </button>
			<button className={`${type==="square" && 'active'}`} id="square" onClick={changeType}> sawtooth </button>
			<Filter settings={filterSettings} changeType={changeFilterType} changeSettings={changeFilterSettings}/>
		</div>
	)
}
