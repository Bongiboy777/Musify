export default function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex items-center justify-center min-h-screen bg-gray-50">
            <div className="absolute w-full max-w-md top-[24]">
                {children}
            </div>
        </div>
    );
}