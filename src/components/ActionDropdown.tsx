import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export type ActionItem = {
  label: string;
  onClick: () => void | Promise<void>;
  requiresInput?: boolean; // whether action needs user input
  icon?: ReactNode;
  disabled?: boolean;
};

export type ActionsDropdownProps = {
  actions: ActionItem[];
  buttonLabel?: string; // default "⋯"
  align?: "start" | "end"; // dropdown alignment
  className?: string;
};

const ActionsDropdown = ({
  actions,
  buttonLabel = "⋯",
  align = "end",
  className,
}: ActionsDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={cn(
            "border bg-white text-black hover:bg-neutral-200",
            className
          )}
        >
          {buttonLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}
        {actions.map((action, idx) => (
          <DropdownMenuItem
            key={idx}
            onClick={action.onClick}
            disabled={action.disabled}
          >
            {action.icon && <span className="mr-2">{action.icon}</span>}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActionsDropdown;
