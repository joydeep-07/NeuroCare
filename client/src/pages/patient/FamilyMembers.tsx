import { useState, useEffect } from "react";
import { Users, UserPlus, Link2, Trash2, Edit3, ShieldCheck, HeartPulse, FileText, CheckCircle } from "lucide-react";
import api from "../../api/axios";
import ENDPOINTS from "../../api/endPoints";

interface Member {
  _id: string;
  relationship: string;
  isLinkedAccount: boolean;
  isSelf: boolean;
  user: {
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
    avatar: string;
    isProfileComplete: boolean;
  };
}

const FamilyMembers = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [relationship, setRelationship] = useState("Father");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("Male");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [illness, setIllness] = useState("");
  const [notes, setNotes] = useState("");

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get(ENDPOINTS.MEMBER.GET_ALL);
      if (res.data.success) {
        setMembers(res.data.members);
      }
    } catch (err) {
      console.log("Error loading family members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleOpenAddForm = () => {
    setEditingMember(null);
    setEmail("");
    setFullName("");
    setRelationship("Father");
    setPhone("");
    setGender("Male");
    setDateOfBirth("");
    setBloodGroup("O+");
    setHeight("");
    setWeight("");
    setIllness("");
    setNotes("");
    setFormError("");
    setShowForm(true);
  };

  const handleOpenEditForm = (member: Member) => {
    setEditingMember(member);
    setEmail(member.user.email || "");
    setFullName(member.user.fullName || "");
    setRelationship(member.relationship || "Family Member");
    setPhone(member.user.phone || "");
    setGender(member.user.gender || "Male");
    setDateOfBirth(member.user.dateOfBirth ? new Date(member.user.dateOfBirth).toISOString().split("T")[0] : "");
    setBloodGroup(member.user.bloodGroup || "O+");
    setHeight(member.user.height ? String(member.user.height) : "");
    setWeight(member.user.weight ? String(member.user.weight) : "");
    setIllness(member.user.illness || "");
    setFormError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setFormError("Email address is required.");
      return;
    }

    try {
      setFormLoading(true);
      setFormError("");

      if (editingMember) {
        // Update
        const res = await api.put(ENDPOINTS.MEMBER.UPDATE(editingMember._id), {
          relationship,
          fullName,
          phone,
          gender,
          dateOfBirth: dateOfBirth || null,
          bloodGroup,
          height: height ? Number(height) : null,
          weight: weight ? Number(weight) : null,
          illness,
          notes,
        });

        if (res.data.success) {
          alert(res.data.message);
          setShowForm(false);
          fetchMembers();
        }
      } else {
        // Add
        const res = await api.post(ENDPOINTS.MEMBER.CREATE, {
          email,
          fullName,
          relationship,
          phone,
          gender,
          dateOfBirth: dateOfBirth || null,
          bloodGroup,
          height: height ? Number(height) : null,
          weight: weight ? Number(weight) : null,
          illness,
          notes,
        });

        if (res.data.success) {
          alert(res.data.message);
          setShowForm(false);
          fetchMembers();
        }
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to save family member.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm("Remove this family relationship? Both user accounts will remain intact.")) return;

    try {
      const res = await api.delete(ENDPOINTS.MEMBER.DELETE(id));
      if (res.data.success) {
        alert(res.data.message);
        fetchMembers();
      }
    } catch (err: any) {
      alert("Failed to remove relationship.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] shadow-lg">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--accent-primary)] mb-2">
            <Users size={16} /> Family Healthcare Vault
          </span>
          <h1 className="text-3xl font-bold font-heading text-[var(--text-main)]">Family Members</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Manage medical records & book appointments for your family. Entering an email of an existing NeuroCare user automatically links both accounts with live profile sync.
          </p>
        </div>

        <button
          onClick={handleOpenAddForm}
          className="px-6 py-3 rounded-2xl bg-[var(--accent-primary)] text-white text-xs font-semibold shadow-md hover:opacity-90 transition-all flex items-center gap-2"
        >
          <UserPlus size={16} /> Add Family Member
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-[var(--card-bg)] rounded-3xl border border-[var(--border-light)] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold font-heading">
                {editingMember ? "Edit Family Member" : "Add Family Member"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-white hover:opacity-80">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-medium">
                  {formError}
                </div>
              )}

              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[var(--text-main)]">
                💡 <strong>Auto-Link Feature</strong>: If the email matches a registered NeuroCare user, a reciprocal link will be established automatically!
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    disabled={!!editingMember}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="family.member@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Relationship *</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)]"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)]"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Current Illness / Known Conditions</label>
                <input
                  type="text"
                  value={illness}
                  onChange={(e) => setIllness(e.target.value)}
                  placeholder="e.g. Hypertension, Diabetes, Asthma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)]"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--border-light)]">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--border-light)] text-[var(--text-main)] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white font-semibold"
                >
                  {formLoading ? "Saving..." : "Save Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] animate-pulse" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)]">
          <Users size={48} className="mx-auto text-[var(--text-secondary)] mb-4" />
          <h3 className="text-xl font-bold text-[var(--text-main)] font-heading">No Family Members Added</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1 mb-6">
            Add your parents, spouse, or children to manage their appointments and medical history.
          </p>
          <button
            onClick={handleOpenAddForm}
            className="px-6 py-3 rounded-2xl bg-[var(--accent-primary)] text-white text-xs font-semibold"
          >
            Add First Family Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((m) => (
            <div
              key={m._id}
              className="rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] p-6 shadow-sm hover:shadow-lg transition-all space-y-4 relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-bold uppercase tracking-wider">
                    {m.relationship}
                  </span>

                  {m.isLinkedAccount ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                      <Link2 size={12} /> Linked Account
                    </span>
                  ) : (
                    <span className="text-[10px] text-[var(--text-secondary)]">Standard Profile</span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <img
                    src={
                      m.user.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(m.user.fullName || "User")}&background=0ea5e9&color=fff`
                    }
                    alt={m.user.fullName}
                    className="w-14 h-14 rounded-2xl object-cover border border-[var(--border-light)]"
                  />
                  <div>
                    <h3 className="text-base font-bold text-[var(--text-main)] font-heading">{m.user.fullName || "Unnamed Member"}</h3>
                    <p className="text-xs text-[var(--text-secondary)]">{m.user.email}</p>
                    <p className="text-xs text-[var(--text-secondary)] font-mono">{m.user.phone || "No phone added"}</p>
                  </div>
                </div>

                {/* Health Metrics */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs pt-4 border-t border-[var(--border-light)]">
                  <div className="bg-[var(--bg-main)] p-2.5 rounded-xl border border-[var(--border-light)]">
                    <span className="text-[var(--text-secondary)] block text-[10px]">Blood Group</span>
                    <span className="font-bold text-rose-500">{m.user.bloodGroup || "Not Set"}</span>
                  </div>
                  <div className="bg-[var(--bg-main)] p-2.5 rounded-xl border border-[var(--border-light)]">
                    <span className="text-[var(--text-secondary)] block text-[10px]">Gender</span>
                    <span className="font-semibold text-[var(--text-main)]">{m.user.gender || "Not Set"}</span>
                  </div>
                </div>

                {m.user.illness && (
                  <div className="mt-2 text-xs p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300">
                    <strong>Current Condition:</strong> {m.user.illness}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--border-light)] text-xs">
                {m.isLinkedAccount ? (
                  <span className="text-[10px] text-[var(--text-secondary)] italic">
                    🔒 Personal info managed by user
                  </span>
                ) : (
                  <button
                    onClick={() => handleOpenEditForm(m)}
                    className="text-[var(--accent-primary)] font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Edit3 size={14} /> Edit Details
                  </button>
                )}

                {!m.isSelf && (
                  <button
                    onClick={() => handleRemove(m._id)}
                    className="text-rose-500 font-semibold flex items-center gap-1 hover:underline ml-auto"
                  >
                    <Trash2 size={14} /> Remove Link
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FamilyMembers;
