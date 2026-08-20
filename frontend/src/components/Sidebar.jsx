import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
    const navigate = useNavigate();

    // Get logged-in user
    const storedUser = localStorage.getItem("user");

    let user = null;

    try {
        user = storedUser
            ? JSON.parse(storedUser)
            : null;
    } catch {
        user = null;
    }

    // Get user's name
    const userName =
        user?.full_name ||
        user?.name ||
        user?.username ||
        "Farmer";

    // Get first letter for avatar
    const userInitial =
        userName
            .trim()
            .charAt(0)
            .toUpperCase();

    const menuItems = [
        {
            path: "/",
            icon: "🏠",
            label: "Dashboard"
        },
        {
            path: "/detection",
            icon: "🔬",
            label: "Disease Detection"
        },
        {
            path: "/crops",
            icon: "🌾",
            label: "Crops"
        },
        {
            path: "/analytics",
            icon: "📊",
            label: "Analytics"
        },
        {
            path: "/history",
            icon: "🕘",
            label: "History"
        }
    ];

    // Logout
    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <aside className="sidebar">

            {/* LOGO */}

            <div className="logo">

                <div className="logo-icon">
                    🌱
                </div>

                <div>

                    <h2>
                        AgriMind
                    </h2>

                    <span>
                        AI
                    </span>

                </div>

            </div>


            {/* MENU TITLE */}

            <div className="menu-title">
                MAIN MENU
            </div>


            {/* MAIN NAVIGATION */}

            <nav>

                {menuItems.map((item) => (

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

                        <span>
                            {item.label}
                        </span>

                    </NavLink>

                ))}

            </nav>


            {/* BOTTOM */}

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

                    <span>
                        Settings
                    </span>

                </NavLink>


                {/* USER INFO */}

                <div
                    style={{
                        marginTop: "15px",
                        padding: "12px",
                        borderTop: "1px solid #e5ebe7"
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px"
                        }}
                    >

                        {/* USER AVATAR */}

                        <div
                            style={{
                                width: "38px",
                                height: "38px",
                                minWidth: "38px",
                                borderRadius: "50%",
                                background: "#16a34a",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "800"
                            }}
                        >
                            {userInitial}
                        </div>


                        {/* USER NAME */}

                        <div
                            style={{
                                overflow: "hidden"
                            }}
                        >

                            <div
                                style={{
                                    fontSize: "13px",
                                    fontWeight: "700",
                                    color: "#14231a",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis"
                                }}
                            >
                                {userName}
                            </div>

                            <div
                                style={{
                                    fontSize: "11px",
                                    color: "#64748b"
                                }}
                            >
                                Farmer
                            </div>

                        </div>

                    </div>


                    {/* LOGOUT */}

                    <button
                        onClick={handleLogout}
                        style={{
                            width: "100%",
                            marginTop: "10px",
                            height: "38px",
                            border: "1px solid #fecaca",
                            borderRadius: "9px",
                            background: "#fff7f7",
                            color: "#dc2626",
                            fontSize: "13px",
                            fontWeight: "700",
                            cursor: "pointer"
                        }}
                    >
                        🚪 Logout
                    </button>

                </div>


                {/* VERSION */}

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