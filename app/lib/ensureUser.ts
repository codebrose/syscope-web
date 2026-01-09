import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "./firebase";

export async function ensureUserDocument(user: User) {
  if (!user?.uid) return; // safety check

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  // 🔹 Find GitHub provider data safely
  const githubProvider = user.providerData.find(
    (p) => p.providerId === "github.com" && !!p.uid
  );

  if (!snap.exists()) {
    // ✅ First-time login → create user
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,

      provider: githubProvider ? "github" : "other",
      github: githubProvider
        ? {
            uid: githubProvider.uid,
            username: githubProvider.displayName ?? githubProvider.email ?? null,
          }
        : null,

      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
  } else {
    // 🔄 Returning user → update last login timestamp
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
    });
  }
}
