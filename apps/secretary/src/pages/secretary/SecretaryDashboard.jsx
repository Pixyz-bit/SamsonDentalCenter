import React from "react";
import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import DashboardWelcomeBanner from "../../components/patient/dashboard/DashboardWelcomeBanner";
import DashboardStats from "../../components/patient/dashboard/DashboardStats";

// New Dashboard Widgets
import PendingApprovalsWidget from "../../components/secretary/dashboard/PendingApprovalsWidget";
import FrontDeskWidget from "../../components/secretary/dashboard/FrontDeskWidget";

const SecretaryDashboard = () => {
  return (
    <div className="flex flex-col h-full">
      <PageBreadcrumb pageTitle="Secretary Dashboard" />

      <div className="mt-8 flex flex-col gap-6">
        {/* Top Section: Welcome Banner */}
        <DashboardWelcomeBanner firstName="Lisa" />

        {/* Global Stats (if needed, or can be removed if widgets replace its utility) */}
        <DashboardStats />

        {/* Command Center Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
          <div className="h-[400px]">
            <FrontDeskWidget />
          </div>
          <div className="h-[400px]">
            <PendingApprovalsWidget />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecretaryDashboard;
