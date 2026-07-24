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

      const response = await api.put(endpoint, formData);

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

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-8 space-y-10">
      <h2 className="text-3xl font-bold">
        {isProfileCreated ? "Update Profile" : "Complete Your Profile"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextField
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
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
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          fullWidth
        />

        <FormControl fullWidth>
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

        <FormControl fullWidth>
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
              },
            }}
          />
        </LocalizationProvider>

        <FormControl fullWidth>
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
        />

        <TextField
          label="Weight (kg)"
          type="number"
          name="weight"
          value={formData.weight}
          onChange={handleChange}
          fullWidth
        />

        <TextField
          label="Current Problem"
          name="illness"
          value={formData.illness}
          onChange={handleChange}
          fullWidth
        />
      </div>

      <div className="flex flex-col gap-5">
        <TextField
          label="Medical History (comma separated)"
          multiline
          rows={3}
          fullWidth
          value={formData.medicalHistory.join(", ")}
          onChange={(e) =>
            setFormData({
              ...formData,
              medicalHistory: e.target.value
                .split(",")
                .map((i) => i.trim())
                .filter(Boolean),
            })
          }
        />

        <TextField
          label="Doctor Recommendations (comma separated)"
          multiline
          rows={3}
          fullWidth
          value={formData.doctorRecommendations.join(", ")}
          onChange={(e) =>
            setFormData({
              ...formData,
              doctorRecommendations: e.target.value
                .split(",")
                .map((i) => i.trim())
                .filter(Boolean),
            })
          }
        />

        <TextField
          label="Notes"
          multiline
          rows={4}
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          fullWidth
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{
              minWidth: 220,
              height: 50,
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