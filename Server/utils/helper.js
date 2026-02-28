export function cleanGeminiResponse(rawResponse) {
  try {
    // Remove any markdown code blocks
    let cleaned = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Remove any leading text before the JSON (like "Generated Questions:")
    const jsonStart = cleaned.indexOf('[');
    const jsonEnd = cleaned.lastIndexOf(']') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No JSON array found in response');
    }
    
    cleaned = cleaned.substring(jsonStart, jsonEnd);
    
    // Parse the JSON
    const questions = JSON.parse(cleaned);
    
    // Validate the structure
    if (!Array.isArray(questions)) {
      throw new Error('Response is not an array');
    }
    
    // Validate each question has required fields
    const validatedQuestions = questions.map((q, index) => {
      if (!q.type || !q.difficulty || !q.question || !q.correctAnswer) {
        throw new Error(`Question at index ${index} is missing required fields`);
      }
      
      // Ensure MCQ has options
      if (q.type === 'MCQ' && (!q.options || !Array.isArray(q.options))) {
        throw new Error(`MCQ at index ${index} is missing options array`);
      }
      
      return q;
    });
    
    return validatedQuestions;
    
  } catch (error) {
    console.error('Error cleaning Gemini response:', error);
    throw new Error(`Failed to parse Gemini response: ${error.message}`);
  }
}
