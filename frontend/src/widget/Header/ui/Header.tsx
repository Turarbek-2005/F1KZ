"use client";
import Link from "next/link";
import Image from "next/image";
import Navbar from "./Navbar";
import {
  Moon,
  Sun,
  User,
  TextAlignJustify,
  Radio,
  Newspaper,
  CalendarDays,
  Flag,
  ListOrdered,
  Target,
  Scale,
  Users,
  UserRound,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { logout, logoutUser } from "@/entities/auth/model/authSlice";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks";
import { useRouter, usePathname } from "next/navigation";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import { GlobalSearch } from "@/features/search/ui/GlobalSearch";
import { Skeleton } from "@/shared/ui/skeleton";
import { UserAvatar } from "@/shared/ui/UserAvatar";

export function Header() {
  const currentYear = new Date().getFullYear();
  const links = [
    { href: "/live", label: "Live", icon: Radio },
    { href: "/news", label: "News", icon: Newspaper },
    { href: "/schedule", label: "Schedule", icon: CalendarDays },
    { href: `/results/${currentYear}/1/race`, label: "Results", icon: Flag },
    { href: "/standings", label: "Standings", icon: ListOrdered },
    { href: "/predictions", label: "Predictions", icon: Target },
    { href: "/compare", label: "Compare", icon: Scale },
    { href: "/teams", label: "Teams", icon: Users },
    { href: "/drivers", label: "Drivers", icon: UserRound },
  ];

  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const activeSeg = pathname.split("/")[1] ?? "";
  const auth = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch {
      // ignore failure, still clear frontend auth state
    }

    dispatch(logout());
    router.push("/login");
  };
  return (
    <header className="w-full fixed top-0 left-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/70 shadow-sm">
      <div className="container px-4 sm:px-0 h-16 mx-auto flex items-center justify-between gap-4 font-medium">
        <Link href="/">
          <Image
            src="/F1KZ logo.png"
            alt="F1KZ Logo"
            width={128}
            height={85}
            priority
          />
        </Link>
        <Navbar />
        <div className="hidden lg:flex gap-3 items-center">
          <GlobalSearch />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {!auth.initialized ? (
            <Skeleton className="h-9 w-9 rounded-md" />
          ) : auth.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="rounded-full outline-none ring-1 ring-border transition hover:ring-red-500/50 focus-visible:ring-2 focus-visible:ring-red-500/50"
                  aria-label="Account menu"
                >
                  <UserAvatar
                    src={auth.user.avatarUrl}
                    name={auth.user.username}
                    className="h-9 w-9 text-xs"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
          )}
        </div>
        <div className="lg:hidden flex items-center gap-2">
          <GlobalSearch />
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-md text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
                aria-label="Open menu"
              >
                <TextAlignJustify className="h-5 w-5" />
              </button>
            </SheetTrigger>

            <SheetContent className="w-[86%] gap-0 overflow-y-auto p-0 sm:max-w-sm">
              <SheetTitle className="sr-only">Navigation</SheetTitle>

              {/* Brand header */}
              <div className="flex h-16 items-center gap-2 border-b border-border/60 px-5">
                <Image
                  src="/F1KZ logo.png"
                  alt="F1KZ"
                  width={96}
                  height={64}
                  priority
                />
              </div>

              {/* Nav links */}
              <nav className="px-3 py-4">
                <ul className="flex flex-col">
                  {links.map((link) => {
                    const active = activeSeg === link.href.split("/")[1];
                    const Icon = link.icon;
                    return (
                      <li key={link.href}>
                        <SheetClose asChild>
                          <Link
                            href={link.href}
                            className={cn(
                              "group flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors",
                              active
                                ? "bg-red-500/10 text-red-500 ring-1 ring-red-500/20"
                                : "text-foreground/80 hover:bg-foreground/5 hover:text-foreground",
                            )}
                          >
                            <Icon className="h-5 w-5 shrink-0" />
                            <span className="flex-1">{link.label}</span>
                            <ChevronRight
                              className={cn(
                                "h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-60",
                                active && "translate-x-0 opacity-60",
                              )}
                            />
                          </Link>
                        </SheetClose>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* Footer */}
              <div className="flex flex-col border-t border-border/60 px-4 py-3">
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
                >
                  <Sun className="h-5 w-5 shrink-0 dark:hidden" />
                  <Moon className="hidden h-5 w-5 shrink-0 dark:block" />
                  <span>
                    <span className="dark:hidden">Light mode</span>
                    <span className="hidden dark:inline">Dark mode</span>
                  </span>
                </button>

                {!auth.initialized ? (
                  <Skeleton className="h-11 w-full rounded-xl" />
                ) : auth.user ? (
                  <>
                    <SheetClose asChild>
                      <button
                        onClick={() => router.push("/profile")}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
                      >
                        <User className="h-5 w-5 shrink-0" />
                        Profile
                      </button>
                    </SheetClose>
                    <SheetClose asChild>
                      <button
                        onClick={() => router.push("/settings")}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
                      >
                        <Settings className="h-5 w-5 shrink-0" />
                        Settings
                      </button>
                    </SheetClose>
                    <SheetClose asChild>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
                      >
                        <LogOut className="h-5 w-5 shrink-0" />
                        Logout
                      </button>
                    </SheetClose>
                  </>
                ) : (
                  <SheetClose asChild>
                    <Link href="/login">
                      <Button className="w-full">Sign In</Button>
                    </Link>
                  </SheetClose>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
