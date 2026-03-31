import { prisma } from "@repo/database";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export const metadata = {
  title: "Lioo.io Blog | Inspirasi dan Edukasi UMKM F&B",
  description: "Dapatkan tips bisnis, inovasi teknologi, dan wawasan operasional untuk mengembangkan bisnis Anda.",
};

export const revalidate = 60; // Revalidate every 60 seconds

export default async function BlogListPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 px-6 md:px-12 bg-[#F9FAF5] min-h-screen text-[#1A1C19]">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-20 text-center max-w-3xl mx-auto">
            <span className="text-[#436831] font-bold tracking-widest text-xs uppercase mb-4 block">
              Jurnal Lioo.io
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6" style={{ fontFamily: "Playfair Display, serif" }}>
              Inspirasi untuk Mengembangkan Bisnis Anda.
            </h1>
            <p className="text-lg text-[#43493E] leading-relaxed">
              Kumpulan esai, tren bisnis terkini, tips operasional, dan pencerahan teknologi yang dibuat khusus untuk merchant F&B dan retail modern.
            </p>
          </header>

          {/* Grid of Posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {posts.map((post: any) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col h-full cursor-pointer">
                {/* Image Placeholder */}
                <div className="aspect-[4/3] rounded-3xl overflow-hidden mb-6 shadow-md bg-white border border-[#E2E3DE]/60 transition-transform duration-500 group-hover:scale-[1.02] group-hover:shadow-xl relative">
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[#2C4F1B] text-[10px] uppercase font-bold px-3 py-1.5 rounded-full z-10 tracking-widest shadow-sm">
                    {post.category}
                  </div>
                  <div className="w-full h-full bg-[#E2E3DE] flex items-center justify-center opacity-80 mix-blend-multiply group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-[#436831] text-5xl opacity-30">
                      {post.category.includes("Teknologi") || post.category.includes("AI") ? "smart_toy" : 
                       post.category.includes("Bisnis") ? "trending_up" : 
                       post.category.includes("Akuntansi") ? "account_balance" : "tips_and_updates"}
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold leading-snug mb-3 group-hover:text-[#436831] transition-colors" style={{ fontFamily: "Playfair Display, serif" }}>
                    {post.title}
                  </h3>
                  <p className="text-[#43493E] text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-auto text-xs font-semibold text-[#73796D] uppercase tracking-wider">
                    <span>{new Date(post.createdAt).toLocaleDateString("id-ID", { month: "short", day: "numeric", year: "numeric" })}</span>
                    <span className="w-1 h-1 rounded-full bg-[#C3C9BA]" />
                    <span>{post.readTime} min read</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Newsletter Section */}
          <section className="mt-32">
            <div className="bg-[#2C4F1B] rounded-[3rem] p-12 md:p-20 relative overflow-hidden text-center text-white shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#436831]/40 via-transparent to-transparent" />
              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "Playfair Display, serif" }}>
                  Tumbuh Bersama lioo.io
                </h2>
                <p className="text-[#BBEDA6] text-lg mb-10 opacity-90">
                  Dapatkan tips pertumbuhan UMKM langsung di inbox Anda. Tanpa spam, hanya esensi bisnis.
                </p>
                <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                  <input
                    type="email"
                    placeholder="Alamat email Anda"
                    className="flex-1 bg-white/10 border-white/20 rounded-full px-8 py-4 text-white placeholder:text-white/40 focus:ring-2 focus:ring-[#C3EFAA] outline-none backdrop-blur-md"
                  />
                  <button type="button" className="bg-[#C3EFAA] text-[#062100] px-10 py-4 rounded-full font-bold hover:bg-white transition-all shadow-lg hover:scale-105 active:scale-95">
                    Berlangganan
                  </button>
                </form>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
