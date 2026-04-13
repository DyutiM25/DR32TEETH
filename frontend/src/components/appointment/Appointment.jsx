import { useState } from "react";

const Appointment = () => {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Select a query");

  const handleSelect = (option) => {
    setSelectedOption(option);
    setShowOptions(false);
  };

  return (
    <section id="appointment">
      <div className="px-4 sm:px-6 md:px-12 py-8 md:py-12 text-center bg-yellow-50">
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight bg-gradient-to-r from-teal-400 to-orange-400 text-transparent bg-clip-text">
          Book your Appointment Now!
        </h3>
        <h4 className="text-base sm:text-lg text-gray-600 mt-4">
          We are here to transform your smile. Book your appointment now!
        </h4>

        <div className="mt-8 md:mt-10 space-y-4 md:space-y-6 max-w-md mx-auto px-4 text-left">
          <input
            type="text"
            placeholder="Enter your name..."
            className="w-full border bg-white rounded-md p-3"
          />
          <input
            type="number"
            placeholder="Phone number..."
            className="w-full border bg-white rounded-md p-3"
          />

          <label className="block font-semibold text-gray-700">
            Select your query:
          </label>

          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              type="button"
              className="w-full inline-flex justify-between items-center rounded-md bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50"
            >
              {selectedOption}
              <svg
                className="-mr-1 h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.72-3.7a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {showOptions && (
              <div className="absolute z-10 mt-2 w-full rounded-md bg-white shadow-lg ring-1 ring-black/5">
                <div className="py-1">
                  {[
                    "Cleaning",
                    "Braces Consultation",
                    "Root Canal",
                    "Whitening",
                  ].map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelect(option)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button className="mt-4 w-full bg-teal-500 text-white py-3 rounded-md hover:bg-teal-600 transition">
            Book Appointment
          </button>
        </div>
      </div>
    </section>
  );
};

export default Appointment;
