import React, { useState, useEffect } from "react";
import { FaUser } from "react-icons/fa";
import { User as LucideUser } from "lucide-react";

export interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: string; // e.g. "w-10 h-10", "w-14 h-14", "w-16 h-16", "h-20 w-20"
  className?: string;
  imageClassName?: string;
  iconSize?: number;
  iconType?: "fa" | "lucide";
  shape?: "circle" | "rounded-xl" | "rounded-2xl";
}

const getAutoIconSize = (sizeStr: string): number => {
  if (sizeStr.includes("20")) return 32;
  if (sizeStr.includes("16")) return 26;
  if (sizeStr.includes("14")) return 22;
  if (sizeStr.includes("12")) return 20;
  if (sizeStr.includes("10")) return 17;
  if (sizeStr.includes("9") || sizeStr.includes("8")) return 14;
  return 18;
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  alt = "User Avatar",
  name = "User",
  size = "w-10 h-10",
  className = "",
  imageClassName = "",
  iconSize,
  iconType = "fa",
  shape = "circle",
}) => {
  const [hasError, setHasError] = useState(false);

  // Reset error state if image source changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const isValidSrc = Boolean(
    src &&
    typeof src === "string" &&
    src.trim() !== "" &&
    !src.includes("null") &&
    !src.includes("undefined")
  );

  const roundedClass =
    shape === "rounded-2xl"
      ? "rounded-2xl"
      : shape === "rounded-xl"
      ? "rounded-xl"
      : "rounded-full";

  const resolvedIconSize = iconSize || getAutoIconSize(size);

  if (!isValidSrc || hasError) {
    return (
      <div
        className={`flex items-center justify-center shrink-0 bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-secondary)] shadow-xs select-none ${roundedClass} ${size} ${className}`}
        title={name || alt}
        aria-label={name || alt}
      >
        {iconType === "lucide" ? (
          <LucideUser size={resolvedIconSize} className="opacity-75 transition-opacity" />
        ) : (
          <FaUser size={resolvedIconSize} className="opacity-75 transition-opacity" />
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden shrink-0 flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--border-light)] ${roundedClass} ${size} ${className}`}
    >
      <img
        src={src || undefined}
        alt={alt || name}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover ${roundedClass} ${imageClassName}`}
      />
    </div>
  );
};

export default UserAvatar;
