"use client";
import React from "react";
import { HeroParallax } from "./ui/hero-parallax";

export function Display() {
  return <HeroParallax products={products} />;
}
export const products = [
  {
    title: "Expressive visuals",
    thumbnail:
      "/6.png",
  },
  {
    title: "Relevant metrics",
    thumbnail:
      "/2.png",
  },
  {
    title: "Intuitive charts",
    thumbnail:
      "/3.png",
  },

  {
    title: "Detailed interface",
    thumbnail:
      "/4.png",
  },
  {
    title: "Quick terminal",
    thumbnail:
      "/5.png",
  },
  {
    title: "Clean dashboard",
    thumbnail:
      "/1.png",
  }

];
