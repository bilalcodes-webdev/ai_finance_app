import HeroSection from "@/components/HeroSection";
import {
  featuresData,
  howItWorksData,
  statsData,
  testimonialsData,
} from "../../data/landing";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Home = () => {
  return (
    <div className="mt-40">
      <HeroSection />
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsData.map((statsData, index) => (
              <div className="text-center" key={index}>
                <div className="text-2xl font-bold mb-2 text-blue-600">
                  {statsData.value}
                </div>
                <div className="text-gray-600">{statsData.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Everything You Need To Manage Your Finance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((featuresData, index) => (
              <Card key={index} className="p-6">
                <CardContent className="space-y-4 pt-4">
                  {featuresData.icon}
                  <h2 className="text-xl font-semibold">
                    {featuresData.title}
                  </h2>
                  <h2 className="text-gray-600">{featuresData.description}</h2>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-16 text-center">How Its Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {howItWorksData.map((data, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                  {data.icon}
                </div>
                <h3 className="text-xl mb-4 font-semibold">{data.title}</h3>
                <p className="text-gray-600">{data.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonialsData.map((testimonials, index) => (
              <Card key={index} className="p-6">
                <CardContent className="pt-4">
                  <div className="flex items-center mb-4">
                    <Image
                      width={40}
                      height={40}
                      src={testimonials.image}
                      alt={testimonials.name}
                      className="rounded-full"
                    />
                    <div className="ml-4">
                      <div className="font-semibold">{testimonials.name}</div>
                      <div className="text-sm text-gray-600">
                        {testimonials.role}
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-600">{testimonials.quote}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 bg-blue-600">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Ready To Take Control Of Your Finances?
          </h2>
          <p className=" text-blue-100 max-w-2xl mx-auto mb-8">
            Don&apos;t manage your money emotionally. Automate it intelligently.
          </p>
          <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-100 animate-bounce cursor-pointer"
            >
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
export default Home;
