import { Filter } from './Filter'
import { Box, Typography, Slider } from '@mui/material';

export function SynthSettings({changeSynthSettings, synthSettings, changeFilterSettings, filterSettings}){
	return (
		<div>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
			  <Typography id="octave-label" sx={{ whiteSpace: 'nowrap', flexShrink: 0 }} gutterBottom>
			    Octave
			  </Typography>
			  <Slider
			    aria-labelledby="octave-label"
			    value={synthSettings.octave}
			    onChange={(event, newValue) => changeSynthSettings('octave', newValue)}
			    min={0}
			    max={3}
			    step={1}
			    name="octave"
			    id="octave"
			    sx={{ flexGrow: 1 }}
			  />
			</Box>
			<Filter settings={filterSettings} changeSettings={changeFilterSettings}/>
		</div>
	)
}

