import { Box, Typography, Slider } from '@mui/material';

export function Filter({settings, changeSettings}){
	let {type, frequency, Q} = settings;
	return (
		<div>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
			  <Typography id="frequency-label" sx={{ whiteSpace: 'nowrap', flexShrink: 0 }} gutterBottom>
			    Brightness
			  </Typography>
			  <Slider
			    aria-labelledby="frequency-label"
			    value={frequency}
			    onChange={(event, newValue) => changeSettings('frequency', newValue)}
			    min={0}
			    max={1000}
			    name="frequency"
			    id="frequency" 
			    sx={{ flexGrow: 1 }} 
			  />
			</Box>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
			  <Typography id="Q-label" sx={{ whiteSpace: 'nowrap', flexShrink: 0 }} gutterBottom>
			    Intensity
			  </Typography>
			  <Slider
			    aria-labelledby="Q-label"
			    value={Q}
			    onChange={(event, newValue) => changeSettings('Q', newValue)}
			    min={0}
			    max={3}
			    step={0.01}
			    name="Q"
			    id="Q"
			    sx={{ flexGrow: 1 }} 
			  />
			</Box>
		</div>
	)
}
