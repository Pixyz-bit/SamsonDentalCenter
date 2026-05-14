import { Badge, Button } from "../../ui";
import {
  STATUS_LABEL,
  STATUS_COLOR,
  formatDate,
  formatTime,
} from "../../../hooks/useAppointments";
import { useNavigate } from "react-router-dom";

const truncateText = (text, maxLength) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const getInitial = (name = "") =>
  name
    .replace(/^Dr\.\s*/i, "")
    .charAt(0)
    .toUpperCase();

const AppointmentTableRow = ({
  appointment,
  onViewDetails,
  onStartAppointment,
  onCreateInvoice,
}) => {
  const displayStatus = STATUS_LABEL[appointment.status] || appointment.status;
  const badgeColor = STATUS_COLOR[displayStatus] || "primary";
  const dentistName =
    typeof appointment.dentist === "object" && appointment.dentist?.profile
      ? `${appointment.dentist.profile.last_name}, ${appointment.dentist.profile.first_name} ${appointment.dentist.profile.middle_name || ""} ${appointment.dentist.profile.suffix || ""}`
          .replace(/\s+/g, " ")
          .trim()
      : appointment.dentist || "TBD";

  return (
    <div
      onClick={() => onViewDetails(appointment.id)}
      className="group relative flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 sm:px-4 py-4 sm:py-5 border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-all hover:bg-gray-50/50 dark:hover:bg-white/[0.02]"
    >
      {/* Desktop View (sm and up) */}
      <div className="hidden sm:flex items-center gap-4 w-full">
        <div className="shrink-0 pl-1 text-gray-300 dark:text-gray-600 transition-colors group-hover:text-amber-400">
          <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-500 font-bold text-sm shadow-sm">
            {getInitial(dentistName)}
          </div>
        </div>

        <div className="w-32 lg:w-40 shrink-0 truncate ml-2">
          <span className="text-sm sm:text-base text-gray-900 dark:text-white font-bold">
            {truncateText(appointment.service, 20)}
          </span>
        </div>

        <div 
          className="flex-grow min-w-0 flex items-center cursor-pointer hover:text-brand-500 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(appointment.id);
          }}
        >
          <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate hover:text-brand-500 transition-colors">
            {dentistName}
          </span>
          <span className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 font-medium ml-2 shrink-0">
            - {formatDate(appointment.date)} at{" "}
            {formatTime(appointment.start_time)}
          </span>
        </div>

        <div
          className="flex items-center gap-3 shrink-0 min-w-[120px] justify-end"
          onClick={(e) => e.stopPropagation()}
        >
          <Badge size="sm" color={badgeColor}>
            {displayStatus}
          </Badge>
          
          {appointment.status === "CONFIRMED" && (
            <Button
              size="sm"
              className="h-8 px-4 text-xs font-bold"
              onClick={() => onStartAppointment(appointment.id)}
            >
              Start
            </Button>
          )}
          
          {appointment.status === "IN_PROGRESS" && (
            <Button
              size="sm"
              variant="primary"
              className="h-8 px-4 text-xs font-bold bg-amber-500 hover:bg-amber-600 border-amber-500 shadow-sm"
              onClick={() => onCreateInvoice(appointment)}
            >
              Invoice
            </Button>
          )}
        </div>
      </div>

      {/* Mobile View (xs only) */}
      <div className="flex sm:hidden gap-4 w-full">
        <div className="shrink-0">
          <div className="w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            {getInitial(dentistName)}
          </div>
        </div>
        <div className="flex-grow min-w-0 flex flex-col gap-0.5">
          <div className="flex justify-between items-center">
            <span className="text-sm tracking-tight font-bold text-gray-900 dark:text-white truncate pr-2">
              {appointment.service}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">
              {formatDate(appointment.date)}
            </span>
          </div>
          <div 
            className="text-sm truncate text-gray-900 dark:text-white font-semibold cursor-pointer hover:text-brand-500 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(appointment.id);
            }}
          >
            {dentistName}
          </div>
          <div className="flex justify-between items-end">
            <div className="text-xs text-gray-400 truncate pr-4 grow font-medium">
              {formatTime(appointment.start_time)} -{" "}
              {formatTime(appointment.end_time)}
            </div>
            <Badge size="sm" color={badgeColor} className="shrink-0">
              {displayStatus}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentTableRow;
