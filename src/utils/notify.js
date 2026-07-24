import toast from "react-hot-toast";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import { createElement } from "react";

const baseClass =
  "flex items-start gap-3 min-w-[280px] max-w-sm rounded-2xl border px-4 py-3 shadow-lg bg-white dark:bg-slate-800 dark:border-slate-700";

const show = (message, { icon, border, iconColor }) =>
  toast.custom(
    (t) =>
      createElement(
        "div",
        {
          className: `${baseClass} ${border} ${
            t.visible ? "animate-enter" : "animate-leave"
          }`,
        },
        createElement(icon, {
          size: 22,
          className: `${iconColor} shrink-0 mt-0.5`,
        }),
        createElement(
          "div",
          { className: "flex-1 min-w-0" },
          createElement(
            "p",
            { className: "text-sm font-semibold text-slate-900 dark:text-slate-100" },
            message
          )
        )
      ),
    { duration: 3200 }
  );

export const notifySuccess = (message) =>
  show(message, {
    icon: CheckCircle2,
    border: "border-emerald-200",
    iconColor: "text-emerald-500",
  });

export const notifyError = (message) =>
  show(message, {
    icon: XCircle,
    border: "border-red-200",
    iconColor: "text-red-500",
  });

export const notifyInfo = (message) =>
  show(message, {
    icon: Info,
    border: "border-blue-200",
    iconColor: "text-blue-500",
  });
