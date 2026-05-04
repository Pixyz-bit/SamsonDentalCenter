import { useEffect, useRef } from "react";
import gsap from "gsap";

const PageHeader = ({ overline, title, subtitle }) => {
  const containerRef = useRef(null);
  const textElementsRef = useRef([]);
  const imageRef = useRef(null);

  // Image mapping based on page name
  const imageConfig = {
    "about us": "/images/characters/doctor-mask.png",
    "contact us": "/images/characters/tooth-brush.png",
    "our services": "/images/characters/woman-braces.png",
    "our dentists": "/images/characters/doctor-mask.png",
    gallery: "/images/characters/woman-braces.png",
    appointment: "/images/characters/tooth-brush.png",
  };

  const getContent = () => {
    const pageName = overline || title || "Our Services";
    const slug = pageName.toLowerCase();

    const config = {
      "about us": {
        title:
          "Every smile has a story. Discover the care and dedication behind ours.",
        desc: "Dedicated to world-class oral healthcare with clinical precision.",
      },
      "contact us": {
        title:
          "Your next great smile is just a message away. Reach out and experience the Samson Dental Center difference.",
      },
      "our services": {
        title:
          "Because every smile deserves exceptional care.  Here's everything we offer.",
        desc: "From preventive care to restorations, we offer comprehensive expertise.",
      },
      "our dentists": {
        title: "Meet the team behind your smile.",
        desc: "Our experts deliver top-quality treatments in a patient-focused environment.",
      },
      gallery: {
        title: "A glimpse into our clinical excellence.",
        desc: "See the real-life transformations achieved in our modern facility.",
      },
      appointment: {
        title: "Secure your consultation in just a few clicks.",
        desc: "Choose a time that works for you and start your journey today.",
      },
    };

    // Map aliases to primary keys
    const aliasMap = {
      about: "about us",
      contact: "contact us",
      inquiries: "contact us",
      services: "our services",
      doctors: "our dentists",
      team: "our dentists",
      booking: "appointment",
    };

    const key = aliasMap[slug] || slug;
    const match = config[key];

    return {
      pageName,
      configKey: key,
      engagingTitle: match?.title || title || `Expert care for ${pageName}.`,
      subDesc:
        match?.desc ||
        subtitle ||
        "Committed to delivering top-quality treatments in a professional environment.",
    };
  };

  const { pageName, configKey, engagingTitle, subDesc } = getContent();
  const pageImage = imageConfig[configKey] || "/images/characters/woman-braces.png";

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        textElementsRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: "power4.out",
          delay: 0.3,
        },
      );

      // Animate image on desktop
      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { x: 100, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power4.out",
            delay: 0.5,
          },
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[300px] md:min-h-[380px] lg:min-h-[420px] flex items-center justify-center overflow-hidden bg-[#171b1e]
"
    >
      {/* Background effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-stone-900/10"></div>
      </div>

      {/* Image — absolutely fills the right half, top to bottom */}
      <div className="hidden md:block absolute right-0 top-0 h-full w-1/2 z-0 overflow-hidden">
        {/* flex items-center justify-center */}
        <img
          ref={imageRef}
          src={pageImage}
          alt={pageName}
          className="h-full w-full object-contain object-center scale-125"
          loading="lazy"
        />
      </div>

      {/* Gradient overlay specifically for navbar readability, placed above the image */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-black/60 via-black/20 to-transparent z-10 pointer-events-none"></div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10 w-full font-sans">
        {/* Mobile: Centered layout */}
        <div className="md:hidden flex flex-col items-center justify-center text-center min-h-[300px]">
          <h1
            ref={(el) => (textElementsRef.current[0] = el)}
            className="text-5xl sm:text-6xl font-black leading-tight tracking-tight text-white max-w-2xl mb-8"
          >
            {pageName}
          </h1>
          <p
            ref={(el) => (textElementsRef.current[1] = el)}
            className="text-lg sm:text-xl text-white/90 max-w-lg leading-relaxed font-normal"
          >
            {engagingTitle}
          </p>
        </div>

        {/* Desktop: Text only on the left half */}
        <div
          className="hidden md:flex items-center min-h-[380px] lg:min-h-[420px]
 w-1/2"
        >
          <div className="flex flex-col items-start justify-center text-left">
            <h1
              ref={(el) => (textElementsRef.current[0] = el)}
              className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight text-white max-w-3xl mb-8"
            >
              {pageName}
            </h1>
            <p
              ref={(el) => (textElementsRef.current[1] = el)}
              className="text-lg lg:text-xl text-white/90 max-w-[500px] leading-relaxed font-normal"
            >
              {engagingTitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
