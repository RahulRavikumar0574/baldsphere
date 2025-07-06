import { NextRequest, NextResponse } from "next/server";
import brainData from "@/myBrainData";

// Simple semantic matching without Python/Ollama
function findSemanticMatch(userInput: string): { 
  found: any; 
  normalized: string | null; 
  confidence: string;
  brainRegions: string[];
} {
  const input = userInput.toLowerCase().trim();
  
  // Direct keyword matching
  let found = brainData.find(
    (item) => {
      const keyword = item.keyword.toLowerCase();
      const cleanKeyword = keyword.replace(/\([^)]*\)/g, '').trim();
      return input === cleanKeyword || input === keyword;
    }
  );

  if (found) {
    return {
      found,
      normalized: found.keyword,
      confidence: 'high',
      brainRegions: found.region || []
    };
  }

  // Semantic synonyms mapping
  const synonyms: { [key: string]: string } = {
    'jog': 'run',
    'sprint': 'run',
    'jogging': 'run',
    'sprinting': 'run',
    'walking': 'walk',
    'strolling': 'walk',
    'take a stroll': 'walk',
    'taking a stroll': 'walk',
    'swimming': 'swim',
    'dancing': 'dance',
    'singing': 'sing',
    'crying': 'cry',
    'driving': 'drive',
    'cooking': 'cook',
    'laughing': 'laugh',
    'thinking': 'think',
    'sneezing': 'sneeze',
    'throwing': 'throw',
    'talking': 'talk',
    'writing': 'write',
    'standing': 'stand',
    'smiling': 'smile',
    'sleeping': 'sleep',
    'eating': 'eat',
    'screaming': 'scream',
    'smelling': 'smell',
    'insulting': 'insult',
    'coughing': 'cough',
    'joking': 'joke',
    'hugging': 'hug',
    'fighting': 'fight',
    'dreaming': 'dream',
    'painting': 'paint',
    'watching': 'watch',
    'playing': 'play',
    'helping': 'help',
    'teaching': 'teach',
    'building': 'build',
    'cleaning': 'clean',
    'climbing': 'climb',
    'sitting': 'sit',
    'kissing': 'kiss',
    'holding': 'hold',
    'pushing': 'push',
    'pulling': 'pull',
    'turning': 'turn',
    'kicking': 'kick',
    'hitting': 'hit',
    'grabbing': 'grab',
    'stretching': 'strech',
    'jogging': 'jog',
    'whistling': 'whistle',
    'yawning': 'yawn',
    'blinking': 'blink',
    'chewing': 'chew',
    'frowning': 'frown',
    'hopping': 'hop',
    'scratching': 'scratch',
    'shivering': 'shiver',
    'clapping': 'clap',
    'doodling': 'doodle',
    'juggling': 'juggle',
    'stomping': 'stomp',
    'wiggling': 'wiggle',
    'twisting': 'twist',
    'squeezing': 'squeeze',
    'sliding': 'slide',
    'leaping': 'leap',
    'bouncing': 'bounce',
    'twitching': 'twitch',
    'rolling': 'roll',
    'crawling': 'crawl',
    'snapping': 'snap',
    'whispering': 'whisper',
    'staring': 'stare',
    'skipping': 'skip(skipping)',
    'spinning': 'spin',
    'drinking': 'drink',
    'swallowing': 'swallow',
    'gulping': 'gulp',
    'pointing': 'point',
    'giggling': 'giggle',
    'squealing': 'squeal',
    'nodding': 'nod',
    'sighing': 'sigh',
    'stumbling': 'stumble',
    'groaning': 'groan',
    'winking': 'wink',
    'shuddering': 'shudder',
    'shouting': 'shout',
    'sniffing': 'sniff',
    'smirking': 'smirk',
    'shoving': 'shove',
    'snatching': 'snatch',
    'flinching': 'flinch',
    'whimpering': 'whimper',
    'rummaging': 'rummage',
    'wailing': 'wail',
    'blurting': 'blurt',
    'jumping': 'jump',
    'combing': 'comb',
    'brushing': 'brush',
    'sewing': 'sew',
    'texting': 'text',
    'photographing': 'photograph',
    'meditating': 'meditate',
    'hiking': 'hike',
    'arguing': 'argue',
    'debating': 'debate',
    'solving': 'solve',
    'procrastinating': 'procrastinate',
    'falling': 'fall',
    'shopping': 'shop',
    'baking': 'bake',
    'gossiping': 'gossip',
    'showering': 'shower',
    'skiing': 'ski',
    'kneading': 'knead',
    'fishing': 'fish(ing)',
    'lifting': 'lift(ing)',
    'exercising': 'exercising',
    'flirting': 'flirt',
    'traveling': 'travel',
    'camping': 'camping',
    'fainting': 'fainting',
    'napping': 'napping',
    'weightlifting': 'weightlifting',
    'surfing': 'surfing',
    'knitting': 'knitting',
    'yelling': 'yelling',
    'shooting': 'shooting',
    'sipping': 'sipping',
    'smoking': 'smoking',
    'vaping': 'vaping',
    'diving': 'diving',
    'rowing': 'rowing',
    'kayaking': 'kayaking',
    'rock climbing': 'rock climbing',
    'sailing': 'sailing',
    'car racing': 'car racing',
    'mountaineering': 'mountaineering',
    'reading': 'reading',
    'sculpting': 'sculpt',
    'gliding': 'glide',
    'diving': 'dive',
    'prying': 'pry',
    'flattening': 'flatten',
    'trimming': 'trim',
    'dunking': 'dunk',
    'flicking': 'flick',
    'pounding': 'pound',
    'chasing': 'chase',
    'tackling': 'tackle',
    'grating': 'grate',
    'layering': 'layer',
    'blending': 'blend',
    'roasting': 'roast'
  };

  // Check for synonyms
  const normalizedInput = synonyms[input];
  if (normalizedInput) {
    found = brainData.find(
      (item) => {
        const keyword = item.keyword.toLowerCase();
        const cleanKeyword = keyword.replace(/\([^)]*\)/g, '').trim();
        return normalizedInput.toLowerCase() === cleanKeyword || normalizedInput.toLowerCase() === keyword;
      }
    );

    if (found) {
      return {
        found,
        normalized: found.keyword,
        confidence: 'medium',
        brainRegions: found.region || []
      };
    }
  }

  // Partial matching
  found = brainData.find(
    (item) => {
      const keyword = item.keyword.toLowerCase();
      const cleanKeyword = keyword.replace(/\([^)]*\)/g, '').trim();
      return input.includes(cleanKeyword) && cleanKeyword.length > 2;
    }
  );

  if (found) {
    return {
      found,
      normalized: found.keyword,
      confidence: 'low',
      brainRegions: found.region || []
    };
  }

  return {
    found: null,
    normalized: null,
    confidence: 'none',
    brainRegions: []
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userInput } = body;

    if (!userInput || typeof userInput !== "string") {
      return NextResponse.json({
        success: false,
        error: "Missing or invalid userInput"
      }, { status: 400 });
    }

    // Use client-side semantic matching
    const result = findSemanticMatch(userInput);
    
    return NextResponse.json({
      success: true,
      data: {
        original: userInput,
        normalized: result.normalized,
        brainRegions: result.brainRegions,
        confidence: result.confidence
      }
    });

  } catch (error) {
    console.error("Error in semantic matching:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to perform semantic matching",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Health check endpoint - always return healthy since we don't depend on external services
    return NextResponse.json({
      success: true,
      data: {
        status: "healthy",
        service: "client-side semantic matching",
        available: true
      }
    });

  } catch (error) {
    console.error("Error in health check:", error);
    return NextResponse.json({
      success: false,
      error: "Health check failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
