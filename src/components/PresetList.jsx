import { useState } from 'react';
import { styled, alpha } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Box from '@mui/material/Box';
import { UpdatePresetButton } from './UpdatePresetButton'

// StyledMenu copied from MUI docs
const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color: 'rgb(55, 65, 81)',
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, ' +
      'rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, ' +
      'rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, ' +
      'rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity
        ),
      },
    },
  },
}));

export function PresetList({ presetData, propogatePreset, deletePreset, updatePreset, currentPresetId }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const noDeleteDefaultPresetId = 0;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (presetId) => {
    setAnchorEl(null);
    if (presetId != null && presetId !== currentPresetId) {
      propogatePreset(presetId);
    }
  };

  const handleDelete = async (e, id) => {
    await deletePreset(id);
    if (id === currentPresetId) {
      propogatePreset(noDeleteDefaultPresetId);
    } else {
      propogatePreset(currentPresetId);
    }
  };

  const selectedTitle = presetData.find(p => p.id === currentPresetId)?.title || 'Presets';

  return (
    <div className="row top-of-preset-form">
      <div className="column-left">
        <Button
          id="preset-button"
          aria-controls={open ? 'preset-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          variant="contained"
          disableElevation
          onClick={handleClick}
          endIcon={<KeyboardArrowDownIcon />}
        >
          {selectedTitle}
        </Button>
        <StyledMenu
          id="preset-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={() => handleClose(null)}
          MenuListProps={{
            'aria-labelledby': 'preset-button',
          }}
        >
          {presetData.map((preset) => (
            <MenuItem
              key={preset.id}
              selected={preset.id === currentPresetId}
              onClick={() => handleClose(preset.id)}
            >
              <Box sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {preset.title}
              </Box>
              { preset.id !== noDeleteDefaultPresetId ? 
              	<IconButton
              	  size="small"
              	  edge="end"
              	  onClick={(e) => handleDelete(e, preset.id)}>
              	  <DeleteIcon fontSize="small" />
              	</IconButton> : null
              }
            </MenuItem>
          ))}
        </StyledMenu>
      </div>
      <div className="column-right">
        <UpdatePresetButton updatePreset={updatePreset} disabled={currentPresetId === noDeleteDefaultPresetId}/>
      </div>
    </div>
  );
}
