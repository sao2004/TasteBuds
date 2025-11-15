import { signInAnonymously } from "firebase/auth";
import { auth } from "./firebase";

export const signInAnonymouslyWithFirebase = async () => {
  try {
    await signInAnonymously(auth);
    return auth.currentUser.uid;
  } catch (error) {
    console.error("Error signing in anonymously:", error);
  }
};
