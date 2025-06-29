import { NextRequest, NextResponse } from "next/server";

const OLLAMA_SERVICE_URL = process.env.OLLAMA_SERVICE_URL || "http://localhost:5000";

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

    // Call the Python Ollama service
    const response = await fetch(`${OLLAMA_SERVICE_URL}/normalize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: userInput }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({
        success: false,
        error: errorData.error || "Semantic matching failed",
        details: errorData
      }, { status: response.status });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: {
        original: data.original,
        normalized: data.normalized,
        brainRegions: data.brain_regions,
        confidence: data.confidence
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
    // Health check endpoint
    const response = await fetch(`${OLLAMA_SERVICE_URL}/health`);
    
    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: "Ollama service is not available"
      }, { status: 503 });
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error("Error checking Ollama service health:", error);
    return NextResponse.json({
      success: false,
      error: "Ollama service is not available",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 503 });
  }
}
