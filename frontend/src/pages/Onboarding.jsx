import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLearner } from '../context/LearnerContext';
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  Clock, 
  Award, 
  FolderGit2, 
  Plus, 
  Trash2, 
  Sparkles, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';

const COMMON_CAREERS = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Scientist',
  'DevOps Engineer',
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { profile, triggerAnalysis, isAnalyzing, error, clearError } = useLearner();

  const [formData, setFormData] = useState({
    fullName: profile?.fullName || '',
    education: profile?.education || '',
    skills: profile?.skills || ['JavaScript', 'HTML/CSS', 'Python'],
    proficiency: profile?.proficiency || { JavaScript: 2, 'HTML/CSS': 2, Python: 1 },
    certifications: profile?.certifications?.length ? profile.certifications : ['AWS Certified Cloud Practitioner'],
    projects: profile?.projects?.length ? profile.projects : ['Personal Portfolio Website'],
    careerGoal: profile?.careerGoal || 'Full Stack Developer',
    availability: profile?.availability || '15 hours per week',
  });

  const [newSkill, setNewSkill] = useState('');
  const [newCert, setNewCert] = useState('');
  const [newProject, setNewProject] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationError) setValidationError('');
  };

  const handleAddSkill = () => {
    const s = newSkill.trim();
    if (!s) return;
    if (formData.skills.includes(s)) return;
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, s],
      proficiency: { ...prev.proficiency, [s]: 2 },
    }));
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => {
      const updatedSkills = prev.skills.filter((s) => s !== skillToRemove);
      const updatedProf = { ...prev.proficiency };
      delete updatedProf[skillToRemove];
      return {
        ...prev,
        skills: updatedSkills,
        proficiency: updatedProf,
      };
    });
  };

  const handleProficiencyChange = (skill, level) => {
    setFormData((prev) => ({
      ...prev,
      proficiency: {
        ...prev.proficiency,
        [skill]: level,
      },
    }));
  };

  const handleAddCert = () => {
    const c = newCert.trim();
    if (!c) return;
    setFormData((prev) => ({ ...prev, certifications: [...prev.certifications, c] }));
    setNewCert('');
  };

  const handleRemoveCert = (index) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  const handleAddProject = () => {
    const p = newProject.trim();
    if (!p) return;
    setFormData((prev) => ({ ...prev, projects: [...prev.projects, p] }));
    setNewProject('');
  };

  const handleRemoveProject = (index) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setValidationError('');

    if (!formData.fullName.trim()) {
      setValidationError('Please enter your full name.');
      return;
    }

    if (formData.skills.length === 0) {
      setValidationError('Please add at least one existing skill.');
      return;
    }

    if (!formData.careerGoal.trim()) {
      setValidationError('Please specify your target career goal.');
      return;
    }

    try {
      await triggerAnalysis(formData);
      navigate('/dashboard');
    } catch (err) {
      // Error handled in context state
    }
  };

  return (
    <section className="max-w-3xl mx-auto py-2 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center sm:text-left space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          Multi-Agent Profile Setup
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          Configure Your Learner Profile
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
          Provide your current skills and target career. Our 4 specialized AI agents will analyze your profile and build a customized roadmap.
        </p>
      </div>

      {/* Errors */}
      {(validationError || error) && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">{validationError ? 'Form Error' : 'Analysis Error'}</p>
            <p className="text-xs text-rose-600 mt-0.5">{validationError || error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info - High Contrast White Frosted Glass */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-7 shadow-md space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-rose-500" />
            Personal &amp; Educational Background
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="e.g. Alex Johnson"
                className="w-full rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/40 focus:border-rose-400 shadow-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Education / Background
              </label>
              <input
                name="education"
                value={formData.education}
                onChange={handleInputChange}
                placeholder="e.g. B.Tech Computer Science / Self-Taught"
                className="w-full rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/40 focus:border-rose-400 shadow-sm transition"
              />
            </div>
          </div>
        </div>

        {/* Career Goal & Availability */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-7 shadow-md space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Briefcase className="w-4 h-4 text-rose-500" />
            Target Career &amp; Availability
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target Career Goal <span className="text-rose-500">*</span>
              </label>
              <input
                name="careerGoal"
                value={formData.careerGoal}
                onChange={handleInputChange}
                list="career-presets"
                placeholder="Select or type career goal"
                className="w-full rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/40 focus:border-rose-400 shadow-sm transition"
              />
              <datalist id="career-presets">
                {COMMON_CAREERS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Weekly Study Time
              </label>
              <input
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                placeholder="e.g. 15 hours per week"
                className="w-full rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/40 focus:border-rose-400 shadow-sm transition"
              />
            </div>
          </div>
        </div>

        {/* Existing Skills & Proficiency */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-7 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-rose-500" />
              Current Skills &amp; Proficiency Rating
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {formData.skills.length} skills added
            </span>
          </div>

          {/* Add Skill Bar */}
          <div className="flex gap-2">
            <input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="Type a skill (e.g. React, SQL, Python, Docker)..."
              className="flex-1 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/40 focus:border-rose-400 shadow-sm transition"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-500/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          {/* Skills List with Proficiency Sliders/Selects */}
          <div className="space-y-2.5 pt-2">
            {formData.skills.map((skill) => (
              <div
                key={skill}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80"
              >
                <span className="font-bold text-xs sm:text-sm text-slate-800">{skill}</span>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3].map((lvl) => {
                      const isSelected = (formData.proficiency[skill] || 1) === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleProficiencyChange(skill, lvl)}
                          className={`px-3 py-1 text-xs rounded-xl font-bold transition ${
                            isSelected
                              ? 'bg-rose-500 text-white shadow-sm'
                              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {lvl === 1 ? 'Beginner' : lvl === 2 ? 'Intermediate' : 'Advanced'}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition"
                    title="Remove skill"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications & Projects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Certifications */}
          <div className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-md space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Certifications
            </h3>
            <div className="flex gap-2">
              <input
                value={newCert}
                onChange={(e) => setNewCert(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCert();
                  }
                }}
                placeholder="e.g. AWS Cloud Practitioner"
                className="flex-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400/40"
              />
              <button
                type="button"
                onClick={handleAddCert}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Add
              </button>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1">
              {formData.certifications.map((c, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2 rounded-xl text-slate-700 border border-slate-100">
                  <span className="truncate font-medium">{c}</span>
                  <button type="button" onClick={() => handleRemoveCert(idx)} className="text-slate-400 hover:text-rose-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-md space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-rose-500" />
              Projects
            </h3>
            <div className="flex gap-2">
              <input
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddProject();
                  }
                }}
                placeholder="e.g. E-Commerce React App"
                className="flex-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400/40"
              />
              <button
                type="button"
                onClick={handleAddProject}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Add
              </button>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1">
              {formData.projects.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2 rounded-xl text-slate-700 border border-slate-100">
                  <span className="truncate font-medium">{p}</span>
                  <button type="button" onClick={() => handleRemoveProject(idx)} className="text-slate-400 hover:text-rose-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isAnalyzing}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 disabled:opacity-50 text-white font-bold rounded-full shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2.5 transition transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>AI Agents Analyzing Career Profile...</span>
              </>
            ) : (
              <>
                <span>Save Profile &amp; Analyze Readiness</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
