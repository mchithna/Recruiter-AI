import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Input, 
  Textarea, 
  Spinner
} from '../../components/ui';
import { Sparkles, Plus, Trash2, Edit2, Check, X, MapPin, Briefcase, GraduationCap } from 'lucide-react';
import { getMyProfile, updateMyProfile } from './services/mockData';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit states for lists
  const [editingEducation, setEditingEducation] = useState(null);
  const [editingExperience, setEditingExperience] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const data = await getMyProfile();
    setProfile(data);
    setLoading(false);
  };

  const handleBasicInfoChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveBasicInfo = async () => {
    await updateMyProfile({
      summaryText: profile.summaryText,
      portfolioUrl: profile.portfolioUrl,
      linkedinUrl: profile.linkedinUrl,
      githubUrl: profile.githubUrl,
      locationCity: profile.locationCity,
      locationCountry: profile.locationCountry,
      yearsOfExperience: profile.yearsOfExperience,
    });
  };

  const handleRemoveSkill = async (skill) => {
    if (skill.extractedByAi) {
      if (!window.confirm('This skill was extracted from your resume by AI. Are you sure you want to remove it?')) return;
    }
    const updatedSkills = profile.skills.filter(s => s.id !== skill.id);
    setProfile(prev => ({ ...prev, skills: updatedSkills }));
    await updateMyProfile({ skills: updatedSkills });
  };

  const handleAddSkill = async () => {
    const name = window.prompt("Enter skill name:");
    if (!name) return;
    const newSkill = { id: Date.now().toString(), name, proficiencyLevel: 'Intermediate', extractedByAi: false };
    const updatedSkills = [...profile.skills, newSkill];
    setProfile(prev => ({ ...prev, skills: updatedSkills }));
    await updateMyProfile({ skills: updatedSkills });
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 pb-16">
      {/* Profile Header (ID Card aesthetic) */}
      <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/75 p-8 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-secondary-950/55 dark:shadow-glass-dark">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary-500/10 to-ai-500/10 opacity-50 dark:from-primary-500/20 dark:to-ai-500/20 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-h2 text-white shadow-glow-primary">
            {profile.firstName[0]}{profile.lastName[0]}
          </div>
          <div>
            <h2 className="text-h2 text-secondary-900 dark:text-white">{profile.firstName} {profile.lastName}</h2>
            <p className="text-body-sm text-secondary-500 dark:text-secondary-400">{profile.email} • {profile.locationCity}, {profile.locationCountry}</p>
          </div>
        </div>
      </div>

      {/* Basic Info Section */}
      <section className="space-y-6">
        <h3 className="text-h3 text-secondary-900 dark:text-white">Basic Information</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="col-span-1 md:col-span-2">
            <Textarea 
              label="Professional Summary" 
              value={profile.summaryText || ''} 
              onChange={(e) => handleBasicInfoChange('summaryText', e.target.value)}
              onBlur={handleSaveBasicInfo}
              rows={4}
            />
          </div>
          <Input 
            label="Location (City)" 
            value={profile.locationCity || ''} 
            onChange={(e) => handleBasicInfoChange('locationCity', e.target.value)}
            onBlur={handleSaveBasicInfo}
          />
          <Input 
            label="Location (Country)" 
            value={profile.locationCountry || ''} 
            onChange={(e) => handleBasicInfoChange('locationCountry', e.target.value)}
            onBlur={handleSaveBasicInfo}
          />
          <Input 
            label="Years of Experience" 
            type="number"
            value={profile.yearsOfExperience || ''} 
            onChange={(e) => handleBasicInfoChange('yearsOfExperience', e.target.value)}
            onBlur={handleSaveBasicInfo}
          />
          <Input 
            label="Portfolio URL" 
            value={profile.portfolioUrl || ''} 
            onChange={(e) => handleBasicInfoChange('portfolioUrl', e.target.value)}
            onBlur={handleSaveBasicInfo}
          />
          <Input 
            label="LinkedIn URL" 
            value={profile.linkedinUrl || ''} 
            onChange={(e) => handleBasicInfoChange('linkedinUrl', e.target.value)}
            onBlur={handleSaveBasicInfo}
          />
          <Input 
            label="GitHub URL" 
            value={profile.githubUrl || ''} 
            onChange={(e) => handleBasicInfoChange('githubUrl', e.target.value)}
            onBlur={handleSaveBasicInfo}
          />
        </div>
      </section>

      {/* Skills Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-h3 text-secondary-900 dark:text-white">Skills</h3>
          <Button variant="outline" size="sm" leftIcon={<Plus size={16} />} onClick={handleAddSkill}>Add Skill</Button>
        </div>
        <div className="flex flex-wrap gap-3">
          {profile.skills.map(skill => (
            <div 
              key={skill.id} 
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-body-sm font-medium border ${
                skill.extractedByAi 
                  ? 'border-ai-200 bg-ai-50 text-ai-700 dark:border-ai-500/30 dark:bg-ai-500/10 dark:text-ai-300 shadow-glow-sm-ai' 
                  : 'border-white/60 bg-white/70 text-secondary-700 dark:border-white/10 dark:bg-secondary-900/50 dark:text-secondary-300'
              } backdrop-blur-md`}
            >
              {skill.extractedByAi && <Sparkles size={14} className="text-ai-500" />}
              <span>{skill.name}</span>
              <span className="opacity-60 text-xs px-2">({skill.proficiencyLevel})</span>
              <button 
                onClick={() => handleRemoveSkill(skill)}
                className="ml-1 rounded-full p-0.5 transition-colors hover:bg-secondary-900/10 dark:hover:bg-white/10"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Experience Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-h3 text-secondary-900 dark:text-white">Work Experience</h3>
          <Button variant="outline" size="sm" leftIcon={<Plus size={16} />} onClick={() => setEditingExperience({})}>Add Experience</Button>
        </div>
        
        <div className="space-y-4">
          {editingExperience && (
             <div className="rounded-2xl border border-primary-200 bg-primary-50/50 p-6 dark:border-primary-900/30 dark:bg-primary-950/20">
               <h4 className="text-body-sm font-semibold mb-4 text-primary-700 dark:text-primary-300">Edit Experience</h4>
               {/* Quick inline form placeholder for simplicity */}
               <div className="grid grid-cols-2 gap-4 mb-4">
                 <Input label="Company Name" defaultValue={editingExperience.companyName} />
                 <Input label="Job Title" defaultValue={editingExperience.jobTitle} />
               </div>
               <div className="flex gap-2">
                 <Button size="sm" onClick={() => setEditingExperience(null)}>Cancel</Button>
                 <Button size="sm" variant="primary">Save</Button>
               </div>
             </div>
          )}

          {profile.experience.map(exp => (
            <div key={exp.id} className="group relative flex justify-between overflow-hidden rounded-2xl border border-white/60 bg-white/75 p-6 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-secondary-950/55 dark:shadow-glass-dark">
              <div>
                <h4 className="text-body font-semibold text-secondary-900 dark:text-white">{exp.jobTitle}</h4>
                <p className="text-body-sm text-secondary-600 dark:text-secondary-400 flex items-center gap-2 mt-1">
                  <Briefcase size={14} /> {exp.companyName}
                  <span className="opacity-50">•</span>
                  <MapPin size={14} /> {exp.location}
                </p>
                <p className="text-caption text-secondary-500 dark:text-secondary-500 mt-2">
                  {exp.startDate} - {exp.endDate}
                </p>
                {exp.description && <p className="mt-3 text-body-sm text-secondary-700 dark:text-secondary-300">{exp.description}</p>}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" onClick={() => setEditingExperience(exp)}>
                  <Edit2 size={16} />
                </Button>
                <Button size="icon" variant="ghost" className="text-red-500">
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-h3 text-secondary-900 dark:text-white">Education</h3>
          <Button variant="outline" size="sm" leftIcon={<Plus size={16} />}>Add Education</Button>
        </div>
        <div className="space-y-4">
          {profile.education.map(edu => (
            <div key={edu.id} className="group relative flex justify-between overflow-hidden rounded-2xl border border-white/60 bg-white/75 p-6 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-secondary-950/55 dark:shadow-glass-dark">
              <div>
                <h4 className="text-body font-semibold text-secondary-900 dark:text-white">{edu.degree} in {edu.fieldOfStudy}</h4>
                <p className="text-body-sm text-secondary-600 dark:text-secondary-400 flex items-center gap-2 mt-1">
                  <GraduationCap size={14} /> {edu.institutionName}
                </p>
                <p className="text-caption text-secondary-500 dark:text-secondary-500 mt-2">
                  {edu.startDate} - {edu.endDate} {edu.grade && `• Grade: ${edu.grade}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
