import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

export function CreatePreset({ add_preset }) {
  const [name, setName] = useState('');
  const [hasError, setHasError] = useState(false);

  const handleClick = () => {
    const trimmedName = name.trim();

    if (trimmedName === '') {
      setHasError(true);
      return; // Don't proceed if input is empty or just spaces
    }

    add_preset(trimmedName);
    setName('');
    setHasError(false);
  };

  return (
    <div className="form">
      <TextField
        id="preset-name"
        label="Name Your Preset"
        variant="filled"
        size="small"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (hasError) setHasError(false); // Clear error on change
        }}
        error={hasError}
        helperText={hasError ? 'This field is required' : ''}
        required
        type="text"
        focused
      />
      <Button onClick={handleClick} variant="contained" size="large">
        Save New Preset
      </Button>
    </div>
  );
}
