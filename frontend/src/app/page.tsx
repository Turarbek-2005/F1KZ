"use client";

import { useState } from "react";

export default function Home() {
  const [token, setToken] = useState("");
  const [me, setMe] = useState<any>(null);
  const API_URL = "http://localhost:4200/api"; // замени на свой backend

  const handleRegister = async () => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@mail.com",
        username: "testuser",
        password: "123456",
      }),
    });
    const data = await res.json();
    console.log("REGISTER:", data);
    alert(JSON.stringify(data, null, 2));
  };

  const handleLogin = async () => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usernameOrEmail: "testuser",
        password: "123456",
      }),
    });
    const data = await res.json();
    console.log("LOGIN:", data);
    setToken(data.token);
    alert("Token saved!");
  };

  const handleGetMe = async () => {
    if (!token) return alert("Сначала залогинься!");
    const res = await fetch(`${API_URL}/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    console.log("ME:", data);
    setMe(data);
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>🔐 Auth API Test</h1>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={handleRegister}>📬 Register</button>
        <button onClick={handleLogin}>🔑 Login</button>
        <button onClick={handleGetMe}>🙋 Get Me</button>
      </div>

      {token && (
        <p>
          <b>Token:</b> <code>{token.slice(0, 30)}...</code>
        </p>
      )}

      {me && (
        <pre
          style={{
            background: "#111",
            color: "#0f0",
            padding: "1rem",
            borderRadius: 8,
            marginTop: 20,
          }}
        >
          {JSON.stringify(me, null, 2)}
        </pre>
      )}
    </div>
  );
}
