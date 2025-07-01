import { Filter } from './Filter'
import Osc from '../../context/Osc'

export function Osc1({changeSettings, changeType, settings, changeFilterSettings, changeFilterType, filterSettings, actx, connection}){
	let {type, frequency, detune} = settings;

	const newOsc = (e) => {
		const newOsc = new Osc(actx, type, frequency, detune, null, connection);
	}

	return (
		<div>
			<button onClick={newOsc}>start</button>
			<input 
				type="range" 
				id="frequency" 
				max="500"
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
			<button className={`${type==="square" && 'active'}`} id="square" onClick={changeType}> square </button>
			<Filter settings={filterSettings} changeType={changeFilterType} changeSettings={changeFilterSettings}/>
		</div>
	)
}
