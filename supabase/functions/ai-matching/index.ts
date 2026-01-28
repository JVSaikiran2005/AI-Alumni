import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface MatchScore {
  alumni_id: string;
  score: number;
  matched_skills: string[];
  matched_interests: string[];
  reasons: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    if (profile?.user_role !== 'student') {
      throw new Error('Only students can generate matches');
    }

    const [studentSkills, studentInterests, allAlumni] = await Promise.all([
      supabase
        .from('user_skills')
        .select('skill_id, skills(name)')
        .eq('user_id', user.id),
      supabase
        .from('interests')
        .select('*')
        .eq('user_id', user.id),
      supabase
        .from('profiles')
        .select('id, full_name, user_details(*)')
        .eq('user_role', 'alumni')
        .eq('is_verified', true),
    ]);

    if (!allAlumni.data || allAlumni.data.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No verified alumni available', matches: [] }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const studentSkillNames = studentSkills.data?.map((s: any) => s.skills.name) || [];
    const studentDomains = studentInterests.data?.map((i: any) => i.domain) || [];

    const matches: MatchScore[] = [];

    for (const alumni of allAlumni.data) {
      if (!alumni.user_details || !alumni.user_details.available_for_mentorship) {
        continue;
      }

      const { data: alumniSkills } = await supabase
        .from('user_skills')
        .select('skill_id, skills(name)')
        .eq('user_id', alumni.id);

      const alumniSkillNames = alumniSkills?.map((s: any) => s.skills.name) || [];

      const matchedSkills = studentSkillNames.filter((skill: string) =>
        alumniSkillNames.includes(skill)
      );

      const skillScore = matchedSkills.length / Math.max(studentSkillNames.length, 1);

      const { data: alumniInterests } = await supabase
        .from('interests')
        .select('*')
        .eq('user_id', alumni.id);

      const alumniDomains = alumniInterests?.map((i: any) => i.domain) || [];
      const matchedInterests = studentDomains.filter((domain: string) =>
        alumniDomains.includes(domain)
      );

      const interestScore = matchedInterests.length / Math.max(studentDomains.length, 1);

      const finalScore = (skillScore * 0.6 + interestScore * 0.4);

      if (finalScore > 0.2) {
        const reasons = [];
        if (matchedSkills.length > 0) {
          reasons.push(`${matchedSkills.length} matching skills`);
        }
        if (matchedInterests.length > 0) {
          reasons.push(`${matchedInterests.length} matching career interests`);
        }
        if (alumni.user_details.current_company) {
          reasons.push(`Works at ${alumni.user_details.current_company}`);
        }

        matches.push({
          alumni_id: alumni.id,
          score: Math.min(finalScore, 1),
          matched_skills: matchedSkills,
          matched_interests: matchedInterests,
          reasons,
        });
      }
    }

    matches.sort((a, b) => b.score - a.score);
    const topMatches = matches.slice(0, 10);

    for (const match of topMatches) {
      await supabase
        .from('ai_matches')
        .upsert({
          student_id: user.id,
          alumni_id: match.alumni_id,
          match_score: match.score,
          match_reasons: match.reasons,
          matched_skills: match.matched_skills,
          matched_interests: match.matched_interests,
          is_active: true,
        }, {
          onConflict: 'student_id,alumni_id',
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        matches_generated: topMatches.length,
        matches: topMatches,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('AI Matching Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
