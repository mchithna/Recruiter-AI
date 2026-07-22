import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Input, 
  Textarea, 
  Spinner,
  ProgressBar,
  Modal,
  useConfirmDialog
} from '../../components/ui';
import { Sparkles, Plus, Trash2, Edit2, X, MapPin, Briefcase, GraduationCap, RefreshCw, AlertCircle, CheckCircle2, FileText, Lightbulb } from 'lucide-react';
import { 
  candidateAiApi, 
  getMyProfile, 
  updateMyProfile,
  addProfileSkill,
  deleteProfileSkill,
  addProfileExperience,
  updateProfileExperience,
  deleteProfileExperience,
  addProfileEducation,
  updateProfileEducation,
  deleteProfileEducation
} from './services/candidateApi';
import { useToast } from '../../lib/ToastContext';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  // Edit states for lists
  const [editingEducation, setEditingEducation] = useState(null);
  const [editingExperience, setEditingExperience] = useState(null);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);

  const { toast } = useToast();
  const { confirm, dialog: confirmDialog } = useConfirmDialog();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile(true);
  }, []);

  const loadProfile = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    const data = await getMyProfile();
    setProfile(data);
    setLoading(false);
  };

  const handleBasicInfoChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveBasicInfo = async () => {
    setSaving(true);
    try {
      await updateMyProfile({
        summaryText: profile.summaryText,
        portfolioUrl: profile.portfolioUrl,
        linkedinUrl: profile.linkedinUrl,
        githubUrl: profile.githubUrl,
        locationCity: profile.locationCity,
        yearsOfExperience: profile.yearsOfExperience ? parseInt(profile.yearsOfExperience, 10) : null,
      });
      try { toast({ title: 'Profile saved successfully.', variant: 'success' }); } catch(e) {}
    } catch (err) {
      try { toast({ title: 'Failed to save profile.', variant: 'danger' }); } catch(e) {}
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyzeProfile = async () => {
    setAnalysisLoading(true);
    setAnalysisError('');
    try {
      const data = await candidateAiApi.analyzeProfile();
      setAnalysis(data);
    } catch (err) {
      setAnalysisError(err?.response?.data?.message || 'Unable to analyze your profile right now.');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleRemoveSkill = async (skill) => {
    if (skill.extractedByAi) {
      const confirmed = await confirm({
        title: 'Remove AI extracted skill?',
        description: 'This skill was extracted from your resume by AI. Removing it may affect profile matching until you add it again.',
        confirmLabel: 'Remove Skill',
        variant: 'warning',
        details: skill.name,
      });
      if (!confirmed) return;
    }
    try {
      await deleteProfileSkill(skill.id);
      await loadProfile();
    } catch (e) {
      toast({ title: 'Failed to remove skill', variant: 'danger' });
    }
  };

  const handleAddSkillSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const skillData = {
      name: formData.get('name'),
      proficiencyLevel: formData.get('proficiencyLevel') || 'Intermediate',
      yearsOfExperience: parseInt(formData.get('yearsOfExperience')) || null
    };
    try {
      await addProfileSkill(skillData);
      setIsSkillModalOpen(false);
      await loadProfile();
      toast({ title: 'Skill added', variant: 'success' });
    } catch (err) {
      toast({ title: err?.response?.data?.message || 'Failed to add skill', variant: 'danger' });
    }
  };

  const handleSaveExperience = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const expData = {
      companyName: formData.get('companyName'),
      jobTitle: formData.get('jobTitle'),
      location: formData.get('location'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate') || null,
      isCurrent: formData.get('isCurrent') === 'on',
      description: formData.get('description')
    };

    try {
      if (editingExperience?.id) {
        await updateProfileExperience(editingExperience.id, expData);
      } else {
        await addProfileExperience(expData);
      }
      setIsExperienceModalOpen(false);
      setEditingExperience(null);
      await loadProfile();
      toast({ title: 'Experience saved', variant: 'success' });
    } catch (err) {
      toast({ title: err?.response?.data?.message || 'Failed to save experience', variant: 'danger' });
    }
  };

  const handleDeleteExperience = async (id) => {
    const confirmed = await confirm({
      title: 'Delete experience?',
      description: 'This work experience will be removed from your candidate profile.',
      confirmLabel: 'Delete Experience',
      variant: 'danger',
    });
    if (!confirmed) return;
    try {
      await deleteProfileExperience(id);
      await loadProfile();
      toast({ title: 'Experience deleted', variant: 'success' });
    } catch (err) {
      toast({ title: 'Failed to delete experience', variant: 'danger' });
    }
  };

  const handleSaveEducation = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const eduData = {
      institutionName: formData.get('institutionName'),
      degree: formData.get('degree'),
      fieldOfStudy: formData.get('fieldOfStudy'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate') || null,
      isCurrent: formData.get('isCurrent') === 'on',
      grade: formData.get('grade')
    };

    try {
      if (editingEducation?.id) {
        await updateProfileEducation(editingEducation.id, eduData);
      } else {
        await addProfileEducation(eduData);
      }
      setIsEducationModalOpen(false);
      setEditingEducation(null);
      await loadProfile();
      toast({ title: 'Education saved', variant: 'success' });
    } catch (err) {
      toast({ title: err?.response?.data?.message || 'Failed to save education', variant: 'danger' });
    }
  };

  const handleDeleteEducation = async (id) => {
    const confirmed = await confirm({
      title: 'Delete education?',
      description: 'This education record will be removed from your candidate profile.',
      confirmLabel: 'Delete Education',
      variant: 'danger',
    });
    if (!confirmed) return;
    try {
      await deleteProfileEducation(id);
      await loadProfile();
      toast({ title: 'Education deleted', variant: 'success' });
    } catch (err) {
      toast({ title: 'Failed to delete education', variant: 'danger' });
    }
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
            <p className="text-body-sm text-secondary-500 dark:text-secondary-400">{profile.email} â€¢ {profile.locationCity}, {profile.locationCountry}</p>
          </div>
        </div>
      </div>

      {/* Basic Info Section */}
      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-h3 text-secondary-900 dark:text-white">Profile and Resume Analysis</h3>
          <Button type="button" onClick={handleAnalyzeProfile} disabled={analysisLoading} leftIcon={analysisLoading ? <Spinner size="sm" /> : <Sparkles size={16} />}>
            Analyze Profile
          </Button>
        </div>
        <div className="rounded-2xl border border-white/60 bg-white/75 p-6 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-secondary-950/55 dark:shadow-glass-dark">
          {analysisError ? (
            <div className="flex flex-col gap-3 text-body-sm text-red-700 dark:text-red-200 sm:flex-row sm:items-center sm:justify-between">
              <span>{analysisError}</span>
              <Button type="button" size="sm" variant="outline" onClick={handleAnalyzeProfile} leftIcon={<RefreshCw size={14} />}>Retry</Button>
            </div>
          ) : analysis?.result ? (
            <AnalysisResult analysis={analysis} />
          ) : (
            <p className="text-body-sm text-secondary-500 dark:text-secondary-400">
              Run analysis to review completeness, missing information, extracted skills, education, experience, projects, certifications, and improvement suggestions.
            </p>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-h3 text-secondary-900 dark:text-white">Basic Information</h3>
          <Button type="button" onClick={handleSaveBasicInfo} disabled={saving} isLoading={saving} variant="primary">
            Save Changes
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="col-span-1 md:col-span-2">
            <Textarea 
              label="Professional Summary" 
              value={profile.summaryText || ''} 
              onChange={(e) => handleBasicInfoChange('summaryText', e.target.value)}
              rows={4}
            />
          </div>
          <Input 
            label="Location (City)" 
            value={profile.locationCity || ''} 
            onChange={(e) => handleBasicInfoChange('locationCity', e.target.value)}
          />
          <Input 
            label="Location (Country)" 
            value={profile.locationCountry || ''} 
            onChange={(e) => handleBasicInfoChange('locationCountry', e.target.value)}
          />
          <Input 
            label="Years of Experience" 
            type="number"
            value={profile.yearsOfExperience || ''} 
            onChange={(e) => handleBasicInfoChange('yearsOfExperience', e.target.value)}
          />
          <Input 
            label="Portfolio URL" 
            value={profile.portfolioUrl || ''} 
            onChange={(e) => handleBasicInfoChange('portfolioUrl', e.target.value)}
          />
          <Input 
            label="LinkedIn URL" 
            value={profile.linkedinUrl || ''} 
            onChange={(e) => handleBasicInfoChange('linkedinUrl', e.target.value)}
          />
          <Input 
            label="GitHub URL" 
            value={profile.githubUrl || ''} 
            onChange={(e) => handleBasicInfoChange('githubUrl', e.target.value)}
          />
        </div>
      </section>

      {/* Skills Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-h3 text-secondary-900 dark:text-white">Skills</h3>
          <Button variant="outline" size="sm" leftIcon={<Plus size={16} />} onClick={() => setIsSkillModalOpen(true)}>Add Skill</Button>
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
          <Button variant="outline" size="sm" leftIcon={<Plus size={16} />} onClick={() => { setEditingExperience({}); setIsExperienceModalOpen(true); }}>Add Experience</Button>
        </div>
        
        <div className="space-y-4">
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
                <Button size="icon" variant="ghost" onClick={() => { setEditingExperience(exp); setIsExperienceModalOpen(true); }}>
                  <Edit2 size={16} />
                </Button>
                <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDeleteExperience(exp.id)}>
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
          <Button variant="outline" size="sm" leftIcon={<Plus size={16} />} onClick={() => { setEditingEducation({}); setIsEducationModalOpen(true); }}>Add Education</Button>
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
                  {edu.startDate} - {edu.endDate} {edu.grade && `â€¢ Grade: ${edu.grade}`}
                </p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" onClick={() => { setEditingEducation(edu); setIsEducationModalOpen(true); }}>
                  <Edit2 size={16} />
                </Button>
                <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDeleteEducation(edu.id)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Modal 
        isOpen={isSkillModalOpen} 
        onClose={() => setIsSkillModalOpen(false)} 
        title="Add Skill"
      >
        <form onSubmit={handleAddSkillSubmit} className="space-y-4">
          <Input label="Skill Name" name="name" required placeholder="e.g. React, C#" />
          <div>
            <label className="mb-1 block text-body-sm font-medium text-secondary-700 dark:text-secondary-300">Proficiency Level</label>
            <select name="proficiencyLevel" className="w-full rounded-xl border border-secondary-200 bg-white px-4 py-2.5 text-body text-secondary-900 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 dark:border-secondary-800 dark:bg-secondary-900 dark:text-white dark:focus:border-primary-400 dark:focus:ring-primary-400/10 transition-all shadow-sm-border">
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
          <Input label="Years of Experience" name="yearsOfExperience" type="number" min="0" placeholder="e.g. 3" />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsSkillModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save</Button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={isExperienceModalOpen} 
        onClose={() => { setIsExperienceModalOpen(false); setEditingExperience(null); }} 
        title={editingExperience?.id ? "Edit Experience" : "Add Experience"}
        size="lg"
      >
        <form onSubmit={handleSaveExperience} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Job Title" name="jobTitle" defaultValue={editingExperience?.jobTitle} required />
            <Input label="Company Name" name="companyName" defaultValue={editingExperience?.companyName} required />
          </div>
          <Input label="Location" name="location" defaultValue={editingExperience?.location} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" name="startDate" type="month" defaultValue={editingExperience?.startDate?.substring(0,7)} required />
            <Input label="End Date" name="endDate" type="month" defaultValue={editingExperience?.endDate?.substring(0,7)} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="isCurrent" id="isCurrentExp" defaultChecked={editingExperience?.isCurrent} className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
            <label htmlFor="isCurrentExp" className="text-body-sm text-secondary-700 dark:text-secondary-300">I currently work here</label>
          </div>
          <Textarea label="Description" name="description" rows={3} defaultValue={editingExperience?.description} />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => { setIsExperienceModalOpen(false); setEditingExperience(null); }}>Cancel</Button>
            <Button type="submit" variant="primary">Save</Button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={isEducationModalOpen} 
        onClose={() => { setIsEducationModalOpen(false); setEditingEducation(null); }} 
        title={editingEducation?.id ? "Edit Education" : "Add Education"}
        size="lg"
      >
        <form onSubmit={handleSaveEducation} className="space-y-4">
          <Input label="Institution Name" name="institutionName" defaultValue={editingEducation?.institutionName} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Degree" name="degree" placeholder="e.g. Bachelor of Science" defaultValue={editingEducation?.degree} required />
            <Input label="Field of Study" name="fieldOfStudy" placeholder="e.g. Computer Science" defaultValue={editingEducation?.fieldOfStudy} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" name="startDate" type="month" defaultValue={editingEducation?.startDate?.substring(0,7)} required />
            <Input label="End Date" name="endDate" type="month" defaultValue={editingEducation?.endDate?.substring(0,7)} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="isCurrent" id="isCurrentEdu" defaultChecked={editingEducation?.isCurrent} className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
            <label htmlFor="isCurrentEdu" className="text-body-sm text-secondary-700 dark:text-secondary-300">I currently study here</label>
          </div>
          <Input label="Grade / GPA" name="grade" defaultValue={editingEducation?.grade} />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => { setIsEducationModalOpen(false); setEditingEducation(null); }}>Cancel</Button>
            <Button type="submit" variant="primary">Save</Button>
          </div>
        </form>
      </Modal>

      {confirmDialog}

    </div>
  );
}

function AnalysisResult({ analysis }) {
  const result = analysis.result || {};
  const scoreAverage = Math.round(((Number(result.profileCompletenessScore) || 0) + (Number(result.resumeCompletenessScore) || 0)) / 2);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-[180px_1fr]">
        <div className="rounded-2xl border border-ai-200/70 bg-ai-50/80 p-5 text-center dark:border-ai-500/20 dark:bg-ai-500/10">
          <div className="text-caption font-semibold uppercase tracking-wide text-ai-700 dark:text-ai-300">
            Readiness
          </div>
          <div className="mt-2 text-h1 tabular-nums text-ai-700 dark:text-ai-200">{scoreAverage}%</div>
          <p className="mt-1 text-caption text-secondary-500 dark:text-secondary-400">
            Combined profile and resume strength
          </p>
        </div>

        <div className="space-y-4">
          <ScoreMetric title="Profile completeness" value={result.profileCompletenessScore} />
          <ScoreMetric title="Resume completeness" value={result.resumeCompletenessScore} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <AiList
          title="Missing profile information"
          items={result.missingProfileInformation}
          icon={AlertCircle}
          tone="warning"
          emptyText="✨ All core profile fields (location, summary, experience) are complete."
        />
        <AiList
          title="Missing resume information"
          items={result.missingResumeInformation}
          icon={FileText}
          tone="danger"
          emptyText="📄 Primary resume document uploaded and verified."
        />
        <AiList
          title="Extracted skills"
          items={result.extractedSkills}
          icon={Sparkles}
          tone="ai"
          emptyText="Add key skills below to enable AI job matching."
        />
        <AiList
          title="Education"
          items={result.education}
          icon={GraduationCap}
          tone="success"
          emptyText="Add education details below to highlight your academic credentials."
        />
        <AiList
          title="Experience"
          items={result.experience}
          icon={Briefcase}
          tone="primary"
          emptyText="Add work experience below to showcase your career timeline."
        />
        <AiList
          title="Projects"
          items={result.projects}
          icon={CheckCircle2}
          tone="success"
          emptyText="No GitHub or portfolio projects linked yet. Adding project links boosts recruiter interest."
        />
        <AiList
          title="Certifications"
          items={result.certifications}
          icon={FileText}
          tone="primary"
          emptyText="No certifications listed. Industry certificates (AWS, PMP, Scrum) improve profile ranking."
        />
        <AiList
          title="Suggestions"
          items={result.suggestions}
          icon={Lightbulb}
          tone="ai"
          emptyText="Your profile is looking great! Keep your summary updated with key accomplishments."
        />
      </div>

      <p className="rounded-xl border border-secondary-100 bg-secondary-50 px-4 py-3 text-caption text-secondary-500 dark:border-white/10 dark:bg-white/5 dark:text-secondary-400">
        {analysis.disclaimer}
      </p>
    </div>
  );
}

function ScoreMetric({ title, value }) {
  const score = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-body-sm font-semibold text-secondary-700 dark:text-secondary-200">
        <span>{title}</span>
        <span className="tabular-nums">{score}%</span>
      </div>
      <ProgressBar value={score} max={100} />
    </div>
  );
}

function AiList({ title, items, icon: Icon = Sparkles, tone = 'ai', emptyText = 'No items found in the current profile or resume data.' }) {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  const toneClasses = {
    ai: 'border-ai-100 bg-ai-50/60 text-ai-700 dark:border-ai-500/20 dark:bg-ai-500/10 dark:text-ai-300',
    danger: 'border-red-100 bg-red-50/70 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200',
    primary: 'border-primary-100 bg-primary-50/70 text-primary-700 dark:border-primary-500/20 dark:bg-primary-500/10 dark:text-primary-200',
    success: 'border-green-100 bg-green-50/70 text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-200',
    warning: 'border-amber-100 bg-amber-50/70 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200',
  };

  return (
    <div className="rounded-2xl border border-secondary-100 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
      <div className="mb-3 flex items-center gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-xl border ${toneClasses[tone] || toneClasses.ai}`}>
          <Icon size={16} />
        </span>
        <h4 className="text-body-sm font-semibold text-secondary-800 dark:text-secondary-100">{title}</h4>
      </div>
      {safeItems.length === 0 ? (
        <p className="text-body-sm text-secondary-500 dark:text-secondary-400">{emptyText}</p>
      ) : (
        <ul className="space-y-2 text-body-sm text-secondary-600 dark:text-secondary-300">
          {safeItems.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ai-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
