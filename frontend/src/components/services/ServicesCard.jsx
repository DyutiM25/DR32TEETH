const ServicesCard = ({ title, description, image, bgColor }) => {
  return (
    <div
      className="shadow-md rounded-lg p-4 md:p-6 min-h-[380px] md:min-h-[400px] w-full max-w-md mx-auto hover:shadow-lg hover:scale-105 transform transition duration-300 flex flex-col justify-between"
      style={{ backgroundColor: bgColor }}
    >
      {image && (
        <img
          src={image}
          alt={title}
          className="w-full h-56 md:h-48 object-cover rounded-md mb-3 md:mb-4"
          loading="lazy"
        />
      )}
      <h5 className="text-lg md:text-xl font-semibold mb-2 text-teal-700">{title}</h5>
      <p className="text-gray-600 text-base md:text-lg">{description}</p>
    </div>
  );
};

export default ServicesCard;
