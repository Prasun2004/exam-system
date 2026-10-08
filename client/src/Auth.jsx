import React, { useState } from "react";
import api from "./componat/api";

const API_URL = "http://localhost:8080";

const Auth = () => {
  const [isSignup, setIsSignup] = useState(false);

  const [showLoginPassword, setShowLoginPassword] =
    useState(false);

  const [showSignupPassword, setShowSignupPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    name:"",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });


  // ==================================================
  // LOGIN INPUT
  // ==================================================

  const handleLoginChange = (e) => {
    setLoginData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };


  // ==================================================
  // SIGNUP INPUT
  // ==================================================

  const handleSignupChange = (e) => {
    setSignupData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };


  // ==================================================
  // LOGIN API
  // ==================================================
const handleLogin = async (e) => {
  e.preventDefault();

  if (!loginData.email || !loginData.password) {
    alert("Please enter email and password");
    return;
  }

  try {
    setLoading(true);

    const response = await api.post(
      "/auth/login",
      loginData
    );

    const data = response.data;

    if (!data.success) {
      alert(data.message || "Login failed");
      return;
    }

    // ==========================================
    // STORE JWT
    // ==========================================

    localStorage.setItem(
      "token",
      data.token
    );

    // ==========================================
    // STORE USER
    // ==========================================

    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );

    console.log("Login successful:", data);

    // ==========================================
    // ROLE BASED NAVIGATION
    // ==========================================

    if (data.user.role === "student") {
      window.location.href = "/question";
      return;
    }

    if (data.user.role === "teacher") {
      window.location.href = "/CreateTest";
      return;
    }

  } catch (error) {

    console.error(
      "Login error:",
      error
    );

    alert(
      error.response?.data?.message ||
      "Unable to connect to the server"
    );

  } finally {
    setLoading(false);
  }
};

  // ==================================================
  // SIGNUP API
  // ==================================================

  const handleSignup = async (e) => {
    e.preventDefault();

    if (
      !signupData.name ||
      !signupData.email ||
      !signupData.password ||
      !signupData.confirmPassword ||
      !signupData.role
    ) {
      alert("Please fill all fields");
      return;
    }

    if (
      signupData.password !==
      signupData.confirmPassword
    ) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/auth/signup`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify(signupData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Signup failed");
        return;
      }

      alert(
        "Account created successfully. Please login."
      );

      // Clear signup form
      setSignupData({
        name:"",
        email: "",
        password: "",
        confirmPassword: "",
        role: "student",
      });

      // Switch back to login
      setIsSignup(false);

    } catch (error) {
      console.error("Signup error:", error);

      alert(
        "Unable to connect to the server"
      );

    } finally {
      setLoading(false);
    }
  };


  // ==================================================
  // FORGOT PASSWORD
  // ==================================================

  const handleForgotPassword = () => {
    alert(
      "Forgot password API will be added later."
    );
  };


  return (
    <div className="min-h-screen bg-[#079b83] flex items-center justify-center px-4">

      <div className="w-full max-w-md">


        {/* =================================================
            LOGIN
        ================================================= */}

        {!isSignup && (
          <div className="bg-white rounded-md shadow-xl px-8 py-8">

            <h2 className="text-2xl font-semibold text-center text-gray-900 mb-7">
              Login
            </h2>


            <form onSubmit={handleLogin}>


              {/* EMAIL */}

              <div className="mb-5">

                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"

                  value={loginData.email}
                  onChange={handleLoginChange}

                  required

                  autoComplete="email"

                  className="
                    w-full
                    h-11
                    px-3
                    border
                    border-gray-300
                    rounded-md
                    text-sm
                    outline-none
                    focus:border-[#079b83]
                    focus:ring-1
                    focus:ring-[#079b83]
                  "
                />

              </div>


              {/* PASSWORD */}

              <div className="relative mb-3">

                <input
                  type={
                    showLoginPassword
                      ? "text"
                      : "password"
                  }

                  name="password"

                  placeholder="Enter your password"

                  value={loginData.password}
                  onChange={handleLoginChange}

                  required

                  autoComplete="current-password"

                  className="
                    w-full
                    h-11
                    px-3
                    pr-11
                    border
                    border-gray-300
                    rounded-md
                    text-sm
                    outline-none
                    focus:border-[#079b83]
                    focus:ring-1
                    focus:ring-[#079b83]
                  "
                />


                <button
                  type="button"

                  onClick={() =>
                    setShowLoginPassword(
                      (previous) => !previous
                    )
                  }

                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-gray-500
                    hover:text-[#079b83]
                  "
                >
                  {showLoginPassword ? "🙈" : "👁️"}
                </button>

              </div>


              {/* FORGOT */}

              <div className="mb-5">

                <button
                  type="button"
                  onClick={handleForgotPassword}

                  className="
                    text-sm
                    text-[#079b83]
                    hover:underline
                  "
                >
                  Forgot password?
                </button>

              </div>


              {/* LOGIN BUTTON */}

              <button
                type="submit"

                disabled={loading}

                className="
                  w-full
                  h-11
                  bg-[#079b83]
                  hover:bg-[#078a74]
                  disabled:bg-gray-400
                  text-white
                  font-medium
                  rounded-md
                  transition
                "
              >
                {loading
                  ? "Please wait..."
                  : "Login"}
              </button>

            </form>


            {/* SWITCH SIGNUP */}

            <p className="text-center text-sm text-gray-700 mt-5">

              Don't have an account?{" "}

              <button
                type="button"

                onClick={() => {
                  setIsSignup(true);
                  setLoginData({
                    email: "",
                    password: "",
                  });
                }}

                className="
                  text-[#079b83]
                  font-semibold
                  hover:underline
                "
              >
                Signup
              </button>

            </p>

          </div>
        )}


        {/* =================================================
            SIGNUP
        ================================================= */}

        {isSignup && (
          <div className="bg-white rounded-md shadow-xl px-8 py-8">

            <h2 className="text-2xl font-semibold text-center text-gray-900 mb-7">
              Signup
            </h2>


            <form onSubmit={handleSignup}>


              {/* EMAIL */}

              <div className="mb-4">

              <input
                  type="text"
                  name="name"

                  placeholder="Enter your name"

                  value={signupData.name}
                  onChange={handleSignupChange}
                  required
                  className="
                    w-full
                    h-11
                    px-3
                    border
                    border-gray-300
                    rounded-md
                    text-sm
                    outline-none
                    focus:border-[#079b83]
                    focus:ring-1
                    focus:ring-[#079b83]
                  "
                />
                </div>

                <div className=" mb-4">

                <input
                  type="email"
                  name="email"

                  placeholder="Enter your email"

                  value={signupData.email}
                  onChange={handleSignupChange}

                  required

                  autoComplete="email"

                  className="
                    w-full
                    h-11
                    px-3
                    border
                    border-gray-300
                    rounded-md
                    text-sm
                    outline-none
                    focus:border-[#079b83]
                    focus:ring-1
                    focus:ring-[#079b83]
                  "
                />

              </div>


              {/* ROLE */}

              <div className="mb-4">

                <select
                  name="role"

                  value={signupData.role}
                  onChange={handleSignupChange}

                  className="
                    w-full
                    h-11
                    px-3
                    border
                    border-gray-300
                    rounded-md
                    text-sm
                    text-gray-600
                    outline-none
                    focus:border-[#079b83]
                    focus:ring-1
                    focus:ring-[#079b83]
                  "
                >

                  <option value="student">
                    Student
                  </option>

                  <option value="teacher">
                    Teacher
                  </option>

                </select>

              </div>


              {/* PASSWORD */}

              <div className="relative mb-4">

                <input
                  type={
                    showSignupPassword
                      ? "text"
                      : "password"
                  }

                  name="password"

                  placeholder="Create a password"

                  value={signupData.password}
                  onChange={handleSignupChange}

                  required

                  autoComplete="new-password"

                  className="
                    w-full
                    h-11
                    px-3
                    pr-11
                    border
                    border-gray-300
                    rounded-md
                    text-sm
                    outline-none
                    focus:border-[#079b83]
                    focus:ring-1
                    focus:ring-[#079b83]
                  "
                />


                <button
                  type="button"

                  onClick={() =>
                    setShowSignupPassword(
                      (previous) => !previous
                    )
                  }

                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-gray-500
                    hover:text-[#079b83]
                  "
                >
                  {showSignupPassword
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>


              {/* CONFIRM PASSWORD */}

              <div className="relative mb-5">

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }

                  name="confirmPassword"

                  placeholder="Confirm your password"

                  value={
                    signupData.confirmPassword
                  }

                  onChange={
                    handleSignupChange
                  }

                  required

                  autoComplete="new-password"

                  className="
                    w-full
                    h-11
                    px-3
                    pr-11
                    border
                    border-gray-300
                    rounded-md
                    text-sm
                    outline-none
                    focus:border-[#079b83]
                    focus:ring-1
                    focus:ring-[#079b83]
                  "
                />


                <button
                  type="button"

                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) => !previous
                    )
                  }

                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-gray-500
                    hover:text-[#079b83]
                  "
                >
                  {showConfirmPassword
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>


              {/* SIGNUP BUTTON */}

              <button
                type="submit"

                disabled={loading}

                className="
                  w-full
                  h-11
                  bg-[#079b83]
                  hover:bg-[#078a74]
                  disabled:bg-gray-400
                  text-white
                  font-medium
                  rounded-md
                  transition
                "
              >
                {loading
                  ? "Creating account..."
                  : "Signup"}
              </button>

            </form>


            {/* SWITCH LOGIN */}

            <p className="text-center text-sm text-gray-700 mt-5">

              Already have an account?{" "}

              <button
                type="button"

                onClick={() => {
                  setIsSignup(false);

                  setSignupData({
                    email: "",
                    password: "",
                    confirmPassword: "",
                    role: "student",
                  });
                }}

                className="
                  text-[#079b83]
                  font-semibold
                  hover:underline
                "
              >
                Login
              </button>

            </p>

          </div>
        )}

      </div>

    </div>
  );
};

export default Auth;