"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { fileToAvatarDataUrl } from "@/shared/lib/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { updateUser } from "@/entities/auth/model/authSlice";
import { useGetDriversQuery, useGetTeamsQuery } from "@/entities/f1api/f1api";
import {
  Loader2,
  Settings,
  User,
  Lock,
  Heart,
  CheckCircle2,
  AlertCircle,
  Check,
  ImagePlus,
  Trash2,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type {
  ApiDriver,
  ApiTeam,
  DriversResponse,
  TeamsResponse,
} from "@/entities/f1api/f1api.interfaces";

type UserShape = {
  username?: string;
  email?: string;
  avatarUrl?: string | null;
  favoriteDriversIds?: string[];
  favoriteDriverIds?: string[];
  favoriteTeamsIds?: string[];
  favoriteTeamIds?: string[];
};

function StatusBanner({
  status,
  error,
}: {
  status: "idle" | "saving" | "saved" | "error";
  error: string | null;
}) {
  if (status === "saved")
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2.5">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        Settings saved successfully.
      </div>
    );
  if (status === "error")
    return (
      <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2.5">
        <AlertCircle className="w-4 h-4 shrink-0" />
        {error ?? "Something went wrong."}
      </div>
    );
  return null;
}

export default function SettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user) as UserShape | undefined;
  const initialized = useAppSelector((s) => s.auth.initialized);

  useEffect(() => {
    if (initialized && !user) {
      router.replace("/login");
    }
  }, [initialized, user, router]);

  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatar, setAvatar] = useState<string | null>(user?.avatarUrl ?? null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file.");
      return;
    }
    setAvatarError(null);
    try {
      setAvatar(await fileToAvatarDataUrl(file));
    } catch (err) {
      setAvatarError(
        err instanceof Error ? err.message : "Could not process that image."
      );
    }
  }

  const getFavDrivers = (u: UserShape | undefined): string[] =>
    Array.isArray(u?.favoriteDriversIds)
      ? u!.favoriteDriversIds!
      : Array.isArray(u?.favoriteDriverIds)
      ? u!.favoriteDriverIds!
      : [];

  const getFavTeams = (u: UserShape | undefined): string[] =>
    Array.isArray(u?.favoriteTeamsIds)
      ? u!.favoriteTeamsIds!
      : Array.isArray(u?.favoriteTeamIds)
      ? u!.favoriteTeamIds!
      : [];

  const [favoriteDriversIds, setFavoriteDriversIds] = useState<string[]>(
    getFavDrivers(user)
  );
  const [favoriteTeamsIds, setFavoriteTeamsIds] = useState<string[]>(
    getFavTeams(user)
  );

  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  const {
    data: driversApi = { drivers: [] as ApiDriver[] },
    isLoading: isDriversLoading,
  } = useGetDriversQuery(undefined, {
    refetchOnMountOrArgChange: true,
  }) as { data?: DriversResponse; isLoading: boolean };

  const {
    data: teamsApi = { teams: [] as ApiTeam[] },
    isLoading: isTeamsLoading,
  } = useGetTeamsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  }) as { data?: TeamsResponse; isLoading: boolean };

  useEffect(() => {
    setUsername(user?.username ?? "");
    setEmail(user?.email ?? "");
    setAvatar(user?.avatarUrl ?? null);
    setFavoriteDriversIds(getFavDrivers(user));
    setFavoriteTeamsIds(getFavTeams(user));
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPwError(null);

    if (password && password !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }

    setStatus("saving");

    try {
      const payload: {
        username: string;
        email: string;
        password?: string;
        avatarUrl: string | null;
        favoriteDriversIds: string[];
        favoriteTeamsIds: string[];
      } = {
        username: username.trim(),
        email: email.trim(),
        avatarUrl: avatar,
        favoriteDriversIds,
        favoriteTeamsIds,
      };

      if (password) payload.password = password;

      await dispatch(updateUser(payload)).unwrap();
      setStatus("saved");
      setPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Unknown error");
      setStatus("error");
    }
  }

  function toggleDriver(id: string) {
    setFavoriteDriversIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleTeam(id: string) {
    setFavoriteTeamsIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  if (!initialized || !user) {
    return null;
  }

  if (isDriversLoading || isTeamsLoading) {
    return (
      <div className="container px-4 sm:px-6 mx-auto py-10 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <Skeleton className="h-10 w-full sm:w-72 mb-6" />
        <div className="rounded-xl border border-border p-6 space-y-5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 sm:px-6 mx-auto py-10 max-w-3xl">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 text-red-500">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your profile and preferences
          </p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="profile" className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Password
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className="flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5" />
              Favorites
            </TabsTrigger>
          </TabsList>

          {/* Profile tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profile Info</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <UserAvatar
                    src={avatar}
                    name={username || user?.username}
                    viewable
                    className="w-20 h-20 text-2xl"
                  />
                  <div className="flex flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleAvatarChange}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImagePlus className="w-4 h-4" />
                        {avatar ? "Change photo" : "Upload photo"}
                      </Button>
                      {avatar && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="gap-2 text-red-500 hover:text-red-600"
                          onClick={() => setAvatar(null)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Square image works best. Applied when you save settings.
                    </p>
                    {avatarError && (
                      <p className="text-xs text-red-500">{avatarError}</p>
                    )}
                  </div>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium">Username</span>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your username"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium">Email</span>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="your@email.com"
                  />
                </label>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Password tab */}
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Change Password</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium">New password</span>
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="Leave blank to keep current"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium">Confirm password</span>
                  <Input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type="password"
                    placeholder="Repeat new password"
                    className={cn(
                      pwError && "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  {pwError && (
                    <span className="text-xs text-red-500">{pwError}</span>
                  )}
                </label>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorites tab */}
          <TabsContent value="favorites" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Favorite Drivers
                  {favoriteDriversIds.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {favoriteDriversIds.length} selected
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {driversApi.drivers.map((driver: ApiDriver) => {
                    const selected = favoriteDriversIds.includes(
                      driver.driverId
                    );
                    return (
                      <button
                        key={driver.driverId}
                        type="button"
                        onClick={() => toggleDriver(driver.driverId)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all duration-150 select-none",
                          selected
                            ? "bg-red-500 border-red-500 text-white"
                            : "bg-transparent border-border text-muted-foreground hover:border-red-400 hover:text-foreground"
                        )}
                      >
                        {selected && <Check className="w-3 h-3" />}
                        {driver.name} {driver.surname}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Favorite Teams
                  {favoriteTeamsIds.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {favoriteTeamsIds.length} selected
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {teamsApi.teams.map((team: ApiTeam) => {
                    const selected = favoriteTeamsIds.includes(team.teamId);
                    return (
                      <button
                        key={team.teamId}
                        type="button"
                        onClick={() => toggleTeam(team.teamId)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all duration-150 select-none",
                          selected
                            ? "bg-red-500 border-red-500 text-white"
                            : "bg-transparent border-border text-muted-foreground hover:border-red-400 hover:text-foreground"
                        )}
                      >
                        {selected && <Check className="w-3 h-3" />}
                        {team.teamName}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex flex-col gap-3">
          <StatusBanner status={status} error={error} />
          <Button
            type="submit"
            disabled={status === "saving"}
            className="w-full sm:w-fit bg-red-500 hover:bg-red-600 text-white"
          >
            {status === "saving" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              "Save settings"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
