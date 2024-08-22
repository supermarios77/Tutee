'use client'

import React from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      title: "Group Sessions",
      price: "$59.99",
      period: "monthly",
      features: [
        "Up to 4 people",
        "2x30 minute sessions",
        "Includes resources",
        "Interesting and interactive topics",
      ],
      isPopular: false,
    },
    {
      title: "One To One Sessions",
      price: "$70.00",
      period: "monthly",
      features: [
        "1 hour a week",
        "Split sessions into 2x30min classes",
        "Resources for extra learning included",
        "Tailored teaching approach",
      ],
      isPopular: true,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 to-indigo-900 dark:from-gray-900 dark:to-black" id="pricing">
      <div className="max-w-[85rem] px-4 py-16 sm:px-6 lg:px-8 lg:py-20 mx-auto">
        <motion.div 
          className="max-w-2xl mx-auto text-center mb-10 lg:mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Choose Your Price Plan
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Or contact us for a personalized plan tailored to your needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 mt-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.title}
              className={`relative flex flex-col p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl ${
                plan.isPopular ? 'border-2 border-blue-500' : ''
              }`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {plan.isPopular && (
                <div className="absolute top-0 right-0 mt-4 mr-4">
                  <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-blue-500 text-white">
                    <Sparkles size={14} />
                    Most popular
                  </span>
                </div>
              )}
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{plan.title}</h3>
              <div className="mt-5">
                <span className="text-4xl font-bold text-gray-800 dark:text-white">{plan.price}</span>
                <span className="text-gray-500 dark:text-gray-400">/{plan.period}</span>
              </div>
              <ul className="mt-6 space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="flex-shrink-0 w-5 h-5 text-blue-500" />
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`mt-8 w-full py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border font-medium ${
                  plan.isPopular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all text-sm`}
              >
                Contact Us
              </motion.button>
            </motion.div>
          ))}
        </div>

        <motion.p 
          className="mt-8 text-center text-sm text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Prices in USD. Taxes may apply.
        </motion.p>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16">
        <svg className="w-32 h-32 text-blue-400 opacity-20" fill="currentColor" viewBox="0 0 256 256">
          <path d="M128,0C57.3,0,0,57.3,0,128s57.3,128,128,128s128-57.3,128-128S198.7,0,128,0z M128,224c-52.9,0-96-43.1-96-96 s43.1-96,96-96s96,43.1,96,96S180.9,224,128,224z"/>
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 transform rotate-180">
        <svg className="w-32 h-32 text-indigo-400 opacity-20" fill="currentColor" viewBox="0 0 256 256">
          <path d="M128,0C57.3,0,0,57.3,0,128s57.3,128,128,128s128-57.3,128-128S198.7,0,128,0z M128,224c-52.9,0-96-43.1-96-96 s43.1-96,96-96s96,43.1,96,96S180.9,224,128,224z"/>
        </svg>
      </div>
    </section>
  );
};

export default Pricing;