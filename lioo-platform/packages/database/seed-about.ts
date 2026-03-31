import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const content = JSON.stringify({
    hero: {
      headline: "Di Mana Teknologi Bertemu Dengan Keahlian Lokal.",
      subheadline: "Selamat datang di Lioo.io—sebuah Living Atelier bagi masa depan ritel dan F&B Indonesia. Kami tidak hanya membangun perangkat lunak; kami merancang ekosistem yang bernapas bersama bisnis Anda."
    },
    narrative: {
      subheading: "Lahir dari Akar Rumput, Tumbuh untuk Indonesia.",
      paragraphs: [
        "Di balik setiap baris kode Lioo, ada semangat untuk memberdayakan setiap sudut kedai kopi, toko kelontong, dan restoran di nusantara. Kami melihat bahwa digitalisasi seringkali terasa dingin dan kaku. Itulah mengapa kami memilih jalan yang berbeda.",
        "Kami menyebut diri kami sebuah \"Atelier\"—sebuah ruang kerja di mana setiap fitur dipahat dengan ketelitian tinggi, mendengarkan keluh kesah pemilik usaha, dan memahami bahwa setiap bisnis memiliki \"ruh\" yang unik. Lioo hadir untuk memastikan ruh bisnis Anda tetap terjaga, sementara teknologi kami mengurus kerumitan di baliknya."
      ]
    },
    values: [
      {
        title: "Pahat dengan Presisi (Precision Crafting)",
        description: "Kami tidak mengejar fitur yang sekadar \"banyak\", tapi fitur yang benar-benar menyelesaikan masalah. Dari kalkulasi pajak hingga prediksi stok AI, semuanya dirancang dengan akurasi tinggi.",
        icon: "architecture"
      },
      {
        title: "Pertumbuhan Organik (Organic Growth)",
        description: "Seperti tanaman di atelier kami, kami percaya kesuksesan sejati tumbuh secara berkelanjutan. Lioo dirancang untuk skala kecil yang bercita-cita besar.",
        icon: "potted_plant"
      },
      {
        title: "Sentuhan Manusia (The Human Touch)",
        description: "Di balik layar Lioo adalah tim yang peduli. Kami adalah mitra strategis Anda, bukan sekadar penyedia layanan di balik layar monitor.",
        icon: "diversity_3"
      }
    ],
    visionMission: {
      vision: "Menjadi standar baru dalam pemberdayaan digital bagi generasi merchant F&B dan retail Indonesia yang lebih mandiri dan berdaya saing global.",
      mission: "Mendemokrasikan teknologi kelas atas (AI & Big Data) menjadi alat yang sederhana, terjangkau, dan berdampak nyata bagi pertumbuhan ekonomi lokal."
    },
    closing: {
      headline: "Mari Tumbuh Bersama.",
      statement: "Setiap bisnis adalah karya seni yang sedang berproses. Biarkan Lioo menjadi alat yang menyempurnakan operasional Anda, agar Anda bisa kembali fokus pada kreativitas dan pelanggan Anda."
    }
  });

  await prisma.legalDocument.upsert({
    where: { type: 'ABOUT_US' },
    update: { content },
    create: {
      type: 'ABOUT_US',
      content
    }
  });

  console.log("Seeded About Us document");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
