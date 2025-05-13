import React from "react";
import { Provider } from "react-redux";
import { store } from "./app/store";
import ItemTable from "./components/ItemTable";
import { CssBaseline, Container, Typography } from "@mui/material";

function App() {
  return (
    <Provider store={store}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Список с пагинацией
        </Typography>
        <ItemTable />
      </Container>
    </Provider>
  );
}

export default App;
