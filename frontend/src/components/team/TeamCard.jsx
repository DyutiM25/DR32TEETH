const TeamCard = ({name, title, description, image}) => {
    let handleClick = () => {
        console.log("Clicked");
    }
    return(
        <div className="bg-white shadow-md rounded-lg p-4 md:p-6 w-full max-w-md mx-auto hover:shadow-lg transition flex flex-col h-full"> 
      {image && (
        <img
          src={image}
          alt={name}
          className="w-full aspect-[4/3] object-cover rounded-md mb-3 md:mb-4"
          loading="lazy"
        />
      )}
      <p className="text-lg md:text-xl font-semibold mb-1 md:mb-2 text-teal-700">{name}</p>
      <h5 className="text-sm md:text-sm font-semibold mb-2 text-teal-700">{title}</h5>
      <p className="text-gray-600 text-xs md:text-sm">{description}</p>
      <button className="text-xs md:text-sm cursor-pointer hover:underline pt-2 mt-3" onClick={handleClick}>Know More</button>
    </div>
    )
}
export default TeamCard;