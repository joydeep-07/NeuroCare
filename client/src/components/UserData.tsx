import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import ENDPOINTS from "../api/endPoints";

interface User {
  _id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  relationship?: string;
  gender?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  height?: number;
  weight?: number;
  illness?: string;
  notes?: string;
  medicalHistory?: string[];
  doctorRecommendations?: string[];
  avatar?: string;
  family?: any;
}

const UserData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await api.get(ENDPOINTS.PROFILE.GET);

      setUser(data.user);
    } catch (error: any) {
      console.error(error.response?.data || error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <button
        onClick={fetchProfile}
        className="px-4 py-2 rounded bg-blue-600 text-white"
      >
        Refresh Profile
      </button>

      <h1 className="text-3xl font-bold">User Profile</h1>

      <div>
        <strong>Full Name:</strong> {user.fullName}
      </div>
      <div>
        <strong>Email:</strong> {user.email}
      </div>
      <div>
        <strong>Phone:</strong> {user.phone}
      </div>
      <div>
        <strong>Relationship:</strong> {user.relationship}
      </div>
      <div>
        <strong>Gender:</strong> {user.gender}
      </div>
      <div>
        <strong>Date of Birth:</strong> {user.dateOfBirth}
      </div>
      <div>
        <strong>Blood Group:</strong> {user.bloodGroup}
      </div>
      <div>
        <strong>Height:</strong> {user.height} cm
      </div>
      <div>
        <strong>Weight:</strong> {user.weight} kg
      </div>
      <div>
        <strong>Current Problem:</strong> {user.illness}
      </div>
      <div>
        <strong>Notes:</strong> {user.notes}
      </div>

      <div>
        <strong>Medical History:</strong>
        <ul className="list-disc ml-6">
          {user.medicalHistory?.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <div>
        <strong>Doctor Recommendations:</strong>
        <ul className="list-disc ml-6">
          {user.doctorRecommendations?.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <div>
        <strong>Family:</strong>
        <pre>{JSON.stringify(user.family, null, 2)}</pre>
      </div>
    </div>
  );
};

export default UserData;
