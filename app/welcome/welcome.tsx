import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Github } from "lucide-react";
import {
  signInWithPopup,
  GithubAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import type { UserCredential } from "firebase/auth";
import { auth } from "../lib/firebase";

export function Welcome() {
  const navigate = useNavigate();
  const [githubToken, setGithubToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        navigate("/dashboard");
      }
    });

    return unsubscribe;
  }, [navigate]);

  const handleGitHubLogin = async () => {
    try {
      const provider = new GithubAuthProvider();

      // Optional: request additional scopes
      // provider.addScope("repo");
      // provider.addScope("read:org");

      const result: UserCredential = await signInWithPopup(auth, provider);

      // ✅ Correctly extract GitHub token from the popup result
      const credential = GithubAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken || null;

      setGithubToken(token);
      console.log("GitHub Access Token:", token);

      // Redirect is handled by auth listener
    } catch (error) {
      console.error("GitHub login failed", error);
    }
  };

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
