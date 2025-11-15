import { useState } from "react";
import { signInAnonymouslyWithFirebase } from "./auth";

function LoginScreen({ onLogin }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold text-white mb-8">TasteBuds</h1>
      <div className="w-full max-w-sm bg-gray-800 rounded-2xl shadow-2xl p-8">
        <h2 className="text-2xl text-center font-semibold mb-6">Login</h2>

        {}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => onLogin("Sign in")}
            className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-green-700 transition"
          >
            Sign In
          </button>

          <button
            onClick={() => onLogin("Log in")}
            className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-blue-700 transition"
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
            onClick={() => onLogin("Guest")}
            className="w-full bg-gray-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-gray-700 transition"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}

function HomeScreen({ onCreate, onJoin }) {
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

        {}
        <button
          onClick={onCreate}
          className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-green-700 transition shadow-lg mb-6"
        >
          Create New Room
        </button>

        <div className="relative flex items-center justify-center mb-6">
          <span className="absolute left-0 right-0 h-px bg-gray-600"></span>
          <span className="relative bg-gray-800 px-3 text-sm text-gray-400">
            OR
          </span>
        </div>

        {}
        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Enter Room Code"
            className="w-full bg-gray-700 border border-gray-600 text-white text-center rounded-lg p-3 text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleJoinClick}
            className="w-full bg-gray-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-gray-700 transition shadow-lg"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}

function SwipeScreen({ roomId, onLeave }) {
  const restaurant = {
    name: "The Golden Spoon",
    cuisine: "Italian",
    img: "https://placehold.co/600x400/F2C94C/27272A?text=The+Golden+Spoon",
  };

  const handleSwipe = (direction) => {
    // date firebase
    console.log(`Swiped ${direction} on ${restaurant.name}`);
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 pt-8 md:p-8">
      <div className="w-full max-w-md">
        {}
        <div className="flex justify-between items-center mb-6 w-full">
          <h1 className="text-xl font-bold text-white">Room: {roomId}</h1>
          <button
            onClick={onLeave}
            className="text-sm text-gray-400 hover:text-red-500 transition"
          >
            Leave Room
          </button>
        </div>

        {}
        <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <img
            src={restaurant.img}
            alt={restaurant.name}
            className="w-full h-64 object-cover"
          />
          <div className="p-6">
            <h2 className="text-3xl font-bold text-white mb-2">
              {restaurant.name}
            </h2>
            <p className="text-lg text-gray-400 mb-6">{restaurant.cuisine}</p>

            <div className="flex justify-around gap-4">
              <button
                onClick={() => handleSwipe("left")}
                className="w-1/2 bg-red-600 text-white font-bold py-4 px-6 rounded-lg text-2xl hover:bg-red-700 transition transform hover:scale-105"
              >
                No
              </button>
              <button
                onClick={() => handleSwipe("right")}
                className="w-1/2 bg-green-600 text-white font-bold py-4 px-6 rounded-lg text-2xl hover:bg-green-700 transition transform hover:scale-105"
              >
                Yes
              </button>
            </div>
          </div>
        </div>

        {}
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-white mb-4">Matches</h3>
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <p className="text-gray-400">No matches yet!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  const [roomId, setRoomId] = useState(null);

  const handleLogin = async () => {
    console.log("Logging in...");

    const uid = await signInAnonymouslyWithFirebase();

    setUser({ id: uid, name: "Guest" });
    // console.log("Logging in as:", loginType);
    // setUser({ id: "user-123", name: "Guest" });
  };

  const handleJoinRoom = (code) => {
    console.log("Joining room:", code);
    setRoomId(code);
  };

  const handleCreateRoom = () => {
    const newCode = "ABCDE";
    console.log("Creating room:", newCode);
    setRoomId(newCode);
  };

  const handleLeaveRoom = () => {
    setRoomId(null);
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (user && !roomId) {
    return <HomeScreen onCreate={handleCreateRoom} onJoin={handleJoinRoom} />;
  }

  if (user && roomId) {
    return <SwipeScreen roomId={roomId} onLeave={handleLeaveRoom} />;
  }

  return <div>Loading...</div>;
}
