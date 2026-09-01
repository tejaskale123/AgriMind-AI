import { NavLink, useNavigate } from "react-router-dom";


/* ============================================================
   PROFESSIONAL SVG ICONS
   No emoji / sticker icons
============================================================ */

function Icon({ name }) {

    const commonProps = {
        width: 20,
        height: 20,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": true,
    };


    switch (name) {

        /* ====================================================
           DASHBOARD
        ==================================================== */

        case "dashboard":
            return (
                <svg {...commonProps}>
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                </svg>
            );


        /* ====================================================
           DISEASE DETECTION
        ==================================================== */

        case "detection":
            return (
                <svg {...commonProps}>
                    <circle cx="10.5" cy="10.5" r="5.5" />
                    <path d="m15 15 5 5" />
                    <path d="M10.5 8v5" />
                    <path d="M8 10.5h5" />
                </svg>
            );


        /* ====================================================
           CROPS
        ==================================================== */

        case "crops":
            return (
                <svg {...commonProps}>
                    <path d="M20.5 4.5C13.5 4.5 7 7 5 14c-1 3.5 1 5.5 4.5 4.5C16.5 16.5 19.5 10 20.5 4.5Z" />
                    <path d="M4 21c3-4 6.5-6.5 11-9" />
                </svg>
            );


        /* ====================================================
           ANALYTICS
        ==================================================== */

        case "analytics":
            return (
                <svg {...commonProps}>
                    <path d="M4 19V5" />
                    <path d="M4 19h16" />
                    <path d="m7 15 3-4 3 2 5-7" />
                    <path d="M16 6h2v2" />
                </svg>
            );


        /* ====================================================
           HISTORY
        ==================================================== */

        case "history":
            return (
                <svg {...commonProps}>
                    <path d="M3 12a9 9 0 1 0 3-6.7" />
                    <path d="M3 4v5h5" />
                    <path d="M12 7v5l3 2" />
                </svg>
            );


        /* ====================================================
           SETTINGS
        ==================================================== */

        case "settings":
            return (
                <svg {...commonProps}>
                    <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
                    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.8 1.8-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.55V20h-2.55v-.11a1.7 1.7 0 0 0-1.03-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06-1.8-1.8.06-.06A1.7 1.7 0 0 0 8.2 15a1.7 1.7 0 0 0-1.55-1.03H6.5v-2.55h.15A1.7 1.7 0 0 0 8.2 10.4a1.7 1.7 0 0 0-.34-1.88L7.8 8.46l1.8-1.8.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 12.57 5.5V5h2.55v.5a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.8 1.8-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.55 1.03h.46v2.55h-.46A1.7 1.7 0 0 0 19.4 15Z" />
                </svg>
            );


        /* ====================================================
           LOGOUT
        ==================================================== */

        case "logout":
            return (
                <svg {...commonProps}>
                    <path d="M10 5H5.5A1.5 1.5 0 0 0 4 6.5v11A1.5 1.5 0 0 0 5.5 19H10" />
                    <path d="M14 8l4 4-4 4" />
                    <path d="M18 12H9" />
                </svg>
            );


        /* ====================================================
           LEAF / LOGO
        ==================================================== */

        case "leaf":
            return (
                <svg
                    {...commonProps}
                    width="29"
                    height="29"
                >
                    <path d="M20.5 4.5C13.5 4.5 7 7 5 14c-1 3.5 1 5.5 4.5 4.5C16.5 16.5 19.5 10 20.5 4.5Z" />
                    <path d="M4 21c3-4 6.5-6.5 11-9" />
                </svg>
            );


        /* ====================================================
           ARROW
        ==================================================== */

        case "arrow":
            return (
                <svg {...commonProps}>
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                </svg>
            );


        default:
            return null;
    }
}


/* ============================================================
   SIDEBAR
============================================================ */

function Sidebar() {

    const navigate = useNavigate();


    /* ========================================================
       GET LOGGED-IN USER
    ======================================================== */

    const storedUser = localStorage.getItem("user");

    let user = null;

    try {

        user = storedUser
            ? JSON.parse(storedUser)
            : null;

    } catch {

        user = null;

    }


    /* ========================================================
       USER INFORMATION
    ======================================================== */

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


    /* ========================================================
       MAIN MENU
    ======================================================== */

    const mainMenu = [

        {
            path: "/",
            icon: "dashboard",
            label: "Dashboard",
        },

        {
            path: "/detection",
            icon: "detection",
            label: "Disease Detection",
        },

        {
            path: "/crops",
            icon: "crops",
            label: "My Crops",
        },

    ];


    /* ========================================================
       INSIGHTS MENU
    ======================================================== */

    const insightMenu = [

        {
            path: "/analytics",
            icon: "analytics",
            label: "Analytics",
        },

        {
            path: "/history",
            icon: "history",
            label: "History",
        },

    ];


    /* ========================================================
       LOGOUT
    ======================================================== */

    const handleLogout = () => {

        localStorage.removeItem("access_token");

        localStorage.removeItem("user");

        navigate("/login");

    };


    /* ========================================================
       NAVIGATION ITEM
    ======================================================== */

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

                <Icon name={item.icon} />

            </span>


            <span className="nav-label">

                {item.label}

            </span>


            <span className="nav-arrow">

                <Icon name="arrow" />

            </span>

        </NavLink>

    );


    /* ========================================================
       SIDEBAR UI
    ======================================================== */

    return (

        <aside className="sidebar">


            {/* ==================================================
                LOGO
            ================================================== */}

            <div className="logo">


                <div className="logo-icon">

                    <Icon name="leaf" />

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


                {/* ==================================================
                    MAIN
                ================================================== */}

                <div className="menu-section">

                    <div className="menu-title">
                        MAIN
                    </div>


                    <nav>

                        {mainMenu.map(renderMenuItem)}

                    </nav>

                </div>


                {/* ==================================================
                    INSIGHTS
                ================================================== */}

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


                {/* ==================================================
                    SETTINGS
                ================================================== */}

                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        isActive
                            ? "nav-item active"
                            : "nav-item"
                    }
                >

                    <span className="nav-icon">

                        <Icon name="settings" />

                    </span>


                    <span className="nav-label">

                        Settings

                    </span>


                    <span className="nav-arrow">

                        <Icon name="arrow" />

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


                    {/* ==================================================
                        LOGOUT
                    ================================================== */}

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="sidebar-logout"
                    >

                        <span className="logout-icon">

                            <Icon name="logout" />

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