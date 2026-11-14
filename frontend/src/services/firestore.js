import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

/**
 * Normalizes career string for deterministic document IDs (prevents duplicate documents)
 */
function normalizeDocKey(str) {
  return (str || 'default').toLowerCase().replace(/[^a-z0-9]/g, '_');
}

/* =======================================================================
   1. USERS COLLECTION
   ======================================================================= */
export async function saveUserProfile(userId, profileData, userEmail = '', userName = '') {
  if (!isFirebaseConfigured || !db || !userId) return null;

  try {
    const userRef = doc(db, 'users', userId);
    const existingSnap = await getDoc(userRef);

    const payload = {
      uid: userId,
      name: profileData.fullName || userName || 'Learner',
      email: userEmail || profileData.email || '',
      education: profileData.education || '',
      skills: profileData.skills || [],
      proficiency: profileData.proficiency || {},
      certifications: profileData.certifications || [],
      projects: profileData.projects || [],
      careerGoal: profileData.careerGoal || 'Full Stack Developer',
      weeklyAvailability: profileData.availability || '15 hours per week',
      updatedAt: new Date().toISOString(),
    };

    if (!existingSnap.exists()) {
      payload.createdAt = new Date().toISOString();
    }

    await setDoc(userRef, payload, { merge: true });
    return payload;
  } catch (err) {
    console.error('Error saving user profile to Firestore:', err);
    throw err;
  }
}

export async function getUserProfile(userId) {
  if (!isFirebaseConfigured || !db || !userId) return null;

  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.error('Error fetching user profile from Firestore:', err);
    return null;
  }
}

/* =======================================================================
   2. SKILL ANALYSES COLLECTION
   ======================================================================= */
export async function saveSkillAnalysis(userId, career, analysisData) {
  if (!isFirebaseConfigured || !db || !userId) return null;

  try {
    const careerKey = normalizeDocKey(career);
    const docId = `${userId}_${careerKey}`;
    const analysisRef = doc(db, 'skill_analyses', docId);

    const payload = {
      userId,
      career: career || 'Full Stack Developer',
      readinessScore: analysisData.career_readiness_score ?? analysisData.readinessScore ?? 0,
      strengths: analysisData.strengths || [],
      missingSkills: analysisData.missing_skills || analysisData.missingSkills || [],
      improvementSkills: analysisData.improvement_skills || analysisData.improvementSkills || [],
      skillAnalysis: analysisData.skill_analysis || analysisData.skillAnalysis || {},
      careerMatch: analysisData.career_match || {},
      createdAt: new Date().toISOString(),
    };

    await setDoc(analysisRef, payload, { merge: true });
    return payload;
  } catch (err) {
    console.error('Error saving skill analysis to Firestore:', err);
    throw err;
  }
}

export async function getLatestSkillAnalysis(userId, career) {
  if (!isFirebaseConfigured || !db || !userId) return null;

  try {
    if (career) {
      const docId = `${userId}_${normalizeDocKey(career)}`;
      const docSnap = await getDoc(doc(db, 'skill_analyses', docId));
      if (docSnap.exists()) return docSnap.data();
    }

    const q = query(
      collection(db, 'skill_analyses'),
      where('userId', '==', userId),
      limit(5)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    }
    return null;
  } catch (err) {
    console.error('Error fetching skill analysis from Firestore:', err);
    return null;
  }
}

/* =======================================================================
   3. LEARNING PATHS COLLECTION
   ======================================================================= */
export async function saveLearningPath(userId, career, modules, completionPercentage = 0) {
  if (!isFirebaseConfigured || !db || !userId) return null;

  try {
    const careerKey = normalizeDocKey(career);
    const docId = `${userId}_${careerKey}`;
    const pathRef = doc(db, 'learning_paths', docId);

    const payload = {
      userId,
      career: career || 'Full Stack Developer',
      modules: modules || [],
      completionPercentage: Math.round(completionPercentage),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(pathRef, payload, { merge: true });
    return payload;
  } catch (err) {
    console.error('Error saving learning path to Firestore:', err);
    throw err;
  }
}

export async function getLearningPath(userId, career) {
  if (!isFirebaseConfigured || !db || !userId) return null;

  try {
    const docId = `${userId}_${normalizeDocKey(career)}`;
    const docSnap = await getDoc(doc(db, 'learning_paths', docId));
    if (docSnap.exists()) return docSnap.data();
    return null;
  } catch (err) {
    console.error('Error fetching learning path from Firestore:', err);
    return null;
  }
}

/* =======================================================================
   4. ASSESSMENTS COLLECTION
   ======================================================================= */
export async function saveAssessmentRecord(userId, assessmentData) {
  if (!isFirebaseConfigured || !db || !userId) return null;

  try {
    const colRef = collection(db, 'assessments');
    const payload = {
      userId,
      skill: assessmentData.skill_name || assessmentData.skill || 'JavaScript Fundamentals',
      score: assessmentData.score ?? 0,
      percentage: assessmentData.percentage ?? 0,
      weakConcepts: assessmentData.weak_concepts || assessmentData.weakConcepts || [],
      recommendations: assessmentData.recommended_exercises || assessmentData.recommendations || [],
      adaptiveTier: assessmentData.adaptive_tier || 'standard',
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(colRef, payload);
    return { id: docRef.id, ...payload };
  } catch (err) {
    console.error('Error saving assessment record to Firestore:', err);
    throw err;
  }
}

export async function getAssessmentHistory(userId) {
  if (!isFirebaseConfigured || !db || !userId) return [];

  try {
    const q = query(
      collection(db, 'assessments'),
      where('userId', '==', userId),
      limit(20)
    );
    const snap = await getDocs(q);
    const results = [];
    snap.forEach((d) => {
      results.push({ id: d.id, ...d.data() });
    });
    // Sort descending by timestamp
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return results;
  } catch (err) {
    console.error('Error fetching assessments from Firestore:', err);
    return [];
  }
}

/* =======================================================================
   5. MENTOR CHATS COLLECTION
   ======================================================================= */
export async function saveMentorChat(userId, messages) {
  if (!isFirebaseConfigured || !db || !userId) return null;

  try {
    const chatRef = doc(db, 'mentor_chats', userId);
    const payload = {
      userId,
      messages: messages.slice(-50), // keep latest 50 messages
      updatedAt: new Date().toISOString(),
    };
    await setDoc(chatRef, payload, { merge: true });
    return payload;
  } catch (err) {
    console.error('Error saving mentor chat to Firestore:', err);
    return null;
  }
}

export async function getMentorChat(userId) {
  if (!isFirebaseConfigured || !db || !userId) return null;

  try {
    const chatRef = doc(db, 'mentor_chats', userId);
    const snap = await getDoc(chatRef);
    if (snap.exists()) {
      return snap.data().messages || [];
    }
    return null;
  } catch (err) {
    console.error('Error fetching mentor chat from Firestore:', err);
    return null;
  }
}
