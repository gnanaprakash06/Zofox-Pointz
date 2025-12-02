// src/components/Spinner.tsx

type SpinnerProps = {
  size?: "sm" | "md" | "lg"; // control size
  color?: string; // optional Tailwind color class
  className?: string; // extra classes
};

const Spinner = ({
  size = "md",
  color = "text-blue-500",
  className = "",
}: SpinnerProps) => {
  let dimension = "w-8 h-8"; // default medium
  if (size === "sm") dimension = "w-4 h-4";
  if (size === "lg") dimension = "w-12 h-12";

  return (
    <div
      className={`flex h-screen w-full items-center justify-center ${className}`}
    >
      <div
        className={`${dimension} animate-spin rounded-full border-4 border-solid border-gray-600 border-t-transparent ${color}`}
      />
    </div>
  );
};

export default Spinner;
