"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

// Mapping slugs to images since they aren't in the DB yet
const courseImages: Record<string, string> = {
  bls: "https://images.unsplash.com/photo-1622115297822-a3798fdbe1f6?q=80&w=2148&auto=format&fit=crop",
  efaw: "https://images.unsplash.com/photo-1600091474842-83bb9c05a723?q=80&w=2148&auto=format&fit=crop",
};

interface CourseGridProps {
  courses: any[];
}

export default function CourseGrid({ courses }: CourseGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {courses.map((course, index) => (
        <motion.div
          key={course.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.15 }}
          className="group flex flex-col bg-white rounded-2xl outline outline-1 outline-offset-[-1.11px] outline-gray-200 transition-all duration-300 hover:-translate-y-[6px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] overflow-hidden"
        >
          {/* Card Image */}
          <div className="relative h-48 w-full bg-gray-100">
            <Image
              src={courseImages[course.slug] || "https://images.unsplash.com/photo-1622115297822-a3798fdbe1f6?q=80&w=2148&auto=format&fit=crop"}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Badge (if it exists in DB) */}
            {course.badge_label && (
              <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/95 rounded-full shadow-sm outline outline-1 outline-white/40 flex items-center gap-2">
                <div className="size-2 bg-lime-400 rounded-full" />
                <span className="text-slate-800 text-xs font-bold uppercase tracking-wide">Available</span>
              </div>
            )}
          </div>

          {/* Card Content */}
          <div className="p-5 flex flex-col flex-1">
            <h3 className="text-slate-800 text-lg font-bold leading-6 mb-2">
              {course.title}
            </h3>
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-white rounded-full shadow-sm outline outline-1 outline-lime-400/40 text-slate-800 text-xs font-medium">{course.badge_label || 'Beginner Friendly'}</span>
            </div>
            <p className="text-slate-600 text-sm font-normal leading-6 mb-6 line-clamp-3">
              {course.description}
            </p>

            {/* Metadata Row */}
            <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-5 mb-6 relative">
              <div className="flex flex-col gap-1">
                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wide">
                  Duration
                </span>
                <span className="text-slate-800 text-sm font-bold">
                  {course.duration_hours} Hours
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wide">
                  Class Size
                </span>
                <span className="text-slate-800 text-sm font-bold">
                  Max 12
                </span>
              </div>
              <div className="flex flex-col gap-1 text-right">
                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wide">
                  Price
                </span>
                <span className="text-slate-800 text-sm font-bold">
                  £{Number(course.price)}
                </span>
              </div>
            </div>

            <Link
              href={`/courses/${course.slug}`}
              className="w-full bg-sky-500 hover:bg-[#8DC63F] text-white text-base font-medium h-[48px] rounded-xl transition-all duration-300 flex items-center justify-center"
            >
              View Course Details
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
}