import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding 100 clients into the database...");
  
  for (let i = 1; i <= 100; i++) {
    const randomKey = Math.random().toString(36).substring(2, 10).toUpperCase();
    const client = await prisma.client.create({
      data: {
        name: `Stress Test Client ${i}`,
        email: `client${i}@stresstest.com`,
        phone: `555-0100-${i.toString().padStart(3, '0')}`,
        licenses: {
          create: {
            key: `TEST-KEY-${randomKey}`,
            status: "ACTIVE",
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          }
        }
      }
    });
    
    if (i % 10 === 0) {
      console.log(`Created ${i} clients...`);
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
