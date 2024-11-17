'use client';

import { SignUp } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { BookOpenIcon, GlobeIcon } from 'lucide-react';

export default function SignUpPage() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-blue-900 to-blue-800 dark:from-blue-950 dark:to-black flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left side: Animated background and content */}
          <motion.div
            className="md:w-1/2 bg-blue-600 p-8 flex flex-col justify-center items-center text-white"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold mb-4">Welcome to Tutee</h1>
            <p className="text-lg mb-6 text-center">
              Join our community of learners and unlock your English potential!
            </p>
            <div className="flex justify-center space-x-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="bg-blue-500 rounded-full p-3"
              >
                <BookOpenIcon size={40} />
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="bg-blue-500 rounded-full p-3"
              >
                <GlobeIcon size={40} />
              </motion.div>
            </div>
          </motion.div>

          {/* Right side: Sign Up form */}
          <motion.div
            className="md:w-1/2 p-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <SignUp
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
                  formFieldInput: 'border-gray-300 dark:border-gray-600',
                  formFieldLabel: 'text-gray-700 dark:text-gray-300',
                  card: 'bg-transparent shadow-none',
                },
              }}
            />
          </motion.div>
        </div>
      </div>
    </main>
  );
}
