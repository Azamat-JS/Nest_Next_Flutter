import GroupDetailsComponent from "@/components/pageContents/GroupDetailsComponent";
import Spinner from "@/components/Spinner";
import { Suspense } from "react";

const GroupDetails = async ({ params }: { params: Promise<{ groupId: string }> }) => {
    const groupId = (await params).groupId;
    return (
        <Suspense fallback={<Spinner />}>
            <GroupDetailsComponent groupId={groupId} />
        </Suspense>
    )
}

export default GroupDetails