import { Button } from "@/components/ui/button";
import { AuthHeaderProps } from "@/types/types";

const headerConfig: Record<string, AuthHeaderProps> = {
  "/dashboard": {
    title: "Dashboard Overview",
  },
  "/user-management": {
    title: "User Management",
    rightSection: (
      <Button onClick={() => alert("Deploy Clicked")} variant="default">
        Export Users
      </Button>
    ),
  },
  "/seller-management": {
    title: "Subscription Management",
    rightSection: (
      <Button onClick={() => alert("Deploy Clicked")} variant="default">
        Export Sellers
      </Button>
    ),
  },
  "/banner-management": {
    title: "Banner Management",
    rightSection: (
      <Button onClick={() => alert("Deploy Clicked")} variant="default">
        + Add Banner
      </Button>
    ),
  },
  "/Subscription-management": {
    title: "Banner Management",
    rightSection: (
      <div className="flex items-center justify-between gap-4">
        <Button onClick={() => alert("Deploy Clicked")} variant="default">
          Plans
        </Button>
        <Button onClick={() => alert("Deploy Clicked")} variant="default">
          Subscribers
        </Button>
      </div>
    ),
  },
  "/app-version-management": {
    title: "App Version Management",
    subtitle: "Manage Zofoxx mobile app versions and deployments",
    rightSection: (
      <Button onClick={() => alert("Deploy Clicked")} variant="default">
        + Release Version
      </Button>
    ),
  },
};

export default headerConfig;
