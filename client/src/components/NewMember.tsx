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
    gender: "",
    dateOfBirth: "",
    bloodGroup: "",
    height: "",
    weight: "",
    illness: "",
    medicalHistory: "",
    doctorRecommendations: "",
    notes: "",
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

      await api.post(ENDPOINTS.MEMBER.CREATE, {
        ...formData,
        height: formData.height ? Number(formData.height) : null,
        weight: formData.weight ? Number(formData.weight) : null,
        medicalHistory: formData.medicalHistory
          ? formData.medicalHistory.split(",").map((item) => item.trim())
          : [],
        doctorRecommendations: formData.doctorRecommendations
          ? formData.doctorRecommendations.split(",").map((item) => item.trim())
          : [],
      });

      alert("Member added successfully.");
      navigate("/profile");
    } catch (error) {
      console.error(error);
      alert("Failed to add member.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Paper className="rounded-2xl p-8">
        <Typography variant="h4" fontWeight={700} mb={4}>
          Add Family Member
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-5 md:grid-cols-2"
        >
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
            value={formData.email}
            onChange={handleChange}
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
            <MenuItem value="Other">Other</MenuItem>
          </TextField>

          <TextField
            select
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            fullWidth
          >
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>

          <TextField
            type="date"
            name="dateOfBirth"
            label="Date of Birth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
            fullWidth
          />

          <TextField
            label="Blood Group"
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Height (cm)"
            name="height"
            type="number"
            value={formData.height}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Weight (kg)"
            name="weight"
            type="number"
            value={formData.weight}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            className="md:col-span-2"
            label="Illness"
            name="illness"
            value={formData.illness}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            className="md:col-span-2"
            label="Medical History (comma separated)"
            name="medicalHistory"
            value={formData.medicalHistory}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
          />

          <TextField
            className="md:col-span-2"
            label="Doctor Recommendations (comma separated)"
            name="doctorRecommendations"
            value={formData.doctorRecommendations}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
          />

          <TextField
            className="md:col-span-2"
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            multiline
            rows={4}
            fullWidth
          />

          <div className="md:col-span-2 flex justify-end">
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
