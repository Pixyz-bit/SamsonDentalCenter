import { Facebook, Phone, Mail, Instagram, Twitter, Youtube, Clock, MapPin } from "lucide-react";
import { useClinicSettings } from "../../hooks/useClinicSettings";

const ContactInfo = () => {
  const { settings, loading } = useClinicSettings();

  const contactItems = [
    {
      icon: Phone,
      label: "Phone Number",
      value: settings?.phone_primary || settings?.phone || "09123456789",
      href: `tel:${settings?.phone_primary || settings?.phone || "09123456789"}`,
      display: settings?.phone_primary || settings?.phone || "09123456789",
      isSocial: false,
    },
    {
      icon: Mail,
      label: "Email",
      value: settings?.email_official || settings?.email || "samsondentalcenter@gmail.com",
      href: `mailto:${settings?.email_official || settings?.email || "samsondentalcenter@gmail.com"}`,
      display: settings?.email_official || settings?.email || "samsondentalcenter@gmail.com",
      isSocial: false,
    },
  ];

  if (settings?.physical_address) {
    contactItems.push({
      icon: MapPin,
      label: "Address",
      value: settings.physical_address,
      href: settings?.google_maps_link || undefined,
      display: settings.physical_address,
      isSocial: !!settings?.google_maps_link,
    });
  }

  if (settings?.business_hours_text) {
    contactItems.push({
      icon: Clock,
      label: "Business Hours",
      value: settings.business_hours_text,
      href: undefined,
      display: settings.business_hours_text,
      isSocial: false,
    });
  }

  if (settings?.closed_time_text) {
    contactItems.push({
      icon: Clock, // Reusing Clock for closed times
      label: "Closed",
      value: settings.closed_time_text,
      href: undefined,
      display: settings.closed_time_text,
      isSocial: false,
    });
  }

  if (settings?.facebook_url) {
    contactItems.push({
      icon: Facebook,
      label: "Facebook",
      value: settings.facebook_url,
      href: settings.facebook_url,
      display: "Follow us on Facebook",
      isSocial: true,
    });
  }
  
  if (settings?.instagram_url) {
    contactItems.push({
      icon: Instagram,
      label: "Instagram",
      value: settings.instagram_url,
      href: settings.instagram_url,
      display: "Follow us on Instagram",
      isSocial: true,
    });
  }

  if (settings?.twitter_url) {
    contactItems.push({
      icon: Twitter,
      label: "Twitter",
      value: settings.twitter_url,
      href: settings.twitter_url,
      display: "Follow us on Twitter",
      isSocial: true,
    });
  }

  if (settings?.youtube_url) {
    contactItems.push({
      icon: Youtube,
      label: "YouTube",
      value: settings.youtube_url,
      href: settings.youtube_url,
      display: "Subscribe on YouTube",
      isSocial: true,
    });
  }

  return (
    <section className="py-16 sm:py-0 lg:py-0 bg-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Doctor Image with Blue Background */}
          <div className="relative flex justify-center">
            {/* Decorative Blue Diagonal Background */}
<div
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-gradient-to-br from-red-500 to-red-600"
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
              <h2 className="text-4xl sm:text-5xl font-bold text-red-600">
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
                    target={item.isSocial ? "_blank" : undefined}
                    rel={
                      item.isSocial
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl
                                                   hover:border-red-400 hover:bg-red-50 transition-all duration-300
                                                   group cursor-pointer"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-500 transition-colors duration-300">
                      <Icon
                        className="text-red-600 group-hover:text-white transition-colors duration-300"
                        size={24}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 font-medium">
                        {item.label}
                      </p>
                      <p className="text-sm sm:text-base text-gray-900 font-semibold hover:text-red-600 transition-colors truncate">
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
