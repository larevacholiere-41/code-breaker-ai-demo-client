import { ConfigProvider } from "antd";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import themeConfig from "./AntDesignTheme";
import { HomePage } from "./pages/home";
import { GamePage } from "./pages/game";
import "./App.sass";

function App() {
  const queryClient = new QueryClient();
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider theme={themeConfig}>
          <BrowserRouter basename={import.meta.env.VITE_BASE_ROUTE}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/game/:gameId/:mode?" element={<GamePage />} />
            </Routes>
          </BrowserRouter>
        </ConfigProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
