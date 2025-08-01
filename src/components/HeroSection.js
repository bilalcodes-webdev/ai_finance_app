"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import { useEffect, useRef } from "react";

const HeroSection = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    const image = imageRef.current;
    const threshhold = 150;

    const handleScroll = () => {
      if (window.scrollY > threshhold) {
        image.classList.add("scrolled");
      } else {
        image.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  },[]);

  return (
    <div className="pb-40 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl md:text-8xl lg:text-[105px] pb-6 gradient-title bg-gradient-to-br from-blue-600 to-purple-600 font-extrabold tracking-tighter pr-2 text-transparent bg-clip-text">
          Automate Budgeting <br /> Expense Tracking
        </h1>
        <p className="text-xl max-w-2xl mx-auto mb-8 text-gray-600">
          Let AI manage your budget, categorize your expenses, and alert you to
          unusual spending—so you can focus on what really matters.
        </p>

        <div className="flex items-center gap-4 justify-center">
          <Link href="/dashboard">
            <Button size="lg" className="px-8 cursor-pointer">
              Getting Started
            </Button>
          </Link>
          <Link href="https://youtu.be/wiOx3xsILPM?t=1">
            <Button size="lg" className="px-8 cursor-pointer" variant="outline">
              Watch Demos
            </Button>
          </Link>
        </div>

        <div className="banner-wrapper">
          <div className="banner-image" ref={imageRef}>
            <Image
              src="/banner.jpeg"
              alt="banner-image"
              width={1280}
              height={720}
              className="rounded-lg border shadow-2xl mx-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default HeroSection;
