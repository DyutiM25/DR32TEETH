const CenterCard = ({ alt, image, bgColor  }) => {
  return (
    <div className="" style={{ backgroundColor: bgColor }} > 
      {image && (
        <img
          src={image}
          alt={alt}
          className="w-full h-100 object-cover"
          loading="lazy"
        />
      )}
    </div>
  );
};

export default CenterCard;
