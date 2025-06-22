import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../../lib/database-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userEmail, 
      userName, 
      userMessage, 
      assistantMessage, 
      brainRegions, 
      activityType 
    } = body;

    // Validate required fields
    if (!userEmail || !userName || !userMessage || !assistantMessage || !brainRegions || !activityType) {
      return NextResponse.json({
        success: false,
        error: 'All fields are required'
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email format'
      }, { status: 400 });
    }

    // Validate brain regions
    if (!Array.isArray(brainRegions) || brainRegions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Brain regions must be a non-empty array'
      }, { status: 400 });
    }

    // Valid brain regions
    const validRegions = ['Frontal', 'Parietal', 'Temporal', 'Occipital'];
    const invalidRegions = brainRegions.filter(region => !validRegions.includes(region));
    
    if (invalidRegions.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Invalid brain regions: ${invalidRegions.join(', ')}. Valid regions are: ${validRegions.join(', ')}`
      }, { status: 400 });
    }

    // Create complete chat interaction using DatabaseService
    const result = await DatabaseService.createChatInteraction(
      userEmail,
      userName,
      userMessage,
      assistantMessage,
      brainRegions,
      activityType
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Chat interaction created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating chat interaction:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to create chat interaction',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
