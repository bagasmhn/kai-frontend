import { jwtDecode } from "jwt-decode";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "SUPER_ADMIN" | "ADMIN" | "PETUGAS" | "PEMBELI";
}

interface JwtPayload {
  sub: number;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "PETUGAS" | "PEMBELI";
  iat?: number;
  exp?: number;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem("token");
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;

  try {
    const storedUser = localStorage.getItem("user");

    if (
      !storedUser ||
      storedUser === "undefined" ||
      storedUser === "null"
    ) {
      return null;
    }

    const parsed = JSON.parse(storedUser) as Partial<User>;
    if (!parsed.email && !parsed.name) {
      return null;
    }

    return {
      id: Number(parsed.id) || 0,
      email: parsed.email || "",
      role: parsed.role || "PEMBELI",
      name: parsed.name || parsed.email?.split("@")[0] || "User",
      phone: parsed.phone || "",
    };
  } catch (error) {
    console.error("Failed to parse user:", error);
    localStorage.removeItem("user");
    return null;
  }
}

export function setAuth(token: string, user?: User) {
  if (typeof window === "undefined") return;

  localStorage.setItem("token", token);

  // Jika user dikirim dari backend
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
    return;
  }

  // Jika backend hanya mengirim access_token
  try {
    const decoded = jwtDecode<JwtPayload>(token);

    const generatedUser: User = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      name: decoded.email.split("@")[0],
      phone: "",
    };

    localStorage.setItem("user", JSON.stringify(generatedUser));
  } catch (error) {
    console.error("Failed to decode JWT:", error);
  }
}

export function clearAuth() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function isAdmin(): boolean {
  const user = getUser();

  return (
    user?.role === "SUPER_ADMIN" ||
    user?.role === "ADMIN" ||
    user?.role === "PETUGAS"
  );
}
