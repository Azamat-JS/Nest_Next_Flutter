import { RequireAdmin } from "@/components/RequireAdmin";

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RequireAdmin>
            <main className="p-4">
                {children}
            </main>
        </RequireAdmin>
    );
}
