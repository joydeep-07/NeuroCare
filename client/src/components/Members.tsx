import { useEffect, useState } from "react";
import api from "../api/axios";
import ENDPOINTS from "../api/endPoints";

interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  bloodGroup: string;
  height: number;
  weight: number;
  illness: string;
  notes: string;
  avatar: string;
}

interface Member {
  _id: string;
  relationship: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);

      const { data } = await api.get(ENDPOINTS.MEMBER.GET_ALL);

      console.log("Members API Response:", data);

      setMembers(data.members || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">Loading...</div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Family Members</h1>

      {members.length === 0 ? (
        <div>No members found.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => {
            if (!member.user) {
              return (
                <div
                  key={member._id}
                  className="rounded-xl border border-red-300 bg-red-50 p-5"
                >
                  <p className="font-semibold text-red-600">
                    Invalid member record
                  </p>

                  <p className="mt-2 text-sm">
                    This member does not have a linked User document.
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Relationship: {member.relationship}
                  </p>
                </div>
              );
            }

            return (
              <div
                key={member._id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex items-center gap-4">
                  <img
                    src={
                      member.user.avatar
                        ? member.user.avatar
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            member.user.fullName,
                          )}`
                    }
                    alt={member.user.fullName}
                    className="h-16 w-16 rounded-full object-cover"
                  />

                  <div>
                    <h2 className="text-xl font-semibold">
                      {member.user.fullName}
                    </h2>

                    <p className="text-sm text-gray-500">
                      {member.relationship}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Email:</strong> {member.user.email}
                  </p>

                  <p>
                    <strong>Phone:</strong> {member.user.phone || "-"}
                  </p>

                  <p>
                    <strong>Gender:</strong> {member.user.gender || "-"}
                  </p>

                  <p>
                    <strong>Blood Group:</strong>{" "}
                    {member.user.bloodGroup || "-"}
                  </p>

                  <p>
                    <strong>Illness:</strong> {member.user.illness || "-"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Members;
