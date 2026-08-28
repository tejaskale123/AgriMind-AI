import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
    const navigate = useNavigate();

    // ============================================================
    // GET LOGGED-IN USER
    // ============================================================

    const storedUser = localStorage.getItem("user");

    let user = null;

    try {
        user = storedUser
            ? JSON.parse(storedUser)
            : null;
    } catch {
        user = null;
    }

    // ============================================================
    // USER INFORMATION
    // ============================================================

    const userName =
        user?.full_name ||
        user?.name ||
        user?.username ||
        "Farmer";

    const userInitial =
        userName
            .trim()
            .charAt(0)
            .toUpperCase();

    // ============================================================
    // NAVIGATION ITEMS
    // ============================================================

    const mainMenu = [
        {
            path: "/",
            icon: "🏠",
            label: "Dashboard",
        },
        {
            path: "/detection",
            icon: "🔬",
            label: "Disease Detection",
        },
        {
            path: "/crops",
            icon: "🌾",
            label: "My Crops",
        },
    ];

    const insightMenu = [
        {
            path: "/analytics",
            icon: "📊",
            label: "Analytics",
        },
        {
            path: "/history",
            icon: "🕘",
            label: "History",
        },
    ];

    // ============================================================
    // LOGOUT
    // ============================================================

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    // ============================================================
    // NAVIGATION ITEM
    // ============================================================

    const renderMenuItem = (item) => (
        <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
                isActive
                    ? "nav-item active"
                    : "nav-item"
            }
        >
            <span className="nav-icon">
                {item.icon}
            </span>

            <span className="nav-label">
                {item.label}
            </span>
        </NavLink>
    );

    // ============================================================
    // SIDEBAR UI
    // ============================================================

    return (
        <aside className="sidebar">

            {/* ==================================================
                LOGO
            ================================================== */}

            <div className="logo">

                <div className="logo-icon">
                    🌱
                </div>

                <div className="logo-content">

                    <h2>
                        AgriMind
                    </h2>

                    <span>
                        SMART AGRICULTURE
                    </span>

                </div>

            </div>


            {/* ==================================================
                NAVIGATION
            ================================================== */}

            <div className="sidebar-navigation">

                {/* MAIN */}

                <div className="menu-section">

                    <div className="menu-title">
                        MAIN
                    </div>

                    <nav>
                        {mainMenu.map(renderMenuItem)}
                    </nav>

                </div>


                {/* INSIGHTS */}

                <div className="menu-section">

                    <div className="menu-title">
                        INSIGHTS
                    </div>

                    <nav>
                        {insightMenu.map(renderMenuItem)}
                    </nav>

                </div>

            </div>


            {/* ==================================================
                SIDEBAR BOTTOM
            ================================================== */}

            <div className="sidebar-bottom">

                {/* SETTINGS */}

                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        isActive
                            ? "nav-item active"
                            : "nav-item"
                    }
                >

                    <span className="nav-icon">
                        ⚙️
                    </span>

                    <span className="nav-label">
                        Settings
                    </span>

                </NavLink>


                {/* ==================================================
                    USER PROFILE
                ================================================== */}

                <div className="sidebar-user">

                    <div className="sidebar-user-info">

                        {/* AVATAR */}

                        <div className="sidebar-avatar">
                            {userInitial}
                        </div>


                        {/* USER DETAILS */}

                        <div className="sidebar-user-details">

                            <div className="sidebar-user-name">
                                {userName}
                            </div>

                            <div className="sidebar-user-role">
                                Farmer
                            </div>

                        </div>

                    </div>


                    {/* LOGOUT */}

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="sidebar-logout"
                    >
                        <span>
                            🚪
                        </span>

                        <span>
                            Logout
                        </span>
                    </button>

                </div>


                {/* ==================================================
                    VERSION
                ================================================== */}

                <div className="sidebar-version">

                    <span>
                        AgriMind AI
                    </span>

                    <small>
                        v1.0.0
                    </small>

                </div>

            </div>

        </aside>
    );
}

export default Sidebar;