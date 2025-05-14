import { Skeleton } from "@/components/ui/skeleton";

export const SignInSkeleton = () => {
  return (
    <div className="flex flex-col items-center space-y-4 rounded-xl bg-indigo-50 p-6 md:w-[400px] w-[300px] shadow-md">
  
      <Skeleton className="h-6 w-48 bg-gray-200 mb-2" />
      <div className="w-full space-y-4">
        <Skeleton className="h-4 w-24 bg-gray-200" />
        <Skeleton className="h-10 w-full rounded-md bg-gray-200" />
        <Skeleton className="h-10 w-full rounded-md bg-gray-300" />
      </div>
      <Skeleton className="h-3 w-24 bg-gray-200 mt-4" />
    </div>
  );
};


export const SignUpSkeleton = () => {
  return (
    <div className="flex flex-col items-center space-y-4 rounded-xl bg-indigo-50 p-6 md:w-[400px] w-[300px] shadow-md">
      <Skeleton className="h-6 w-52 bg-gray-200 mb-1" />
      <Skeleton className="h-4 w-64 bg-gray-200 mb-4" />
      <div className="w-full space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-1/2 rounded-md bg-gray-200" />
          <Skeleton className="h-10 w-1/2 rounded-md bg-gray-200" />
        </div>
        <Skeleton className="h-10 w-full rounded-md bg-gray-200" />
        <Skeleton className="h-10 w-full rounded-md bg-gray-300" />
      </div>
      <Skeleton className="h-3 w-48 bg-gray-200 mt-4" />
      <Skeleton className="h-3 w-24 bg-gray-200" />
    </div>
  );
};