import GroupDetailsComponent from "@/components/pageContents/GroupDetailsComponent";

const GroupDetails = async ({ params }: { params: Promise<{ groupId: string }> }) => {
    const groupId = (await params).groupId;
    return <GroupDetailsComponent groupId={groupId} />
}

export default GroupDetails