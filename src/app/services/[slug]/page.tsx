"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import servicesDataJson from "@/data/services-data.json";

const serviceData: Record<string, {
  name: string;
  image: string;
  description: string;
  workPhotos: string[];
  workVideos: string[];
  orderedMedia?: string[];
  beforeAfterVideos?: { before: string; after: string }[];
  beforeAfterPhotos?: { before: string; after: string | string[] }[];
}> = servicesDataJson;

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

  const hasMedia = service.workPhotos.length > 0 || service.workVideos.length > 0 || (service.orderedMedia && service.orderedMedia.length > 0) || (service.beforeAfterVideos && service.beforeAfterVideos.length > 0) || (service.beforeAfterPhotos && service.beforeAfterPhotos.length > 0);

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

            {/* Ordered Media (mixed photos and videos in exact order) */}
            {service.orderedMedia && service.orderedMedia.length > 0 && (
              <div className="flex flex-col items-center gap-6 mb-8">
                {service.orderedMedia.map((src, index) => {
                  const isVideo = src.endsWith('.mp4') || src.endsWith('.webm') || src.endsWith('.mov');
                  return isVideo ? (
                    <video
                      key={index}
                      src={src}
                      autoPlay
                      loop
                      muted
                      className="w-full max-w-3xl rounded-xl shadow-lg"
                      playsInline
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img
                      key={index}
                      src={src}
                      alt={`${service.name} work example ${index + 1}`}
                      className="w-full max-w-3xl rounded-xl shadow-lg"
                    />
                  );
                })}
              </div>
            )}

            {/* Videos */}
            {service.workVideos.length > 0 && (
              <div className="flex flex-col items-center gap-6 mb-8">
                {service.workVideos.map((video, index) => (
                  <video
                    key={index}
                    src={video}
                    autoPlay
                    loop
                    muted
                    className="w-full max-w-3xl rounded-xl shadow-lg"
                    playsInline
                  >
                    Your browser does not support the video tag.
                  </video>
                ))}
              </div>
            )}

            {/* Before & After Videos */}
            {service.beforeAfterVideos && service.beforeAfterVideos.length > 0 && (
              <div className="mt-8">
                {service.beforeAfterVideos.map((pair, index) => (
                  <div key={index} className="flex flex-col gap-8 mb-8 max-w-3xl mx-auto">
                    <div>
                      <p className="text-center font-semibold text-gray-700 mb-3">Before</p>
                      <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg bg-black">
                        <video
                          src={pair.before}
                          autoPlay
                          loop
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
                          autoPlay
                          loop
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
                {service.beforeAfterPhotos.map((pair, index) => {
                  const afterPhotos = Array.isArray(pair.after) ? pair.after : [pair.after];
                  return (
                    <div key={index} className="flex flex-col gap-8 mb-8 max-w-4xl mx-auto">
                      <div>
                        <p className="text-center font-semibold text-gray-700 mb-3">Before</p>
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg max-w-2xl mx-auto">
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
                        <div className={`grid ${afterPhotos.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-2xl mx-auto'} gap-4`}>
                          {afterPhotos.map((photo, photoIndex) => (
                            <div key={photoIndex} className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                              <Image
                                src={photo}
                                alt={`After ${photoIndex + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Photos */}
            {service.workPhotos.length > 0 && (
              <div className="flex flex-col items-center gap-6">
                {service.workPhotos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`${service.name} work example ${index + 1}`}
                    className="w-full max-w-3xl rounded-xl shadow-lg"
                  />
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
