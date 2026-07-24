import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Spinner, Badge } from '../../../components/ui';
import api from '../../../api';
import { Brain, Target, Zap, Briefcase, User, Search, X, ChevronDown, Sparkles, Cpu, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function PracticeSetup() {
  const navigate = useNavigate();
  const [sources, setSources] = useState([]);
  const [quotaInfo, setQuotaInfo] = useState({ usedToday: 0, dailyQuota: 5 });
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  
  // Selections
  const [selectedSourceIdx, setSelectedSourceIdx] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState(null); // { id, name }
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [error, setError] = useState(null);

  // Search state for skill picker
  const [skillSearch, setSkillSearch] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const skillInputRef = useRef(null);
  const skillDropdownRef = useRef(null);

  // Loading animation state
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingLines = useMemo(() => [
    'Connecting to Hirely AI Engine...',
    `Analyzing ${selectedSkill?.name || 'Skill'} core concepts & taxonomy...`,
    `Formulating ${difficulty}-level scenario questions...`,
    'Drafting multiple-choice options & distractor answers...',
    'Generating detailed technical explanations...',
    'Finalizing your personalized 12-question practice set...'
  ], [selectedSkill, difficulty]);

  useEffect(() => {
    async function fetchSources() {
      try {
        const res = await api.get('/candidate/practice/sources');
        const data = res.data;
        const sourceList = data.sources || data;
        setSources(sourceList);
        if (data.usedToday !== undefined) {
          setQuotaInfo({ usedToday: data.usedToday, dailyQuota: data.dailyQuota || 5 });
        }
        if (sourceList.length > 0 && sourceList[0].skills?.length > 0) {
          setSelectedSkill(sourceList[0].skills[0]);
        }
      } catch (err) {
        console.error('Failed to load practice sources:', err);
        setError('Could not load practice sources. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchSources();
  }, []);

  // Cycle loading messages when starting
  useEffect(() => {
    let interval;
    if (starting) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingLines.length - 1 ? prev + 1 : prev));
      }, 1400);
    }
    return () => clearInterval(interval);
  }, [starting, loadingLines.length]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        skillDropdownRef.current && !skillDropdownRef.current.contains(event.target) &&
        skillInputRef.current && !skillInputRef.current.contains(event.target)
      ) {
        setShowSkillDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentSource = sources[selectedSourceIdx];
  const skills = currentSource?.skills || [];

  const filteredSkills = useMemo(() => {
    if (!skillSearch.trim()) return skills;
    const term = skillSearch.toLowerCase();
    return skills.filter(sk => sk.name.toLowerCase().includes(term));
  }, [skills, skillSearch]);

  const handleSourceSelect = (idx) => {
    setSelectedSourceIdx(idx);
    const newSource = sources[idx];
    if (newSource?.skills?.length > 0) {
      setSelectedSkill(newSource.skills[0]);
    } else {
      setSelectedSkill(null);
    }
    setSkillSearch('');
  };

  const handleSkillSelect = (skill) => {
    setSelectedSkill(skill);
    setSkillSearch('');
    setShowSkillDropdown(false);
  };

  const handleStart = async (e) => {
    e.preventDefault();
    if (!currentSource || !selectedSkill) return;

    if (quotaInfo.usedToday >= quotaInfo.dailyQuota) {
      setError('Daily practice quota (5 sessions) reached. Please come back tomorrow!');
      return;
    }

    setStarting(true);
    setError(null);
    try {
      const res = await api.post('/candidate/practice/start', {
        sourceType: currentSource.sourceType,
        sourceApplicationId: currentSource.sourceType === 'Application' ? currentSource.sourceId : null,
        sourceInterviewId: currentSource.sourceType === 'Interview' ? currentSource.sourceId : null,
        skillId: selectedSkill.id,
        difficulty: difficulty
      });
      navigate(`/candidate/practice/session/${res.data.id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to start session. Please try again.');
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const difficulties = [
    { value: 'Beginner', icon: Brain, description: 'Core concepts and definitions' },
    { value: 'Intermediate', icon: Target, description: 'Practical application and scenarios' },
    { value: 'Advanced', icon: Zap, description: 'Complex problem solving and edge cases' }
  ];

  const sourceIcon = (type) => {
    switch (type) {
      case 'Profile': return User;
      case 'Application': return Briefcase;
      default: return Target;
    }
  };

  const isQuotaReached = quotaInfo.usedToday >= quotaInfo.dailyQuota;

  return (
    <div className="w-full">
      <Card className="relative overflow-hidden p-6 md:p-8">
        
        {/* Quota Header Counter */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-secondary-100 pb-4 dark:border-secondary-800">
          <div>
            <h2 className="text-h3 text-secondary-900 dark:text-white">Configure Session</h2>
            <p className="text-body-sm text-secondary-500">Pick a topic and difficulty to start practicing</p>
          </div>
          
          <div className="flex items-center gap-2 rounded-xl bg-secondary-50 px-4 py-2 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800">
            <ShieldCheck className={`h-4 w-4 ${isQuotaReached ? 'text-amber-500' : 'text-primary-500'}`} />
            <span className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">
              Daily Quota:
            </span>
            <span className={`text-sm font-bold ${isQuotaReached ? 'text-red-500 dark:text-red-400' : 'text-primary-600 dark:text-primary-400'}`}>
              {quotaInfo.usedToday} / {quotaInfo.dailyQuota} sessions used
            </span>
          </div>
        </div>

        {/* Animated Full Overlay when Starting */}
        {starting && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/95 p-6 backdrop-blur-md dark:bg-secondary-950/95 animate-fadeIn">
            
            {/* Glowing AI Orb */}
            <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary-500 via-indigo-500 to-purple-600 opacity-75 blur-lg animate-pulse" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-gradient-to-tr from-primary-600 to-indigo-600 shadow-2xl">
                <Sparkles className="h-10 w-10 text-white animate-spin-slow" />
              </div>
              <div className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-secondary-900 shadow-md animate-bounce">
                <Zap className="h-4 w-4 fill-current" />
              </div>
            </div>

            {/* Dynamic Animated Status Line */}
            <div className="text-center max-w-md space-y-3">
              <h3 className="text-h3 font-bold text-secondary-900 dark:text-white flex items-center justify-center gap-2">
                <Cpu className="h-5 w-5 text-primary-500 animate-pulse" />
                Generating Practice Session
              </h3>

              {/* Animated Text Lines */}
              <div className="h-8 overflow-hidden">
                <p key={loadingStep} className="text-body-sm font-medium text-primary-600 dark:text-primary-400 transition-all transform duration-300 animate-fadeIn">
                  {loadingLines[loadingStep]}
                </p>
              </div>

              {/* Animated Shimmer Progress Bar */}
              <div className="w-full bg-secondary-100 dark:bg-secondary-800 rounded-full h-2 overflow-hidden relative">
                <div 
                  className="bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-600 h-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(100, Math.max(15, ((loadingStep + 1) / loadingLines.length) * 100))}%` }}
                />
              </div>

              {/* Step Checklist Indicator */}
              <div className="pt-4 flex flex-wrap justify-center gap-2 text-xs text-secondary-500">
                {loadingLines.map((_, idx) => (
                  <span 
                    key={idx} 
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all ${
                      idx <= loadingStep 
                        ? 'border-primary-500/30 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium' 
                        : 'border-secondary-200 dark:border-secondary-800 opacity-40'
                    }`}
                  >
                    {idx <= loadingStep && <CheckCircle2 className="h-3 w-3 text-primary-500" />}
                    Step {idx + 1}
                  </span>
                ))}
              </div>
            </div>

          </div>
        )}

        <form onSubmit={handleStart} className="space-y-8">
          
          {isQuotaReached && (
            <div className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 dark:bg-amber-900/20 dark:border-amber-800/40 dark:text-amber-300">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <span className="font-semibold">Daily Practice Limit Reached:</span> You have completed {quotaInfo.usedToday} of {quotaInfo.dailyQuota} practice sessions today. Please come back tomorrow to start new sessions!
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Section 1: Topic Selection (2 columns: Source & Skill) */}
          <div className="space-y-4">
            <h3 className="text-h4 text-secondary-900 dark:text-white">1. Select Topic</h3>
            <div className="grid gap-6 md:grid-cols-2">
              
              {/* Left: Choose Practice Source */}
              <div className="space-y-3">
                <label className="text-body-sm font-semibold text-secondary-700 dark:text-secondary-300">
                  Choose Practice Source
                </label>
                <div className="grid gap-3">
                  {sources.map((src, idx) => {
                    const isSelected = idx === selectedSourceIdx;
                    const Icon = sourceIcon(src.sourceType);
                    return (
                      <button
                        key={`${src.sourceType}-${src.sourceId}`}
                        type="button"
                        onClick={() => handleSourceSelect(idx)}
                        className={[
                          'flex items-center gap-4 rounded-xl border p-4 text-left transition-all',
                          isSelected
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                            : 'border-secondary-200 bg-white hover:border-primary-300 dark:border-secondary-800 dark:bg-secondary-900 dark:hover:border-primary-700'
                        ].join(' ')}
                      >
                        <div className={[
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                          isSelected
                            ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400'
                            : 'bg-secondary-100 text-secondary-500 dark:bg-secondary-800 dark:text-secondary-400'
                        ].join(' ')}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-secondary-900 dark:text-white truncate">{src.title}</div>
                          <div className="text-xs text-secondary-500 dark:text-secondary-400">
                            {src.companyName} · {src.skills?.length || 0} skill{src.skills?.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right: Select Skill */}
              <div className="space-y-3">
                <label className="text-body-sm font-semibold text-secondary-700 dark:text-secondary-300">
                  Select Skill
                </label>
                <div className="relative">
                  {/* Search Input / Selected Display Container */}
                  <div
                    ref={skillInputRef}
                    className={[
                      'flex items-center gap-2.5 rounded-xl border px-4 py-3 cursor-text transition-all',
                      showSkillDropdown
                        ? 'border-primary-500 ring-1 ring-primary-500 dark:border-primary-500'
                        : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-300 dark:hover:border-primary-600'
                    ].join(' ')}
                    onClick={() => {
                      setShowSkillDropdown(true);
                      skillInputRef.current?.querySelector('input')?.focus();
                    }}
                  >
                    <Search className="h-4 w-4 text-secondary-400 shrink-0" />
                    
                    {selectedSkill && !showSkillDropdown ? (
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm font-medium text-secondary-900 dark:text-white">
                          {selectedSkill.name}
                        </span>
                        <button
                          type="button"
                          className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSkill(null);
                            setSkillSearch('');
                            setShowSkillDropdown(true);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={skillSearch}
                        onChange={(e) => {
                          setSkillSearch(e.target.value);
                          setShowSkillDropdown(true);
                        }}
                        onFocus={() => setShowSkillDropdown(true)}
                        placeholder={skills.length > 0 ? `Search ${skills.length} skills...` : 'No skills available'}
                        className="flex-1 text-sm text-secondary-900 dark:text-white placeholder-secondary-400 focus:outline-none focus:ring-0"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          boxShadow: 'none',
                          outline: 'none',
                          padding: 0,
                          borderRadius: 0
                        }}
                      />
                    )}

                    <ChevronDown className={`h-4 w-4 text-secondary-400 shrink-0 transition-transform ${showSkillDropdown ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Dropdown Options */}
                  {showSkillDropdown && skills.length > 0 && (
                    <div
                      ref={skillDropdownRef}
                      className="absolute left-0 right-0 top-full z-20 mt-1.5 max-h-56 overflow-y-auto rounded-xl border border-secondary-200 bg-white shadow-xl dark:border-secondary-700 dark:bg-secondary-900"
                    >
                      {filteredSkills.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-secondary-500">No matching skills</div>
                      ) : (
                        filteredSkills.map(sk => (
                          <button
                            key={sk.id}
                            type="button"
                            onClick={() => handleSkillSelect(sk)}
                            className={[
                              'flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors',
                              selectedSkill?.id === sk.id
                                ? 'bg-primary-50 text-primary-700 font-medium dark:bg-primary-900/30 dark:text-primary-400'
                                : 'text-secondary-700 hover:bg-secondary-50 dark:text-secondary-300 dark:hover:bg-secondary-800'
                            ].join(' ')}
                          >
                            {sk.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Choose Difficulty */}
          <div className="space-y-4">
            <h3 className="text-h4 text-secondary-900 dark:text-white">2. Choose Difficulty</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {difficulties.map((diff) => {
                const isSelected = difficulty === diff.value;
                const Icon = diff.icon;
                return (
                  <button
                    key={diff.value}
                    type="button"
                    onClick={() => setDifficulty(diff.value)}
                    className={[
                      'relative flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all',
                      isSelected 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                        : 'border-secondary-200 bg-white hover:border-primary-300 dark:border-secondary-800 dark:bg-secondary-900 dark:hover:border-primary-700'
                    ].join(' ')}
                  >
                    <div className={[
                      'rounded-lg p-2',
                      isSelected ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400' : 'bg-secondary-100 text-secondary-500 dark:bg-secondary-800 dark:text-secondary-400'
                    ].join(' ')}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-secondary-900 dark:text-white">{diff.value}</div>
                      <div className="mt-1 text-xs text-secondary-500 dark:text-secondary-400 leading-relaxed">
                        {diff.description}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-secondary-100 dark:border-secondary-800">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full group relative overflow-hidden"
              disabled={!selectedSkill || starting || isQuotaReached}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isQuotaReached ? 'Daily Quota Reached (5/5)' : 'Generate Practice Questions'}
                <Zap className="h-4 w-4 transition-transform group-hover:scale-110" />
              </span>
            </Button>
            <p className="mt-3 text-center text-xs text-secondary-500 dark:text-secondary-400">
              Each session contains 12 tailored questions. Limit: 5 sessions per day.
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}
