import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyB_9zYrw53BwNqoSxa-Cv6TeCIAaRAMKYY';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export interface CandidateSummary {
  overallAssessment: string;
  keyStrengths: string[];
  areasOfConcern: string[];
  technicalSkills: string[];
  softSkills: string[];
  recommendation: 'Strong Hire' | 'Hire' | 'Maybe' | 'No Hire';
  confidenceScore: number;
  nextSteps: string[];
}

export class GeminiService {
  private model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    }
  });

  async generateCandidateSummary(
    candidateName: string,
    role: string,
    notes: string[]
  ): Promise<CandidateSummary> {
    try {
      console.log('Starting AI summary generation for:', candidateName);
      console.log('Using API Key (first 10 chars):', GEMINI_API_KEY.substring(0, 10) + '...');
      
      const combinedNotes = notes.join('\n\n');
      
      const prompt = `
        As an AI hiring assistant, analyze the following candidate interview notes and provide a comprehensive summary.
        
        Candidate: ${candidateName}
        Role: ${role}
        
        Interview Notes:
        ${combinedNotes}
        
        Please provide a structured analysis in the following JSON format:
        {
          "overallAssessment": "A 2-3 sentence overall assessment of the candidate",
          "keyStrengths": ["strength1", "strength2", "strength3"],
          "areasOfConcern": ["concern1", "concern2"],
          "technicalSkills": ["skill1", "skill2", "skill3"],
          "softSkills": ["skill1", "skill2", "skill3"],
          "recommendation": "Strong Hire|Hire|Maybe|No Hire",
          "confidenceScore": 85,
          "nextSteps": ["next step 1", "next step 2"]
        }
        
        Base your analysis on:
        - Technical competency mentioned in notes
        - Communication skills
        - Problem-solving ability
        - Cultural fit indicators
        - Experience relevance
        - Any red flags or concerns
        
        Be objective and professional. If information is limited, acknowledge this in your assessment.
        
        Return only valid JSON without any markdown formatting or code blocks.
      `;

      console.log('Sending request to Gemini API...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('Gemini API Response:', text); 

      let cleanedText = text.trim();
      
      cleanedText = cleanedText.replace(/```json\s*/g, '');
      cleanedText = cleanedText.replace(/```\s*/g, '');
      
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in response:', cleanedText);
        throw new Error('Invalid response format from AI');
      }

      const summary: CandidateSummary = JSON.parse(jsonMatch[0]);
      
      if (!summary.overallAssessment || !summary.recommendation) {
        throw new Error('Missing required fields in AI response');
      }
      
      console.log('Successfully parsed AI summary');
      return summary;
    } catch (error: any) {
      console.error('Error generating candidate summary:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        name: error.name
      });
      
      if (error.message?.includes('404') || error.status === 404) {
        console.error('API endpoint not found - may need to enable Gemini API or check model availability');
      }
      
      return {
        overallAssessment: `Unable to generate AI summary for ${candidateName} at this time. ${error.message || 'The AI service encountered an error'}. Please review the notes manually or try again later.`,
        keyStrengths: ['Manual review required - AI analysis unavailable'],
        areasOfConcern: ['AI analysis failed - please review notes manually'],
        technicalSkills: [],
        softSkills: [],
        recommendation: 'Maybe',
        confidenceScore: 0,
        nextSteps: [
          'Manual review of interview notes recommended',
          'Check if Gemini API is properly enabled in Google Cloud Console',
          'Verify API key permissions and quotas',
          'Consider re-running AI analysis later'
        ]
      };
    }
  }

  async generateFollowUpQuestions(
    candidateName: string,
    role: string,
    notes: string[]
  ): Promise<string[]> {
    try {
      const combinedNotes = notes.join('\n\n');
      
      const prompt = `
        Based on the following interview notes for ${candidateName} applying for ${role}, 
        suggest 5 insightful follow-up questions that would help better evaluate this candidate.
        
        Notes:
        ${combinedNotes}
        
        Focus on:
        - Areas not yet thoroughly explored
        - Clarifying technical competencies
        - Understanding cultural fit
        - Assessing problem-solving approach
        
        Return only a JSON array of questions without any markdown formatting:
        ["question1", "question2", "question3", "question4", "question5"]
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      let cleanedText = text.trim();
      cleanedText = cleanedText.replace(/```json\s*/g, '');
      cleanedText = cleanedText.replace(/```\s*/g, '');

      const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        return ['Unable to generate follow-up questions at this time.'];
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error generating follow-up questions:', error);
      return ['Unable to generate follow-up questions at this time.'];
    }
  }
}

export const geminiService = new GeminiService(); 