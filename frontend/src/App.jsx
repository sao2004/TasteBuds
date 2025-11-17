import { useState, useEffect } from "react";
import { signInAnonymously } from "firebase/auth";
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

const signInAnonymouslyWithFirebase = async () => {
  try {
    await signInAnonymously(auth);
    return auth.currentUser.uid;
  } catch (error) {
    console.error("Error signing in anonymously:", error);
    throw error;
  }
};

//
const MOCK_RESTAURANT_LIST = [
  {
    id: "mock1",
    name: "Restaurantul A (Simulat)",
    cuisine: "Italian",
    img: "https://placehold.co/600x400/F2C94C/27272A?text=Restaurant+A",
  },
  {
    id: "mock2",
    name: "Restaurantul B (Simulat)",
    cuisine: "Mexican",
    img: "https://placehold.co/600x400/EB5757/27272A?text=Restaurant+B",
  },
  {
    id: "mock3",
    name: "Restaurantul C (Simulat)",
    cuisine: "Indian",
    img: "https://placehold.co/600x400/2F80ED/27272A?text=Restaurant+C",
  },
  {
    id: "mock4",
    name: "Restaurantul D (Simulat)",
    cuisine: "Japonez",
    img: "https://placehold.co/600x400/27AE60/27272A?text=Restaurant+D",
  },
  {
    id: "mock5",
    name: "Restaurantul E (Simulat)",
    cuisine: "American",
    img: "https://placehold.co/600x400/9B51E0/27272A?text=Restaurant+E",
  },
];

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

