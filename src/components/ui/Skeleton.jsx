export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200/90 dark:bg-gray-700/90 ${className}`}
      {...props}
    />
  );
}
