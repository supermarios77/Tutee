export default function Testimonials() {
  const testimonials = [
    {
      quote: "My tutor made English feel less daunting. Now, I navigate conversations effortlessly. Thanks for the boost!",
      author: "Hannah, China",
    },
    {
      quote: "My tutors engaging sessions made learning English enjoyable. Now, I'm excited to practice every day. Thanks for making it fun!",
      author: "Kim, South Korea",
    },
    {
      quote: "My tutors patient guidance helped me overcome language barriers. Now, I communicate fluently and feel more at ease. Thanks for the empowerment",
      author: "Ahmed, Turkiye",
    },
  ];

  return (
    <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-0 mx-auto">
      <h2 className="testimonials-header">
        Testimonials
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="flex flex-col bg-white border border-gray-200 shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700"
          >
            <div className="flex-auto p-4 md:p-6">
              <svg
                className="w-20 h-auto sm:w-24 text-gray-700 dark:text-neutral-300"
                width="140"
                height="47"
                viewBox="0 0 140 47"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              ></svg>

              <p className=" text-gray-800 md:text-xl dark:text-white">
                <em>&quot;{testimonial.quote}&quot;</em>
              </p>
            </div>

            <div className="p-4 rounded-b-xl md:px-6">
              <h3 className="text-sm font-semibold text-gray-800 sm:text-base dark:text-neutral-200">
                {testimonial.author}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
