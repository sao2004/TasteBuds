import { db } from "../firebase";
import {
  doc,
  collection,
  addDoc,
  setDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";

const HistoryService = {
  // Salvare restaurant castigator in istoric
  async syncWinnerToHistory(userId, roomId, winnerId, restaurants) {
    if (!userId || !winnerId || !roomId) return;

    const winnerData = restaurants.find(r => r.id === winnerId);
    if (!winnerData) return;

    // Pentru a evita suprascrierea datelor existente
    const historyDocRef = doc(db, "users", userId, "history", `${roomId}_${winnerId}`);

    try {
      await setDoc(historyDocRef, {
        restaurantId: winnerId,
        name: winnerData.name,
        date: new Date().toISOString(),
        timestamp: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.error(e);
    }
  },

  // Citire istoric pentru user-ul logat
  subscribeToHistory(userId, callback) {
    if (!userId) {
        callback([]);
        return () => {};
    }

    const historyRef = collection(db, "users", userId, "history");

    return onSnapshot(historyRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log("DB dump:", items);
      callback(items);
    });
  }
};

export default HistoryService;
