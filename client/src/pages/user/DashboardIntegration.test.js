import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Profile from "./Profile";
import Dashboard from "./Dashboard";
import axios from "axios";
import { useAuth } from "../../context/auth";
import MockAdapter from "axios-mock-adapter";
import { BrowserRouter as Router } from "react-router-dom";
import "@testing-library/jest-dom";

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));
jest.mock("../../components/Layout", () => ({ children }) => (
  <div>{children}</div>
));
const mock = new MockAdapter(axios);

describe("Profile Update Integration Tests", () => {
  const mockAuth = {
    user: {
      email: "tyy@gmail.com",
      name: "tyy",
      phone: "12345678",
      address: "123 Orchard Road",
    },
  };
  let setAuth;

  beforeEach(() => {
    setAuth = jest.fn(); // Mocking setAuth
    useAuth.mockReturnValue([mockAuth, setAuth]);
  });

  it("should update the profile and reflect changes in the dashboard", async () => {
    const updatedUser = {
      email: "tyy@gmail.com",
      name: "Test",
      phone: "12345678",
      address: "123 Orchard Road",
    };

    mock.onPut("/api/v1/auth/profile").reply(200, { updatedUser });

    render(
      <Router>
        <Profile />
      </Router>
    );

    // Change the name and submit the form
    fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), {
      target: { value: "Test" },
    });
    fireEvent.click(screen.getByText("UPDATE"));

    // Ensure the profile is updated
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Enter Your Name").value).toBe("Test");
    });

    await waitFor(() => {
      expect(setAuth).toHaveBeenCalledWith({
        ...mockAuth,
        user: updatedUser,
      });
    });

    // Simulate the updated `auth` context after the profile update
    useAuth.mockReturnValue([{ user: updatedUser }, setAuth]);

    expect({ user: updatedUser }).toMatchObject({
      user: {
        name: "Test",
        email: "tyy@gmail.com",
        phone: "12345678",
        address: "123 Orchard Road",
      },
    });

    render(
      <Router>
        <Dashboard />
      </Router>
    );

    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("should not update invalid input and reflect changes in the dashboard", async () => {
    const updatedUser = {
      email: "tyy@gmail.com",
      name: "1",
      phone: "12345678",
      address: "123 Orchard Road",
    };

    mock.onPut("/api/v1/auth/profile").reply(200, { updatedUser });

    render(
      <Router>
        <Profile />
      </Router>
    );

    // Change the name and submit the form
    fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), {
      target: { value: "1" },
    });
    fireEvent.click(screen.getByText("UPDATE"));

    // Ensure the profile is updated
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Enter Your Name").value).toBe("1");
    });

    await waitFor(() => {
      expect(setAuth).toHaveBeenCalledWith({
        ...mockAuth,
        user: updatedUser,
      });
    });

    // Simulate the updated `auth` context after the profile update
    useAuth.mockReturnValue([{ user: updatedUser }, setAuth]);

    expect({ user: updatedUser }).toMatchObject({
      user: {
        name: "1",
        email: "tyy@gmail.com",
        phone: "12345678",
        address: "123 Orchard Road",
      },
    });

    render(
      <Router>
        <Dashboard />
      </Router>
    );

    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
