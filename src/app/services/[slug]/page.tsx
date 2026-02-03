"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

const serviceData: Record<string, {
  name: string;
  image: string;
  description: string;
  workPhotos: string[];
  workVideos: string[];
  beforeAfterVideos?: { before: string; after: string }[];
  beforeAfterPhotos?: { before: string; after: string }[];
}> = {
  "bathrooms": {
    name: "Bathrooms",
    image: "/icons/bathrooms.png",
    description: "Transform your bathroom into a beautiful, functional space. We handle everything from simple updates to complete bathroom renovations including tile work, fixtures, vanities, and more.",
    workPhotos: [],
    workVideos: ["/work/bathrooms-video-1.mp4"],
  },
  "concrete": {
    name: "Concrete",
    image: "/icons/concrete.png",
    description: "Professional concrete services including driveways, patios, walkways, and foundations. We deliver durable, quality concrete work that stands the test of time.",
    workPhotos: [],
    workVideos: [],
  },
  "decks": {
    name: "Decks",
    image: "/icons/decks.png",
    description: "Build the outdoor living space of your dreams. We construct beautiful, durable decks using quality materials that will last for years to come.",
    workPhotos: ["/work/decks-1.jpg"],
    workVideos: ["/work/decks-video-1.mp4"],
  },
  "drywalling": {
    name: "Drywalling",
    image: "/icons/drywalling.png",
    description: "Professional drywall installation and repair services. We handle new construction, repairs, texturing, and finishing to give your walls a flawless look.",
    workPhotos: [],
    workVideos: [],
  },
  "electrical-work": {
    name: "Electrical Work",
    image: "/icons/electrical.png",
    description: "Safe and reliable electrical services for your home. From outlet installations to lighting upgrades, we ensure your electrical work is done right.",
    workPhotos: [],
    workVideos: [],
  },
  "fences": {
    name: "Fences",
    image: "/icons/fences.png",
    description: "Enhance your property with a quality fence installation. We offer wood, vinyl, chain link, and other fencing options to meet your needs and budget.",
    workPhotos: ["/work/fences-1.png", "/work/fences-2.png", "/work/fences-3.png"],
    workVideos: [],
  },
  "flooring": {
    name: "Flooring",
    image: "/icons/flooring.png",
    description: "Upgrade your floors with professional installation services. We work with hardwood, laminate, tile, vinyl, and more to transform any room.",
    workPhotos: ["/work/flooring-1.jpg"],
    workVideos: [],
  },
  "gutter-cleaning": {
    name: "Gutter Cleaning",
    image: "/icons/gutter-cleaning.png",
    description: "Keep your gutters flowing properly with our cleaning and maintenance services. We also install gutter guards to reduce future maintenance needs.",
    workPhotos: ["/work/gutter-cleaning-1.jpg", "/work/gutter-after-2.png"],
    workVideos: [],
    beforeAfterPhotos: [{ before: "/work/gutter-before-1.png", after: "/work/gutter-after-1.png" }],
  },
  "junk-removal": {
    name: "Junk Removal",
    image: "/icons/junk-removal.png",
    description: "Fast and efficient junk removal services. We haul away unwanted items, debris, and clutter from your home or property responsibly.",
    workPhotos: [],
    workVideos: [],
  },
  "kitchens": {
    name: "Kitchens",
    image: "/icons/kitchens.png",
    description: "Create your dream kitchen with our remodeling services. From cabinet installation to countertops and backsplashes, we do it all.",
    workPhotos: [],
    workVideos: [],
  },
  "landscaping": {
    name: "Landscaping",
    image: "/icons/landscaping.png",
    description: "Transform your outdoor space with professional landscaping. We offer design, planting, hardscaping, and ongoing maintenance services.",
    workPhotos: ["/work/landscaping-1.jpg"],
    workVideos: ["/work/landscaping-video-1.mp4"],
  },
  "masonry": {
    name: "Masonry",
    image: "/icons/masonry.png",
    description: "Expert masonry services including brick, stone, and block work. We build and repair walls, chimneys, patios, and other masonry structures with precision craftsmanship.",
    workPhotos: [],
    workVideos: [],
  },
  "painting": {
    name: "Painting",
    image: "/icons/painting.png",
    description: "Refresh your space with professional interior and exterior painting services. We deliver clean, precise work with quality paints that last.",
    workPhotos: [],
    workVideos: ["/work/painting-video-1.mp4"],
  },
  "plumbing": {
    name: "Plumbing",
    image: "/icons/plumbing.png",
    description: "Reliable plumbing services for repairs, installations, and maintenance. We handle leaks, clogs, fixture installations, and more.",
    workPhotos: [],
    workVideos: ["/work/plumbing-video-1.mp4", "/work/plumbing-video-2.mp4"],
  },
  "powerwashing": {
    name: "Powerwashing",
    image: "/icons/powerwashing.png",
    description: "Restore the look of your home, driveway, deck, and more with professional pressure washing services that remove years of grime and buildup.",
    workPhotos: [],
    workVideos: ["/work/powerwashing-video-1.mp4", "/work/powerwashing-video-2.mp4"],
  },
  "remodeling": {
    name: "Remodeling",
    image: "/icons/remodeling.png",
    description: "Complete home remodeling services to transform any space. We handle projects of all sizes with attention to detail and quality craftsmanship.",
    workPhotos: ["/work/remodeling-1.jpg"],
    workVideos: [],
  },
  "roofing": {
    name: "Roofing",
    image: "/icons/roofing.png",
    description: "Protect your home with professional roofing services. We offer repairs, replacements, and maintenance to keep your roof in top condition.",
    workPhotos: [],
    workVideos: [],
  },
  "sheds-gates": {
    name: "Sheds & Gates",
    image: "/icons/sheds.png",
    description: "Custom shed construction and gate installation services. We build functional, attractive structures that enhance your property.",
    workPhotos: [],
    workVideos: ["/work/sheds-video-1.mp4", "/work/sheds-video-2.mp4"],
  },
  "siding": {
    name: "Siding",
    image: "/icons/siding.png",
    description: "Professional siding installation and repair services. We work with vinyl, fiber cement, wood, and other siding materials to protect and beautify your home.",
    workPhotos: [],
    workVideos: [],
  },
  "snow-removal": {
    name: "Snow Removal",
    image: "/icons/snow-removal.png",
    description: "Reliable snow removal services to keep your property safe and accessible during winter. We offer residential and commercial snow clearing.",
    workPhotos: [],
    workVideos: ["/work/snow-removal-video-1.mp4", "/work/snow-removal-video-2.mp4"],
  },
  "tree-trimming": {
    name: "Tree Trimming",
    image: "/icons/tree-trimming.png",
    description: "Professional tree trimming and pruning services to keep your trees healthy, safe, and looking their best.",
    workPhotos: [],
    workVideos: ["/work/tree-trimming-video-1.mp4", "/work/tree-trimming-video-2.mp4", "/work/tree-trimming-video-3.mp4"],
  },
  "waterproofing": {
    name: "Waterproofing",
    image: "/icons/waterproofing.png",
    description: "Protect your home from water damage with basement and foundation waterproofing services. We keep your home dry and safe.",
    workPhotos: [],
    workVideos: ["/work/waterproofing-video-1.mp4"],
  },
  "stairs": {
    name: "Stairs",
    image: "/icons/stairs.png",
    description: "Professional stair installation, repair, and refinishing services. We build and restore beautiful, safe staircases that enhance your home.",
    workPhotos: [],
    workVideos: [],
    beforeAfterVideos: [{ before: "/work/stairs-before.mp4", after: "/work/stairs-after.mp4" }],
  },
};

