import React from "react";
import { Stethoscope } from "lucide-react";

const ClinicianAvailabilityWidget = () => {
  const clinicians = [
    { name: "Dr. Samson", status: "available", room: "Room 1" },
    { name: "Dr. Reyes", status: "in-procedure", room: "Surgery A" },
    { name: "Dr. Cruz", status: "available", room: "Room 2" },
    { name: "Dr. Lim", status: "off", room: "-" },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col h-full transition-all">
      <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Stethoscope size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Clinicians Today
            </h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Availability status
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2">
        {clinicians.map((doc, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3 shrink-0">
                {doc.status === "available" && (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </>
                )}
                {doc.status === "in-procedure" && (
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                )}
                {doc.status === "off" && (
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-300 dark:bg-gray-600"></span>
                )}
              </span>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {doc.name}
                </p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {doc.room}
                </p>
              </div>
            </div>
            
            <span className="text-xs font-semibold px-2 py-1 rounded-md bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {doc.status === "available" ? "Available" : doc.status === "in-procedure" ? "Busy" : "Off"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClinicianAvailabilityWidget;
