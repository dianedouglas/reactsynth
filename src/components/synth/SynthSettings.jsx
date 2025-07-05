import { Filter } from './Filter'

export function SynthSettings({changeSynthSettings, synthSettings, changeFilterSettings, filterSettings}){
	return (
		<div>
			<label htmlFor="octave">Octave</label>
			<input 
				type="range" 
				id="octave" 
				name="octave" 
				min="0"
				max="3"
				step="1"
				value={synthSettings.octave}
				onChange={changeSynthSettings}>
			</input>
			<Filter settings={filterSettings} changeSettings={changeFilterSettings}/>
		</div>
	)
}

