export default function Testimonials() {
  const testimonials = [
    {
      quote:
        "I'm absolutely floored by the level of care and attention to detail the team at HS have put into this theme and for one can guarantee that I will be a return customer.",
      author: "Nicole Grazioso",
    },
    {
      quote:
        "I never thought learning English could be this enjoyable! The materials provided are comprehensive, and the instructors are incredibly supportive.",
      author: "Jack Smith",
    },
    {
      quote:
        "Studying English at HS has been a game-changer for me. The interactive lessons and personalized feedback have significantly boosted my confidence.",
      author: "Emily Johnson",
    },
  ];

  return (
    <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-0 mx-auto">
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
              >
              </svg>

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