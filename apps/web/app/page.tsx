"use client";

export default function Home() {
  const setDestination = () => {
    window.location.href =
      'http://localhost:3001/api/auth/google?intent=destination';
  };
  const logout = async () => {
    try {
      await fetch("http://localhost:3001/api/auth/logout", {
        method: "POST",
        credentials: "include", // 🔥 CRITICAL
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div>
      <button onClick={setDestination}>Set Destination</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
