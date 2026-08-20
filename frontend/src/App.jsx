import {
    BrowserRouter,
    Routes,
    Route,
    useLocation
} from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import DiseaseDetection from "./pages/DiseaseDetection";
import Crops from "./pages/Crops";
import Analytics from "./pages/Analytics";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Register from "./pages/Register";
import Login from "./pages/Login";


function AppLayout() {
    const location = useLocation();

    const token = localStorage.getItem("access_token");

    const isAuthenticated = Boolean(token);

    const publicPage =
        location.pathname === "/login" ||
        location.pathname === "/register";

    if (!publicPage && !isAuthenticated) {
        window.location.href = "/login";
        return null;
    }

    // Pages where Sidebar should NOT appear
    const hideSidebar = publicPage;

    return (
        <div
            className={
                hideSidebar
                    ? "auth-layout"
                    : "app-layout"
            }
        >

            {!hideSidebar && <Sidebar />}


            <main
                className={
                    hideSidebar
                        ? "auth-main-content"
                        : "main-content"
                }
            >

                <Routes>

                    {/* LOGIN */}

                    <Route
                        path="/login"
                        element={<Login />}
                    />


                    {/* REGISTER */}

                    <Route
                        path="/register"
                        element={<Register />}
                    />


                    {/* DASHBOARD */}

                    <Route
                        path="/"
                        element={<Dashboard />}
                    />


                    {/* DISEASE DETECTION */}

                    <Route
                        path="/detection"
                        element={<DiseaseDetection />}
                    />


                    {/* CROPS */}

                    <Route
                        path="/crops"
                        element={<Crops />}
                    />


                    {/* ANALYTICS */}

                    <Route
                        path="/analytics"
                        element={<Analytics />}
                    />


                    {/* HISTORY */}

                    <Route
                        path="/history"
                        element={<History />}
                    />


                    {/* SETTINGS */}

                    <Route
                        path="/settings"
                        element={<Settings />}
                    />

                </Routes>

            </main>

        </div>
    );
}


function App() {

    return (
        <BrowserRouter>
            <AppLayout />
        </BrowserRouter>
    );
}


export default App;
