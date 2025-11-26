import { Montserrat, Grape_Nuts } from "next/font/google";

export const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-montserrat",
  display: "swap",
});

export const grapeNuts = Grape_Nuts({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-grape-nuts",
  display: "swap",
});
