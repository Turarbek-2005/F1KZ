"use client";

import { useEffect, useState } from "react";

interface Team {
  id: number;
  teamId: string;
  teamImgUrl: string;
  bolidImgUrl: string;
}

export default function Home() {
  const [teams, setTeams] = useState<Team[] | null>(null);

  useEffect(() => {
    async function fetchTeams() {
      try {
        const res = await fetch("http://localhost:4200/api/f1/teams");
        const data = await res.json();
        console.log("Загруженный пилот:", data);
        setTeams(data);
      } catch (err) {
        console.error("Ошибка загрузки пилота:", err);
      }
    }

    fetchTeams();
  }, []);

  if (!teams) return <div className="container mx-auto text-center">Loading...</div>;

  return (
    <div className="container mx-auto text-center mt-10">
      <h1 className="text-3xl font-bold mb-4">Welcome to F1KZ!</h1>
      <div className="grid grid-cols-2 gap-4 mb-8">

      {teams.map((team) => (
        <div key={team.id} >
          <h2 className="text-xl font-semibold">{team.teamId}</h2>
          <img src={team.teamImgUrl} alt={team.teamImgUrl} className="mx-auto w-10 h-10 " />
          <img src={team.bolidImgUrl} alt={team.bolidImgUrl} className="mx-auto w-96 h-auto " />
        </div>
      ))}
      </div>
    </div>
  );
}
