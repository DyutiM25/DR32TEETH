import SampleImage from "../../assets/images/sample3.jpg";
import SampleImage2 from "../../assets/images/dr-sl.jpg";
import SampleImage3 from "../../assets/images/drak.jpg";
import Hero1 from "../../assets/images/hero-1.png";

const Hero = () => {
  return (
    <section id="hero" className="flex flex-col md:flex-row items-center justify-between gap-8 px-4 sm:px-6 md:px-24 py-8 md:py-12 min-h-[80vh] bg-white">
      {/* Text Section */}
      <div className="flex-1 space-y-6 md:space-y-8 max-w-xl">
        <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] bg-gradient-to-r from-teal-500 to-orange-400 text-transparent bg-clip-text pb-[12px]">
          Most Renowned Dental Practitioners in Hyderabad
        </h3>

        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          {/* Badge Image */}
          <img
            src={Hero1}
            alt="27 Years of Excellence"
            className="w-28 h-32 sm:w-32 sm:h-36 object-contain rounded-lg"
          />

          {/* Bullet Points */}
          <ul className="space-y-2 sm:space-y-3 text-gray-700 text-base sm:text-lg font-medium">
            <li className="flex items-start gap-2">
              <span className="text-teal-700 font-bold">✔</span> 27+ Years of
              Dental Excellence
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-700 font-bold">✔</span> Millions of
              Smiles Corrected
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-700 font-bold">✔</span> Advanced
              Implant Treatments
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-700 font-bold">✔</span> Precision and
              Compassionate Care
            </li>
          </ul>
        </div>
      </div>

      {/* Image Section */}
      <div className="flex-1 flex gap-3 sm:gap-4 justify-center md:justify-end max-w-2xl h-auto">
        {/* Left Big Image */}
        <div className="w-2/3">
          <img
            src={SampleImage}
            alt="Main Image"
            className="w-full h-[250px] sm:h-[320px] md:h-[400px] lg:h-[500px] object-cover rounded-xl shadow-md"
          />
        </div>

        {/* Right Stacked Small Images */}
        <div className="w-1/3 flex flex-col gap-3 sm:gap-4">
          <img
            src={SampleImage2}
            alt="Chair Image"
            className="w-full h-[118px] sm:h-[150px] md:h-[190px] lg:h-[240px] object-cover rounded-xl shadow-md"
          />
          <img
            src={SampleImage3}
            alt="Award Image"
            className="w-full h-[118px] sm:h-[150px] md:h-[190px] lg:h-[240px] object-cover rounded-xl shadow-md"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
