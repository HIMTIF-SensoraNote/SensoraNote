import { Skeleton } from "./skeleton";

export function NoteCardSkeleton() {
  return (
    <div className="flex flex-col-reverse sm:flex-row gap-6 sm:gap-8 py-8 border-b border-gray-100 dark:border-white/5 last:border-0 pointer-events-none">
       <div className="flex-1 space-y-4 py-2">
          <Skeleton className="h-7 w-[85%] sm:w-3/4 rounded-lg" />
          
          <div className="pt-2">
              <Skeleton className="h-4 w-full rounded-md mb-2" />
              <Skeleton className="h-4 w-[90%] rounded-md mb-2" />
              <Skeleton className="h-4 w-4/5 rounded-md" />
          </div>

          <div className="flex items-center justify-between mt-auto pt-6">
             <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="space-y-1.5">
                   <Skeleton className="h-3 w-24 rounded-md" />
                   <Skeleton className="h-2 w-16 rounded-md" />
                </div>
             </div>
             <div className="flex gap-4">
                <Skeleton className="h-5 w-10 rounded-md" />
                <Skeleton className="h-5 w-10 rounded-md" />
             </div>
          </div>
       </div>
       <Skeleton className="w-full sm:w-[160px] md:w-[200px] h-[200px] sm:h-[130px] md:h-[150px] rounded-2xl shrink-0" />
    </div>
  );
}

export function ArticleSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-5 lg:px-0 pt-10 sm:pt-20 pb-20 pointer-events-none">
       <div className="mb-10 text-center sm:text-left space-y-5">
           <Skeleton className="h-10 w-full sm:w-4/5 rounded-xl mx-auto sm:mx-0" />
           <Skeleton className="h-10 w-3/4 sm:w-2/3 rounded-xl mx-auto sm:mx-0" />
           
           <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-6">
               <Skeleton className="w-10 h-10 rounded-full shrink-0" />
               <div className="space-y-2">
                   <Skeleton className="h-4 w-32 rounded-md" />
                   <Skeleton className="h-3 w-24 rounded-md" />
               </div>
           </div>
       </div>

       <Skeleton className="w-full aspect-[21/9] rounded-3xl mb-12" />

       <div className="space-y-4">
           <Skeleton className="h-5 w-full rounded-md" />
           <Skeleton className="h-5 w-[98%] rounded-md" />
           <Skeleton className="h-5 w-full rounded-md" />
           <Skeleton className="h-5 w-[95%] rounded-md" />
           <Skeleton className="h-5 w-[80%] rounded-md mb-8" />
           
           <Skeleton className="h-5 w-full rounded-md" />
           <Skeleton className="h-5 w-[92%] rounded-md" />
           <Skeleton className="h-5 w-[96%] rounded-md" />
       </div>
    </div>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10 mb-12 pointer-events-none">
       <Skeleton className="w-32 h-32 sm:w-40 sm:h-40 rounded-full shrink-0" />
       <div className="text-center sm:text-left flex-1 w-full space-y-4 pt-4">
          <Skeleton className="h-8 w-48 rounded-lg mx-auto sm:mx-0" />
          <Skeleton className="h-4 w-64 rounded-md mx-auto sm:mx-0" />
          
          <div className="flex items-center justify-center sm:justify-start gap-6 pt-2">
             <Skeleton className="h-4 w-20 rounded-md" />
             <Skeleton className="h-4 w-20 rounded-md" />
             <Skeleton className="h-4 w-32 rounded-md hidden sm:block" />
          </div>

          <div className="pt-4">
             <Skeleton className="h-20 w-full sm:w-3/4 rounded-xl mx-auto sm:mx-0" />
          </div>
       </div>
    </div>
  );
}
