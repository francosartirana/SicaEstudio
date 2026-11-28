export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F6F3EC] text-[#1C1917]">
      {children}
    </div>
  )
}
