import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  await prisma.user.updateMany({
    where: { email: 'lioo.io1521@gmail.com' },
    data: { tenantId: null }
  })
  console.log("Berhasil mereset tenantId user:", 'lioo.io1521@gmail.com')
}
main()
