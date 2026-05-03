import React from "react";
import { Calendar, MoreVertical } from "lucide-react";

const UpcomingAppointmentsWidget = () => {
  // Mock data for UI demonstration
  const appointments = [
    {
      id: 1,
      time: "09:00 AM",
      patient: "Emily Chen",
      procedure: "Routine Checkup",
      doctor: "Dr. Samson",
      status: "checked-in",
    },
    {
      id: 2,
      time: "09:45 AM",
      patient: "Robert Fox",
      procedure: "Root Canal Prep",
      doctor: "Dr. Reyes",
      status: "confirmed",
    },
    {
      id: 3,
      time: "10:30 AM",
      patient: "Amanda Clark",
      procedure: "Teeth Whitening",
      doctor: "Dr. Cruz",
      status: "confirmed",
    },
    {
      id: 4,
      time: "11:15 AM",
      patient: "Marcus Johnson",
      procedure: "Consultation",
      doctor: "Dr. Samson",
      status: "unconfirmed",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col h-full transition-all">
      <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Calendar size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Up Next Today</h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Next 4 appointments
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {appointments.map((apt) => (
          <div
            key={apt.id}
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-[#00a884]/30 transition-colors"
          >
            <div className="flex flex-col items-center justify-center min-w-[70px] shrink-0 border-r border-gray-100 dark:border-gray-800 pr-4">
              <span className="text-sm font-extrabold text-gray-900 dark:text-white">
                {apt.time.split(" ")[0]}
              </span>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                {apt.time.split(" ")[1]}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {apt.patient}
                </p>
                {apt.status === "checked-in" ? (
                   <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                     Checked In
                   </span>
                ) : apt.status === "unconfirmed" ? (
                  <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400">
                    Unconfirmed
                  </span>
                ) : null}
              </div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {apt.procedure} • {apt.doctor}
              </p>
            </div>

            <div className="shrink-0">
              {apt.status !== "checked-in" && (
                <button className="hidden sm:block text-xs font-bold bg-gray-100 hover:bg-[#00a884] hover:text-white text-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-[#00a884] dark:hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                  Check In
                </button>
              )}
              <button className="sm:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingAppointmentsWidget;
