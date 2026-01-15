import { signInAnonymously, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./firebase";

export const signInAnonymouslyWithFirebase = async () => {
  try {
    await signInAnonymously(auth);
    return auth.currentUser.uid;
  } catch (error) {
    console.error("Error signing in anonymously:", error);
  }
};

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user.uid;
  } catch (error) {
    console.error("Error signing in with Google:", error);
  }
};
