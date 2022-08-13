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
