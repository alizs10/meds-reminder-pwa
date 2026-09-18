import Skeleton from "@/components/ui/Skeleton";

export default function HomeSkeleton() {
    return (
        <div className="flex flex-col gap-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-20 w-full rounded-3xl" />
            <Skeleton className="h-20 w-full rounded-3xl" />
        </div>
    );
}