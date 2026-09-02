import {
    BrowserRouter,
    Routes,
    Route,
    useLocation,
    Navigate,
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


/* ============================================================
   APP LAYOUT
============================================================ */

function AppLayout() {

    const location = useLocation();

    const token = localStorage.getItem("access_token");

    const isAuthenticated = Boolean(token);


    /* ============================================================
       PUBLIC PAGES
    ============================================================ */

    const publicPage =
        location.pathname === "/login" ||
        location.pathname === "/register";


    /* ============================================================
       PROTECTED ROUTES
    ============================================================ */

    if (!publicPage && !isAuthenticated) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }


    /* ============================================================
       AUTHENTICATED USER
       CANNOT OPEN LOGIN / REGISTER
    ============================================================ */

    if (publicPage && isAuthenticated) {

        return (
            <Navigate
                to="/"
                replace
            />
        );

    }


    /* ============================================================
       AUTH PAGES
       NO SIDEBAR
    ============================================================ */

    if (publicPage) {

        return (

            <div className="auth-layout">

                <main className="auth-main-content">

                    <Routes>

                        <Route
                            path="/login"
                            element={<Login />}
                        />

                        <Route
                            path="/register"
                            element={<Register />}
                        />

                    </Routes>

                </main>

            </div>

        );

    }


    /* ============================================================
       MAIN APPLICATION
       SIDEBAR + CONTENT
    ============================================================ */

    return (

        <div className="app-layout">

            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <Sidebar />


            {/* ==================================================
                MAIN CONTENT
            ================================================== */}

            <main className="main-content">

                <Routes>

                    {/* ==================================================
                        DASHBOARD
                    ================================================== */}

                    <Route
                        path="/"
                        element={<Dashboard />}
                    />


                    {/* ==================================================
                        DISEASE DETECTION
                    ================================================== */}

                    <Route
                        path="/detection"
                        element={<DiseaseDetection />}
                    />


                    {/* ==================================================
                        MY CROPS
                    ================================================== */}

                    <Route
                        path="/crops"
                        element={<Crops />}
                    />


                    {/* ==================================================
                        ANALYTICS
                    ================================================== */}

                    <Route
                        path="/analytics"
                        element={<Analytics />}
                    />


                    {/* ==================================================
                        HISTORY
                    ================================================== */}

                    <Route
                        path="/history"
                        element={<History />}
                    />


                    {/* ==================================================
                        SETTINGS
                    ================================================== */}

                    <Route
                        path="/settings"
                        element={<Settings />}
                    />


                    {/* ==================================================
                        UNKNOWN ROUTE
                    ================================================== */}

                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/"
                                replace
                            />
                        }
                    />

                </Routes>

            </main>

        </div>

    );

}


/* ============================================================
   APP
============================================================ */

function App() {

    return (

        <BrowserRouter>

            <AppLayout />

        </BrowserRouter>

    );

}


export default App;