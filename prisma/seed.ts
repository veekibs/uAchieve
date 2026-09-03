const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const courses = [
    {
      title: "Basic Life Support",
      slug: "bls",
      description: "Learn essential CPR techniques and basic life-saving skills. Perfect for anyone wanting to respond confidently in emergency situations.",
      duration_hours: 3,
      duration_text: "3 Hours (Half Day)",
      price: 85.00,
      badge_label: "Beginner Friendly",
      class_size: "Maximum 12 Participants",
      accreditation: "HSE & Resuscitation Council UK",
      training_type: "In-Person Practical",
      validity_text: "3 Years",
      prerequisites: "None Required",
      overview: "Our Basic Life Support course equips you with the essential skills to respond confidently in emergency situations. You'll learn CPR techniques, how to use a defibrillator, and how to manage choking incidents. This hands-on training is delivered by experienced healthcare professionals with over 30 years of real-world experience.",
      learning_points: [
        "Adult and child CPR techniques",
        "Using an automated defibrillator (AED)",
        "Managing choking in adults and children",
        "Recovery position procedures",
        "Scene safety and assessment",
        "Emergency response protocols"
      ],
      faqs: [
        { q: "Do I need any prior experience?", a: "No prior experience is needed. This course is designed to be completely beginner-friendly." },
        { q: "How long is the certificate valid?", a: "Your certificate is valid for exactly 3 years from the date of completion." },
        { q: "What should I bring to the course?", a: "Just bring yourself! We provide all training materials, dummies, and equipment." },
        { q: "Where is the training held?", a: "Training venues are confirmed in your booking confirmation email. We use premises that are easily accessible with parking or public transport nearby." }
      ],
      cancellation_policy: [
        { q: "2+ Weeks Before", a: "Full (100%) refund available to original payment method.", color: "bg-lime-400" },
        { q: "Less Than 2 Weeks", a: "Non-refundable, but eligible for 1 free rebook to an upcoming session.", color: "bg-amber-500" }
      ]
    },
    {
      title: "Emergency First Aid at Work",
      slug: "efaw",
      description: "Comprehensive workplace first aid training covering injuries, illnesses, and emergency protocols. Meets HSE requirements for workplace first aiders.",
      duration_hours: 6,
      duration_text: "6 Hours (Full Day)",
      price: 145.00,
      badge_label: "HSE Approved",
      class_size: "Maximum 12 Participants",
      accreditation: "HSE & Resuscitation Council UK",
      training_type: "In-Person Practical",
      validity_text: "3 Years",
      prerequisites: "None Required",
      overview: "Our Emergency First Aid at Work course equips you with the comprehensive skills required to act as a first aider in any workplace environment. Covering a wide range of emergency scenarios, illnesses, and injuries, this course meets HSE requirements for appointed workplace first aiders and is delivered by experienced healthcare professionals with over 30 years of real-world emergency response experience.",
      learning_points: [
        "Adult CPR and AED use",
        "Managing choking in adults",
        "Treating severe bleeding and wounds",
        "Recognising and managing shock",
        "Burns and scalds treatment",
        "Bone, muscle and joint injuries",
        "Seizures and unconsciousness",
        "Eye injuries and embedded objects",
        "Anaphylaxis and allergic reactions",
        "Emergency response protocols",
        "Incident reporting and documentation",
        "HSE compliance requirements"
      ],
      faqs: [
        { q: "Do I need prior first aid experience?", a: "No prior experience needed, though some basic awareness is helpful. The course is suitable for complete beginners and those renewing their qualification." },
        { q: "How long is the certificate valid?", a: "Your EFAW certificate is valid for 3 years from the date of completion, in accordance with HSE guidelines." },
        { q: "What should I bring to the course?", a: "All equipment and materials are provided. We recommend wearing comfortable clothing as there is practical floor work involved throughout the day." },
        { q: "Where is the training held?", a: "Training venues are confirmed in your booking confirmation email. We use premises that are easily accessible with parking or public transport nearby." }
      ],
      cancellation_policy: [
        { q: "2+ Weeks Before", a: "Full (100%) refund available to original payment method.", color: "bg-lime-400" },
        { q: "Less Than 2 Weeks", a: "Non-refundable, but eligible for 1 free rebook to an upcoming session.", color: "bg-amber-500" }
      ]
    }
  ];

  console.log('Seeding courses...');
  for (const course of courses) {
    await prisma.course.upsert({
      where: { slug: course.slug },
      update: course,
      create: course,
    });
  }

  // Get the created courses to use their IDs for sessions
  const blsCourse = await prisma.course.findUnique({ where: { slug: 'bls' } });
  const efawCourse = await prisma.course.findUnique({ where: { slug: 'efaw' } });

  if (blsCourse && efawCourse) {
    console.log('Seeding sessions...');

    // Clear existing sessions to avoid duplicates
    await prisma.session.deleteMany({});

    const startDate = new Date();
    const endDate = new Date(startDate.getFullYear(), 7, 31); // August 31st

    // If we've already passed August, seed for the next year's August
    if (startDate > endDate) {
      endDate.setFullYear(startDate.getFullYear() + 1);
    }

    let current = new Date(startDate);
    // Find the first Saturday starting from today or later
    const dayOfWeek = current.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
    current.setDate(current.getDate() + daysUntilSaturday);
    current.setHours(0, 0, 0, 0);

    let count = 0;
    while (current <= endDate) {
      // Alternate between BLS and EFAW courses each week
      const isBls = count % 2 === 0;
      const course = isBls ? blsCourse : efawCourse;
      const duration = isBls ? 3 : 6;

      await prisma.session.create({
        data: {
          course_id: course.id,
          date: new Date(current),
          start_time: new Date(new Date(current).setHours(9, 0, 0, 0)),
          end_time: new Date(new Date(current).setHours(9 + duration, 0, 0, 0)),
          venue_name: 'Bedford Community Centre',
          venue_address: '123 High Street, Bedford, MK40 1AA',
          max_capacity: 12,
          is_active: true
        }
      });

      // Advance by 7 days
      current.setDate(current.getDate() + 7);
      count++;
    }

    console.log(`${count} sessions seeded successfully through August! 📅`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });