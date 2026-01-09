import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Github } from "lucide-react";
import {
  signInWithPopup,
  GithubAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";

import { auth } from "../lib/firebase";
import { ensureUserDocument } from "../lib/ensureUser";
import { useAuth } from "../context/authContext";

export function Welcome() {
  const navigate = useNavigate();
  const { setUser, setGithubToken, loading, setLoading } = useAuth();

  // 🔹 Listen to auth state changes (optional, keeps user logged in across refresh)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      setUser(user);

      try {
        await ensureUserDocument(user);
      } catch (err) {
        console.error("Failed to sync user to Firestore", err);
      }

      setLoading(false);
      navigate("/dashboard");
    });

    return unsubscribe;
  }, [navigate, setUser, setLoading]);

  // 🔹 Handle GitHub login
  const handleGitHubLogin = async () => {
  setLoading(true);

  try {
    const provider = new GithubAuthProvider();
    provider.addScope("repo");

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    setUser(user);
    setGithubToken(GithubAuthProvider.credentialFromResult(result)?.accessToken ?? null);

    // 🔹 Firestore sync immediately after login
    await ensureUserDocument(user);

    navigate("/dashboard");
  } catch (err) {
    console.error("GitHub login failed", err);
  } finally {
    setLoading(false);
  }
};


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white bg-zinc-950">
        Loading...
      </div>
    );
  }

  return (
    <main className="flex items-center justify-center h-screen bg-zinc-950 px-4">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-white text-center">
          Sign in to Syscop
        </h1>

        <p className="text-zinc-400 text-center mt-2 text-sm">
          Authenticate using your GitHub account
        </p>

        <button
          onClick={handleGitHubLogin}
          className="mt-8 w-full flex items-center justify-center gap-3 rounded-xl bg-white text-black font-semibold py-3 hover:bg-zinc-200 transition"
        >
          <Github size={20} />
          Continue with GitHub
        </button>

        <p className="text-xs text-zinc-500 text-center mt-6">
          By signing in, you agree to our terms and policies.
        </p>
      </div>
    </main>
  );
}
