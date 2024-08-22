'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { QuoteIcon } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      quote: "My tutor is a great teacher. She helped me to read and learn new words and idioms with patience. Thanks for this knowledgeable session.",
      author: "Ali, Turkiye",
    },
    {
      quote: "My tutor always makes me feel comfortable and knows how to make good conversation! I really enjoy the classes every time!",
      author: "Kim, South Korea",
    },
    {
      quote: "My tutor is super nice and friendly! During her classes, you will always have her undivided attention. She is a good listener as well as a nice person to talk to.",
      author: "Hannah, China",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-800 to-blue-900 dark:from-blue-900 dark:to-neutral-900" id="testimonials">
      <div className="max-w-[85rem] px-4 py-16 sm:px-6 lg:px-8 mx-auto">
        <motion.h2 
          className="text-3xl font-bold text-center text-white mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          What Our Students Say
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="p-6">
                <QuoteIcon className="w-10 h-10 text-blue-500 mb-4" />
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  &quot;{testimonial.quote}&quot;
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {testimonial.author}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full transform rotate-45"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-400 to-indigo-600 rounded-full transform rotate-45"></div>
      </div>
    </section>
  );
}