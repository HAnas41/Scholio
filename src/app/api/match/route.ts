import { NextResponse } from 'next/server';
import { degreeMatch, fieldMatch, filterScholarships, minRequirementCheck, provinceMatch } from '@/lib/matching';
import { rankScholarships, generateScholarshipExplanation } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { studentProfile, scholarships } = await req.json();

    if(!studentProfile?.currentStatus || !studentProfile?.matricObtainedMarks) {
      return NextResponse.json({error:'Please complete your profile'},{status:400});
    }
    if(!studentProfile.isPakistanResident) {
      return NextResponse.json({error:'Only Pakistani residents eligible',matches:[]});
    }
    
    const filtered = filterScholarships(studentProfile, scholarships);
    if(!filtered.length) return NextResponse.json({matches: [], message: 'No matching scholarships found'});
    
    let ranked: any[] = [];
    try { 
      ranked = await rankScholarships(studentProfile, filtered); 
    } 
    catch (e) {
      console.error('[match API] Gemini ranking failed, using rule-based fallback:', e);
      const getFallbackScore = (scholarship: any) => {
        let score = 50;

        if (minRequirementCheck(studentProfile, scholarship)) score += 20;
        if (fieldMatch(studentProfile, scholarship)) score += 10;
        if (degreeMatch(studentProfile, scholarship)) score += 10;
        if (provinceMatch(studentProfile, scholarship)) score += 5;

        const deadlineDate = scholarship?.deadline ? new Date(scholarship.deadline) : null;
        if (deadlineDate && !Number.isNaN(deadlineDate.getTime())) {
          const now = new Date();
          const diffDays = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          if (diffDays > 30) score += 5;
        }

        return Math.round(Math.min(100, Math.max(50, score)));
      };

      ranked = await Promise.all(
        filtered.map(async s => {
          let explanation = 'Rule-based match';
          try {
            explanation = await generateScholarshipExplanation(studentProfile, s as any);
          } catch (explanationError) {
            console.error('[match API] Gemini explanation failed, using rule-based text:', explanationError);
          }
          return { scholarship_id: s.id, match_score: getFallbackScore(s), explanation };
        })
      );
      ranked.sort((a, b) => b.match_score - a.match_score);
    }
    
    const final = ranked.map(r => ({...r, scholarship: filtered.find((s:any)=>s.id===r.scholarship_id)})).filter(x=>x.scholarship).sort((a,b)=>b.match_score - a.match_score);
    return NextResponse.json({matches: final});
  } catch (error: any) {
    return NextResponse.json({ error: 'Matching service unavailable' }, { status: 500 });
  }
}
