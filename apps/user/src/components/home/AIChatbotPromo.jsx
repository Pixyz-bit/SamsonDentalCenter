import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const AIChatbotPromo = ({ variant = "light" }) => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const mockupRef = useRef(null);
  const isDark = variant === "dark";

  // GSAP Animations
  useEffect(() => {
    let ctx = gsap.context(() => {
      // Masked Reveal Heading (Consistent with site style)
      gsap.from(".chatbot-reveal-text", {
        x: "-100%",
        opacity: 0,
        duration: 1.5,
        stagger: 0.2,
        ease: "expo.out",
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 85%",
          once: true,
        },
      });

      // Mockup Entrance
      gsap.from(".chatbot-mockup-anim", {
        scale: 0.9,
        opacity: 0,
        rotateX: -10,
        duration: 1.8,
        ease: "expo.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          once: true,
        },
      });

      // Floating elements stagger
      gsap.from(".floating-badge", {
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.3,
        ease: "power3.out",
        delay: 0.5,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          once: true,
        },
      });

      // Continuous floating animation
      gsap.to(mockupRef.current, {
        y: "-=15",
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`py-20 sm:py-32 lg:py-40 relative overflow-hidden transition-colors duration-500 ${isDark ? "bg-[#0B1120]" : "bg-white"}`}
    >
      {/* Background Decoration */}
      <div
        className={`absolute top-1/2 left-0 w-[600px] h-[600px] rounded-full blur-[140px] opacity-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "bg-blue-600" : "bg-blue-400"}`}
      ></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* CONTENT SIDE */}
          <div ref={headingRef}>
            <div className="overflow-hidden mb-6">
              <div className="chatbot-reveal-text flex items-center gap-3">
                <span className="h-px w-10 bg-sky-400"></span>
                <span className="text-sky-400 font-bold uppercase tracking-[0.3em] text-[10px]">
                  Future of Dentistry
                </span>
              </div>
            </div>

            <h2
              className={`text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[1.16] tracking-tighter mb-10 ${isDark ? "text-white" : "text-slate-900"}`}
            >
              <div className="overflow-hidden">
                <span className="block chatbot-reveal-text">Intelligent</span>
              </div>
              <div className="overflow-hidden">
                <span className="block text-transparent bg-clip-text bg-sky-400 chatbot-reveal-text">
                  Clinical Care.
                </span>
              </div>
            </h2>

            <div className="floating-badge">
              <p
                className={`text-lg md:text-xl mb-12 leading-relaxed max-w-xl font-medium ${isDark ? "text-white" : "text-slate-600"}`}
              >
                Experience 24/7 clinical support. Our advanced AI assistant
                handles inquiries, schedules appointments, and provides instant
                oral health guidance with precision.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                <button
                  onClick={() => navigate("/inquiries")}
                  className="group w-full sm:w-auto bg-slate-900 text-white hover:bg-blue-600 px-10 py-5 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 shadow-xl shadow-slate-900/10 hover:shadow-blue-500/20 hover:-translate-y-1 flex items-center justify-center gap-3"
                >
                  Engage with AI
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M13 5l7 7-7 7"
                    ></path>
                  </svg>
                </button>
                <button
                  onClick={() => navigate("/services")}
                  className={`w-full sm:w-auto border px-10 py-5 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 ${isDark ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-white border-slate-200 text-slate-800 hover:border-blue-200 hover:text-blue-600 shadow-sm"}`}
                >
                  View Capabilities
                </button>
              </div>
            </div>
          </div>

          {/* VISUAL MOCKUP SIDE */}
          <div className="relative">
            <div ref={mockupRef} className="chatbot-mockup-anim relative z-10">
              {/* Main Phone-style Container */}
              <div
                className={`w-full max-w-[380px] mx-auto rounded-[3rem] border shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden transition-all duration-700 ${isDark ? "bg-slate-950/80 border-white/10" : "bg-white border-slate-100"}`}
              >
                <div
                  className={`p-6 border-b flex items-center justify-between ${isDark ? "bg-white/5 border-white/5" : "bg-slate-50/80 border-slate-100"}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"></path>
                        <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"></path>
                      </svg>
                    </div>
                    <div className="text-left">
                      <p
                        className={`font-black text-xs uppercase tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}
                      >
                        Samson AI Agent
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-[8px] font-bold text-green-500 uppercase tracking-widest">
                          Neural Engine Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-6 h-[420px]">
                  <div className="flex justify-start text-left">
                    <div
                      className={`rounded-2xl rounded-tl-none p-4 max-w-[85%] text-xs font-semibold leading-relaxed ${isDark ? "bg-white/5 text-white" : "bg-slate-100 text-slate-700 border border-slate-200/50"}`}
                    >
                      Welcome to Samson Dental. How can I assist with your
                      clinical inquiry today?
                    </div>
                  </div>
                  <div className="flex justify-end text-right">
                    <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none p-4 max-w-[85%] text-xs font-bold shadow-lg shadow-blue-500/10">
                      Tell me about your 3D scanning.
                    </div>
                  </div>
                  <div className="flex justify-start text-left">
                    <div
                      className={`rounded-2xl rounded-tl-none p-4 max-w-[85%] text-xs font-semibold leading-relaxed ${isDark ? "bg-white/5 text-white" : "bg-slate-100 text-slate-700 border border-slate-200/50"}`}
                    >
                      Our iTero Element 5D scanner provides precise diagnostics
                      and zero radiation exposure.
                    </div>
                  </div>
                </div>

                <div
                  className={`p-6 border-t ${isDark ? "bg-white/5 border-white/5" : "bg-white"}`}
                >
                  <div
                    className={`h-11 rounded-xl border w-full flex items-center px-4 transition-colors ${isDark ? "bg-slate-900 border-white/10 hover:border-blue-500/30" : "bg-slate-50 border-slate-100 hover:border-blue-200"}`}
                  >
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      System Synchronized
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating Decorative Badges */}
              <div className="absolute -top-6 -right-6 floating-badge z-20">
                <div
                  className={`p-4 rounded-3xl border shadow-2xl flex items-center gap-4 ${isDark ? "bg-slate-900/90 border-white/10" : "bg-white/95 border-slate-100"}`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      ></path>
                    </svg>
                  </div>
                  <div className="pr-4 text-left">
                    <p
                      className={`text-[10px] font-black uppercase tracking-tighter ${isDark ? "text-sky-400" : "text-sky-500"}`}
                    >
                      Secure
                    </p>
                    <p className={`text-[8px] font-bold uppercase tracking-widest leading-none ${isDark ? "text-white" : "text-slate-500"}`}>
                      End-to-End Privacy
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 floating-badge z-20">
                <div
                  className={`p-4 rounded-3xl border shadow-2xl flex items-center gap-4 ${isDark ? "bg-slate-900/90 border-white/10" : "bg-white/95 border-slate-100"}`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      ></path>
                    </svg>
                  </div>
                  <div className="pr-4 text-left">
                    <p
                      className={`text-[10px] font-black uppercase tracking-tighter ${isDark ? "text-sky-400" : "text-sky-500"}`}
                    >
                      Neural
                    </p>
                    <p className={`text-[8px] font-bold uppercase tracking-widest leading-none ${isDark ? "text-white" : "text-slate-500"}`}>
                      Deep Learning Model
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIChatbotPromo;
