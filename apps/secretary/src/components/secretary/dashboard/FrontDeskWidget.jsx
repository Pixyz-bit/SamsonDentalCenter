import React from "react";
import { Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const FrontDeskWidget = () => {
  // Mock data representing active patients at the front desk
  const activePatients = [
    {
      id: 2,
      startTime: "10:30 AM",
      endTime: "11:30 AM",
      patient: "Sarah Mitchell",
      procedure: "Orthodontic Checkup",
      doctor: "Dr. Emily Chen",
      status: "In Progress",
      contact: "+63 920 987 6543",
    },
    {
      id: 1,
      startTime: "09:00 AM",
      endTime: "10:00 AM",
      patient: "Christopher Picarding",
      procedure: "Routine Cleaning",
      doctor: "Dr. James Thompson",
      status: "Waiting",
      contact: "+63 917 123 4567",
    },
    {
      id: 3,
      startTime: "1:00 PM",
      endTime: "2:00 PM",
      patient: "James Wilson",
      procedure: "Tooth Extraction",
      doctor: "Dr. Alan Smith",
      status: "Waiting",
      contact: "+63 932 555 7890",
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col h-full transition-all">
      <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Users size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Front Desk Queue</h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Active patients in clinic
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {activePatients.map((apt) => (
          <div
            key={apt.id}
            className="flex flex-col sm:flex-row bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group cursor-pointer"
          >
            {/* Left Time Column */}
            <div className="flex flex-row sm:flex-col w-full sm:w-[85px] bg-gray-50/50 dark:bg-gray-800/20 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-800 shrink-0">
              <div className="flex-1 flex flex-col justify-center px-3 py-3 sm:py-0">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 whitespace-nowrap">
                  Start Time
                </span>
                <span className="text-xs font-semibold text-[#0B1120] dark:text-white font-outfit truncate mt-0.5">
                  {apt.startTime}
                </span>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-row items-center p-3 sm:p-4 gap-4 min-w-0 w-full">
              {/* Patient Name */}
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">
                  Patient
                </span>
                <span className="font-semibold text-[#0B1120] dark:text-white text-sm font-outfit group-hover:text-brand-500 transition-colors truncate">
                  {apt.patient}
                </span>
              </div>

              {/* Service */}
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">
                  Service
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-[#0B1120] dark:text-white truncate" title={apt.procedure}>
                  {apt.procedure}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
        <Link to="/secretary/front-desk" className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
          <span>Go to Front Desk</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default FrontDeskWidget;
