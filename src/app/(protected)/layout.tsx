import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const setting = await prisma.setting.findFirst();
  const now = new Date();

  // Enforce license check
  // BYPASSED FOR TESTING:
  // if (!setting?.licenseExpiry || setting.licenseExpiry < now) {
  //   redirect("/license");
  // }

  return (
    <div className="min-h-screen relative overflow-hidden bg-muted print:bg-card text-foreground font-sans">
      {/* Animated Mesh Background */}
      <div className="fixed inset-0 z-0 pointer-events-none print:hidden overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 mix-blend-multiply filter blur-[100px] animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] rounded-full bg-emerald-400/20 mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 flex">
        <Sidebar userRole={session.role as string} />
        <div className="md:pl-64 flex flex-col min-h-screen w-full print:pl-0">
          <Header />
          <main className="flex-1">
            <div className="py-7 px-5 sm:px-7 lg:px-8 print:py-0 print:px-0 max-w-screen-2xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
