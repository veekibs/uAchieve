import prisma from "../../../../lib/prisma/client";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import CourseDetailClient from "./CourseDetailClient";

export const dynamic = 'force-dynamic';

interface CoursePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const courses = await prisma.course.findMany({
    select: { slug: true },
  });

  return courses.map((course) => ({
    slug: course.slug,
  }));
}

export default async function CourseDetailsPage({ params }: CoursePageProps) {
  const { slug } = await params;

  // Fetch the specific course from your Supabase database
  const courseRaw = await prisma.course.findUnique({
    where: { slug: slug },
    include: {
      sessions: {
        where: { is_active: true, is_archived: false, is_finalised: false },
        include: {
          _count: {
            select: { bookings: true }
          }
        },
        orderBy: { date: 'asc' }
      }
    }
  });

  if (!courseRaw) {
    notFound();
  }

  // Serialize the course object (convert Decimal and Date to plain types)
  const course = {
    ...courseRaw,
    price: Number(courseRaw.price),
    created_at: courseRaw.created_at.toISOString(),
    overview: (courseRaw as any).overview || courseRaw.description,
    learning_points: (courseRaw as any).learning_points || [],
    faqs: ((courseRaw as any).faqs as any[]) || [],
    cancellation_policy: ((courseRaw as any).cancellation_policy as any[]) || [],
    duration_text: (courseRaw as any).duration_text || `${courseRaw.duration_hours} Hours`,
    class_size: (courseRaw as any).class_size || "Max 12",
    accreditation: (courseRaw as any).accreditation || "HSE & RCUK",
    training_type: (courseRaw as any).training_type || "In Person",
    validity_text: (courseRaw as any).validity_text || "3 Years",
    prerequisites: (courseRaw as any).prerequisites || "None Required",
    sessions: (courseRaw.sessions || []).map(s => ({
      ...s,
      date: s.date.toISOString(),
      start_time: s.start_time.toISOString(),
      end_time: s.end_time.toISOString(),
      bookedCount: s._count?.bookings || 0,
      maxCapacity: s.max_capacity || 12,
    })),
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFB]">
      <Navbar />
      <main className="flex-1 w-full pt-[140px] pb-0 relative z-10">
        <CourseDetailClient course={course} />
      </main>
      <Footer />
    </div>
  );
}