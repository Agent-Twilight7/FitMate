import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { loginUser } from "../utils/API";
import Auth from "../utils/auth";
import Header from "../components/Header";

export default function Login() {
  const [formState, setFormState] = useState({ email: "", password: "" });
  const [showAlert, setShowAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Store custom error message

  const loggedIn = Auth.loggedIn();

  // Update form state on input change
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormState({
      ...formState,
      [name]: value,
    });
  };

  // Submit form
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    try {
      // Attempt to log in the user
      const response = await loginUser(formState);

      if (!response.ok) {
        // Extract the error message from the backend
        const errorData = await response.json();

        // Set specific error messages based on backend response
        if (errorData.message.includes("not found")) {
          setErrorMessage("The email address you entered does not exist.");
        } else if (errorData.message.includes("Invalid password")) {
          setErrorMessage("The password you entered is incorrect.");
        } else {
          setErrorMessage("Login failed. Please check your credentials.");
        }

        throw new Error(errorData.message || "Login failed.");
      }

      // Extract token and user data
      const { token, user } = await response.json();
      Auth.login(token);
      console.log(user);
    } catch (err) {
      console.error(err.message);
      setShowAlert(true);
    }

    // Clear form values after submission
    setFormState({
      email: "",
      password: "",
    });
  };

  // If the user is logged in, redirect to the home page
  if (loggedIn) {
    return <Navigate to="/" />;
  }

  return (
    <div className="signup d-flex flex-column align-items-center justify-content-center text-center">
      <Header />
      <form onSubmit={handleFormSubmit} className="signup-form d-flex flex-column">
        {/* --------------------email-------------------- */}
        <label htmlFor="email">Email</label>
        <input
          className="form-input"
          value={formState.email}
          placeholder="youremail@gmail.com"
          name="email"
          type="email"
          onChange={handleChange}
        />

        {/* -------------------- password-------------------- */}
        <label htmlFor="password">Password</label>
        <input
          className="form-input"
          value={formState.password}
          placeholder="********"
          name="password"
          type="password"
          onChange={handleChange}
        />

        {/* --------------------login btn-------------------- */}
        <div className="btn-div">
          <button
            disabled={!(formState.email && formState.password)} // Enable only when both fields are filled
            className="signup-btn mx-auto my-auto"
          >
            Login
          </button>
        </div>

        {/* --------------------signup link-------------------- */}
        <p className="link-btn">
          New to FitMate? <Link to="/signup">Create one</Link>
        </p>

        {/* -------------------- Error Alert -------------------- */}
        {showAlert && <div className="err-message">{errorMessage}</div>}
      </form>
    </div>
  );
}
