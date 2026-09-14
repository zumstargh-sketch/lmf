import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Curated answers powering the in-app AI assistant and the WhatsApp auto-responder.
// Titles are phrased as questions so they double as assistant suggestions.
const entries = [
  {
    title: 'What is the Lordina Foundation about?',
    content:
      'The Lordina Foundation is a Ghanaian nonprofit dedicated to improving lives. We support communities across Ghana through practical projects, assistance for people in need, education support and women empowerment programmes. Together, communities thrive.'
  },
  {
    title: 'How do I donate?',
    content:
      'Tap the Donate tab, sign in with your free donor account, enter an amount in Ghana cedis and continue securely. Every donation receives a reference number so it can always be traced, and it is recorded under your account. You can also designate your gift to a project you care about.'
  },
  {
    title: 'How do I create a donor account?',
    content:
      'Tap the Account tab, choose Create account, and provide your full name, a valid email address and a password of at least 6 characters. Accounts are free, and having one keeps every donation you make safely recorded in your name.'
  },
  {
    title: 'How do I request assistance?',
    content:
      'Open the Assistance tab and share a few details: your name, phone number and what kind of help you need. Our team reviews every request and follows up. You can also send us a message on WhatsApp using the WhatsApp button in the app.'
  },
  {
    title: 'How can I volunteer with the foundation?',
    content:
      'We welcome volunteers with all kinds of skills - from healthcare and teaching to logistics and event support. Contact the team on WhatsApp or through the assistance form with your name, profession, skills and availability, and our team will connect you to a project that fits.'
  },
  {
    title: 'Are there scholarships available?',
    content:
      'The foundation supports students through its scholarship programme. Details such as eligibility and application windows are announced as they open - check with the team on WhatsApp or watch this app for announcements so you do not miss a deadline.'
  },
  {
    title: 'How do I track my donation?',
    content:
      'Every donation receives a unique reference (for example DN-1691234567890) when it is created. Keep that reference - you can quote it any time in a chat with the team to confirm the status of your gift. Your donations are also tied to your account.'
  },
  {
    title: 'Is my donation secure?',
    content:
      'Yes. Donations are processed through secure payment partners, tied to your verified donor account, and always acknowledged with a reference. The foundation team can confirm any transaction with that reference.'
  },
  {
    title: 'Where does the foundation work?',
    content:
      'The Lordina Foundation works with communities across Ghana. Open the Projects tab in the app to see the communities and regions where projects are currently running.'
  },
  {
    title: 'How do I contact the foundation?',
    content:
      'The fastest way to reach the team is WhatsApp - tap the WhatsApp button in the app to start a chat instantly. You can also submit the assistance form in the app and the team will get back to you.'
  }
];

async function main() {
  console.log('Seeding AI knowledge base...');
  for (const entry of entries) {
    const existing = await prisma.aIKnowledge.findFirst({
      where: { title: entry.title, language: 'en' }
    });
    if (existing) {
      await prisma.aIKnowledge.update({ where: { id: existing.id }, data: { content: entry.content } });
    } else {
      await prisma.aIKnowledge.create({ data: { ...entry, language: 'en' } });
    }
  }
  console.log(`AI knowledge ready (${entries.length} entries).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });