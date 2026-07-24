import { useEffect, useState } from "react";
import {
  Avatar,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Typography,
} from "@mui/material";
import api from "../api/axios";
import ENDPOINTS from "../api/endPoints";

interface Member {
  _id: string;
  fullName: string;
  email?: string;
  phone?: string;
  relationship: string;
  gender: string;
  bloodGroup?: string;
  illness?: string;
  appointmentStatus: string;
}

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    try {
      const { data } = await api.get(ENDPOINTS.MEMBER.GET_ALL);

      setMembers(data.members || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Typography variant="h6" color="text.secondary">
          No family members found.
        </Typography>
      </div>
    );
  }

  return (
    <>
   
      <div className="mx-auto max-w-7xl p-6">
        <Typography variant="h4" fontWeight={700} mb={4}>
          Family Members
        </Typography>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <Card key={member._id} className="rounded-2xl shadow-sm">
              <CardContent>
                <div className="mb-4 flex items-center gap-4">
                  <Avatar sx={{ width: 56, height: 56 }}>
                    {member.fullName.charAt(0).toUpperCase()}
                  </Avatar>

                  <div>
                    <Typography variant="h6">{member.fullName}</Typography>

                    <Typography variant="body2" color="text.secondary">
                      {member.relationship}
                    </Typography>
                  </div>
                </div>

                <div className="space-y-2">
                  <Typography variant="body2">
                    <strong>Email:</strong> {member.email || "-"}
                  </Typography>

                  <Typography variant="body2">
                    <strong>Phone:</strong> {member.phone || "-"}
                  </Typography>

                  <Typography variant="body2">
                    <strong>Gender:</strong> {member.gender}
                  </Typography>

                  <Typography variant="body2">
                    <strong>Blood Group:</strong> {member.bloodGroup || "-"}
                  </Typography>

                  <Typography variant="body2">
                    <strong>Illness:</strong> {member.illness || "None"}
                  </Typography>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default Members;
