import { Filter } from './Filter'

export function Osc1({changeSettings, settings, changeFilterSettings, filterSettings}){
	return (
		<div>
			<label htmlFor="frequency">Pitch</label>
			<input 
				type="range" 
				id="frequency" 
				name="frequency" 
				min="110"
				max="440"
				value={settings.frequency}
				onChange={changeSettings}>
			</input>
		</div>
	)
}

			// <Filter settings={filterSettings} changeSettings={changeFilterSettings}/>
