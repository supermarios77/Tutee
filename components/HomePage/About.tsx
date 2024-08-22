'use client'

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { GraduationCapIcon, BookOpenIcon, UsersIcon } from "lucide-react";

export const About = () => {
  const imageUrl =
    "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80";

  const features = [
    { icon: GraduationCapIcon, title: "Expert Tutors", description: "Learn from certified professionals" },
    { icon: BookOpenIcon, title: "Tailored Learning", description: "Personalized lessons for your goals" },
    { icon: UsersIcon, title: "Global Community", description: "Connect with learners worldwide" },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 to-blue-800 dark:from-blue-900 dark:to-neutral-900" id="about">
      <div className="max-w-[85rem] px-4 py-16 sm:px-6 lg:px-8 mx-auto">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <Image
              className="rounded-lg shadow-xl"
              src={imageUrl}
              alt="Online English tutoring session"
              width={800}
              height={600}
              objectFit="cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-20 rounded-lg"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Elevate Your English Skills with Expert Guidance
            </h2>
            <p className="text-lg text-gray-300">
              At Tutee, we're committed to empowering students to achieve fluency and confidence in English. Our experienced tutors provide personalized instruction tailored to your unique learning needs and goals.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="flex items-start"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-blue-200" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                    <p className="mt-1 text-gray-300">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};