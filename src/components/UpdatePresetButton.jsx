import Button from '@mui/material/Button';

export function UpdatePresetButton({ updatePreset, disabled }) {
  const handleClick = () => {
    updatePreset();
  };

  return (
    <Button
      onClick={handleClick}
      variant="contained"
      size="large"
      disabled={disabled}
      sx={{
        '&.Mui-disabled': {
          backgroundColor: '#90caf9', // Light blue
          color: '#0d47a1',           // Deep blue text
          fontStyle: 'italic',
          cursor: 'not-allowed',
        },
      }}
    >
      Update Preset
    </Button>
  );
}
