import React from "react";
import { Users, Activity } from "lucide-react";

const LiveFrontDeskWidget = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col relative transition-all">
      {/* Decorative gradient pulse */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00a884]/10 blur-3xl rounded-full pointer-events-none" />

      <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#00a884]/10 flex items-center justify-center text-[#00a884]">
            <Activity size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Live Capacity
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Current clinic status
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-2 gap-4 relative z-10">
        <div className="bg-gray-50 dark:bg-white/[0.02] p-4 rounded-xl border border-gray-100 dark:border-gray-800">
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5">
            <Users size={14} /> Waiting Room
          </p>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white">4</p>
        </div>
        <div className="bg-gray-50 dark:bg-white/[0.02] p-4 rounded-xl border border-gray-100 dark:border-gray-800">
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5">
            <Activity size={14} /> In Surgery
          </p>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white">2</p>
        </div>
        <div className="col-span-2 bg-gray-50 dark:bg-white/[0.02] p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            Waitlist Queue
          </p>
          <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold px-3 py-1 rounded-full">
            1 Patient
          </span>
        </div>
      </div>
    </div>
  );
};

export default LiveFrontDeskWidget;
