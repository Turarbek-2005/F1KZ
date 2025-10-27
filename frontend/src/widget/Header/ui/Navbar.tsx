import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex gap-6 ">
      <Link href="/">Standings</Link>
      <Link href="/">Teams</Link>
      <Link href="/">Drivers</Link>
      <Link href="/">Seasons</Link>
      <Link href="/">Results</Link>
      <Link href="/">Races</Link>

    </nav>
  );
}