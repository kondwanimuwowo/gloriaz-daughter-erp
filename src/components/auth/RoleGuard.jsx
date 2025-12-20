import { useAuthStore } from "../../store/useAuthStore";

export default function RoleGuard({ children, roles = [], fallback = null }) {
  const { profile } = useAuthStore();

  if (!profile) return fallback;

  if (roles.length === 0) return children;

  if (roles.includes(profile.role)) {
    return children;
  }

  return fallback;
}

