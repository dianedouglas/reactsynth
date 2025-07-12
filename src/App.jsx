
import { useState, useEffect, useRef } from 'react'
import { scaleValue } from './utils/mathHelpers';
import './App.css'

import { PresetList } from './components/PresetList'
import { CreatePreset } from './components/CreatePreset'
import { get_presets, create_preset, delete_preset, update_preset } from './api/endpoints'

import { SynthSettings } from './components/synth/SynthSettings'
import { ReverbControls } from './components/synth/Reverb'
import { Osc } from './context/Osc'
import { RippleCanvas } from './components/RippleCanvas'
import { audioCtx, gain, filter } from './context/audioContext';

function App() {
  const [presets, setPresets] = useState([]);
  const [currentPresetId, setcurrentPresetId] = useState(0)
  // ************* Preset List stuff
  // fetch presets on page load
  const fetchPresets = async () => {
    const presets = await get_presets();
    setPresets(presets);
  }

  useEffect(() => {
    fetchPresets();
  }, [])

  const createPreset = async (title) => {
    const preset_object = {
      "title": title,
      "ripple_speed": rippleSettings.rippleSpeed,
      "ripple_sustain": rippleSettings.decay,
      "amount_of_rain": rippleSettings.displayRainSpeed,
      "octave": synthSettings.octave,
      "filter_frequency": filterSettings.frequency,
      "filter_q": filterSettings.Q
    }
    const preset = await create_preset(preset_object);
    // update client side, update state by adding new preset.
    setPresets([preset, ...presets]);
  }

  const deletePreset = async (id) => {
    const preset = await delete_preset(id);
    // handle client side, update state by filtering out preset.
    setPresets(presets.filter(preset => preset.id !== id));
  }

  const updatePreset = async () => {
    const currentPreset = presets.find(preset => preset.id === currentPresetId);
    const preset_object = {
      "title": currentPreset.title,
      "ripple_speed": rippleSettings.rippleSpeed,
      "ripple_sustain": rippleSettings.decay,
      "amount_of_rain": rippleSettings.displayRainSpeed,
      "octave": synthSettings.octave,
      "filter_frequency": filterSettings.frequency,
      "filter_q": filterSettings.Q
    }
    const preset = await update_preset(currentPresetId, preset_object);
    // update client side with updated preset list after updating backend.
    fetchPresets();
  }


  // ************** Audio stuff

  const [synthSettings, setSynthSettings] = useState({
    octave: 2
  })

  // frequency default sets color to blue
  const [filterSettings, setFilterSettings] = useState({
    frequency: 589,
    Q: filter.Q.value,
    type: "lowpass"
  })

  const rainIntervalMax = 1500;
  const rainIntervalMin = 100;
  const rainIntervalDisplayDefault = 300;

  // ---------- rippleSettings state ------------
  // rippleSpeed: 
  //   amount each circle's radius grows per animation frame.
  // decay (sustain): 
  //   circle's transparency is multiplied by the decay on each animation frame.
  //   when each circle's transparency gets below the threshold it is removed from the array and no longer drawn.
  // rainSpeed:
  //   milliseconds between raindrops (setInterval). each raindrop also triggers a new note with playNote.
  // displayRainSpeed: 
  //   used for the slider controlling amount of rain because it is an inverse display. highest slider value = fastest rain.
  // isRaining:
  //   starts false and is set to true by start button, back to false with stop button. Web audio api requires user gesture.
  // hue: 
  //   color of ripples, governed by frequency of filter in the filter component..
  // lightness:
  //   lightness of the color of ripples (hsla) governed by the Q of the filter.
  const [rippleSettings, setRippleSettings] = useState({
    rippleSpeed: 25,
    decay: 5,
    displayRainSpeed: rainIntervalDisplayDefault,
    rainSpeed: scaleValue(rainIntervalDisplayDefault, rainIntervalMin, rainIntervalMax, rainIntervalMax, rainIntervalMin),
    isRaining: false,
    hue: scaleValue(filterSettings.frequency, 0, 1000, 0, 360),
    lightness: scaleValue(filterSettings.Q, 0, 3, 40, 100)
  })

  const changeSynthSettings = (e) => {
    // right now this is just used to set the octave for the synth
    // but other settings could be added by using the correct id and then updating the osc.
    // synthSettings are passed into the newNote function triggered by new ripples in RippleCanvas
    let {value, id} = e.target;
    setSynthSettings(prev => ({ ...prev, [id]: value }));
  }

  // update the actual filter instance and then update the filterSettings state.
  const changeFilterSettings = (e) => {
    const { value, id } = e.target;
    filter[id].value = value;
    setFilterSettings(prev => ({ ...prev, [id]: value }));
  }

  const newNote = (rippleSettings, circlesRef, synthSettingsRef) => {
    // rippleSettings does not need a ref 
    // a RippleCanvas useEffect creates a new interval to call this method with new values, removing the old one.
    const currentSynthSettings = synthSettingsRef.current;
    const currentCircles = circlesRef.current;
    new Osc(audioCtx, gain, currentSynthSettings.octave, rippleSettings, currentCircles);
  }

  const propogatePreset = (id) => {
    const currentPreset = presets.find(preset => preset.id === parseInt(id));
    setcurrentPresetId(id);
    setFilterSettings(prev => ({ 
      ...prev, 
      frequency: currentPreset.filter_frequency,
      Q: currentPreset.filter_q
    }));
    // update the actual filter node as well.
    filter.frequency.value = currentPreset.filter_frequency;
    filter.Q.value = currentPreset.filter_q;
    setSynthSettings(prev => ({ 
      ...prev, 
      octave: currentPreset.octave,
    }));
    setRippleSettings(prev => ({ 
      ...prev, 
      rippleSpeed: currentPreset.ripple_speed,
      decay: currentPreset.ripple_sustain,
      displayRainSpeed: currentPreset.amount_of_rain,
      rainSpeed: scaleValue(currentPreset.amount_of_rain, rainIntervalMin, rainIntervalMax, rainIntervalMax, rainIntervalMin),
      hue: scaleValue(currentPreset.filter_frequency, 0, 1000, 0, 360),
      lightness: scaleValue(currentPreset.filter_q, 0, 3, 40, 100)
    }));
  }

  return (
    <>
      <div className='App'>
        <div className='app-container'>
          <h1>Rain Synth</h1>
          <RippleCanvas 
            playNote={newNote}
            filterSettings={filterSettings}
            synthSettings={synthSettings}
            rippleSettings={rippleSettings}
            setRippleSettings={setRippleSettings}
          />
          <SynthSettings 
            synthSettings={synthSettings}
            changeSynthSettings={changeSynthSettings} 
            filterSettings={filterSettings}
            changeFilterSettings={changeFilterSettings} 
          />
          <ReverbControls rippleSettings={rippleSettings}/>
          <PresetList presetData={presets} propogatePreset={propogatePreset} deletePreset={deletePreset} updatePreset={updatePreset}/>
          <CreatePreset add_preset={createPreset}/>
        </div>
      </div>
    </>
  )
}

export default App
