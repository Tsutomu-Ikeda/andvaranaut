import { TopPage } from "./component/top-page";
import "./App.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { useDarkMode } from "./hooks/use-dark-mode";

export const App = () => {
  const { dark } = useDarkMode();
  const theme = createTheme({
    palette: {
      primary: { main: "#bf0a0a" },
      mode: dark ? "dark" : "light",
    },
    typography: {
      fontSize: 16,
      h1: { fontSize: 52 },
      h2: { fontSize: 26 },
      h3: { fontSize: 24 },
      h4: { fontSize: 22 },
      h5: { fontSize: 20 },
      h6: { fontSize: 18 },
      subtitle1: { fontSize: 18 },
      body1: { fontSize: 16 },
    }
  });

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <TopPage />
      </ThemeProvider>
    </>
  );
};
