import { Filter } from './Filter'

export function Osc1({changeSettings, settings, changeFilterSettings, filterSettings}){
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
				value={settings.frequency}
				onChange={changeSettings}>
			</input>
			<Filter settings={filterSettings} changeSettings={changeFilterSettings}/>
		</div>
	)
}

