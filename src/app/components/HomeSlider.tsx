"use client";
import Slider from "react-slick";

const slides = [
  { title: "Welcome to VONE", text: "Connect. Innovate. Grow." },
  { title: "Earn Rewards", text: "Join community events and collect points." },
  { title: "Explore Talents", text: "Discover inspiring profiles around you." },
];

export default function HomeSlider() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
  } as const;

  return (
    <div className="mb-6">
      <Slider {...settings}>
        {slides.map((s, idx) => (
          <div key={idx} className="h-60 md:h-72 flex flex-col items-center justify-center rounded-lg text-center bg-gradient-to-br from-cyan-600 via-pink-500 to-purple-600">
            <h2 className="text-2xl font-bold mb-2">{s.title}</h2>
            <p className="text-sm">{s.text}</p>
          </div>
        ))}
      </Slider>
    </div>
  );
}
