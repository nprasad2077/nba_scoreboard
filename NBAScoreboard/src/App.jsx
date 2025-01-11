import { Button, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";

// Custom styled button
const CustomButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
  border: 0,
  color: "white",
  height: 48,
  padding: "0 30px",
  boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
  "&:hover": {
    background: "linear-gradient(45deg, #FE8B8B 30%, #FF9E53 90%)",
  },
}));

function App() {
  return (
    <Stack
      spacing={2}
      direction="row"
      alignItems="center"
      justifyContent="center"
      sx={{ minHeight: "100vh" }}
    >
      {/* Default MUI Button */}
      <Button variant="contained">Default Button</Button>

      {/* Custom Styled Button */}
      <CustomButton variant="contained">Custom Button</CustomButton>
    </Stack>
  );
}

export default App;
