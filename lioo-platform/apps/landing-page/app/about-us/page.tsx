import { prisma } from "@repo/database";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

// Revalidate slightly more often since it's dynamic
export const revalidate = 60;

export default async function AboutUsPage() {
  const doc = await prisma.legalDocument.findUnique({
    where: { type: "ABOUT_US" },
  });

  // Fallback defaults
  const content = doc?.content
    ? JSON.parse(doc.content)
    : {
        hero: {
          headline: "Di Mana Teknologi Bertemu Dengan Keahlian Lokal.",
          subheadline: "Selamat datang di Lioo.io—sebuah Living Atelier bagi masa depan ritel dan F&B Indonesia. Kami tidak hanya membangun perangkat lunak; kami merancang ekosistem yang bernapas bersama bisnis Anda.",
        },
        narrative: {
          subheading: "Lahir dari Akar Rumput, Tumbuh untuk Indonesia.",
          paragraphs: [
            "Di balik setiap baris kode Lioo, ada semangat untuk memberdayakan setiap sudut kedai kopi, toko kelontong, dan restoran di nusantara...",
          ],
        },
        values: [],
        visionMission: { vision: "", mission: "" },
        closing: { headline: "", statement: "" },
      };

  return (
    <>
      <Navbar />
      <main className="pt-24 overflow-x-hidden bg-[#fbf9f4]">
        {/* 1. Hero Section: Filosofi Kami */}
        <section className="relative min-h-[85vh] flex items-center px-8 md:px-12 py-20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
            <div className="lg:col-span-6 z-10">
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#fed488] text-[#785a1a] text-xs font-bold uppercase tracking-[0.15em] mb-8">
                Filosofi Kami
              </span>
              <h1 className="text-4xl md:text-6xl text-[#061b0e] leading-[1.15] mb-8 tracking-tight font-extrabold" style={{ fontFamily: "Playfair Display, serif" }}>
                {content.hero.headline}
              </h1>
              <p className="text-lg md:text-xl text-[#434843] leading-relaxed max-w-lg">
                {content.hero.subheadline}
              </p>
            </div>
            <div className="lg:col-span-6 relative">
              <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden shadow-2xl transform rotate-2 bg-[#dbdad5]">
                {/* Fallback image abstraction */}
                <div className="w-full h-full object-cover flex items-center justify-center p-8 bg-[url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80')] bg-cover bg-center mix-blend-multiply opacity-80" />
              </div>
              {/* Decorative Element */}
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#775a19]/20 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </section>

        {/* 2. Cerita Kami (The Narrative) */}
        <section className="py-32 px-8 md:px-12 bg-[#f5f3ee]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              <div className="order-2 lg:order-1 relative">
                <div className="aspect-square bg-white rounded-[2rem] shadow-inner p-12 flex items-center justify-center overflow-hidden">
                   <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&q=80')] bg-cover bg-center rounded-xl opacity-80" />
                </div>
                <div className="absolute -top-12 -right-12 p-8 bg-[#1b3022] text-[#819986] rounded-2xl shadow-xl hidden md:block">
                  <p className="text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif" }}>Est. 2026</p>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-4xl md:text-5xl text-[#061b0e] mb-12 font-bold" style={{ fontFamily: "Playfair Display, serif" }}>
                  Cerita Kami
                </h2>
                <h3 className="text-xl text-[#775a19] mb-6 font-semibold">
                  {content.narrative.subheading}
                </h3>
                <div className="space-y-6 text-[#434843] leading-relaxed text-lg">
                  {content.narrative.paragraphs.map((p: string, i: number) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Nilai-Nilai Kami (Our Living Values) */}
        <section className="py-32 px-8 md:px-12">
          <div className="max-w-7xl mx-auto text-center mb-20">
            <h2 className="text-4xl md:text-5xl text-[#061b0e] mb-4 font-bold" style={{ fontFamily: "Playfair Display, serif" }}>
              Our Living Values
            </h2>
            <p className="text-[#434843]">Fondasi yang mendasari setiap baris kode yang kami rangkai.</p>
          </div>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.values.map((val: any, i: number) => (
              <div key={i} className="p-10 rounded-[2rem] bg-white border border-[#e4e2dd] transition-all duration-500 hover:shadow-2xl hover:ring-2 hover:ring-[#819986] group">
                <div className="w-16 h-16 bg-[#f5f3ee] flex items-center justify-center rounded-2xl mb-8 group-hover:bg-[#fed488] transition-colors">
                  <span className="material-symbols-outlined text-4xl text-[#775a19]">{val.icon}</span>
                </div>
                <h3 className="text-xl text-[#061b0e] mb-4 font-bold" style={{ fontFamily: "Playfair Display, serif" }}>
                  {val.title}
                </h3>
                <p className="text-[#434843] leading-relaxed">
                  {val.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Visi & Misi */}
        <section className="bg-[#1b3022] text-[#fbf9f4] py-32 px-8 md:px-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#061b0e] to-transparent opacity-50" />
          <div className="max-w-4xl mx-auto relative z-10 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#819986] mb-12 block">
              Visi &amp; Misi
            </span>
            <h2 className="text-3xl md:text-5xl leading-tight mb-16 italic font-bold" style={{ fontFamily: "Playfair Display, serif" }}>
              "{content.visionMission.vision}"
            </h2>
            <div className="text-left border-t border-[#819986]/30 pt-16">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#fed488] mb-4">
                Misi Kami
              </h4>
              <p className="text-[#819986] text-xl md:text-2xl leading-relaxed">
                {content.visionMission.mission}
              </p>
            </div>
          </div>
        </section>

        {/* 5. Closing */}
        <section className="py-40 px-8 text-center bg-[#fbf9f4]">
          <div className="max-w-3xl mx-auto">
            <div className="mb-12 flex justify-center">
              <div className="w-20 h-20 rounded-full bg-[#eae8e3] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#061b0e] text-3xl">temp_preferences_custom</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl text-[#061b0e] mb-8 font-bold" style={{ fontFamily: "Playfair Display, serif" }}>
              {content.closing.headline}
            </h2>
            <p className="text-[#434843] text-lg lg:text-xl leading-relaxed mb-12">
              {content.closing.statement}
            </p>
            <a href={`${process.env.NEXT_PUBLIC_MERCHANT_URL || "http://localhost:3002"}/api/auth/register`} className="inline-block bg-[#061b0e] text-white px-12 py-5 rounded-full text-sm uppercase tracking-widest font-bold transition-all duration-300 hover:bg-[#775a19] hover:-translate-y-1 shadow-xl">
              Mulai Bertumbuh Bersama Lioo
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
