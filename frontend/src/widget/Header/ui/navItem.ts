import { cn } from "@/shared/lib/utils";

// Shared base styling for every top-level nav item — the plain links in Navbar
// as well as the Drivers/Teams dropdown triggers — so they read as one row.
// Navbar links layer an animated pill behind this; the dropdown triggers pass
// a static `extra` background when active.
export function navItemClass(active: boolean, extra?: string) {
  return cn(
    "relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
    active
      ? "text-red-500"
      : "text-foreground/70 hover:text-foreground hover:bg-foreground/5",
    extra,
  );
}

// Static red pill used behind an active dropdown trigger.
export const activePill = "bg-red-500/10 ring-1 ring-red-500/20";
