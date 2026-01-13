"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { updateUser } from "@/entities/auth/model/authSlice";
import { useGetDriversQuery, useGetTeamsQuery } from "@/entities/f1api/f1api";

type ApiDriver = {
  driverId: string;
  name?: string;
  surname?: string;
  imgUrl?: string;
};

type ApiTeam = {
  teamId: string;
  teamName?: string;
};

type UserShape = {
  username?: string;
  email?: string;
  favoriteDriversIds?: string[];
  favoriteDriverIds?: string[];
  favoriteTeamsIds?: string[];
  favoriteTeamIds?: string[];
};
type DriversApiResponse = {
  drivers: ApiDriver[];
};

type TeamsApiResponse = {
  teams: ApiTeam[];
};
export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user) as UserShape | undefined;

  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");

  const initialFavDrivers: string[] = Array.isArray(user?.favoriteDriversIds)
    ? user!.favoriteDriversIds!
    : Array.isArray(user?.favoriteDriverIds)
    ? user!.favoriteDriverIds!
    : [];

  const initialFavTeams: string[] = Array.isArray(user?.favoriteTeamsIds)
    ? user!.favoriteTeamsIds!
    : Array.isArray(user?.favoriteTeamIds)
    ? user!.favoriteTeamIds!
    : [];

  const [favoriteDriversIds, setFavoriteDriversIds] =
    useState<string[]>(initialFavDrivers);
  const [favoriteTeamsIds, setFavoriteTeamsIds] =
    useState<string[]>(initialFavTeams);

  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  const { data: driversApi = { drivers: [] as ApiDriver[] } } =
    useGetDriversQuery(undefined, { refetchOnMountOrArgChange: false }) as {
      data?: DriversApiResponse;
      loading?: boolean;
    };
  const { data: teamsApi = { teams: [] as ApiTeam[] } } = useGetTeamsQuery(
    undefined,
    { refetchOnMountOrArgChange: false }
  ) as { data?: TeamsApiResponse; loading?: boolean };

  useEffect(() => {
    setUsername(user?.username ?? "");
    setEmail(user?.email ?? "");
    const drv = Array.isArray(user?.favoriteDriversIds)
      ? user!.favoriteDriversIds!
      : Array.isArray(user?.favoriteDriverIds)
      ? user!.favoriteDriverIds!
      : [];
    const tm = Array.isArray(user?.favoriteTeamsIds)
      ? user!.favoriteTeamsIds!
      : Array.isArray(user?.favoriteTeamIds)
      ? user!.favoriteTeamIds!
      : [];
    setFavoriteDriversIds(drv);
    setFavoriteTeamsIds(tm);
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("saving");

    try {
      const payload: {
        username: string;
        email: string;
        password?: string;
        favoriteDriversIds: string[];
        favoriteTeamsIds: string[];
      } = {
        username: username.trim(),
        email: email.trim(),
        favoriteDriversIds: favoriteDriversIds ?? [],
        favoriteTeamsIds: favoriteTeamsIds ?? [],
      };

      if (password) payload.password = password;

      await dispatch(updateUser(payload)).unwrap();
      setStatus("saved");
      setPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Unknown error");
      setStatus("error");
    }
  }

  return (
    <div className="container px-4 sm:px-0 mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">Username</span>
          <Input
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setUsername(e.target.value)
            }
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">Email</span>
          <Input
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            type="email"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">
            New password (leave blank to keep)
          </span>
          <Input
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            type="password"
          />
        </label>

        <div>
          <div className="text-sm text-muted-foreground mb-2">
            Favorite drivers
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto p-2 border rounded">
            {driversApi.drivers.map((driver: ApiDriver) => (
              <label key={driver.driverId} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={driver.driverId}
                  checked={favoriteDriversIds.includes(driver.driverId)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const id = driver.driverId;
                    setFavoriteDriversIds((prev) =>
                      e.target.checked
                        ? [...prev, id]
                        : prev.filter((x) => x !== id)
                    );
                  }}
                  className="accent-blue-600"
                />
                <span>
                  {driver.name ?? ""} {driver.surname ?? ""}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground mb-2">
            Favorite teams
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto p-2 border rounded">
            {teamsApi.teams.map((team: ApiTeam) => (
              <label key={team.teamId} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={team.teamId}
                  checked={favoriteTeamsIds.includes(team.teamId)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const id = team.teamId;
                    setFavoriteTeamsIds((prev) =>
                      e.target.checked
                        ? [...prev, id]
                        : prev.filter((x) => x !== id)
                    );
                  }}
                  className="accent-blue-600"
                />
                <span>{team.teamName ?? ""}</span>
              </label>
            ))}
          </div>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}
        {status === "saved" && (
          <div className="text-sm text-green-600">Settings saved.</div>
        )}

        <Button type="submit" className="w-fit" disabled={status === "saving"}>
          {status === "saving" ? "Saving..." : "Save settings"}
        </Button>
      </form>
    </div>
  );
}
