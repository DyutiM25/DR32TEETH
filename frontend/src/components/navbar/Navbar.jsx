import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/images/header.png";
import { UserCircle2, Menu, X } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navRef = useRef(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const updateNavHeight = () => {
      if (navRef.current) {
        const height = navRef.current.getBoundingClientRect().height;
        document.documentElement.style.setProperty(
          "--nav-height",
          `${height}px`,
        );
      }
    };

    updateNavHeight();
    window.addEventListener("resize", updateNavHeight);

    return () => window.removeEventListener("resize", updateNavHeight);
  }, [open]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  const links = [
    { href: "#hero", text: "Home" },
    // { href: "#team", text: "About Us" },
    { href: "#services", text: "Our Services" },
    { href: "#center", text: "Our Center" },
    // { href: "#", text: "Implant Patients" },
    // { href: "#", text: "International Patients" },
    { href: "#team", text: "Our Team" },
    { href: "#appointment", text: "Book an Appointment" },
  ];

  return (
    <nav ref={navRef} className="sticky top-0 bg-[#ccf2ed] z-50 shadow-md">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-12 py-3">
        <div className="flex items-center justify-between md:hidden">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" onClick={() => setOpen(false)}>
              <img
                src={logo}
                alt="Dr. 32 Teeth Logo"
                className="h-12 sm:h-16 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Hamburger Icon for Mobile */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-teal-800 focus:outline-none z-50 p-2"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <div className="hidden md:grid md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8">
          {/* Left: Logo */}
          <div className="justify-self-start flex-shrink-0">
            <Link to="/" onClick={() => setOpen(false)}>
              <img
                src={logo}
                alt="Dr. 32 Teeth Logo"
                className="h-12 sm:h-16 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Center: Page Links */}
          <div className="flex items-center justify-self-stretch px-4">
            <div
              className="grid w-full items-center justify-items-center gap-4"
              style={{
                gridTemplateColumns: `repeat(${links.length}, minmax(0, 1fr))`,
              }}
            >
              {links.map((link) => (
                <a
                  key={link.text}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-center text-sm lg:text-base whitespace-nowrap text-gray-800 hover:text-[#00796b] transition-colors font-medium"
                >
                  {link.text}
                </a>
              ))}
            </div>
          </div>

          {/* Right: Buttons */}
          <div className="justify-self-end flex items-center gap-2 lg:gap-3 flex-shrink-0">
            {user ? (
              <div className="flex items-center gap-2 lg:gap-3">
                <span className="hidden lg:inline-block text-sm lg:text-base text-gray-800 font-medium">
                  Hello, {user.firstName}
                </span>
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center text-[#009688] hover:text-[#00796b] transition-colors"
                >
                  <UserCircle2 className="w-5 h-5 lg:w-6 lg:h-6" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 lg:px-4 lg:py-2 text-sm lg:text-base bg-[#009688] text-white rounded-md hover:bg-[#00796b] transition-colors text-center font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 lg:gap-3">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="px-3 py-1.5 lg:px-4 lg:py-2 text-sm lg:text-base bg-[#009688] text-white rounded-md hover:bg-[#00796b] transition-colors text-center font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="text-sm lg:text-base text-center text-[#009688] font-medium hover:underline transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {open && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40"
            onClick={() => setOpen(false)}
          ></div>
        )}

        {/* Mobile Menu */}
        <div
          className={`${
            open
              ? "flex flex-col fixed top-0 right-0 h-full w-[85%] max-w-sm bg-[#ccf2ed] shadow-2xl border-l border-gray-200 z-50 overflow-y-auto"
              : "hidden"
          } md:hidden transition-all duration-300 ease-in-out`}
        >
          {/* Close button for mobile menu */}
          {open && (
            <div className="flex justify-between items-center p-4 border-b border-gray-300 md:hidden">
              <h3 className="text-lg font-semibold text-gray-800">Menu</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-teal-800 focus:outline-none"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          )}

          {/* Middle: Page Links */}
          <div className="flex flex-col py-4">
            <div className="flex flex-col">
              {links.map((link) => (
                <a
                  key={link.text}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="px-6 py-3 text-base hover:bg-[#b8e8e1] transition text-gray-800 hover:text-[#00796b] transition-colors font-medium"
                >
                  {link.text}
                </a>
              ))}
            </div>
          </div>

          {/* Right: Buttons */}
          <div className="mt-auto border-t border-gray-300 p-4 bg-gray-50">
            {user ? (
              <div className="flex flex-col gap-3">
                <span className="px-0 text-base mb-2 text-gray-800 font-medium">
                  Hello, {user.firstName}
                </span>
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="px-6 py-3 text-base hover:bg-[#b8e8e1] transition rounded text-[#009688] hover:text-[#00796b] transition-colors"
                >
                  <div className="flex items-center">
                    <UserCircle2 className="w-5 h-5 lg:w-6 lg:h-6" />
                    <span className="ml-2">Profile</span>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                  className="px-6 py-3 text-base w-full md:w-auto bg-[#009688] text-white rounded-md hover:bg-[#00796b] transition-colors text-center font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="px-6 py-3 text-base w-full md:w-auto bg-[#009688] text-white rounded-md hover:bg-[#00796b] transition-colors text-center font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="px-6 py-3 text-base w-full md:w-auto text-center text-[#009688] font-medium hover:underline transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
