import { useState, useEffect } from "react";
import { signInAnonymouslyWithFirebase } from "./auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "./firebase";

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

// LoginScreen
function LoginScreen({ onLogin }) {
  const [loading, setLoading] = useState(false);

  const handleLoginClick = async (type) => {
    setLoading(true);
    if (type === "Guest") {
      await onLogin();
    } else {
      console.log("Login type not implemented:", type);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold text-white mb-8">TasteBuds</h1>
      <div className="w-full max-w-sm bg-gray-800 rounded-2xl shadow-2xl p-8">
        <h2 className="text-2xl text-center font-semibold mb-6">Login</h2>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleLoginClick("Guest")}
            disabled={loading}
            className="w-full bg-gray-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-gray-700 transition disabled:bg-gray-500"
          >
            {loading ? "Logging in..." : "Continue as Guest"}
          </button>
        </div>
      </div>
    </div>
  );
}

// HomeScreen
function HomeScreen({ onCreate, onJoin, loading, errorMessage }) {
  const [roomCode, setRoomCode] = useState("");

  const handleJoinClick = () => {
    if (roomCode) onJoin(roomCode);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-8">Start a Room</h1>
        {errorMessage && <p className="text-red-400 mb-4">{errorMessage}</p>}
        <button
          onClick={onCreate}
          disabled={loading}
          className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-green-700 transition shadow-lg mb-6 disabled:bg-gray-500"
        >
          {loading ? "Finding location..." : "Find Restaurants Near Me"}
        </button>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Enter Room Code"
            disabled={loading}
            className="w-full bg-gray-700 border border-gray-600 text-white text-center rounded-lg p-3 text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-600"
          />
          <button
            onClick={handleJoinClick}
            disabled={loading}
            className="w-full bg-gray-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-gray-700 transition shadow-lg disabled:bg-gray-500"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}

// Choose Restaurants
function SwipeScreen({ roomData, onLeave, onSwipe, userId }) {
  const [copySuccess, setCopySuccess] = useState(false);
  const mySwipes = roomData.swipes[userId] || {};
  const nextRestaurant = roomData.restaurants.find(
    (r) => mySwipes[r.id] === undefined,
  );
  const matches = roomData.restaurants.filter((r) =>
    roomData.matches.includes(r.id),
  );

  const handleCopyRoomCode = () => {
    const input = document.createElement("input");
    input.style.position = "absolute";
    input.style.left = "-9999px";
    input.value = roomData.id;
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand("copy");
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
    document.body.removeChild(input);
  };

  if (!nextRestaurant) {
    return (
      <div className="flex flex-col items-center min-h-screen p-4 pt-8 md:p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">All done!</h2>
        <p className="text-gray-400 mb-8">Waiting for other players...</p>
        <div className="mb-8 p-4 bg-gray-800 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-2 w-full max-w-md">
          <div className="text-center sm:text-left">
            <span className="text-gray-400 text-sm">Room Code:</span>
            <span className="text-white font-mono text-2xl ml-2">
              {roomData.id}
            </span>
          </div>
          <button
            onClick={handleCopyRoomCode}
            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 transition w-full sm:w-auto"
          >
            {copySuccess ? "Copied!" : "Copy Code"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-4 pt-8 md:p-8">
      {/* Room code */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-2 w-full max-w-md">
        <div className="text-center sm:text-left">
          <span className="text-gray-400 text-sm">Room Code:</span>
          <span className="text-white font-mono text-2xl ml-2">
            {roomData.id} {/* Room code */}
          </span>
        </div>
        <button
          onClick={handleCopyRoomCode}
          className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 transition w-full sm:w-auto"
        >
          {copySuccess ? "Copied!" : "Copy Code"}
        </button>
      </div>

      {/* Matches */}
      {matches.length > 0 && (
        <div className="w-full max-w-md mb-6 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-xl font-bold text-white mb-2">Matches</h3>
          <ul className="space-y-2">
            {matches.map((r) => (
              <li key={r.id} className="text-white">
                {r.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Restaurant afisare */}
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        <img
          src={
            nextRestaurant.photo || "https://placehold.co/600x400?text=No+Image"
          }
          alt={nextRestaurant.name}
          className="w-full h-64 object-cover"
        />
        <div className="p-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            {nextRestaurant.name}
          </h2>
          <p className="text-lg text-gray-400 mb-6">{nextRestaurant.cuisine}</p>
          <div className="flex justify-around gap-4">
            <button
              onClick={() => onSwipe(nextRestaurant.id, "left")}
              className="w-1/2 bg-red-600 text-white font-bold py-4 px-6 rounded-lg text-2xl hover:bg-red-700 transition transform hover:scale-105"
            >
              No
            </button>
            <button
              onClick={() => onSwipe(nextRestaurant.id, "right")}
              className="w-1/2 bg-green-600 text-white font-bold py-4 px-6 rounded-lg text-2xl hover:bg-green-700 transition transform hover:scale-105"
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Aplicatia in sine
export default function App() {
  const [user, setUser] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!roomId) return setRoomData(null);
    const roomRef = doc(db, "rooms", roomId);
    const unsubscribe = onSnapshot(
      roomRef,
      (doc) => {
        if (doc.exists()) setRoomData(doc.data());
        else {
          setErrorMessage("Room not found.");
          setRoomId(null);
        }
      },
      (error) => {
        console.error(error);
        setErrorMessage("Error listening to room.");
        setRoomId(null);
      },
    );
    return () => unsubscribe();
  }, [roomId]);

  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const uid = await signInAnonymouslyWithFirebase();
      if (uid) setUser({ id: uid, name: "Guest" });
      else setErrorMessage("Anonymous login failed.");
    } catch (error) {
      setErrorMessage(error.message);
    }
    setLoading(false);
  };

  const handleCreateRoom = async () => {
    if (!navigator.geolocation) return alert("Enable location");

    setLoading(true);
    setErrorMessage("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          // Aici preiau restaurantul TODO: Sa fie mai putine requesturi la API
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `http://localhost:5000/get_restaurants?lat=${latitude}&long=${longitude}`,
          );
          if (!res.ok) throw new Error("Failed to fetch restaurants");
          const restaurants = await res.json();
          const filtered = restaurants.filter((r) =>
            r.types.includes("restaurant"),
          );

          // Room creation
          const newCode = generateRoomCode();
          const roomRef = doc(db, "rooms", newCode);
          const newRoomData = {
            id: newCode,
            users: [user.id],
            restaurants: filtered,
            swipes: { [user.id]: {} },
            matches: [],
            created: new Date().toISOString(),
          };
          await setDoc(roomRef, newRoomData);

          setRoomId(newCode);
        } catch (err) {
          console.error(err);
          setErrorMessage("Failed to fetch restaurants");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error(err);
        setErrorMessage("Failed to get location");
        setLoading(false);
      },
    );
  };

  const handleJoinRoom = async (code) => {
    if (!code) return;
    setLoading(true);
    setErrorMessage("");

    try {
      const roomRef = doc(db, "rooms", code);
      const docSnap = await getDoc(roomRef);
      if (docSnap.exists()) {
        await updateDoc(roomRef, {
          users: arrayUnion(user.id),
          [`swipes.${user.id}`]: docSnap.data().swipes[user.id] || {},
        });
        setRoomId(code);
      } else setErrorMessage("Room not found.");
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to join room.");
    }
    setLoading(false);
  };

  const handleLeaveRoom = () => {
    setRoomId(null);
    setRoomData(null);
  };

  const handleSwipe = async (restaurantId, direction) => {
    if (!roomData || !user) return;
    const roomRef = doc(db, "rooms", roomId);
    const userSwipePath = `swipes.${user.id}.${restaurantId}`;
    roomData.swipes[user.id] = roomData.swipes[user.id] || {};
    roomData.swipes[user.id][restaurantId] = direction;
    await updateDoc(roomRef, { [userSwipePath]: direction });

    if (direction === "right") {
      const updatedDocSnap = await getDoc(roomRef);
      const currentRoomData = updatedDocSnap.data();
      const otherUsers = currentRoomData.users.filter((uid) => uid !== user.id);
      let isMatch = otherUsers.length > 0;
      for (const otherId of otherUsers) {
        if (currentRoomData.swipes[otherId]?.[restaurantId] !== "right") {
          isMatch = false;
          break;
        }
      }
      if (isMatch && !currentRoomData.matches.includes(restaurantId)) {
        await updateDoc(roomRef, { matches: arrayUnion(restaurantId) });
      }
    }
  };

  if (!user) return <LoginScreen onLogin={handleLogin} />;
  if (!roomData)
    return (
      <HomeScreen
        onCreate={handleCreateRoom}
        onJoin={handleJoinRoom}
        loading={loading}
        errorMessage={errorMessage}
      />
    );
  return (
    <SwipeScreen
      roomData={roomData}
      onLeave={handleLeaveRoom}
      onSwipe={handleSwipe}
      userId={user.id}
    />
  );
}
