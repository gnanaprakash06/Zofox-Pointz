// columns/mantraColumns.tsx
import { ActionsDropdown, TooltipText } from "@/components";
import { cn } from "@/lib/utils";
import { MantraType } from "@/services/mantra.service";
import { indDateTimeFormatter } from "@/utils/DateFormatter.utils";
import { createColumnHelper } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";

const columnHelper = createColumnHelper<MantraType>();

export type MantraActionType = {
  id: string;
  title: string;
  action: "edit" | "delete" | "toggle-status";
};

export const createMantraColumns = (
  onActionClick: (payload: MantraActionType) => void
) => [
  columnHelper.accessor("title", {
    header: "Title",
    cell: (info) => (
      <div className="font-semibold">
        <TooltipText
          text={info.getValue() || "N/A"}
          truncate
          className="w-[30ch]"
        />
      </div>
    ),
  }),

  columnHelper.accessor("description", {
    header: "Description",
    cell: (info) => (
      <TooltipText
        text={info.getValue() || "N/A"}
        truncate
        className="w-[40ch]"
      />
    ),
  }),

  columnHelper.accessor("tags", {
    header: "Tags",
    cell: (info) => {
      const tags = info.getValue() || [];
      return (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
            >
              {tag}
            </span>
          ))}
        </div>
      );
    },
  }),

  columnHelper.accessor("playCount", {
    header: "Plays",
    cell: (info) => (
      <div className="font-medium">
        {info.getValue()?.toLocaleString() || 0}
      </div>
    ),
  }),

  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => {
      const status = info.getValue();
      const isActive = status === "active";

      return (
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold",
            isActive
              ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
              : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
          )}
        >
          {status}
        </span>
      );
    },
  }),

  columnHelper.accessor("createdAt", {
    header: "Created At",
    cell: (info) => (
      <div className="text-sm">{indDateTimeFormatter(info.getValue())}</div>
    ),
  }),

  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: (info) => {
      const data = info.row.original;

      const actions = [
        {
          label: "Edit",
          icon: <Edit size={16} />,
          onClick: () =>
            onActionClick({
              id: data._id,
              title: data.title,
              action: "edit",
            }),
        },
        {
          label: data.status === "active" ? "Deactivate" : "Activate",
          icon: <Edit size={16} />,
          onClick: () =>
            onActionClick({
              id: data._id,
              title: data.title,
              action: "toggle-status",
            }),
        },
        {
          label: "Delete",
          icon: <Trash2 size={16} />,
          onClick: () =>
            onActionClick({
              id: data._id,
              title: data.title,
              action: "delete",
            }),
          variant: "destructive" as const,
        },
      ];

      return <ActionsDropdown actions={actions} />;
    },
  }),
];
