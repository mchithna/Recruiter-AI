import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Input, Textarea, Button, Badge } from '../../components/ui';
import { Save } from 'lucide-react';

export default function CandidateProfile() {
  const [profile, setProfile] = useState({
    fullName: 'Alex Johnson',
    headline: 'Experienced Full-Stack Developer with a passion for building scalable web applications.',
    location: 'San Francisco, CA',
    yearsOfExperience: '5',
    skills: ['React', 'Node.js', 'TypeScript', 'Tailwind CSS', 'PostgreSQL']
  });

  const handleSave = () => {
    console.log('Saved Profile:', profile);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b-2 border-primary-100 pb-3">
        <h1 className="text-h2 text-secondary-900">Candidate Profile</h1>
        <Button variant="primary" onClick={handleSave} leftIcon={<Save size={16} strokeWidth={1.75} />}>
          Save Profile
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            label="Full Name" 
            value={profile.fullName} 
            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} 
          />
          <Input 
            label="Location" 
            value={profile.location} 
            onChange={(e) => setProfile({ ...profile, location: e.target.value })} 
          />
          <Input 
            label="Years of Experience" 
            type="number"
            value={profile.yearsOfExperience} 
            onChange={(e) => setProfile({ ...profile, yearsOfExperience: e.target.value })} 
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Professional Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            label="Headline" 
            value={profile.headline} 
            onChange={(e) => setProfile({ ...profile, headline: e.target.value })} 
            autoResize
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, idx) => (
              <Badge key={idx} variant="secondary">{skill}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
