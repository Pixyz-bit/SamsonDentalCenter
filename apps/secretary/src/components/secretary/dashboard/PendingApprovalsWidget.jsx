import React from "react";
import { CheckCircle2, XCircle, Clock, ChevronRight } from "lucide-react";

const PendingApprovalsWidget = () => {
  // Mock data for UI demonstration
  const pendingRequests = [
    {
      id: 1,
      patientName: "Michael Chang",
      type: "New Patient Registration",
      timeAgo: "10 mins ago",
      status: "pending",
    },
    {
      id: 2,
      patientName: "Sarah Jenkins",
      type: "Reschedule Request",
      timeAgo: "25 mins ago",
      status: "pending",
    },
    {
      id: 3,
      patientName: "David Ocampo",
      type: "Online Booking",
      timeAgo: "1 hr ago",
      status: "pending",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col h-full transition-all">
      <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Action Needed</h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {pendingRequests.length} pending approvals
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {pendingRequests.map((req) => (
          <div
            key={req.id}
            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] rounded-xl transition-colors cursor-pointer"
          >
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#00a884] transition-colors">
                {req.patientName}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                  {req.type}
                </span>
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                  {req.timeAgo}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Decline">
                <XCircle size={20} />
              </button>
              <button className="p-2 text-gray-400 hover:text-[#00a884] hover:bg-[#00a884]/10 rounded-lg transition-colors" title="Approve">
                <CheckCircle2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <button className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <span>View all in Approvals</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default PendingApprovalsWidget;
