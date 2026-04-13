import CenterData from "./CenterData";
import CenterCard from "./CenterCard";
import ImageSlider from "../common/ImageSlider";

const Center = () => {
  const gradientColors = ["#ffffff"];

  return (
    <section id="center">
      <div className="px-4 sm:px-6 md:px-12 py-8 md:py-12 text-center bg-gray-50">
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight bg-gradient-to-r from-teal-400 to-orange-400 text-transparent bg-clip-text mb-6 md:mb-8">
          Our Center
        </h3>
        <div className="container flex flex-col lg:flex-row justify-between gap-6 md:gap-8 px-4 sm:px-6 md:px-8 py-6 md:py-8">
          <div className="w-full lg:w-1/2">
            <div
              className="relative w-full"
              style={{ paddingBottom: "56.25%" }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3414.8058140819!2d78.4435160751662!3d17.443252283453457!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb90c3f850e499%3A0x485ae34b61414bbe!2sSRI%20SAI%20SUPER%20SPECIALITY%20DENTAL%20HOSPITAL!5e1!3m2!1sen!2sin!4v1750323815754!5m2!1sen!2sin"
                className="absolute top-0 left-0 w-full h-full"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ border: "1px dotted black" }}
              ></iframe>
            </div>
          </div>
          <div className="w-full lg:w-1/2">
            <ImageSlider
              data={CenterData}
              slidesToShow={1}
              slidesToScroll={1}
              dots={true}
              arrows={false}
              gradientColors={gradientColors}
              autoplay={true}
              autoplaySpeed={4000}
              renderItem={(item, idx) => {
                const bgColor = gradientColors[idx % gradientColors.length];
                return (
                  <CenterCard
                    alt={item.altText}
                    image={item.img}
                    bgColor={bgColor}
                  />
                );
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Center;
