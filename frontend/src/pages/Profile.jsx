import React, { useState, useContext } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Profile() {

  const { user, setUser, logout } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    branch: user?.branch || "",
    year: user?.year || ""
  });

  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: ""
  });

  const [message, setMessage] = useState("");

  const navigate = useNavigate();



  const handleUpdate = async (e) => {

    e.preventDefault();

    try {

      const res = await api.put("/auth/update", formData);

      setUser(res.data.user);

      setMessage("Profile updated successfully");

    } catch (err) {

      console.error(err);

      setMessage(err.response?.data?.message || "Update failed");

    }

  };



  const handleChangePassword = async (e) => {

    e.preventDefault();

    try {

      await api.post("/auth/change-password", passData);

      setPassData({
        currentPassword: "",
        newPassword: ""
      });

      setMessage("Password changed successfully");

    } catch (err) {

      console.error(err);

      setMessage(err.response?.data?.message || "Password change failed");

    }

  };



  const handleDelete = async () => {

    if (!window.confirm("Are you sure you want to delete your account?")) return;

    try {

      await api.delete("/auth/delete");

      logout();

      navigate("/login");

    } catch (err) {

      console.error(err);

      setMessage("Failed to delete account");

    }

  };



  return (

    <div className="glass-container">

      <div className="auth-header">
        <h1>My Profile</h1>
      </div>

      <button
        className="btn btn-primary mb-4"
        onClick={logout}
        style={{ backgroundColor: "#ea580c" }}
      >
        Logout
      </button>

      <button
        className="btn btn-danger mb-4"
        onClick={handleDelete}
      >
        Delete Account
      </button>

      {message && (
        <p style={{ textAlign: "center", color: "#10b981", marginBottom: "1rem" }}>
          {message}
        </p>
      )}



      <form onSubmit={handleUpdate} className="mb-4">

        <div className="form-group">
          <input
            className="form-input"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <input
            className="form-input"
            value={formData.branch}
            onChange={(e) =>
              setFormData({ ...formData, branch: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <input
            className="form-input"
            type="number"
            value={formData.year}
            onChange={(e) =>
              setFormData({ ...formData, year: e.target.value })
            }
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ backgroundColor: "#ea580c" }}
        >
          Update Profile
        </button>

      </form>



      <h3 className="mb-4 mt-4" style={{ fontSize: "1.2rem" }}>
        Change Password
      </h3>

      <form onSubmit={handleChangePassword}>

        <div className="form-group">
          <input
            type="password"
            placeholder="Current Password"
            required
            className="form-input"
            value={passData.currentPassword}
            onChange={(e) =>
              setPassData({
                ...passData,
                currentPassword: e.target.value
              })
            }
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            placeholder="New Password"
            required
            className="form-input"
            value={passData.newPassword}
            onChange={(e) =>
              setPassData({
                ...passData,
                newPassword: e.target.value
              })
            }
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ backgroundColor: "#ea580c" }}
        >
          Update Password
        </button>

      </form>

    </div>

  );

}

export default Profile;