import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import api from "../api/axios";
import ENDPOINTS from "../api/endPoints";

const NewMember = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    relationship: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      await api.post(ENDPOINTS.MEMBER.CREATE, formData);

      alert("Family member added successfully.");

      navigate("/profile");
    } catch (error: any) {
      console.error(error);

      alert(error?.response?.data?.message || "Failed to add family member.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Paper className="rounded-2xl p-8 shadow-md">
        <Typography variant="h4" fontWeight={700} mb={4}>
          Add Family Member
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-5 md:grid-cols-2"
        >
          {" "}
          <TextField
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            select
            label="Relationship"
            name="relationship"
            value={formData.relationship}
            onChange={handleChange}
            required
            fullWidth
          >
            <MenuItem value="Father">Father</MenuItem>
            <MenuItem value="Mother">Mother</MenuItem>
            <MenuItem value="Brother">Brother</MenuItem>
            <MenuItem value="Sister">Sister</MenuItem>
            <MenuItem value="Spouse">Spouse</MenuItem>
            <MenuItem value="Son">Son</MenuItem>
            <MenuItem value="Daughter">Daughter</MenuItem>
            <MenuItem value="Grandfather">Grandfather</MenuItem>
            <MenuItem value="Grandmother">Grandmother</MenuItem>
            <MenuItem value="Uncle">Uncle</MenuItem>
            <MenuItem value="Aunt">Aunt</MenuItem>
            <MenuItem value="Cousin">Cousin</MenuItem>
            <MenuItem value="Friend">Friend</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
          <div className="md:col-span-2 mt-4 flex justify-end gap-4">
            <Button
              variant="outlined"
              onClick={() => navigate("/profile")}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              type="submit"
              disabled={loading}
              size="large"
            >
              {loading ? "Adding..." : "Add Member"}
            </Button>
          </div>
        </Box>
      </Paper>
    </div>
  );
};

export default NewMember;