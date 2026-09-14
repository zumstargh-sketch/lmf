import * as React from 'react';
import { AppProps } from 'next/app';
import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: 'Georgia, "Times New Roman", serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 }
  },
  palette: {
    primary: { main: '#176B5B', contrastText: '#FFFFFF' },
    secondary: { main: '#D88A28', contrastText: '#FFFFFF' },
    background: { default: '#F4F1EA', paper: '#FFFDF8' },
    text: { primary: '#1C2A27', secondary: '#65716D' }
  },
  shape: { borderRadius: 6 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } }
  }
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
