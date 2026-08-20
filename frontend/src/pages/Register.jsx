import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: "",
        confirm_password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =========================================================
    // HANDLE INPUT
    // =========================================================

    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };


    // =========================================================
    // REGISTER
    // =========================================================

    const handleRegister = async (event) => {

        event.preventDefault();

        setError("");
        setSuccess("");


        // -----------------------------------------------------
        // VALIDATION
        // -----------------------------------------------------

        if (!formData.full_name.trim()) {

            setError(
                "Please enter your full name."
            );

            return;
        }


        if (!formData.email.trim()) {

            setError(
                "Please enter your email address."
            );

            return;
        }


        if (formData.password.length < 6) {

            setError(
                "Password must contain at least 6 characters."
            );

            return;
        }


        if (
            formData.password !==
            formData.confirm_password
        ) {

            setError(
                "Passwords do not match."
            );

            return;
        }


        // -----------------------------------------------------
        // API REQUEST
        // -----------------------------------------------------

        setLoading(true);

        try {

            const response = await fetch(
                "http://127.0.0.1:8000/auth/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        full_name:
                            formData.full_name.trim(),

                        email:
                            formData.email.trim(),

                        password:
                            formData.password,
                    }),
                }
            );


            const data =
                await response.json();


            // -------------------------------------------------
            // ERROR
            // -------------------------------------------------

            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Registration failed."
                );
            }


            // -------------------------------------------------
            // SUCCESS
            // -------------------------------------------------

            setSuccess(
                "Account created successfully. Redirecting to login..."
            );


            setFormData({
                full_name: "",
                email: "",
                password: "",
                confirm_password: "",
            });


            setTimeout(() => {

                navigate("/login");

            }, 1200);


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );

            setError(
                error.message ||
                "Unable to connect to the server."
            );

        } finally {

            setLoading(false);
        }
    };


    // =========================================================
    // UI
    // =========================================================

    return (

        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "30px",
                background:
                    "linear-gradient(135deg, #f0fdf4, #dcfce7)",
            }}
        >

            <div
                style={{
                    width: "100%",
                    maxWidth: "460px",
                    background: "#ffffff",
                    borderRadius: "20px",
                    padding: "40px",
                    boxShadow:
                        "0 20px 50px rgba(0,0,0,0.10)",
                }}
            >

                {/* =================================================
                    HEADER
                ================================================= */}

                <div
                    style={{
                        textAlign: "center",
                        marginBottom: "30px",
                    }}
                >

                    <div
                        style={{
                            fontSize: "48px",
                            marginBottom: "10px",
                        }}
                    >
                        🌱
                    </div>

                    <h1
                        style={{
                            margin: 0,
                            fontSize: "30px",
                            color: "#166534",
                        }}
                    >
                        Create Account
                    </h1>

                    <p
                        style={{
                            color: "#64748b",
                            marginTop: "8px",
                        }}
                    >
                        Join AgriMind AI
                    </p>

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div
                        style={{
                            background: "#fef2f2",
                            color: "#b91c1c",
                            padding: "12px 15px",
                            borderRadius: "10px",
                            marginBottom: "18px",
                            fontSize: "14px",
                        }}
                    >
                        {error}
                    </div>

                )}


                {/* =================================================
                    SUCCESS
                ================================================= */}

                {success && (

                    <div
                        style={{
                            background: "#f0fdf4",
                            color: "#15803d",
                            padding: "12px 15px",
                            borderRadius: "10px",
                            marginBottom: "18px",
                            fontSize: "14px",
                        }}
                    >
                        {success}
                    </div>

                )}


                {/* =================================================
                    FORM
                ================================================= */}

                <form
                    onSubmit={handleRegister}
                >

                    {/* FULL NAME */}

                    <label
                        style={{
                            display: "block",
                            marginBottom: "7px",
                            fontWeight: "600",
                            color: "#334155",
                        }}
                    >
                        Full Name
                    </label>

                    <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        autoComplete="name"
                        style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "13px 14px",
                            border:
                                "1px solid #cbd5e1",
                            borderRadius: "10px",
                            marginBottom: "18px",
                            fontSize: "15px",
                            outline: "none",
                        }}
                    />


                    {/* EMAIL */}

                    <label
                        style={{
                            display: "block",
                            marginBottom: "7px",
                            fontWeight: "600",
                            color: "#334155",
                        }}
                    >
                        Email Address
                    </label>

                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        autoComplete="email"
                        style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "13px 14px",
                            border:
                                "1px solid #cbd5e1",
                            borderRadius: "10px",
                            marginBottom: "18px",
                            fontSize: "15px",
                            outline: "none",
                        }}
                    />


                    {/* PASSWORD */}

                    <label
                        style={{
                            display: "block",
                            marginBottom: "7px",
                            fontWeight: "600",
                            color: "#334155",
                        }}
                    >
                        Password
                    </label>

                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Minimum 6 characters"
                        autoComplete="new-password"
                        style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "13px 14px",
                            border:
                                "1px solid #cbd5e1",
                            borderRadius: "10px",
                            marginBottom: "18px",
                            fontSize: "15px",
                            outline: "none",
                        }}
                    />


                    {/* CONFIRM PASSWORD */}

                    <label
                        style={{
                            display: "block",
                            marginBottom: "7px",
                            fontWeight: "600",
                            color: "#334155",
                        }}
                    >
                        Confirm Password
                    </label>

                    <input
                        type="password"
                        name="confirm_password"
                        value={
                            formData.confirm_password
                        }
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "13px 14px",
                            border:
                                "1px solid #cbd5e1",
                            borderRadius: "10px",
                            marginBottom: "24px",
                            fontSize: "15px",
                            outline: "none",
                        }}
                    />


                    {/* REGISTER BUTTON */}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            border: "none",
                            borderRadius: "10px",
                            padding: "14px",
                            background:
                                loading
                                    ? "#86efac"
                                    : "#16a34a",
                            color: "#ffffff",
                            fontSize: "16px",
                            fontWeight: "700",
                            cursor:
                                loading
                                    ? "not-allowed"
                                    : "pointer",
                        }}
                    >
                        {loading
                            ? "Creating Account..."
                            : "Create Account"}
                    </button>

                </form>


                {/* =================================================
                    LOGIN LINK
                ================================================= */}

                <div
                    style={{
                        textAlign: "center",
                        marginTop: "25px",
                        color: "#64748b",
                    }}
                >

                    Already have an account?{" "}

                    <Link
                        to="/login"
                        style={{
                            color: "#15803d",
                            fontWeight: "700",
                            textDecoration: "none",
                        }}
                    >
                        Login
                    </Link>

                </div>

            </div>

        </div>
    );
}

export default Register;