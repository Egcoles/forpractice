import { useState } from "react";
import { Box, Button, CircularProgress, Paper, TextField, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const RegisterPage = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.username.trim()) newErrors.username = "Username is required";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5125/api/auth/register", {
        username: form.username,
        password: form.password
      });

      console.log("Registered:", res.data);
      //Redirect to login page
      navigate("/");
    } catch (err) {
      setErrors({ general: "Registration failed. Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
        padding: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          width: "100%",
          maxWidth: 400,
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Register
        </Typography>

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth margin="normal" label="Username"
            name="username" value={form.username}
            onChange={handleChange}
            error={!!errors.username}
            helperText={errors.username}
          />

          <TextField
            fullWidth margin="normal" label="Password" type="password"
            name="password" value={form.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
          />

          <TextField
            fullWidth margin="normal" label="Confirm Password" type="password"
            name="confirmPassword" value={form.confirmPassword}
            onChange={handleChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
          />

          {errors.general && (
            <Typography color="error" sx={{ mt: 1 }}>
              {errors.general}
            </Typography>
          )}

          <Button
            fullWidth
            variant="contained"
            type="submit"
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Register"}
          </Button>
        </form>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Already have an account?{" "}
          <Link to="/" style={{ textDecoration: "none", color: "#1976d2" }}>
            Login
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default RegisterPage;
