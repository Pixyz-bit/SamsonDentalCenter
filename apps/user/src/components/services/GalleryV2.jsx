import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const galleryItems = [
  {
    id: "1",
    image:
      "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&q=80&w=800",
    title: "Precision",
  },
  {
    id: "2",
    image:
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800",
    title: "Comfort",
  },
  {
    id: "3",
    image:
      "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&q=80&w=800",
    title: "Aesthetics",
  },
  {
    id: "4",
    image:
      "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&q=80&w=800",
    title: "Quality",
  },
  {
    id: "5",
    image:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800",
    title: "State of Art",
  },
  {
    id: "6",
    image:
      "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=800",
    title: "Durability",
  },
  {
    id: "7",
    image:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800",
    title: "Technology",
  },
];

const GalleryV2 = ({ variant = "dark", showExploreButton = false }) => {
  const containerRef = useRef(null);
  const scrollWrapperRef = useRef(null);
  const trackRef = useRef(null);
  const titleCharsRef = useRef([]);
  const isDark = false; // forced light mode
  const navigate = useNavigate();

  useEffect(() => {
    let ctx = gsap.context(() => {
      // 1. Title Reveal
      gsap.fromTo(
        ".title-reveal-line",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: scrollWrapperRef.current,
            start: "top 60%", // Triggers when the wrapper safely enters the screen
            once: true,
          },
        },
      );

      // 2. Horizontal Scroll
      // We want to move the track left by its scrollable width
      const getScrollAmount = () => {
        const cards = trackRef.current.querySelectorAll(".gallery-v2-card");
        if (cards.length === 0) return 0;
        const lastCard = cards[cards.length - 1];
        const viewportWidth = window.innerWidth;
        // Calculate stop point based only on gallery cards + 20vw padding
        const scrollStopRange = lastCard.offsetLeft + lastCard.offsetWidth + (viewportWidth * 0.2);
        return -(scrollStopRange - viewportWidth);
      };

      // Timeline for horizontal scroll with buffer zones
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollWrapperRef.current,
          start: "top top",
          end: () =>
            `+=${Math.abs(getScrollAmount()) + window.innerHeight * 1.5}`, // Added extra scroll distance for delay buffers
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true, // Recalculate on window resize
        },
      });

      // Buffer pause before horizontal scroll begins
      tl.to({}, { duration: 0.05 });

      // The actual horizontal movement
      tl.to(trackRef.current, {
        x: getScrollAmount,
        ease: "none",
        duration: 0.9,
      });

      // Buffer pause after horizontal scroll before unpinning
      tl.to({}, { duration: 0.05 });

      // 3. Cards Entrance Animation
      gsap.fromTo(
        ".gallery-v2-card",
        { opacity: 0, scale: 0.8, y: 60 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1,
          stagger: 0.1,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: scrollWrapperRef.current,
            start: "top 60%", // Waits until the screen reaches the actual carousel section
            once: true,
          },
        },
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className={`relative overflow-hidden ${isDark ? "bg-red-950" : "bg-white"}`}
    >
      <div className="lg:h-[200px]" />{" "}
      {/* Spacer to allow scrolling to reach the pin naturally */}
      {/* The pinned section */}
      <div
        ref={scrollWrapperRef}
        className="h-screen w-full flex flex-col justify-center pb-16 lg:pb-0 relative"
      >
        {/* Absolute Background Blur Decoration */}
        <div
          className={`absolute top-1/2 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 -translate-y-1/2 pointer-events-none ${isDark ? "bg-red-600" : "bg-red-400"}`}
        ></div>

        {/* Text overlaid / stacked - Aligned with Navbar Logo */}
        <div className="relative lg:absolute lg:inset-0 z-20 pointer-events-none flex items-start lg:items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-[90vw] lg:max-w-[40vw] pointer-events-auto">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`h-px w-8 ${isDark ? "bg-red-600" : "bg-red-600"}`}
                ></span>
                <span
                  className={`${isDark ? "text-red-600" : "text-red-600"} font-bold uppercase tracking-widest text-xs`}
                >
                  Dental Gallery
                </span>
              </div>
              <h2 className={`text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[1.16] tracking-tighter ${isDark ? "text-white" : "text-stone-900"} m-0`}>
                <div className="overflow-hidden py-2 -my-2 whitespace-nowrap">
                  <span className={`block ${isDark ? "text-white" : "text-stone-900"} title-reveal-line`}>
                    Intelligent Care.
                  </span>
                </div>
                <div className="overflow-hidden py-2 -my-2 whitespace-nowrap">
                  <span className="block text-red-600 title-reveal-line">
                    Beautiful Smiles.
                  </span>
                </div>
              </h2>
              {showExploreButton && (
                <div className="pt-8 overflow-hidden pointer-events-auto">
                  <button
                    onClick={() => navigate('/services')}
                    className={`inline-flex items-center space-x-2 ${isDark ? "text-white" : "text-stone-900"} font-bold uppercase tracking-widest text-xs hover:text-red-400 transition-colors title-reveal-line`}
                  >
                    <span>Explore Our Services</span>
                    <svg className="w-4 h-4 translate-y-[-1px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Track mask wrapper - Back to full bleed but with right-side solid cut-off */}
        <div
          className="relative lg:absolute lg:inset-0 flex items-center overflow-hidden pointer-events-none w-full mt-2 lg:mt-0
                     lg:[-webkit-mask-image:linear-gradient(to_right,transparent_0%,transparent_35%,black_50%,black_85%,transparent_100%)] 
                     lg:[mask-image:linear-gradient(to_right,transparent_0%,transparent_35%,black_50%,black_85%,transparent_100%)]"
        >
          {/* The scrolling track of images */}
          <div
            ref={trackRef}
            className="flex items-center gap-6 lg:gap-12 pl-6 lg:pl-[50vw] pr-[20vw] relative z-10 will-change-transform pointer-events-auto h-full mt-4 lg:mt-0"
          >
            {galleryItems.map((item, index) => (
              <div
                key={item.id}
                className="gallery-v2-card flex-shrink-0 relative rounded-2xl overflow-hidden shadow-2xl group transition-transform w-[260px] h-[380px] md:w-[320px] md:h-[480px] lg:w-[400px] lg:h-[600px]"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-6 left-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                  <p className="text-white font-bold tracking-widest uppercase text-sm">
                    {item.title}
                  </p>
                </div>
              </div>
            ))}

            {/* Extra Decorative Image (Outside of scroll stop calculation) */}
            <div className="flex-shrink-0 relative rounded-2xl overflow-hidden w-[260px] h-[380px] md:w-[320px] md:h-[480px] lg:w-[400px] lg:h-[600px] opacity-20 blur-[2px] grayscale">
              <img
                src="/images/services/gallery-chairs-row.jpg"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Right Boundary Gradient Overlay - Creates the smooth fade-out into the background */}
        <div className="absolute right-[calc((100vw-min(100vw,1280px))/2+16px)] top-0 bottom-0 w-[150px] bg-gradient-to-l from-white to-transparent z-40 pointer-events-none hidden lg:block"></div>
        
        {/* Solid Right Boundary Overlay - Hides the gallery as it reaches the screen corner */}
        <div className="absolute right-0 top-0 bottom-0 w-[calc((100vw-min(100vw,1280px))/2+16px)] bg-white z-40 pointer-events-none hidden lg:block"></div>
      </div>
    </section>
  );
};

export default GalleryV2;
