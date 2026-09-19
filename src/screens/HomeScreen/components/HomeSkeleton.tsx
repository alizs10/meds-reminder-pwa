import Skeleton from "@/components/ui/Skeleton";

export default function HomeSkeleton() {
    return (
        <div className="flex flex-col gap-3">
            <Skeleton className="h-6.5 w-32 mx-auto" />
            <Skeleton className="h-32 w-full rounded-3xl" />
            <Skeleton className="h-32 w-full rounded-3xl" />
            <Skeleton className="h-32 w-full rounded-3xl" />
            <Skeleton className="h-32 w-full rounded-3xl" />
            <Skeleton className="h-32 w-full rounded-3xl" />
            <Skeleton className="h-32 w-full rounded-3xl" />
        </div>
    );
}