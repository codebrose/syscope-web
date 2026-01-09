import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import type { ReactNode } from "react";
import { auth } from "../lib/firebase";

export type AuthContextType = {
  user: User | null;
  githubToken: string | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setGithubToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("githubToken");
    if (savedToken) setGithubToken(savedToken);
  }, []);

  // Listen to Firebase auth state automatically
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Save token to localStorage whenever it changes
  useEffect(() => {
    if (githubToken) {
      localStorage.setItem("githubToken", githubToken);
    } else {
      localStorage.removeItem("githubToken");
    }
  }, [githubToken]);

  return (
    <AuthContext.Provider
      value={{ user, githubToken, loading, setUser, setGithubToken, setLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
