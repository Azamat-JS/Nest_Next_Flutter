import GroupDetailsComponent from "@/components/pageContents/GroupDetailsComponent";

const GroupDetails = async ({ params }: { params: Promise<{ groupId: string }> }) => {
    const groupId = await (await params).groupId;
    return <GroupDetailsComponent productId={groupId} />
}

export default GroupDetails