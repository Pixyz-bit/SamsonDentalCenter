import { Facebook, Phone, Mail } from "lucide-react";

const ContactInfo = () => {
  const contactItems = [
    {
      icon: Facebook,
      label: "Facebook",
      value: "https://www.facebook.com/samsondentalcenter",
      href: "https://www.facebook.com/samsondentalcenter",
      display: "https://www.facebook.com/samsondentalcenter",
    },
    {
      icon: Phone,
      label: "Phone Number",
      value: "09123456789",
      href: "tel:09123456789",
      display: "09123456789",
    },
    {
      icon: Mail,
      label: "Email",
      value: "samsondentalcenter@gmail.com",
      href: "mailto:samsondentalcenter@gmail.com",
      display: "samsondentalcenter@gmail.com",
    },
  ];

  return (
    <section className="py-16 sm:py-0 lg:py-0 bg-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Doctor Image with Blue Background */}
          <div className="relative flex justify-center">
            {/* Decorative Blue Diagonal Background */}
<div
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-gradient-to-br from-blue-500 to-blue-600"
    style={{
        clipPath: "polygon(50% 0%, 100% 34.5%, 79.4% 100%, 20.6% 100%, 0% 34.5%)",
    }}
></div>

            {/* Doctor Image */}
            <div className="relative z-10">
              <img
                src="/images/characters/doctor-headshot.png"
                alt="Dr. Samson Dental Center"
                className="w-[280px] sm:w-[320px] md:w-[400px] lg:w-[480px] h-auto object-cover"
              />
            </div>
          </div>

          {/* Right Column - Contact Info */}
          <div className="space-y-8">
            {/* Heading */}
            <div className="space-y-3">
              <h2 className="text-4xl sm:text-5xl font-bold text-blue-600">
                We'd love to hear from you
              </h2>
              <p className="text-xl text-gray-900 font-semibold">
                because every great smile starts with a simple hello.
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-4">
              {contactItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.label === "Facebook" ? "_blank" : undefined}
                    rel={
                      item.label === "Facebook"
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl
                                                   hover:border-blue-400 hover:bg-blue-50 transition-all duration-300
                                                   group cursor-pointer"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-500 transition-colors duration-300">
                      <Icon
                        className="text-blue-600 group-hover:text-white transition-colors duration-300"
                        size={24}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 font-medium">
                        {item.label}
                      </p>
                      <p className="text-sm sm:text-base text-gray-900 font-semibold hover:text-blue-600 transition-colors truncate">
                        {item.display}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactInfo;
