import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api.service";
import { useAuth } from "../features/auth/features.authContext";

// ─── Constants ────────────────────────────────────────────────────────────────

const LANGUAGES = [
  { value: "C",          label: "C" },
  { value: "Java",       label: "Java" },
  { value: "Python",     label: "Python" },
  { value: "JavaScript", label: "JavaScript" },
];

const DIFFICULTY_LEVELS = [
  {
    level: 1,
    emoji: "🟢",
    name: "Rookie Grid",
    difficulty: "Beginner",
    laps: 2,
    focus: "Basic syntax",
    lapInfo: ["Lap 1: MCQ", "Lap 2: Simple debugging"],
    track: "Simple oval track",
  },
  {
    level: 2,
    emoji: "🟡",
    name: "Code Circuit",
    difficulty: "Easy–Intermediate",
    laps: 3,
    focus: "Output & logic",
    lapInfo: ["Lap 1: MCQ", "Lap 2–3: Debugging"],
    track: "Sharp turns",
  },
  {
    level: 3,
    emoji: "🟠",
    name: "Logic Grand Prix",
    difficulty: "Intermediate",
    laps: 4,
    focus: "Functions & loops",
    lapInfo: ["Lap 1: MCQ", "Lap 2–4: Debugging"],
    track: "Split lane track",
  },
  {
    level: 4,
    emoji: "🔵",
    name: "Algorithm Arena",
    difficulty: "Advanced",
    laps: 5,
    focus: "Data structures & complexity",
    lapInfo: ["Lap 1: MCQ", "Lap 2–5: Debugging"],
    track: "Multi-curve technical track",
  },
  {
    level: 5,
    emoji: "🔴",
    name: "Championship Circuit",
    difficulty: "Expert",
    laps: 6,
    focus: "Real-world coding challenges",
    lapInfo: ["Lap 1: MCQ", "Lap 2–6: Advanced debugging"],
    track: "Complex grand prix map",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const RoomPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lobby, setLobby] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Settings state (leader-controlled, synced from server)
  const [selectedLanguage, setSelectedLanguage] = useState("JavaScript");
  const [selectedDifficulty, setSelectedDifficulty] = useState(1);
  const [savingSettings, setSavingSettings] = useState(false);

  // ── Fetch lobby ─────────────────────────────────────────────────────────────
  const fetchLobby = useCallback(async () => {
    try {
      if (!code) return;
      const res = await api.get(`/lobby/${code}`);
      setLobby(res.data);
      setError(null);

      // Sync settings from server
      if (res.data.settings?.language) setSelectedLanguage(res.data.settings.language);
      if (res.data.settings?.level)    setSelectedDifficulty(res.data.settings.level);

      // If race has already started → redirect
      if (res.data.status === "racing" && res.data.currentRace) {
        navigate(`/race/${res.data.currentRace}`);
      }
    } catch {
      setError("Lobby not found or server error.");
    } finally {
      setLoading(false);
    }
  }, [code, navigate]);

  // ── Poll every 3 s ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!code) return;
    fetchLobby();
    const interval = setInterval(fetchLobby, 3000);
    return () => clearInterval(interval);
  }, [fetchLobby, code]);

  // ── Derived: is current user the leader? ────────────────────────────────────
  const isLeader =
    user &&
    lobby?.leader &&
    (lobby.leader._id === user._id || lobby.leader._id === user.id ||
     lobby.leader    === user._id  || lobby.leader    === user.id);

  // ── Save settings (leader only) ─────────────────────────────────────────────
  const saveSettings = async () => {
    try {
      setSavingSettings(true);
      await api.patch(`/lobby/${code}/settings`, {
        language: selectedLanguage,
        level: selectedDifficulty,
      });
      await fetchLobby();
    } catch (err) {
      console.error(err);
      alert("Failed to save settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  // ── Toggle ready ────────────────────────────────────────────────────────────
  const toggleReady = async () => {
    try {
      setUpdating(true);
      await api.patch(`/lobby/${code}/ready`);
      await fetchLobby();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  // ── Start race ──────────────────────────────────────────────────────────────
  const startRace = async () => {
    try {
      setUpdating(true);
      const res = await api.post(`/lobby/${code}/start`);
      navigate(`/race/${res.data.race._id}`);
    } catch (err) {
      console.error(err);
      alert("Cannot start race.");
    } finally {
      setUpdating(false);
    }
  };

  // ── Leave lobby ─────────────────────────────────────────────────────────────
  const leaveLobby = async () => {
    try {
      await api.post(`/lobby/${code}/leave`);
      navigate("/lobby");
    } catch (err) {
      console.error(err);
      navigate("/lobby");
    }
  };

  // ── Active difficulty info card ─────────────────────────────────────────────
  const activeDifficulty = DIFFICULTY_LEVELS.find((d) => d.level === selectedDifficulty);

  // ── Loading / Error ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white bg-[#0a0a0f]">
        Loading Lobby...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-400 bg-[#0a0a0f]">
        <p>{error}</p>
        <button
          onClick={() => navigate("/lobby")}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
        >
          Back to Lobby
        </button>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8">

      {/* ── Header ── */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Lobby Code: <span className="text-cyan-400">{lobby.code}</span>
          </h1>
          {isLeader && (
            <span className="text-xs text-yellow-400 font-semibold mt-1 block">
              👑 You are the leader
            </span>
          )}
        </div>
        <button
          onClick={leaveLobby}
          className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
        >
          Leave Lobby
        </button>
      </div>

      {/* ── Lobby Status ── */}
      <div className="mb-6">
        <p>Status: <span className="text-yellow-400">{lobby.status}</span></p>
        <p>Leader: <span className="text-green-400">{lobby.leader?.username || "Unknown"}</span></p>
      </div>

      {/* ── Race Settings Panel ── */}
      <div className="mb-8 p-6 border border-gray-700 rounded-lg bg-[#111118]">
        <h2 className="text-xl font-bold mb-4 text-cyan-400">⚙️ Race Settings</h2>

        {/* Language Selection */}
        <div className="mb-5">
          <p className="text-sm text-gray-400 mb-2">🖥️ Language</p>
          <div className="flex gap-3 flex-wrap">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.value}
                onClick={() => isLeader && setSelectedLanguage(lang.value)}
                disabled={!isLeader}
                title={!isLeader ? "Only the leader can change settings" : ""}
                className={`px-4 py-2 rounded font-semibold transition-colors
                  ${selectedLanguage === lang.value
                    ? "bg-cyan-500 text-black"
                    : "bg-gray-700 text-white hover:bg-gray-600"}
                  ${!isLeader ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="mb-5">
          <p className="text-sm text-gray-400 mb-2">🏎️ Difficulty Level</p>
          <div className="flex gap-3 flex-wrap">
            {DIFFICULTY_LEVELS.map((d) => (
              <button
                key={d.level}
                onClick={() => isLeader && setSelectedDifficulty(d.level)}
                disabled={!isLeader}
                title={!isLeader ? "Only the leader can change settings" : ""}
                className={`flex flex-col items-center px-4 py-2 rounded transition-colors min-w-[90px]
                  ${selectedDifficulty === d.level
                    ? "bg-purple-600 text-white"
                    : "bg-gray-700 text-white hover:bg-gray-600"}
                  ${!isLeader ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span className="text-lg">{d.emoji}</span>
                <span className="text-xs font-bold">Level {d.level}</span>
                <span className="text-xs text-gray-300">{d.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Info Card */}
        {activeDifficulty && (
          <div className="mb-5 p-4 border border-purple-700 rounded-lg bg-[#1a1a2e]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{activeDifficulty.emoji}</span>
              <strong className="text-purple-300">
                LEVEL {activeDifficulty.level} – {activeDifficulty.name}
              </strong>
            </div>
            <div className="text-sm text-gray-300 space-y-1">
              <p><span className="text-gray-500">Difficulty:</span> {activeDifficulty.difficulty}</p>
              <p><span className="text-gray-500">Laps:</span> {activeDifficulty.laps}</p>
              <p><span className="text-gray-500">Focus:</span> {activeDifficulty.focus}</p>
              <p><span className="text-gray-500">Track:</span> {activeDifficulty.track}</p>
              <ul className="list-disc list-inside mt-1">
                {activeDifficulty.lapInfo.map((info, i) => (
                  <li key={i}>{info}</li>
                ))}
              </ul>
              <p className="text-cyan-400 mt-2">🤖 Adaptive AI Difficulty Engine enabled</p>
            </div>
          </div>
        )}

        {/* Save Settings (leader only) */}
        {isLeader ? (
          <button
            onClick={saveSettings}
            disabled={savingSettings}
            className="px-5 py-2 bg-green-600 rounded hover:bg-green-700 font-semibold disabled:opacity-50"
          >
            {savingSettings ? "Saving..." : "💾 Save Settings"}
          </button>
        ) : (
          <p className="text-sm text-gray-500 italic">
            🔒 Only the lobby leader can change settings.
          </p>
        )}
      </div>

      {/* ── Player List ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {lobby.members.map((member, index) => (
          <div
            key={member.user?._id || index}
            className="p-4 border border-gray-700 rounded bg-[#111118]"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold">
                  {member.user?.username || member.username || "Player"}
                  {(member.user?._id === lobby.leader?._id ||
                    member.user?._id === lobby.leader) && (
                    <span className="ml-1 text-yellow-400">👑</span>
                  )}
                </p>
                <p className="text-sm text-gray-400">
                  {member.isReady ? "✅ Ready" : "⏳ Not Ready"}
                </p>
              </div>
              <div
                className={`w-3 h-3 rounded-full ${
                  member.isReady ? "bg-green-500" : "bg-red-500"
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Controls ── */}
      <div className="flex gap-4">
        <button
          onClick={toggleReady}
          disabled={updating}
          className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Toggle Ready
        </button>

        {isLeader && lobby.status === "ready" && (
          <button
            onClick={startRace}
            disabled={updating}
            className="px-6 py-2 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
          >
            🚦 Start Race
          </button>
        )}
      </div>

    </div>
  );
};

export default RoomPage;