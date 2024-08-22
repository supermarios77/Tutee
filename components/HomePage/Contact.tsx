'use client'

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, MessageCircle, Facebook, Twitter, Instagram, Linkedin, BookOpen } from "lucide-react";

const Contact = () => {
  const imageUrl =
    "https://images.unsplash.com/photo-1572021335469-31706a17aaef?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      value: "info@tutee.co.uk",
      href: "mailto:info@tutee.co.uk",
    },
    {
      icon: MessageCircle,
      title: "Telegram",
      value: "@tuteeuk",
      href: "https://t.me/+@TUTEEUK",
    },
  ];

  const footerLinks = [
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Pricing", href: "#pricing" },
    { name: "Contact", href: "#contact" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#" },
    { icon: Twitter, href: "#" },
    { icon: Instagram, href: "#" },
    { icon: Linkedin, href: "#" },
  ];

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-indigo-900 to-blue-900 dark:from-gray-900 dark:to-black" id="contact">
      <div className="container px-6 py-16 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Get in Touch
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            We're here to help. Reach out to us through any of the following methods.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 mt-12 sm:grid-cols-2 lg:grid-cols-2">
          {contactMethods.map((method, index) => (
            <motion.div
              key={method.title}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800"
            >
              <div className="flex items-center">
                <span className="inline-block p-3 text-blue-500 rounded-full bg-blue-100 dark:bg-blue-900">
                  <method.icon className="w-6 h-6" />
                </span>
                <h3 className="mx-3 text-lg font-semibold text-gray-700 dark:text-white">
                  {method.title}
                </h3>
              </div>
              <p className="mt-4 text-lg font-medium text-blue-500 dark:text-blue-400">
                <a 
                  href={method.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {method.value}
                </a>
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 border-t border-gray-700 pt-8"
        >
          <div className="flex flex-col items-center">
            <Link href="/" className="flex items-center mb-6">
              <BookOpen className="h-8 w-8 text-white mr-2" />
              <span className="text-2xl font-bold text-white">Tutee</span>
            </Link>
            <nav className="flex flex-wrap justify-center mb-6">
              {footerLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-300 hover:text-white mx-4 my-2"
                >
                  {link.name}
                </a>
              ))}
            </nav>
            <div className="flex space-x-6 mb-6">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-gray-400 hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <link.icon className="h-6 w-6" />
                  <span className="sr-only">{link.icon.name}</span>
                </a>
              ))}
            </div>
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Tutee. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 -z-10 overflow-hidden"
      >
        <Image
          src={imageUrl}
          alt="Background"
          layout="fill"
          objectFit="cover"
          quality={100}
          className="opacity-10"
        />
      </motion.div>

      {/* Decorative element */}
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 transform rotate-180">
        <svg className="w-32 h-32 text-blue-400 opacity-20" fill="currentColor" viewBox="0 0 256 256">
          <path d="M128,0C57.3,0,0,57.3,0,128s57.3,128,128,128s128-57.3,128-128S198.7,0,128,0z M128,224c-52.9,0-96-43.1-96-96 s43.1-96,96-96s96,43.1,96,96S180.9,224,128,224z"/>
        </svg>
      </div>
    </footer>
  );
};

export default Contact;