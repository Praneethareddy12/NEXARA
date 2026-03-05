import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

export default function SkillRadar({ skills }) {
  const data = Object.entries(skills || {}).map(([skill, level]) => ({
    skill: skill.charAt(0).toUpperCase() + skill.slice(1).replace(/_/g, ' '),
    level: level,
    fullMark: 100
  }));

  return (
    <Card className="shadow-lg border-none">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Skill Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis 
              dataKey="skill" 
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
            <Radar 
              name="Skill Level" 
              dataKey="level" 
              stroke="#8b5cf6" 
              fill="#8b5cf6" 
              fillOpacity={0.6} 
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}