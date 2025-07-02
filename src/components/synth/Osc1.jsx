import { Filter } from './Filter'

export function Osc1({changeSettings, settings, changeFilterSettings, filterSettings}){
	return (
		<div>
			<input 
				type="range" 
				id="frequency" 
				max="500"
				value={settings.frequency}
				onChange={changeSettings}>
			</input>
		</div>
	)
}

			// <Filter settings={filterSettings} changeSettings={changeFilterSettings}/>
