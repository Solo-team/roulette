import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const NAMES = [
  "Alex", "Maria", "Ivan", "Olga", "Dmitry", "Anna", "Sergey", "Elena",
  "Andrey", "Natasha", "Mikhail", "Yulia", "Pavel", "Ksenia", "Nikita",
  "Daria", "Roman", "Polina", "Artem", "Victoria", "Denis", "Alina",
  "Maxim", "Sofia", "Igor", "Anastasia", "Kirill", "Ekaterina", "Anton",
];

async function main() {
  await prisma.botUser.deleteMany();

  const bots = Array.from({ length: 100 }, (_, i) => ({
    name: `${NAMES[i % NAMES.length]} ${String.fromCharCode(65 + (i % 26))}.`,
    coins: Math.floor(Math.random() * 50_000) + 1_000,
    avatarUrl: `https://api.dicebear.com/9.x/bottts/svg?seed=${i}`,
  }));

  await prisma.botUser.createMany({ data: bots });
  console.log(`Seeded ${bots.length} bot users`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
