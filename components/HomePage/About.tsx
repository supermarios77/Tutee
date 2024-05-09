import React from "react";
import Image from "next/image";

export const About = () => {
  const imageUrl =
    "https://images.unsplash.com/photo-1648737963503-1a26da876aca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=900&h=900&q=80";

  return (
    <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto" id="about">
      <div className="md:grid md:grid-cols-2 md:items-center md:gap-12 xl:gap-32">
        <div>
          <Image
            className="rounded-xl"
            src={imageUrl}
            alt="Image Description"
            width={800}
            height={800}
          />
        </div>

        <div className="mt-5 sm:mt-10 lg:mt-0">
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-2 md:space-y-4">
              <h2 className="font-bold text-3xl lg:text-4xl text-gray-800 dark:text-neutral-200">
                Meet Your Teacher
              </h2>
              <p className="text-gray-500 dark:text-neutral-500">
                Welcome to Tutee - your pathway to mastering the English
                language! With over a decade of experience as a native English
                tutor, I bring expertise and passion to every lesson. Holding a
                postgraduate diploma and degree in Law, I initially ventured
                into the legal profession, but the allure of guiding others in
                English language acquisition proved irresistible. Witnessing
                countless success stories among my students fuels my dedication
                to teaching and tutoring. Tutee is more than just a platform;
                it&apos;s a commitment to empowering students to unlock their full
                linguistic potential. Join me on this transformative journey
                towards fluency and confidence in English.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
