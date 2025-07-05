import { Filter } from './Filter'

export function SynthSettings({changeSynthSettings, synthSettings, changeFilterSettings, filterSettings}){
	return (
		<div>
			<label htmlFor="frequency">Octave</label>
			<input 
				type="range" 
				id="frequency" 
				name="frequency" 
				min="0"
				max="3"
				step="1"
				value={synthSettings.frequency}
				onChange={changeSynthSettings}>
			</input>
			<Filter settings={filterSettings} changeSettings={changeFilterSettings}/>
		</div>
	)
}

