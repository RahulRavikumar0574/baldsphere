"use client"
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleDesign from "@/components/ParticleDesign";

const brainLobes = [
  {
    name: "Frontal Lobe",
    image: "/frontal.svg",
    location: "Front part of the brain, just behind your forehead",
    mainRole: "The brain’s CEO - controls planning, movement, personality, and decision-making",
    whatItDoes: [
      "Controls voluntary movement via the motor cortex",
      "Helps you make decisions, solve problems, and plan ahead",
      "Turns thoughts into speech in the Broca area",
      "Regulates emotions, reactions, and how you interact socially",
      "Holds information temporarily",
      "Helps suppress distractions"
    ],
    damageNote: "Damages in this region can alter personality"
  },
  {
    name: "Parietal Lobe",
    image: "/parietal.svg",
    location: "Upper middle part of the brain, behind the frontal lobe",
    mainRole: "The brain’s GPS and sensory interpreter - deals with touch, space, and movement",
    whatItDoes: [
      "Processes touch, pain, pressure, and temperature in the somatosensory cortex",
      "Handles spatial orientation and navigation",
      "Detects where your body is in space in terms of position and movement",
      "Integrates info from senses to understand the surroundings",
      "Left side handles math and logic; right side handles spatial coordination"
    ],
    damageNote: "Damage may cause clumsiness or trouble judging distance and space"
  },
  {
    name: "Temporal Lobe",
    image: "/temporal.svg",
    location: "Sides of the brain, near the ears",
    mainRole: "The brain’s audio and emotional archive - handles hearing, memory, language, and feelings",
    whatItDoes: [
      "Processes sounds and language via the auditory cortex",
      "Forms new long-term memories through the hippocampus",
      "Understands speech via Wernicke’s area",
      "Reads facial expressions and emotional tone through the amygdala",
      "Connects senses with emotional meaning (e.g. a song tied to a memory)"
    ],
    damageNote: "Damage here can affect memory recall and language comprehension"
  },
  {
    name: "Occipital Lobe",
    image: "/occipital.svg",
    location: "Back of the brain",
    mainRole: "Your brain’s visual studio - interprets what your eyes see",
    whatItDoes: [
      "Decodes visual signals like shape, color, and motion",
      "Helps recognize objects and faces",
      "Sends information to other lobes for full perception",
      "Essential for visual-spatial processing"
    ],
    damageNote: "Damage here may lead to visual hallucinations or difficulty recognizing visuals"
  }
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content with particle background */}
      <div className="relative">
        {/* Colorful Particle Background - only for main content */}
        <div className="absolute inset-0 z-0">
          <ParticleDesign 
            colors={["#10B981", "#F59E0B", "#3B82F6", "#8B5CF6"]} 
            linkColor="#6B7280"
          />
        </div>
        
        <div className="relative z-10">
          <Navbar />

          {/* Hero Section */}
          <div className="pt-28 lg:pt-32 pb-12 text-center relative z-20">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4">How It Works</h1>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Discover how BaldSphere maps your actions to specific brain regions.
              Learn about the four main lobes of the brain and their incredible functions.
            </p>
          </div>

          {/* Alternating Lobe Sections */}
          <div className="py-16 relative z-20">
            <div className="max-w-6xl mx-auto space-y-16">
              {brainLobes.map((lobe) => (
                <div key={lobe.name} className="flex flex-col md:flex-row gap-10">
                  {/* Image container */}
                  <div className="w-full md:w-1/2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 flex items-center justify-center">
                    <img
                      src={lobe.image}
                      alt={lobe.name}
                      className="w-full h-auto rounded-xl"
                    />
                  </div>

                  {/* Text container */}
                  <div className="w-full md:w-1/2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{lobe.name}</h2>
                    <p className="mb-1 text-gray-600">
                      <strong className="text-gray-800">Location:</strong> {lobe.location}
                    </p>
                    <p className="mb-3 text-gray-700 italic">
                      <strong className="text-gray-800">Main Role:</strong> {lobe.mainRole}
                    </p>
                    <h4 className="font-semibold text-gray-800 mb-2">What it does:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-gray-700 mb-2">
                      {lobe.whatItDoes.map((fn, i) => (
                        <li key={i}>{fn}</li>
                      ))}
                    </ul>
                    <p className="text-red-600 font-medium mt-2">{lobe.damageNote}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="py-16 bg-gradient-to-br from-yellow-400/90 to-yellow-500/90 backdrop-blur-sm text-center relative z-20">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Explore Your Brain?</h2>
            <p className="text-lg text-yellow-100 mb-6">
              Start chatting with BaldMann and watch your brain light up in real-time!
            </p>
            <a
              href="/chat"
              className="inline-block bg-white text-yellow-500 font-bold px-8 py-4 rounded-full hover:bg-gray-100 shadow-lg"
            >
              Start Exploring
            </a>
          </div>
        </div>
      </div>

      {/* Footer - completely separate from particle background */}
      <div className="bg-white border-t border-gray-200">
        <Footer />
      </div>
    </div>
  );
}
