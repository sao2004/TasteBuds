import { useState, useEffect } from "react";
    import { signInAnonymouslyWithFirebase, signInWithGoogle } from "./auth";
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

    // importam room factory
    import RoomFactory from "./factories/RoomFactory";

    // importam facade pentru istoric
    import HistoryService from "./services/HistoryService";

    // LoginScreen
    function LoginScreen({ onLogin }) {
      const [loading, setLoading] = useState(null);

      const handleLoginClick = async (type) => {
        setLoading(type);
        if (type === "Guest") {
          await onLogin();
        } else if (type === "Google") {
          const uid = await signInWithGoogle();
          if (uid) {
            await onLogin({ id: uid, name: "Google user" });
          }
        } else {
          console.log("Login type not implemented:", type);
        }
        setLoading(null);
      };

      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-4xl font-bold text-white mb-8">TasteBuds</h1>
          <div className="w-full max-w-sm bg-gray-800 rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl text-center font-semibold mb-6">Login</h2>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleLoginClick("Google")}
                disabled={loading !== null}
                className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-blue-700 transition disabled:bg-gray-500"
              >
                {loading === "Google" ? "Logging in..." : "Continue with Google"}
              </button>
              <button
                onClick={() => handleLoginClick("Guest")}
                disabled={loading !== null}
                className="w-full bg-gray-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-gray-700 transition disabled:bg-gray-500"
              >
                {loading === "Guest" ? "Logging in..." : "Continue as Guest"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // HomeScreen
    function HomeScreen({ onCreate, onJoin, loading, errorMessage, history = []}) {
      const [roomCode, setRoomCode] = useState("");

      const handleJoinClick = () => {
        if (roomCode) onJoin(roomCode);
      };

      return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-4xl font-bold text-white mb-8">TasteBuds</h1>
            <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">


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

              {history && history.length > 0 && (
                <div className="mt-10 border-t border-gray-700 pt-6 text-left">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <span>🕒</span> Restaurante vizitate:
                  </h3>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                    {history.map((h, i) => (
                      <div key={i} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center border-l-4 border-green-500">
                        <span className="text-white font-medium">{h.name}</span>
                        <span className="text-gray-400 text-xs">
                          {h.date ? new Date(h.date).toLocaleDateString('ro-RO') : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }

    // Choose Restaurants
    function SwipeScreen({ roomData, onLeave, onSwipe, userId, onSelectWinner }) {
      const [copySuccess, setCopySuccess] = useState(false);
      const mySwipes = roomData.swipes[userId] || {};
      const nextRestaurant = roomData.restaurants.find(
        (r) => mySwipes[r.id] === undefined,
      );
      const matches = roomData.restaurants.filter((r) =>
        roomData.matches.includes(r.id),
      );

      // Verificam daca toti userii au terminat swipe-urile
      const allUsersDone = roomData.users.every((uid) => {
        const userSwipes = roomData.swipes[uid] || {};
        return roomData.restaurants.every((r) => userSwipes[r.id] !== undefined);
      });

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

      const handleViewRoute = (restaurant) => {
        // Deschidem Google Maps cu directii catre restaurant
        const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(restaurant.name)}&destination_place_id=${restaurant.id}`;
        window.open(url, '_blank');
      };

      // Daca toti au terminat si avem matches, afisam ecranul de winner
      if (!nextRestaurant && allUsersDone && matches.length > 0 && !roomData.winner) {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-8">All Done!</h2>
            <p className="text-gray-400 mb-8">Everyone has finished swiping. Ready to pick a winner?</p>

            <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl p-8 mb-6">
              <h3 className="text-xl font-bold text-white mb-4">Matched Restaurants ({matches.length})</h3>
              <ul className="space-y-2 mb-6">
                {matches.map((r) => (
                  <li key={r.id} className="text-white text-lg">
                    {r.name}
                  </li>
                ))}
              </ul>

              <button
                onClick={onSelectWinner}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-lg text-xl hover:from-purple-700 hover:to-pink-700 transition transform hover:scale-105 shadow-lg"
              >
                Pick Random Winner!
              </button>
            </div>

            <div className="p-4 bg-gray-800 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-2 w-full max-w-md">
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

      // Daca avem winner, il afisam
      if (roomData.winner) {
        const winnerRestaurant = roomData.restaurants.find(r => r.id === roomData.winner);

        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">  Winner! </h2>

            <div className="w-full max-w-md bg-gradient-to-br from-purple-800 to-pink-800 rounded-2xl shadow-2xl overflow-hidden mb-6">
              <img
                src={winnerRestaurant.photo || "https://placehold.co/600x400?text=No+Image"}
                alt={winnerRestaurant.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {winnerRestaurant.name}
                </h2>
                <p className="text-lg text-gray-200 mb-6">{winnerRestaurant.cuisine}</p>

                <button
                  onClick={() => handleViewRoute(winnerRestaurant)}
                  className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-lg text-xl hover:bg-blue-700 transition transform hover:scale-105 shadow-lg"
                >
                  Get Directions
                </button>

                {/* BUTONUL BACK TO HOME */}
                <button
                onClick={onLeave}
                className="w-full bg-gray-700 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-gray-600 transition"
                >
                  Back to Home
                </button>
              </div>
            </div>

            <div className="p-4 bg-gray-800 rounded-lg w-full max-w-md">
              <p className="text-gray-400 text-sm mb-2">All Matches:</p>
              <ul className="space-y-1">
                {matches.map((r) => (
                  <li key={r.id} className={`text-white ${r.id === roomData.winner ? 'font-bold text-green-400' : ''}`}>
                    {r.name} {r.id === roomData.winner && '👑'}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      }

      // Daca nu am terminat de swipe-uit
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
        <div className="flex flex-col lg:flex-row items-start justify-center min-h-screen p-4 pt-8 md:p-8 gap-6">
          {/* Partea stanga - Restaurant card */}
          <div className="flex flex-col items-center w-full lg:w-auto">
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

          {/* Partea dreapta - Matches */}
          {matches.length > 0 && (
            <div className="w-full lg:w-80 p-4 bg-gray-700 rounded-lg lg:sticky lg:top-8">
              <h3 className="text-xl font-bold text-white mb-4">🎯 Matches ({matches.length})</h3>
              <ul className="space-y-3">
                {matches.map((r) => (
                  <li key={r.id} className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-white font-semibold">{r.name}</p>
                    <p className="text-gray-400 text-sm">{r.cuisine}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
      const [history, setHistory] = useState([]);

      // Sincronizare istoric
        useEffect(() => {
          if (!user?.id || user?.name === "Guest") {
              setHistory([]);
              return;
          }

          try{
            const unsubscribe = HistoryService.subscribeToHistory(user.id, (data) => {
              setHistory(data);
            });

            return () => unsubscribe();
          } catch (error) {
            console.error("Error loading history", error);
          }
        }, [user?.id, user?.name]);

        // Salvare castigator in istoric
        useEffect(() => {

          const isGoogleUser = user?.id && user?.name !== "Guest";

          if (roomData?.winner && isGoogleUser && roomId) {

            console.log("Verify winner for user:", user.id);

            const winnerExists = roomData.restaurants.find(r => r.id === roomData.winner);

            if (winnerExists) {
              console.log("Writing to HistoryService...");

              HistoryService.syncWinnerToHistory(
                user.id,
                roomId,
                roomData.winner,
                roomData.restaurants
              ).then(() => {
                console.log("Done!");
              }).catch(err => {
                console.error("Error in writing ", err);
              });
            }
          }
        }, [roomData?.winner, user?.id, user?.name, roomId, roomData?.restaurants]);

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

      const handleLogin = async (googleUser = null) => {
        setLoading(true);
        setErrorMessage("");
        try {
          if(googleUser)
            setUser(googleUser)
          else{
            const uid = await signInAnonymouslyWithFirebase();
            if (uid) setUser({ id: uid, name: "Guest" });
            else setErrorMessage("Anonymous login failed.");
          }
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
              // Aici preiau restaurantul
              const { latitude, longitude } = pos.coords;
              const res = await fetch(
                `http://localhost:5000/get_restaurants?lat=${latitude}&long=${longitude}`,
              );
              if (!res.ok) throw new Error("Failed to fetch restaurants");
              const restaurants = await res.json();
              const filtered = restaurants.filter((r) =>
                r.types.includes("restaurant"),
              );

              // factory pattern
              const newRoomData = RoomFactory.create(user.id, filtered);

              const roomRef = doc(db, "rooms", newRoomData.id);
              await setDoc(roomRef, newRoomData);

              setRoomId(newRoomData.id);
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

      const handleSelectWinner = async () => {
        if (!roomData || roomData.matches.length === 0) return;

        // Selectam random un restaurant din matches
        const randomIndex = Math.floor(Math.random() * roomData.matches.length);
        const winnerId = roomData.matches[randomIndex];

        const roomRef = doc(db, "rooms", roomId);
        try{
          await updateDoc(roomRef, { winner: winnerId });
        } catch (error) {
          console.error("Error selecting winner:", error);
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
            history={history}
          />
        );
      return (
        <SwipeScreen
          roomData={roomData}
          onLeave={handleLeaveRoom}
          onSwipe={handleSwipe}
          userId={user.id}
          onSelectWinner={handleSelectWinner}
        />
      );
    }
