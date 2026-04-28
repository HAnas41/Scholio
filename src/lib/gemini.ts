import { GoogleGenAI, Type } from "@google/genai";
import { StudentProfile, Scholarship, MatchResult } from "@/types";

const DEFAULT_MODEL = "gemini-2.5-flash";

let ai: GoogleGenAI | undefined;

function buildStudentSummary(student: StudentProfile): string {
  const latest =
    student.educationHistory?.length > 0
      ? student.educationHistory[student.educationHistory.length - 1]
      : undefined;
  const degree =
    student.degreePreference ||
    latest?.degreeLevel ||
    student.currentStatus ||
    "";
  const field =
    student.fieldOfStudy ||
    student.fieldPreference ||
    latest?.fieldOfStudy ||
    "";
  return [
    `Name: ${student.name}`,
    `Degree / status: ${degree}`,
    `Field: ${field}`,
    `CGPA: ${student.cgpaOrMarks ?? ""}`,
    `Matric marks: ${student.matricMarks ?? ""}`,
    `Province: ${student.province}`,
    `University: ${student.currentUniversity ?? latest?.universityName ?? ""}`,
  ].join(", ");
}

export const rankScholarships = async (
  student: StudentProfile,
  scholarships: Scholarship[]
): Promise<MatchResult[]> => {
  const apiKey = process.env.GEMINI_API_KEY?.replace(/^["']|["']$/g, "").trim();
  if (!apiKey) {
    console.error(
      "[Gemini] GEMINI_API_KEY is missing or empty. Set it in .env.local (Google AI Studio: https://aistudio.google.com/apikey)."
    );
    throw new Error("GEMINI_API_KEY is not configured");
  }

  if (!ai) {
    ai = new GoogleGenAI({ apiKey });
  }

  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  const studentSummary = buildStudentSummary(student);
  const prompt = `You are a scholarship advisor for Pakistani students. Rank these scholarships for this student:
STUDENT: ${studentSummary}
SCHOLARSHIPS: ${JSON.stringify(scholarships)}
Score 0-100 on degree fit (30%), field relevance (25%), CGPA competitiveness (25%), match quality (20%).
IMPORTANT: Be consistent. Same student profile should always get the same score. Do not randomize.
Respond ONLY with a JSON array like: [{"scholarship_id":"id","match_score":85,"explanation":"string"}]. Sort by match_score desc.`;

  try {
    const res = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.1,
        topK: 1,
        topP: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              scholarship_id: { type: Type.STRING },
              match_score: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
            },
            required: ["scholarship_id", "match_score", "explanation"],
          },
        },
      },
    });

    const text = res.text;
    if (!text?.trim()) {
      console.error("[Gemini] Empty response body", {
        modelVersion: res.modelVersion,
        promptFeedback: res.promptFeedback,
      });
      throw new Error("Empty Gemini response");
    }

    const parsed = JSON.parse(text) as MatchResult[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("Gemini returned no ranking rows");
    }
    return parsed;
  } catch (err) {
    console.error("[Gemini] Error:", err);
    throw err;
  }
};

export const generateScholarshipExplanation = async (
  student: StudentProfile,
  scholarship: Scholarship
): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY?.replace(/^["']|["']$/g, "").trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  if (!ai) {
    ai = new GoogleGenAI({ apiKey });
  }

  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  const latest =
    student.educationHistory?.length > 0
      ? student.educationHistory[student.educationHistory.length - 1]
      : undefined;
  const marksPercentage =
    student.matricTotalMarks && student.matricObtainedMarks
      ? ((Number(student.matricObtainedMarks) / Number(student.matricTotalMarks)) * 100).toFixed(1)
      : "";

  const prompt = `You are helping a student understand scholarship fit.
Write 2-3 short sentences in simple English explaining why this scholarship matches this student.
Do not use bullet points. Be specific and practical.

Student profile:
- CGPA: ${student.cgpaOrMarks ?? ""}
- Field: ${student.fieldOfStudy || student.fieldPreference || latest?.fieldOfStudy || ""}
- Degree level: ${student.degreePreference || latest?.degreeLevel || student.currentStatus || ""}
- Province: ${student.province || ""}
- Marks percentage: ${marksPercentage}

Scholarship requirements:
- Minimum CGPA/marks: ${scholarship.minimumType || ""} ${scholarship.minimumValue ?? ""}
- Required field: ${scholarship.fieldRequired || ""}
- Scholarship type: ${(scholarship as any).type || ""}
- Eligible provinces: ${Array.isArray(scholarship.eligibleProvinces) ? scholarship.eligibleProvinces.join(", ") : ""}
`;

  const res = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      temperature: 0.2,
      topK: 1,
      topP: 0.1,
    },
  });

  const text = res.text?.trim();
  if (!text) {
    throw new Error("Empty Gemini explanation response");
  }
  return text;
};
