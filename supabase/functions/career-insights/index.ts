import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface CareerTrend {
  skill: string;
  demand: number;
  growth_rate: number;
  avg_salary: number;
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

    const { data: userSkills } = await supabase
      .from('user_skills')
      .select('skills(name, category)')
      .eq('user_id', user.id);

    const { data: allJobs } = await supabase
      .from('job_postings')
      .select('required_skills, salary_range, company')
      .eq('is_active', true);

    const skillDemand: Record<string, { count: number, companies: Set<string> }> = {};
    const salaryData: Record<string, number[]> = {};

    allJobs?.forEach((job) => {
      if (job.required_skills) {
        job.required_skills.forEach((skill: string) => {
          if (!skillDemand[skill]) {
            skillDemand[skill] = { count: 0, companies: new Set() };
          }
          skillDemand[skill].count++;
          if (job.company) {
            skillDemand[skill].companies.add(job.company);
          }
        });
      }
    });

    const trendingSkills = Object.entries(skillDemand)
      .map(([skill, data]) => ({
        skill,
        demand: data.count,
        companies: Array.from(data.companies),
        growth_rate: Math.random() * 50 + 10,
      }))
      .sort((a, b) => b.demand - a.demand)
      .slice(0, 10);

    const personalizedInsights = userSkills?.map((us: any) => {
      const skill = us.skills.name;
      const demandInfo = skillDemand[skill];
      return {
        skill,
        category: us.skills.category,
        demand_level: demandInfo ? 'High' : 'Medium',
        job_count: demandInfo?.count || 0,
        recommendation: demandInfo
          ? 'In high demand - consider showcasing this skill'
          : 'Consider combining with trending skills',
      };
    }) || [];

    const { data: alumniByCompany } = await supabase
      .from('user_details')
      .select('current_company')
      .not('current_company', 'is', null);

    const companyCounts: Record<string, number> = {};
    alumniByCompany?.forEach((a) => {
      if (a.current_company) {
        companyCounts[a.current_company] = (companyCounts[a.current_company] || 0) + 1;
      }
    });

    const topCompanies = Object.entries(companyCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([company, count]) => ({ company, alumni_count: count }));

    const careerPaths = [
      {
        path: 'Software Engineering',
        avg_salary: '120000',
        demand: 'Very High',
        skills_needed: ['JavaScript', 'React', 'Node.js', 'System Design'],
        time_to_proficiency: '6-12 months',
      },
      {
        path: 'Data Science',
        avg_salary: '130000',
        demand: 'High',
        skills_needed: ['Python', 'Machine Learning', 'SQL', 'Statistics'],
        time_to_proficiency: '8-14 months',
      },
      {
        path: 'Product Management',
        avg_salary: '140000',
        demand: 'High',
        skills_needed: ['User Research', 'Analytics', 'Strategy', 'Communication'],
        time_to_proficiency: '12-18 months',
      },
    ];

    return new Response(
      JSON.stringify({
        trending_skills: trendingSkills,
        personalized_insights: personalizedInsights,
        top_companies: topCompanies,
        career_paths: careerPaths,
        market_summary: {
          total_active_jobs: allJobs?.length || 0,
          most_in_demand: trendingSkills[0]?.skill || 'N/A',
          avg_growth_rate: '35%',
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Career Insights Error:', error);
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
