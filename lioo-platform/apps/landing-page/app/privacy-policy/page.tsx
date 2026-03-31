import { prisma } from "@repo/database";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export const revalidate = 60; // revalidate every 60s

export default async function PrivacyPolicyPage() {
  const doc = await prisma.legalDocument.findUnique({
    where: { type: "PRIVACY_POLICY" },
  });

  const content = doc?.content || "Konten belum tersedia.";
  const lastUpdated = doc?.updatedAt 
    ? new Date(doc.updatedAt).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Belum pernah diperbarui";

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto min-h-screen">
        <div className="bg-white rounded-[2rem] p-8 md:p-12 ambient-shadow">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1A1C19] mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-[#73796D] mb-10 font-bold tracking-widest uppercase">
            Terakhir Diperbarui: {lastUpdated}
          </p>

          <div className="prose prose-lg prose-p:text-[#43493E] prose-headings:text-[#1A1C19] prose-a:text-[#436831] max-w-none">
            {content.split("\n\n").map((paragraph: string, index: number) => {
              // Simple check to identify headings like "1. Data yang Kami Kumpulkan"
              if (paragraph.match(/^\d+\.\s/)) {
                const [heading, ...rest] = paragraph.split("\n");
                return (
                  <div key={index} className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">{heading}</h2>
                    {rest.map((p: string, pIndex: number) => (
                      <p key={pIndex} className="mb-4 leading-relaxed">{p}</p>
                    ))}
                  </div>
                );
              }

              return (
                <p key={index} className="mb-4 leading-relaxed whitespace-pre-line">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
