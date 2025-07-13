import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: `'Kalam', cursive`,
  },
  components: {
    // Style all Buttons
    MuiButton: {
      styleOverrides: {
        root: {
          whiteSpace: 'nowrap',
          minWidth: '175px'
        },
      },
    },
  }
});

export default theme;
