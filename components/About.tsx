import React from "react";
import Image from "next/image";

export const About = () => {
  const imageUrl =
    "https://images.unsplash.com/photo-1648737963503-1a26da876aca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=900&h=900&q=80";

  return (
    <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
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
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac
                euismod nibh. Pellentesque habitant morbi tristique senectus et
                netus et malesuada fames ac turpis egestas. Duis mauris libero,
                mattis non sapien ut, fermentum rutrum lorem. Morbi convallis
                varius risus id pharetra. Aliquam rutrum luctus commodo. Nulla
              </p>
            </div>
            <ul className="space-y-2 sm:space-y-4">
              <li className="flex space-x-3">
                <span className="mt-0.5 size-5 flex justify-center items-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-800/30 dark:text-blue-500">
                  <svg
                    className="flex-shrink-0 size-3.5"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>

                <span className="text-sm sm:text-base text-gray-500 dark:text-neutral-500">
                  <span className="font-bold">Easy & fast</span> designing
                </span>
              </li>

              <li className="flex space-x-3">
                <span className="mt-0.5 size-5 flex justify-center items-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-800/30 dark:text-blue-500">
                  <svg
                    className="flex-shrink-0 size-3.5"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>

                <span className="text-sm sm:text-base text-gray-500 dark:text-neutral-500">
                  Powerful <span className="font-bold">features</span>
                </span>
              </li>

              <li className="flex space-x-3">
                <span className="mt-0.5 size-5 flex justify-center items-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-800/30 dark:text-blue-500">
                  <svg
                    className="flex-shrink-0 size-3.5"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>

                <span className="text-sm sm:text-base text-gray-500 dark:text-neutral-500">
                  User Experience Design
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};