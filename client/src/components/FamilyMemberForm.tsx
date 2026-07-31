import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

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

interface FamilyMemberFormProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  editingMember: Member | null;
  formLoading: boolean;
  formError: string;
}

const FamilyMemberForm: React.FC<FamilyMemberFormProps> = ({
  show,
  onClose,
  onSubmit,
  editingMember,
  formLoading,
  formError,
}) => {
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

  useEffect(() => {
    if (editingMember) {
      setEmail(editingMember.user.email || "");
      setFullName(editingMember.user.fullName || "");
      setRelationship(editingMember.relationship || "Family Member");
      setPhone(editingMember.user.phone || "");
      setGender(editingMember.user.gender || "Male");
      setDateOfBirth(
        editingMember.user.dateOfBirth
          ? new Date(editingMember.user.dateOfBirth).toISOString().split("T")[0]
          : "",
      );
      setBloodGroup(editingMember.user.bloodGroup || "O+");
      setHeight(
        editingMember.user.height ? String(editingMember.user.height) : "",
      );
      setWeight(
        editingMember.user.weight ? String(editingMember.user.weight) : "",
      );
      setIllness(editingMember.user.illness || "");
    } else {
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
    }
  }, [editingMember, show]);

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
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
  };

  return (
    <AnimatePresence>
      {show && (
        <div data-lenis-prevent className="fixed h-screen inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Left Sliding Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-y-0 left-0 max-w-xl w-full bg-[var(--card-bg)] border-r border-[var(--border-light)] shadow-2xl flex flex-col z-10"
          >
            {/* Drawer Header */}
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold font-heading">
                {editingMember ? "Edit Family Member" : "Add Family Member"}
              </h2>
              <button
                onClick={onClose}
                className="text-white hover:opacity-80 p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Form Body */}
            <form
              onSubmit={handleSubmitForm}
              className="p-6 overflow-y-auto space-y-4 text-xs flex-1"
            >
              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-medium">
                  {formError}
                </div>
              )}

              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[var(--text-main)]">
                💡 <strong>Auto-Link Feature</strong>: If the email matches a
                registered NeuroCare user, a reciprocal link will be established
                automatically!
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    Email Address *
                  </label>
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
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    Relationship *
                  </label>
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
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    Gender
                  </label>
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
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    Blood Group
                  </label>
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
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                  Current Illness / Known Conditions
                </label>
                <input
                  type="text"
                  value={illness}
                  onChange={(e) => setIllness(e.target.value)}
                  placeholder="e.g. Hypertension, Diabetes, Asthma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)]"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--border-light)] mt-auto">
                <button
                  type="button"
                  onClick={onClose}
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FamilyMemberForm;
