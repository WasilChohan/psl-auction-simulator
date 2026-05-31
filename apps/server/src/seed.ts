import { PrismaClient } from "@prisma/client";
import playersData from "./players-data.json" with { type: "json" };

const prisma = new PrismaClient();

async function main() {
  // Clear existing player data only
  await prisma.player.deleteMany();

  // Seed players from JSON
  console.log(`Seeding ${playersData.length} PSL players...`);
  
  for (const player of playersData) {
    await prisma.player.create({
      data: {
        name: player.name,
        category: player.category,
        role: player.role,
        basePrice: player.basePrice,
        country: player.country || "Pakistan"
      }
    });
  }

  console.log(`✅ Seeded ${playersData.length} players successfully`);
}

main().finally(() => prisma.$disconnect());