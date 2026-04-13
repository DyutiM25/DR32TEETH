import TeamCard from "./TeamCard";
import TeamData from "./TeamData";

const Team = () => {
  return (
    <section id="team">
      <div className="px-4 sm:px-6 md:px-12 py-8 md:py-12 text-center bg-yellow-50">
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight bg-gradient-to-r from-teal-400 to-orange-400 text-transparent bg-clip-text">
          Our Team
        </h3>
        <h4 className="text-base sm:text-lg text-gray-600 mb-6 md:mb-8">
          Your Smile, Our Responsibility.
        </h4>
        <div
          className="
    grid
    grid-cols-1
    sm:grid-cols-2
    md:grid-cols-3
    lg:grid-cols-4
    gap-6
    justify-items-center
  "
        >
          {TeamData.map((member, idx) => (
            <TeamCard
              key={idx}
              name={member.name}
              title={member.title}
              description={member.description}
              image={member.img}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
