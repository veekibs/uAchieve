import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const firstName = process.argv[3] || 'Admin';
  const lastName = process.argv[4] || 'User';

  if (!email) {
    console.error('Usage: npx ts-node scripts/promote-to-admin.ts <email> [firstName] [lastName]');
    process.exit(1);
  }

  try {
    // Find the user in Supabase's internal auth.users table using raw SQL
    const authUsers: any[] = await prisma.$queryRawUnsafe(
      `SELECT id FROM auth.users WHERE email = $1 LIMIT 1`,
      email.toLowerCase()
    );

    if (!authUsers || authUsers.length === 0) {
      console.error(`\n❌ Error: No user found in Supabase Auth with the email "${email}".`);
      console.log('👉 Please create the user first in your Supabase Dashboard (Authentication -> Users -> Add User) or sign up via the UI.\n');
      process.exit(1);
    }

    const authUserId = authUsers[0].id;

    // Clean up stale public.users record if it exists with a different ID
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser && existingUser.id !== authUserId) {
      console.log(`⚠️ Stale user record found in public database for ${email} with a different ID. Cleaning it up...`);
      await prisma.user.delete({
        where: { email: email.toLowerCase() }
      });
    }

    // Upsert into public.users
    const user = await prisma.user.upsert({
      where: { id: authUserId },
      update: {
        role: 'admin',
      },
      create: {
        id: authUserId,
        email: email.toLowerCase(),
        first_name: firstName,
        last_name: lastName,
        role: 'admin',
      },
    });

    console.log(`\n✅ Success: Promoted ${email} (ID: ${user.id}) to Admin! 🚀`);
  } catch (error: any) {
    console.error('\n❌ Failed to run script:', error.message || error);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

