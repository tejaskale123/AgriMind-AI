import {
    BrowserRouter,
    Routes,
    Route,
    useLocation,
    Navigate
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


    // ============================================================
    // PROTECTED ROUTES
    // ============================================================

    if (!publicPage && !isAuthenticated) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }


    // ============================================================
    // AUTHENTICATED USER ON LOGIN / REGISTER
    // ============================================================

    if (publicPage && isAuthenticated) {

        return (
            <Navigate
                to="/"
                replace
            />
        );

    }


    // ============================================================
    // SIDEBAR
    // ============================================================

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

                    {/* ==================================================
                        PUBLIC ROUTES
                    ================================================== */}

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />


                    {/* ==================================================
                        PROTECTED ROUTES
                    ================================================== */}

                    <Route
                        path="/"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/detection"
                        element={<DiseaseDetection />}
                    />

                    <Route
                        path="/crops"
                        element={<Crops />}
                    />

                    <Route
                        path="/analytics"
                        element={<Analytics />}
                    />

                    <Route
                        path="/history"
                        element={<History />}
                    />

                    <Route
                        path="/settings"
                        element={<Settings />}
                    />


                    {/* ==================================================
                        UNKNOWN ROUTE
                    ================================================== */}

                    <Route
                        path="*"
                        element={<Navigate to="/" replace />}
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