const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const { ROLES } = require("../lib/const");
const SALT_ROUND = 10;

async function run() {
  const prisma = new PrismaClient();
  const hashedPassword = await bcrypt.hash("supervisor123", SALT_ROUND);
  try {
    const admin1 = await prisma.user.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: "supervisor",
        nip: "123",
        division: "supervisor",
        email: "supervisor@gmail.com",
        password: hashedPassword,
        phone_number: "+6281234567890",
        address: "Mataram",
        role: ROLES.SUPERVISOR,
        status: "supervisor",
      },
    });

    console.log({ admin1 });
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
