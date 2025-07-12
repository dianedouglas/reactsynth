import { useState } from 'react';
import Button from '@mui/material/Button';

export function UpdatePresetButton({ updatePreset }) {
  const handleClick = () => {
    updatePreset();
  };
  return (
    <Button onClick={handleClick} variant="contained" size="large">
      Update Preset
    </Button>
  );
}
