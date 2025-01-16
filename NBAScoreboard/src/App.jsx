import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Scoreboard from "./components/Scoreboard";
import NBAScores from "./components/NBAScores";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
  },
});

function App() {
  return (
    <div>
      <NBAScores />
    </div>
  );
}

export default App;
