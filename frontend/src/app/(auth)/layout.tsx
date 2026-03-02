export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-50">
      <div className="absolute top-[24] w-full max-w-md">{children}</div>
    </div>
  );
}
