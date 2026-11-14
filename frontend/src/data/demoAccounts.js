/**
 * Pre-configured Demo Accounts for HIGH LEARNER
 * Allows 1-click login and testing across different learner roles
 */

export const DEMO_USERS = [
  {
    uid: 'demo_user_alex',
    name: 'Alex Johnson',
    email: 'alex.johnson@highlearner.ai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    title: 'Aspiring Full Stack Engineer',
    profile: {
      fullName: 'Alex Johnson',
      education: 'B.S. in Computer Science',
      skills: ['JavaScript', 'HTML/CSS', 'Python', 'SQL', 'Git'],
      proficiency: {
        JavaScript: 3,
        'HTML/CSS': 3,
        Python: 2,
        SQL: 1,
        Git: 2,
      },
      certifications: ['AWS Certified Cloud Practitioner', 'Meta Frontend Developer'],
      projects: ['E-Commerce Web Platform', 'Student Analytics Portal'],
      careerGoal: 'Full Stack Developer',
      availability: '15 hours per week',
    },
  },
  {
    uid: 'demo_user_maya',
    name: 'Maya Chen',
    email: 'maya.chen@highlearner.ai',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    title: 'Aspiring AI & Machine Learning Engineer',
    profile: {
      fullName: 'Maya Chen',
      education: 'M.S. in Data Science',
      skills: ['Python', 'SQL', 'Data Science', 'Machine Learning', 'Git'],
      proficiency: {
        Python: 4,
        SQL: 3,
        'Data Science': 3,
        'Machine Learning': 2,
        Git: 2,
      },
      certifications: ['DeepLearning.AI TensorFlow Developer', 'Google Data Analytics'],
      projects: ['Predictive Customer Churn Model', 'Neural NLP Text Classifier'],
      careerGoal: 'Machine Learning Engineer',
      availability: '20 hours per week',
    },
  },
  {
    uid: 'demo_user_marcus',
    name: 'Marcus Taylor',
    email: 'marcus.taylor@highlearner.ai',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    title: 'Aspiring DevOps & Cloud Architect',
    profile: {
      fullName: 'Marcus Taylor',
      education: 'Systems Administration & Cloud Engineering',
      skills: ['Docker', 'Linux', 'Python', 'AWS', 'Git'],
      proficiency: {
        Docker: 3,
        Linux: 3,
        Python: 2,
        AWS: 2,
        Git: 3,
      },
      certifications: ['AWS Solutions Architect Associate', 'CKA: Kubernetes Administrator'],
      projects: ['Automated Kubernetes CI/CD Pipeline', 'Multi-Region Terraform Deployments'],
      careerGoal: 'DevOps Engineer',
      availability: '12 hours per week',
    },
  },
];
