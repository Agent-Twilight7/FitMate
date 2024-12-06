import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { createUser } from "../utils/API"; // Assuming this function interacts with your backend
import Auth from "../utils/auth";
import Header from "../components/Header";

export default function Signup() {
  const loggedIn = Auth.loggedIn();

  // Form state
  const [formState, setFormState] = useState({
    username: "",
    email: "",
    password: "",
  });

  // Error message state
  const [errorMessage, setErrorMessage] = useState("");

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
      // Attempt to create a new user
      const response = await createUser(formState);

      // Check if response is not OK
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.errors ? errorData.errors.join(", ") : "Something went wrong!"
        );
      }

      // Extract token and user data
      const { token } = await response.json();
      Auth.login(token);
    } catch (err) {
      console.error(err.message);

      // Set a single error message
      setErrorMessage(err.message);
    }
  };

  // If the user is already logged in, redirect to the home page
  if (loggedIn) {
    return <Navigate to="/" />;
  }

  return (
    <div className="signup d-flex flex-column align-items-center justify-content-center text-center">
      <Header />
      <form onSubmit={handleFormSubmit} className="signup-form d-flex flex-column">
        {/* Username Field */}
        <label htmlFor="username">Username</label>
        <input
          className="form-input"
          value={formState.username}
          placeholder="Your username"
          name="username"
          type="text"
          onChange={handleChange}
        />

        {/* Email Field */}
        <label htmlFor="email">Email</label>
        <input
          className="form-input"
          value={formState.email}
          placeholder="youremail@gmail.com"
          name="email"
          type="email"
          onChange={handleChange}
        />

        {/* Password Field */}
        <label htmlFor="password">Password</label>
        <input
          className="form-input"
          value={formState.password}
          placeholder="********"
          name="password"
          type="password"
          onChange={handleChange}
        />

        {/* Signup Button */}
        <div className="btn-div">
          <button
            disabled={!(formState.username && formState.email && formState.password)}
            className="signup-btn mx-auto my-auto"
          >
            Sign Up
          </button>
        </div>

        {/* Link to Login */}
        <p className="link-btn">
          Already have an account? <Link to="/login">Log in</Link>
        </p>

        {/* Error Message */}
        {errorMessage && (
          <div
            style={{
              color: "red",
              marginTop: "10px",
              fontSize: "0.9rem",
              textAlign: "center",
            }}
          >
            {errorMessage}
          </div>
        )}
      </form>
    </div>
  );
}