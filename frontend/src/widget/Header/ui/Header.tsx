"use client";
import Link from "next/link";
import Image from "next/image";
import Navbar from "./Navbar";
import { Moon, Sun, User, TextAlignJustify } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { logout } from "@/entities/auth/model/authSlice";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
export function Header() {
  const links = [
    { href: "/news", label: "News" },
    { href: "/schedule", label: "Schedule" },
    { href: "/results/2025/1/race", label: "Results" },
    { href: "/standings", label: "Standings" },
    { href: "/teams", label: "Teams" },
    { href: "/drivers", label: "Drivers" },
  ];

  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const auth = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };
  return (
    <header className="w-full fixed top-0 left-0 z-50 bg-background shadow">
      <div className="container px-4 sm:px-0 h-16 mx-auto flex items-center justify-between font-medium">
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
        <div className="hidden md:flex gap-3">
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
          {auth.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <User className="h-[1.2rem] w-[1.2rem]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuItem>Profile</DropdownMenuItem>
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
              <Button variant="outline">Sing In</Button>
            </Link>
          )}
        </div>
        <div className="md:hidden">
  <Sheet>
    <SheetTrigger asChild>
      <button className="h-6 w-6">
        <TextAlignJustify />
      </button>
    </SheetTrigger>

    <SheetContent className="w-screen h-screen p-10 pb-20 flex flex-col">
      <SheetTitle className="sr-only">Navigation</SheetTitle>

      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold">Menu</span>
      </div>

      <nav className="mt-12 flex flex-col gap-6 text-3xl font-semibold mb-auto">
        {links.map((link) => (
          <SheetClose asChild key={link.href}>
            <Link
              href={link.href}
              className="transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          </SheetClose>
        ))}
      </nav>

      {/* <div className="flex-1" /> */}

      <div className="flex flex-col gap-4">
        <Button
          variant="outline"
          size="icon"
          className="self-center"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="dark:hidden" />
          <Moon className="hidden dark:block" />
        </Button>

        {auth.user ? (
          <div className="flex flex-col gap-3 text-center">
            <SheetClose asChild>
              <button
                onClick={() => router.push("/settings")}
                className="text-muted-foreground hover:text-foreground transition"
              >
                Settings
              </button>
            </SheetClose>

            <SheetClose asChild>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-600 transition"
              >
                Logout
              </button>
            </SheetClose>
          </div>
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
