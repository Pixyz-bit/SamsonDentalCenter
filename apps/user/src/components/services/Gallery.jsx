import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionHeading from "../common/SectionHeading";

gsap.registerPlugin(ScrollTrigger);

const SMILE_GALLERY = [
  {
    image:
      "/images/services/gallery-chairs-row.jpg",
    tags: ["DENTAL IMPLANTS", "VENEERS"],
    classes:
      "md:col-start-1 md:row-start-1 md:row-span-2 col-start-1 row-start-1 row-span-2 aspect-[1/2] md:aspect-auto",
  },
  {
    image:
      "/images/services/gallery-chair-red.jpg",
    tags: ["VENEERS"],
    classes:
      "md:col-start-2 md:row-start-1 col-start-2 row-start-1 aspect-square",
  },
  {
    image:
      "/images/services/gallery-equipment.jpg",
    tags: ["VENEERS"],
    classes:
      "md:col-start-3 md:row-start-1 col-start-2 row-start-2 aspect-square",
  },
  {
    image:
      "/images/services/gallery-consultation.jpg",
    tags: ["ALL-ON-X"],
    classes:
      "md:col-start-2 md:row-start-2 col-start-1 row-start-3 aspect-square",
  },
  {
    image:
      "/images/services/service-chair-close.jpg",
    tags: ["ALL-ON-X"],
    classes:
      "md:col-start-3 md:row-start-2 col-start-2 row-start-3 aspect-square",
  },
  {
    image:
      "/images/services/service-chair-tree.jpg",
    tags: ["ENDODONTICS", "VENEERS"],
    classes:
      "md:col-start-1 md:row-start-3 col-start-1 row-start-4 aspect-square",
  },
  {
    image:
      "/images/services/service-chair-scenic.jpg",
    tags: ["VENEERS"],
    classes:
      "md:col-start-2 md:row-start-3 col-start-2 row-start-4 aspect-square",
  },
  {
    image:
      "/images/services/service-lab-work.jpg",
    tags: ["ENDODONTICS", "DENTAL IMPLANTS"],
    classes:
      "md:col-start-1 md:row-start-4 col-start-1 row-start-5 aspect-square",
  },
  {
    image:
      "/images/services/service-exam.jpg",
    tags: ["PROFESSIONAL WHITENING", "VENEERS"],
    classes:
      "md:col-start-2 md:row-start-4 col-start-1 row-start-6 aspect-square",
  },
  {
    image:
      "/images/services/gallery-chairs-row.jpg",
    tags: ["VENEERS", "THERAPY"],
    classes:
      "md:col-start-3 md:row-start-3 md:row-span-2 col-start-2 row-start-5 row-span-2 aspect-[1/2] md:aspect-auto",
  },
];

const Gallery = ({ variant = "light" }) => {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);
  const headingRef = useRef(null);

  const isDark = false; // forced light mode

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Heading stagger (uses ref trigger to avoid conflict with HomeServices)
      gsap.from(".gallery-heading-item", {
        x: -100,
        opacity: 0,
        duration: 1.5,
        stagger: 0.2,
        ease: "expo.out",
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 90%",
          once: true,
        },
      });

      // Grid cards batch reveal
      gsap.set(".gallery-card", { y: 40, opacity: 0, scale: 0.95 });
      ScrollTrigger.batch(".gallery-card", {
        start: "top 95%",
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.1,
          });
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`py-16 sm:py-24 lg:py-32 relative overflow-hidden transition-colors duration-500 ${isDark ? "bg-red-950" : "bg-white"}`}
    >
      {/* Background Decor */}
      <div
        className={`absolute bottom-0 left-0 w-150 h-150 rounded-full blur-[100px] -ml-24 -mb-24 transition-opacity pointer-events-none ${isDark ? "bg-white/5" : "bg-red-600/5"}`}
      ></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div ref={headingRef} className="max-w-3xl mb-12 md:mb-20">
          <div className="gallery-heading-item flex items-center gap-3 mb-6">
            <span
              className={`h-px w-8 ${isDark ? "bg-red-400" : "bg-red-400"}`}
            ></span>
            <span
              className={`${isDark ? "text-red-400" : "text-red-400"} font-bold uppercase tracking-widest text-[10px]`}
            >
              Smile Gallery
            </span>
          </div>
          <h2
            className={`text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[1.1] tracking-tight ${isDark ? "text-white" : "text-stone-900"}`}
          >
            <span className="block gallery-heading-item">
              Our patients' smiles
            </span>
            <span
              className={`block gallery-heading-item ${isDark ? "text-red-400" : "text-red-400"}`}
            >
              speak for themselves.
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 p-2 rounded-2xl shadow-sm">
          {SMILE_GALLERY.map((item, idx) => (
            <div
              key={idx}
              className={`gallery-card relative overflow-hidden rounded-xl group transition-all duration-500 cursor-pointer ${item.classes}`}
            >
              <img
                src={item.image}
                alt={`Patient Smile ${idx + 1}`}
                className="absolute inset-0 w-full h-full object-cover grayscale-20 group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
              />

              {/* Overlay */}
              <div
                className={`absolute inset-0 transition-colors duration-500 ${isDark ? "bg-black/30 group-hover:bg-transparent" : "bg-stone-900/10 group-hover:bg-transparent"}`}
              ></div>

              {/* Tags/Badges */}
              <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 max-w-[90%] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                {item.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className={`backdrop-blur-sm text-[8px] md:text-[10px] font-bold px-2 py-1 rounded shadow-sm tracking-wide uppercase whitespace-nowrap ${isDark ? "bg-stone-900/90 text-white" : "bg-white/95 text-stone-900"}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
