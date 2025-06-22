import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const brainLobes = [
  {
    name: "Frontal Lobe",
    image: "/frontal.svg",
    location: "Front part of the brain, behind the forehead",
    functions: [
      "Executive functions: planning, decision-making, problem-solving, judgment",
      "Voluntary motor control: movement via the motor cortex",
      "Speech production: via Broca's area (usually in the left hemisphere)",
      "Personality and behavior: emotional regulation, social interaction",
      "Working memory and attention control"
    ]
  },
  {
    name: "Parietal Lobe",
    image: "/parietal.svg",
    location: "Upper middle part of the brain, behind the frontal lobe",
    functions: [
      "Processing sensory input: touch, pressure, temperature, pain",
      "Spatial awareness and navigation",
      "Perception of body position (proprioception)",
      "Integration of sensory information from different modalities (visual, auditory, etc.)"
    ]
  },
  {
    name: "Temporal Lobe",
    image: "/temporal.svg",
    location: "Sides of the brain, near the ears",
    functions: [
      "Auditory processing: hearing and language comprehension",
      "Memory formation: especially in the hippocampus",
      "Understanding language: via Wernicke's area (usually left hemisphere)",
      "Emotion processing: via the amygdala"
    ]
  },
  {
    name: "Occipital Lobe",
    image: "/occipital.svg",
    location: "Back of the brain",
    functions: [
      "Visual processing: interpreting visual information from the eyes",
      "Recognition of shapes, colors, and motion",
      "Visual-spatial processing"
    ]
  }
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="pt-28 lg:pt-32 pb-12 bg-gradient-to-br from-yellow-50 to-yellow-100 text-center">
        <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4">How It Works</h1>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          Discover how BaldSphere maps your actions to specific brain regions.
          Learn about the four main lobes of the brain and their incredible functions.
        </p>
      </div>

      {/* Alternating Lobe Sections */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto space-y-16">
          {brainLobes.map((lobe) => (
            <div key={lobe.name} className="flex flex-col md:flex-row gap-10">
              {/* Image container */}
              <div className="w-full md:w-1/2 bg-white rounded-2xl shadow-xl p-6 flex items-center justify-center">
                <img
                  src={lobe.image}
                  alt={lobe.name}
                  className="w-full h-auto rounded-xl"
                />
              </div>

              {/* Text container */}
              <div className="w-full md:w-1/2 bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{lobe.name}</h2>
                <p className="mb-3 text-gray-600">
                  <strong className="text-gray-800"> Location:</strong> {lobe.location}
                </p>
                <h4 className="font-semibold text-gray-800 mb-2"> Main Functions:</h4>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  {lobe.functions.map((fn, i) => (
                    <li key={i}>{fn}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-gradient-to-br from-yellow-400 to-yellow-500 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Ready to Explore Your Brain?</h2>
        <p className="text-lg text-yellow-100 mb-6">
          Start chatting with BaldMann and watch your brain light up in real-time!
        </p>
        <a
          href="/chat"
          className="inline-block bg-white text-yellow-500 font-bold px-8 py-4 rounded-full hover:bg-gray-100 shadow-lg"
        >
          Start Exploring 🧠
        </a>
      </div>

      <Footer />
    </div>
  );
}
