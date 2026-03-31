import { prisma } from "@repo/database";
import { notFound } from "next/navigation";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Link from "next/link";
import { Metadata } from "next";

export const revalidate = 60; // ISR 60 seconds

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> | { slug: string } }): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!post) {
    return { title: "Not Found" };
  }

  return {
    title: `${post.title} | lioo.io Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const resolvedParams = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!post) {
    notFound();
  }

  // Get related posts (excluding current one)
  const relatedPosts = await prisma.blogPost.findMany({
    where: { NOT: { slug: resolvedParams.slug } },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  // Convert raw text into paragraphs
  const contentParagraphs = post.content.split("\n\n").filter(Boolean);

  return (
    <div className="bg-[#F9FAF5] min-h-screen font-sans text-[#1A1C19] selection:bg-[#BBEDA6] selection:text-[#062100]">
      <Navbar />

      <main className="pt-32 pb-24 px-6">
        <article className="max-w-[720px] mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 mb-8 text-[11px] uppercase tracking-[0.1em] font-bold text-[#73796D]">
            <Link href="/" className="hover:text-[#2C4F1B]">Home</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <Link href="/blog" className="hover:text-[#2C4F1B]">Blog</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-[#2C4F1B]/60 line-clamp-1">{post.title}</span>
          </nav>

          {/* Header Info */}
          <header className="mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#C3EFAA]/40 text-[#062100] text-xs font-bold uppercase tracking-wider mb-6 border border-[#BBEDA6]">
              {post.category}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-8 text-[#1A1C19] tracking-tight" style={{ fontFamily: "Playfair Display, serif" }}>
              {post.title}
            </h1>
            
            <div className="flex items-center gap-6 py-6 border-y border-[#E2E3DE]/60">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#E2E3DE] border border-[#C3C9BA]/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-[#73796D] opacity-60">
                  person
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#1A1C19]">Lioo.io Editorial</span>
                <div className="flex items-center gap-2 text-xs text-[#43493E] font-medium">
                  <span>{new Date(post.createdAt).toLocaleDateString("id-ID", { month: "short", day: "numeric", year: "numeric" })}</span>
                  <span className="w-1 h-1 rounded-full bg-[#C3C9BA]" />
                  <span>{post.readTime} min read</span>
                </div>
              </div>
            </div>
          </header>

          {/* Article Body */}
          <div className="space-y-6 text-lg leading-[1.8] text-[#1A1C19]/90 mt-12">
            {contentParagraphs.map((paragraph, idx) => {
              // Extract lists if content starts with a dash or bullet
              if (paragraph.startsWith("-") || paragraph.startsWith("•")) {
                const listItems = paragraph.split("\n").map(li => li.replace(/^[-•]\s*/, ""));
                return (
                  <ul key={idx} className="space-y-4 my-8 list-none">
                    {listItems.map((item, i) => (
                      <li key={i} className="flex gap-4 items-start">
                        <span className="w-2 h-2 rounded-full bg-[#436831] shrink-0 mt-3 shadow-sm" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              // Render as normal paragraph
              return (
                <p key={idx} className="mb-6">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* In-Article CTA */}
          <div className="p-8 my-16 rounded-3xl bg-gradient-to-r from-[#C3EFAA]/20 to-[#BBEDA6]/10 border border-[#BBEDA6]/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-2 max-w-sm">
              <h4 className="font-bold text-[#2C4F1B] text-xl" style={{ fontFamily: "Playfair Display, serif" }}>Digitalisasi Tanpa Ribet</h4>
              <p className="text-sm text-[#43493E] leading-relaxed">Terapkan wawasan dari artikel ini langsung ke bisnis Anda dengan ekosistem POS pintar lioo.io.</p>
            </div>
            <Link href="/" className="px-8 py-4 bg-[#2C4F1B] text-white rounded-full text-sm font-bold shadow-xl shadow-[#2C4F1B]/20 hover:scale-105 transition-all w-full md:w-auto text-center active:scale-95 flex items-center gap-2">
              Mulai Sekarang
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>

          {/* Author Bio */}
          <footer className="mt-24 pt-12 border-t border-[#E2E3DE]">
            <div className="flex flex-col sm:flex-row items-center gap-8 bg-white shadow-sm p-8 rounded-3xl border border-[#E2E3DE]/40">
              <div className="w-24 h-24 rounded-full bg-[#C3EFAA]/40 flex items-center justify-center border-4 border-white shadow-md ring-1 ring-[#E2E3DE]">
                <span className="text-3xl text-[#2C4F1B] font-extrabold" style={{ fontFamily: "Playfair Display, serif" }}>L</span>
              </div>
              <div className="text-center sm:text-left">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#436831] block mb-2">Ditulis Oleh</span>
                <h3 className="serif-text text-xl font-bold mb-2">Editor Lioo.io</h3>
                <p className="text-sm text-[#43493E] leading-relaxed">Menyajikan wawasan, analitik tren, dan trik operasional untuk membantu merchant lokal memperluas ekspansi bisnis mereka dengan pendekatan teknologi sentris.</p>
              </div>
            </div>
          </footer>
        </article>

        {/* Related Posts */}
        <section className="max-w-[1080px] mx-auto mt-32">
          <div className="flex justify-between items-end mb-12 border-b border-[#E2E3DE]/60 pb-6">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#436831] mb-2 block">Lanjutkan Membaca</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1A1C19]" style={{ fontFamily: "Playfair Display, serif" }}>
                Artikel Terkait
              </h2>
            </div>
            <Link href="/blog" className="hidden md:flex items-center gap-2 text-[#436831] font-bold hover:underline underline-offset-8">
              Lihat Semua
              <span className="material-symbols-outlined text-xl">arrow_right_alt</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedPosts.map((rel: any) => (
              <Link key={rel.id} href={`/blog/${rel.slug}`} className="group cursor-pointer">
                <div className="aspect-[4/3] rounded-3xl overflow-hidden mb-6 shadow-sm bg-white border border-[#E2E3DE]/60 transition-transform duration-500 group-hover:scale-[1.02] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#BBEDA6] text-6xl group-hover:scale-110 transition-transform duration-500">
                    article
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-widest font-semibold text-[#73796D] mb-3 block">
                  {rel.category}
                </span>
                <h3 className="text-xl font-bold leading-snug group-hover:text-[#436831] transition-colors" style={{ fontFamily: "Playfair Display, serif" }}>
                  {rel.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