function LoginScreen({ onLogin }) {
  const [loading, setLoading] = useState(false);

  const handleLoginClick = async (type) => {
    setLoading(true);
    if (type === "Guest") {
      await onLogin();
    } else {
      console.log("Login type not implemented:", type);
      setLoading(false);
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
            onClick={() => handleLoginClick("Sign in")}
            disabled={loading}
            className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-green-700 transition disabled:bg-gray-500"
          >
            Sign In
          </button>
          <button
            onClick={() => handleLoginClick("Log in")}
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-blue-700 transition disabled:bg-gray-500"
          >
            Log In
          </button>
          <div className="relative flex items-center justify-center my-2">
            <span className="absolute left-0 right-0 h-px bg-gray-600"></span>
            <span className="relative bg-gray-800 px-3 text-sm text-gray-400">
              OR
            </span>
          </div>
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

function HomeScreen({ onCreate, onJoin, loading, errorMessage }) {
  const [roomCode, setRoomCode] = useState("");

  const handleJoinClick = () => {
    if (roomCode) {
      onJoin(roomCode);
    }
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

        <div className="relative flex items-center justify-center mb-6">
          <span className="absolute left-0 right-0 h-px bg-gray-600"></span>
          <span className="relative bg-gray-800 px-3 text-sm text-gray-400">
            OR
          </span>
        </div>

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

function SwipeScreen({ roomData, onLeave, onSwipe, userId }) {
  const [copySuccess, setCopySuccess] = useState(false);

  const mySwipes = roomData.swipes[userId] || {};
  const nextRestaurant = roomData.restaurants.find(
    (r) => mySwipes[r.id] === undefined,
  );

  const matches = roomData.restaurants.filter((r) =>
    roomData.matches.includes(r.id),
  );

  // copiere room code
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

        <MatchesList matches={matches} />
        <button
          onClick={onLeave}
          className="mt-8 text-sm text-gray-400 hover:text-red-500 transition"
        >
          Leave Room
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-4 pt-8 md:p-8">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6 w-full">
          <span className="text-xl font-bold text-white">TasteBuds</span>
          <button
            onClick={onLeave}
            className="text-sm text-gray-400 hover:text-red-500 transition"
          >
            Leave Room
          </button>
        </div>

        <div className="mb-8 p-4 bg-gray-800 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-2">
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

        {roomData.users.length < 2 && (
          <div className="mb-8 p-4 bg-blue-900 border border-blue-700 text-blue-200 rounded-lg text-center">
            Waiting for another person to join... Share the room code!
          </div>
        )}

        <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <img
            src={nextRestaurant.img}
            alt={nextRestaurant.name}
            className="w-full h-64 object-cover"
          />
          <div className="p-6">
            <h2 className="text-3xl font-bold text-white mb-2">
              {nextRestaurant.name}
            </h2>
            <p className="text-lg text-gray-400 mb-6">
              {nextRestaurant.cuisine}
            </p>
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

        <MatchesList matches={matches} />
      </div>
    </div>
  );
}

function MatchesList({ matches }) {
  return (
    <div className="mt-8 w-full">
      <h3 className="text-2xl font-bold text-white mb-4">
        Matches ({matches.length})
      </h3>
      {matches.length === 0 ? (
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <p className="text-gray-400">No matches yet!</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {matches.map((r) => (
            <li key={r.id} className="bg-gray-800 p-4 rounded-lg shadow-md">
              <h4 className="text-xl font-semibold text-white">{r.name}</h4>
              <p className="text-gray-400">{r.cuisine}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!roomId) {
      setRoomData(null);
      return;
    }

    const roomRef = doc(db, "rooms", roomId);
    const unsubscribe = onSnapshot(
      roomRef,
      (doc) => {
        if (doc.exists()) {
          setRoomData(doc.data());
        } else {
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
    console.log("Logging in...");
    setLoading(true);
    setErrorMessage("");
    try {
      const uid = await signInAnonymouslyWithFirebase();
      if (uid) {
        setUser({ id: uid, name: "Guest" });
      } else {
        setErrorMessage("Anonymous login failed.");
      }
    } catch (error) {
      setErrorMessage(error.message);
      console.error(error);
    }
    setLoading(false);
  };

  const handleJoinRoom = async (code) => {
    if (!code) return;
    setLoading(true);
    setErrorMessage("");

    const roomRef = doc(db, "rooms", code);
    try {
      const docSnap = await getDoc(roomRef);
      if (docSnap.exists()) {
        await updateDoc(roomRef, {
          users: arrayUnion(user.id),
          [`swipes.${user.id}`]: docSnap.data().swipes[user.id] || {},
        });
        setRoomId(code);
      } else {
        setErrorMessage("Room not found.");
      }
    } catch (error) {
      setErrorMessage("Failed to join room.");
      console.error(error);
    }
    setLoading(false);
  };

  const handleCreateRoom = () => {
    setLoading(true);
    setErrorMessage("");

    if (!navigator.geolocation) {
      setErrorMessage("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Got location:", { latitude, longitude });

        console.log("Simulating API call to Google Places...");
        setTimeout(async () => {
          try {
            const restaurants = MOCK_RESTAURANT_LIST;

            const newCode = generateRoomCode();
            const roomRef = doc(db, "rooms", newCode);
            const newRoomData = {
              id: newCode,
              users: [user.id],
              restaurants: restaurants,
              swipes: {
                [user.id]: {},
              },
              matches: [],
              created: new Date().toISOString(),
            };

            await setDoc(roomRef, newRoomData);
            setRoomId(newCode);
          } catch (error) {
            setErrorMessage("Failed to create room in database.");
            console.error(error);
          } finally {
            setLoading(false);
          }
        }, 2000);
      },
      (error) => {
        setErrorMessage("Failed to get location. Please enable it.");
        console.error("Geolocation error:", error);
        setLoading(false);
      },
    );
  };

  const handleLeaveRoom = () => {
    setRoomId(null);
    setRoomData(null);
  };

  const handleSwipe = async (restaurantId, direction) => {
    if (!roomData || !user) return;

    const roomRef = doc(db, "rooms", roomId);
    const userSwipePath = `swipes.${user.id}.${restaurantId}`;

    if (roomData.swipes[user.id]) {
      roomData.swipes[user.id][restaurantId] = direction;
    } else {
      roomData.swipes[user.id] = { [restaurantId]: direction };
    }

    await updateDoc(roomRef, {
      [userSwipePath]: direction,
    });

    if (direction === "right") {
      const updatedDocSnap = await getDoc(roomRef);
      const currentRoomData = updatedDocSnap.data();

      const otherUsers = currentRoomData.users.filter((uid) => uid !== user.id);

      let isMatch = true;

      if (otherUsers.length > 0) {
        for (const otherId of otherUsers) {
          if (currentRoomData.swipes[otherId]?.[restaurantId] !== "right") {
            isMatch = false;
            break;
          }
        }
      } else {
        isMatch = false;
      }

      if (isMatch && !currentRoomData.matches.includes(restaurantId)) {
        await updateDoc(roomRef, {
          matches: arrayUnion(restaurantId),
        });
      }
    }
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (!roomData) {
    return (
      <HomeScreen
        onCreate={handleCreateRoom}
        onJoin={handleJoinRoom}
        loading={loading}
        errorMessage={errorMessage}
      />
    );
  }

  return (
    <SwipeScreen
      roomData={roomData}
      onLeave={handleLeaveRoom}
      onSwipe={handleSwipe}
      userId={user.id}
    />
  );
}