export default function ServicePage() {
  const params = useParams();
  const slug = params.slug as string;
  const service = serviceData[slug];

  if (!service) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Service Not Found</h1>
          <Link href="/#services" className="text-gold hover:underline">
            Back to Services
          </Link>
        </div>
      </div>
    );
  }

  const hasMedia = service.workPhotos.length > 0 || service.workVideos.length > 0 || (service.beforeAfterVideos && service.beforeAfterVideos.length > 0) || (service.beforeAfterPhotos && service.beforeAfterPhotos.length > 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-[#D4AF37]/30 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="relative w-20 h-20">
              <Image
                src="/logo.png"
                alt="Variety Amaya LLC"
                fill
                className="object-contain"
                priority
              />
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/#services" className="text-white hover:text-[#D4AF37] transition-colors">
                All Services
              </Link>
              <a href="tel:7036770440" className="text-[#D4AF37] hover:text-white transition-colors font-semibold">
                (703) 677-0440
              </a>
              <Link
                href="/#requestForm"
                className="bg-[#D4AF37] hover:bg-[#B8960C] text-black font-semibold px-6 py-2 rounded-full transition-colors"
              >
                Free Estimate
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-48 h-48 rounded-2xl overflow-hidden bg-gray-900">
              <Image
                src={service.image}
                alt={service.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {service.name}
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl">
                {service.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Work Examples Section */}
      {hasMedia && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Our {service.name} Work
            </h2>

            {/* Videos */}
            {service.workVideos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {service.workVideos.map((video, index) => (
                  <div
                    key={index}
                    className="relative aspect-video rounded-xl overflow-hidden shadow-lg bg-black"
                  >
                    <video
                      src={video}
                      controls
                      muted
                      className="w-full h-full object-cover"
                      playsInline
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ))}
              </div>
            )}

            {/* Photos */}
            {service.workPhotos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {service.workPhotos.map((photo, index) => (
                  <div
                    key={index}
                    className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg"
                  >
                    <Image
                      src={photo}
                      alt={`${service.name} work example ${index + 1}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Before & After Videos */}
            {service.beforeAfterVideos && service.beforeAfterVideos.length > 0 && (
              <div className="mt-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Before & After
                </h3>
                {service.beforeAfterVideos.map((pair, index) => (
                  <div key={index} className="flex flex-col gap-8 mb-8 max-w-3xl mx-auto">
                    <div>
                      <p className="text-center font-semibold text-gray-700 mb-3">Before</p>
                      <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg bg-black">
                        <video
                          src={pair.before}
                          controls
                          muted
                          className="w-full h-full object-cover"
                          playsInline
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                    <div>
                      <p className="text-center font-semibold text-gray-700 mb-3">After</p>
                      <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg bg-black">
                        <video
                          src={pair.after}
                          controls
                          muted
                          className="w-full h-full object-cover"
                          playsInline
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Before & After Photos */}
            {service.beforeAfterPhotos && service.beforeAfterPhotos.length > 0 && (
              <div className="mt-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Before & After
                </h3>
                {service.beforeAfterPhotos.map((pair, index) => (
                  <div key={index} className="flex flex-col gap-8 mb-8 max-w-3xl mx-auto">
                    <div>
                      <p className="text-center font-semibold text-gray-700 mb-3">Before</p>
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                        <Image
                          src={pair.before}
                          alt="Before"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-center font-semibold text-gray-700 mb-3">After</p>
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                        <Image
                          src={pair.after}
                          alt="After"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Contact us today for a free estimate on your {service.name.toLowerCase()} project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/#requestForm"
              className="bg-[#D4AF37] hover:bg-[#B8960C] text-black font-bold px-10 py-4 rounded-full text-lg transition-all"
            >
              Get a Free Estimate
            </Link>
            <a
              href="tel:7036770440"
              className="border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#B8960C] hover:border-[#B8960C] hover:text-white font-bold px-8 py-4 rounded-full text-lg transition-all"
            >
              Call (703) 677-0440
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500">
            © {new Date().getFullYear()} Variety Amaya LLC. All rights reserved.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Licensed & Insured | Serving the DMV Area
          </p>
        </div>
      </footer>
    </div>
  );
}
