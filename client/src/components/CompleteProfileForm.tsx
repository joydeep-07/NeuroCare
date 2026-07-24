import { useEffect, useState } from "react";
import {
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";

import api from "../api/axios";
import ENDPOINTS from "../api/endPoints";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

const relationships = [
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Son",
  "Daughter",
  "Spouse",
  "Grandfather",
  "Grandmother",
  "Other",
];

const bloodGroups = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

const genders = ["Male", "Female", "Other"];

const CompleteProfileForm = () => {
  const [loading, setLoading] = useState(true);
  const [isProfileCreated, setIsProfileCreated] = useState(false);
  const [medicalHistoryText, setMedicalHistoryText] = useState("");
  const [doctorRecommendationsText, setDoctorRecommendationsText] = useState("");

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
    notes: "",
    medicalHistory: [] as string[],
    doctorRecommendations: [] as string[],
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get(ENDPOINTS.PROFILE.GET);

        if (data.success && data.user) {
          const user = data.user;

        setFormData({
          fullName: user.fullName || "",
          email: user.email || "",
          phone: user.phone || "",
          relationship: user.relationship || "",
          gender: user.gender || "",
          dateOfBirth: user.dateOfBirth
            ? dayjs(user.dateOfBirth).format("YYYY-MM-DD")
            : "",
          bloodGroup: user.bloodGroup || "",
          height: user.height || "",
          weight: user.weight || "",
          illness: user.illness || "",
          notes: user.notes || "",
          medicalHistory: user.medicalHistory || [],
          doctorRecommendations: user.doctorRecommendations || [],
        });

        // ADD THESE TWO LINES
        setMedicalHistoryText((user.medicalHistory || []).join(", "));
        setDoctorRecommendationsText(
          (user.doctorRecommendations || []).join(", "),
        );

        setIsProfileCreated(!!user.fullName);

          setIsProfileCreated(!!user.fullName);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<{ name?: string; value: unknown }>
      | any,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const endpoint = isProfileCreated
        ? ENDPOINTS.PROFILE.UPDATE
        : ENDPOINTS.PROFILE.COMPLETE;

     const payload = {
       ...formData,
       medicalHistory: medicalHistoryText
         .split(",")
         .map((item) => item.trim())
         .filter(Boolean),

       doctorRecommendations: doctorRecommendationsText
         .split(",")
         .map((item) => item.trim())
         .filter(Boolean),
     };

     const response = await api.put(endpoint, payload);

      console.log(response.data);

      setIsProfileCreated(true);
    } catch (error: any) {
      console.error(error.response?.data || error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        Loading...
      </div>
    );
  }

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "var(--card-bg)",
      color: "var(--text-main)",
      borderRadius: "12px",

      "& fieldset": {
        borderColor: "var(--border-light)",
      },

      "&:hover fieldset": {
        borderColor: "var(--accent-primary)",
      },

      "&.Mui-focused fieldset": {
        borderColor: "var(--accent-primary)",
        borderWidth: "2px",
      },
    },

    "& .MuiInputLabel-root": {
      color: "var(--text-secondary)",
    },

    "& .MuiInputLabel-root.Mui-focused": {
      color: "var(--accent-primary)",
    },

    "& .MuiOutlinedInput-input": {
      color: "var(--text-main)",
    },

    "& .MuiSvgIcon-root": {
      color: "var(--text-secondary)",
    },
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto rounded-2xl p-8 space-y-10"
      style={{
        background: "var(--card-bg)",
        color: "var(--text-main)",
        border: "1px solid var(--border-light)",
        boxShadow: "0 8px 30px var(--shadow)",
      }}
    >
      <h2 className="text-3xl font-bold" style={{ color: "var(--text-main)" }}>
        {isProfileCreated ? "Update Profile" : "Complete Your Profile"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextField
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          fullWidth
          sx={inputSx}
        />

        <TextField
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          sx={inputSx}
        />

        <TextField
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          fullWidth
          sx={inputSx}
        />

        <FormControl fullWidth sx={inputSx}>
          <InputLabel>Relationship</InputLabel>
          <Select
            name="relationship"
            value={formData.relationship}
            label="Relationship"
            onChange={handleChange}
          >
            {relationships.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={inputSx}>
          <InputLabel>Gender</InputLabel>
          <Select
            name="gender"
            value={formData.gender}
            label="Gender"
            onChange={handleChange}
          >
            {genders.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Date of Birth"
            value={formData.dateOfBirth ? dayjs(formData.dateOfBirth) : null}
            onChange={(value) =>
              setFormData({
                ...formData,
                dateOfBirth: value ? value.format("YYYY-MM-DD") : "",
              })
            }
            slotProps={{
              textField: {
                fullWidth: true,
                sx: inputSx,
              },
            }}
          />
        </LocalizationProvider>

        <FormControl fullWidth sx={inputSx}>
          <InputLabel>Blood Group</InputLabel>
          <Select
            name="bloodGroup"
            value={formData.bloodGroup}
            label="Blood Group"
            onChange={handleChange}
          >
            {bloodGroups.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Height (cm)"
          type="number"
          name="height"
          value={formData.height}
          onChange={handleChange}
          fullWidth
          sx={inputSx}
        />

        <TextField
          label="Weight (kg)"
          type="number"
          name="weight"
          value={formData.weight}
          onChange={handleChange}
          fullWidth
          sx={inputSx}
        />

        <TextField
          label="Current Problem"
          name="illness"
          value={formData.illness}
          onChange={handleChange}
          fullWidth
          sx={inputSx}
        />
      </div>

      <div className="flex flex-col gap-5">
        <TextField
          label="Medical History (comma separated)"
          multiline
          rows={3}
          fullWidth
          sx={inputSx}
          value={medicalHistoryText}
          onChange={(e) => setMedicalHistoryText(e.target.value)}
        />

        <TextField
          label="Doctor Recommendations (comma separated)"
          multiline
          rows={3}
          fullWidth
          sx={inputSx}
          value={doctorRecommendationsText}
          onChange={(e) => setDoctorRecommendationsText(e.target.value)}
        />

        <TextField
          label="Notes"
          multiline
          rows={4}
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          fullWidth
          sx={inputSx}
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{
              minWidth: 220,
              height: 52,
              borderRadius: "12px",
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              backgroundColor: "var(--accent-primary)",
              color: "#fff",
              boxShadow: "0 8px 20px var(--shadow)",

              "&:hover": {
                backgroundColor: "var(--accent-secondary)",
              },
            }}
          >
            {isProfileCreated ? "Update Profile" : "Save Profile"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CompleteProfileForm;