"use client";
import Link from "next/link";
import Image from "next/image";
import Navbar from "./Navbar";
import { Moon, Sun, User } from "lucide-react";
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
export function Header() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const auth = useAppSelector((s) => s.auth);

  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };
  return (
    <header className="w-full">
      <div className="container h-16 mx-auto flex items-center justify-between">
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
        <div className="flex gap-3">
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
                <DropdownMenuItem>Settings</DropdownMenuItem>
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
      </div>
    </header>
  );
}
