"use client";
import React from "react";
import Slider from "react-slick";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const slides = [
  { src: "/android-chrome-512x512.png", alt: "Slide 1" },
  { src: "/vercel.svg", alt: "Slide 2" },
  { src: "/next.svg", alt: "Slide 3" },
];

const HeaderSlider: React.FC = () => {
  const settings = {
    dots: true,
    arrows: false,
    infinite: true,
    autoplay: true,
    speed: 500,
  } as const;

  return (
    <div className="mb-4">
      <Slider {...settings}>
        {slides.map((s, i) => (
          <div
            key={i}
            className="h-40 flex items-center justify-center bg-gray-100 dark:bg-[#111]"
          >
            <Image
              src={s.src}
              alt={s.alt}
              width={150}
              height={150}
              className="object-contain"
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default HeaderSlider;
