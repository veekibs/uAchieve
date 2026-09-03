import prisma from "../../../lib/prisma/client";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import CourseGrid from "./CourseGrid";

export const dynamic = 'force-dynamic';

export default async function CoursesPage() {
  // Fetch all active courses from your Supabase database!
  const coursesRaw = await prisma.course.findMany({
    orderBy: {
      created_at: 'asc' // Keeps BLS first, EFAW second
    }
  });

  // Convert Decimal and Date objects to plain types so they can be passed to Client Components
  const courses = coursesRaw.map(course => ({
    ...course,
    price: Number(course.price),
    created_at: course.created_at.toISOString(),
  }));

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-['Plus_Jakarta_Sans']">
      <Navbar />

      <main className="flex-1 w-full pt-[120px] pb-24 relative z-10">
        <div className="max-w-5xl mx-auto px-6 w-full">

          {/* Header Section */}
          <div className="flex flex-col items-center text-center mb-16">
            <h1 className="text-slate-800 text-[32px] md:text-[40px] font-bold tracking-tight mb-4 leading-tight">
              Our Training Courses
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Choose the right course for your needs
            </p>
          </div>

          {/* Course Cards Grid */}
          <CourseGrid courses={courses} />
        </div>
      </main>

      <Footer />
    </div>
  );
}