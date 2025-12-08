"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { updateUser } from "@/entities/auth/model/authSlice";
import { useGetDriversQuery, useGetTeamsQuery } from "@/entities/f1api/f1api";

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [favoriteDriversIds, setFavoriteDriversIds] = useState<string[]>(
    Array.isArray((user as any)?.favoriteDriversIds) ? (user as any).favoriteDriversIds : ((user as any)?.favoriteDriverIds ? (user as any).favoriteDriverIds : [])
  );
  const [favoriteTeamsIds, setFavoriteTeamsIds] = useState<string[]>(
    Array.isArray((user as any)?.favoriteTeamsIds) ? (user as any).favoriteTeamsIds : ((user as any)?.favoriteTeamIds ? (user as any).favoriteTeamIds : [])
  );

  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const { data: driversApi = { drivers: [] } } = useGetDriversQuery(undefined, { refetchOnMountOrArgChange: false });
  const { data: teamsApi = { teams: [] } } = useGetTeamsQuery(undefined, { refetchOnMountOrArgChange: false });

  useEffect(() => {
    // keep local state in sync when user loads
    setUsername(user?.username ?? "");
    setEmail(user?.email ?? "");
    const drv = Array.isArray((user as any)?.favoriteDriversIds) ? (user as any).favoriteDriversIds : ((user as any)?.favoriteDriverIds ? (user as any).favoriteDriverIds : []);
    const tm = Array.isArray((user as any)?.favoriteTeamsIds) ? (user as any).favoriteTeamsIds : ((user as any)?.favoriteTeamIds ? (user as any).favoriteTeamIds : []);
    setFavoriteDriversIds(drv);
    setFavoriteTeamsIds(tm);
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("saving");

    try {
      // updateUser thunk expects favoriteDriverIds/favoriteTeamIds according to existing slice types
      const payload: any = { username: username.trim(), email: email.trim() };
      if (password) payload.password = password;
      if (favoriteDriversIds && favoriteDriversIds.length) payload.favoriteDriversIds = favoriteDriversIds;
      else payload.favoriteDriversIds = [];
      if (favoriteTeamsIds && favoriteTeamsIds.length) payload.favoriteTeamsIds = favoriteTeamsIds;
      else payload.favoriteTeamsIds = [];

      await dispatch(updateUser(payload)).unwrap();
      setStatus("saved");
      setPassword("");
    } catch (err: any) {
      setError(err?.message || String(err));
      setStatus("error");
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">Username</span>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">Email</span>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">New password (leave blank to keep)</span>
          <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
        </label>

        <div>
          <div className="text-sm text-muted-foreground mb-2">Favorite drivers</div>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto p-2 border rounded">
            {driversApi?.drivers.map((driver: any) => (
              <label key={driver.driverId} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={driver.driverId}
                  checked={favoriteDriversIds.includes(driver.driverId)}
                  onChange={(e) => {
                    const id = driver.driverId;
                    setFavoriteDriversIds((prev) => (e.target.checked ? [...prev, id] : prev.filter((x) => x !== id)));
                  }}
                  className="accent-blue-600"
                />
                <span>{driver.name} {driver.surname}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground mb-2">Favorite teams</div>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto p-2 border rounded">
            {teamsApi?.teams.map((team: any) => (
              <label key={team.teamId} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={team.teamId}
                  checked={favoriteTeamsIds.includes(team.teamId)}
                  onChange={(e) => {
                    const id = team.teamId;
                    setFavoriteTeamsIds((prev) => (e.target.checked ? [...prev, id] : prev.filter((x) => x !== id)));
                  }}
                  className="accent-blue-600"
                />
                <span>{team.teamName}</span>
              </label>
            ))}
          </div>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}
        {status === "saved" && <div className="text-sm text-green-600">Settings saved.</div>}

        <Button type="submit" className="w-fit" disabled={status === "saving"}>
          {status === "saving" ? "Saving..." : "Save settings"}
        </Button>
      </form>
    </div>
  );
}
