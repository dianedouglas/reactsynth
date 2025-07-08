import { useState } from 'react';

export function PresetList({ presetData, propogatePreset }) {
  // Initialize with the first preset's id if available
  const [selectedOption, setSelectedOption] = useState(presetData[0]?.id || '');

  const handleChange = (e) => {
    const selectedId = e.target.value;
    setSelectedOption(selectedId); // update local state
    propogatePreset(selectedId);   // call parent with selected id
  };

  return (
    <div>
      <select onChange={handleChange} value={selectedOption}>
        {presetData.map(preset => (
          <option key={preset.id} value={preset.id}>
            {preset.title}
          </option>
        ))}
      </select>
    </div>
  );
}
