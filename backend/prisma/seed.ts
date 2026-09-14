import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const superEmail = process.env.SUPER_ADMIN_EMAIL;
  const superPassword = process.env.SUPER_ADMIN_PASSWORD;

  console.log('Running seed...');

  // create roles
  const roles = ['SUPER_ADMIN','ADMIN','EDITOR','PROGRAM_MANAGER','CASE_OFFICER','FINANCE_OFFICER','CONTENT_MANAGER'];
  const createdRoles: Record<string,string> = {};
  for (const r of roles) {
    const rec = await prisma.role.upsert({ where: { name: r }, update: {}, create: { name: r } });
    createdRoles[r] = rec.id;
  }

  if (superEmail && superPassword) {
    const hashed = await bcrypt.hash(superPassword, 10);
    const existing = await prisma.user.findUnique({ where: { email: superEmail } });
    if (!existing) {
      await prisma.user.create({ data: { email: superEmail, password: hashed, roleId: createdRoles['SUPER_ADMIN'], name: 'Super Admin' } });
      console.log('Created SUPER_ADMIN user from env vars');
    } else {
      console.log('SUPER_ADMIN already exists');
    }
  } else {
    console.log('SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD not provided. You can create the first admin via secure setup.');
  }

  // seed a sample project and news article for development
  const project = await prisma.project.create({ data: {
    title: 'Community Health Outreach - Northern Region',
    category: 'Healthcare',
    region: 'Northern',
    district: 'Example District',
    community: 'Sample Community',
    description: 'A health screening project for communities in the Northern region.',
    status: 'active',
    beneficiaries: 250
  }});

  await prisma.news.create({ data: { title: 'Foundation Launches Health Outreach', slug: 'health-outreach-launch', excerpt: 'Our health outreach begins in the Northern region.', content: 'Full article content here', featured: true } });

  await prisma.impactStatistic.createMany({ data: [
    { key: 'communities_reached', value: 12 },
    { key: 'children_supported', value: 450 }
  ]});
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
