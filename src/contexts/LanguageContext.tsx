import { createContext, useContext, useState, useCallback } from "react";

type Lang = "en" | "am";

const translations = {
  // Navbar
  "nav.home": { en: "Home", am: "ዋና ገጽ" },
  "nav.learningLab": { en: "Learning Lab", am: "የመማሪያ ቤተ-ሙከራ" },
  "nav.pictogramBoard": { en: "Pictogram Board", am: "የምስል ሰሌዳ" },
  "nav.assessment": { en: "AI Assessment", am: "AI ምዘና" },
  "nav.dashboard": { en: "Dashboard", am: "ዳሽቦርድ" },
  "nav.sensoryMode": { en: "Sensory Mode", am: "ሴንሰሪ ሞድ" },
  "nav.standardMode": { en: "Standard Mode", am: "መደበኛ ሞድ" },
  "nav.signIn": { en: "Sign In", am: "ግባ" },
  "nav.signOut": { en: "Sign Out", am: "ውጣ" },

  // Hero
  "hero.subtitle": { en: "Inclusive Special Education for Every Ethiopian Child", am: "ለእያንዳንዱ ኢትዮጵያዊ ልጅ አካታች ልዩ ትምህርት" },
  "hero.description": { en: "Empowering children with Autism, Dyslexia & ADHD through AI-powered learning, visual communication, and progress tracking.", am: "ኦቲዝም፣ ዲስሌክሲያ እና ADHD ያላቸውን ልጆች በAI ትምህርት፣ ምስላዊ ግንኙነት እና የእድገት ክትትል ማብቃት።" },
  "hero.startAssessment": { en: "Start Free Assessment", am: "ነፃ ምዘና ጀምር" },
  "hero.exploreLab": { en: "Explore Learning Lab", am: "የመማሪያ ቤተ-ሙከራ ይመልከቱ" },

  // Features
  "features.title": { en: "Everything Your Child Needs", am: "ልጅዎ የሚፈልገው ሁሉ" },
  "features.subtitle": { en: "Tools designed with love, backed by research.", am: "በፍቅር የተሰሩ፣ በምርምር የተደገፉ መሳሪያዎች።" },
  "features.explore": { en: "Explore", am: "ይመልከቱ" },
  "features.aiAssessment.title": { en: "AI Assessment", am: "AI ምዘና" },
  "features.aiAssessment.desc": { en: "Intelligent screening chatbot helps parents identify learning needs early.", am: "ብልህ የማጣሪያ ቻትቦት ወላጆች የመማር ፍላጎቶችን አስቀድመው እንዲለዩ ይረዳል።" },
  "features.learningLab.title": { en: "Learning Lab", am: "የመማሪያ ቤተ-ሙከራ" },
  "features.learningLab.desc": { en: "Interactive modules for Amharic Phonics and Social Stories.", am: "ለአማርኛ ፎኒክስ እና ማህበራዊ ታሪኮች መስተጋብራዊ ሞዱሎች።" },
  "features.pictogramBoard.title": { en: "Pictogram Board", am: "የምስል ሰሌዳ" },
  "features.pictogramBoard.desc": { en: "Visual communication with Amharic audio for non-verbal children.", am: "ለማይናገሩ ልጆች በአማርኛ ድምጽ ምስላዊ ግንኙነት።" },
  "features.parentDashboard.title": { en: "Parent Dashboard", am: "የወላጅ ዳሽቦርድ" },
  "features.parentDashboard.desc": { en: "Track your child's growth with our visual Growth Tree tracker.", am: "በእድገት ዛፍ ልጅዎን ይከታተሉ።" },

  // Pricing
  "pricing.title": { en: "Full Access Plan", am: "ሙሉ ተደራሽነት ዕቅድ" },
  "pricing.perMonth": { en: "ETB/month", am: "ብር/ወር" },
  "pricing.item1": { en: "AI-powered assessment tool", am: "በAI የተደገፈ የምዘና መሳሪያ" },
  "pricing.item2": { en: "Full Learning Lab access", am: "ሙሉ የመማሪያ ቤተ-ሙከራ ተደራሽነት" },
  "pricing.item3": { en: "Pictogram Board with audio", am: "ከድምጽ ጋር የምስል ሰሌዳ" },
  "pricing.item4": { en: "Parent Growth Tree dashboard", am: "የወላጅ እድገት ዛፍ ዳሽቦርድ" },
  "pricing.item5": { en: "New content every month", am: "በየወሩ አዲስ ይዘት" },
  "pricing.payViaTelebirr": { en: "Pay via Telebirr", am: "በቴሌብር ይክፈሉ" },
  "pricing.transferInstructions": { en: "Transfer {amount} ETB to Telebirr Account: {account} (Naol Mesfin)", am: "{amount} ብር ወደ ቴሌብር ሂሳብ: {account} (ናኦል መስፍን) ያስተላልፉ" },
  "pricing.verifyButton": { en: "I've Paid – Verify My Account", am: "ከፍያለሁ – ሂሳቤን ያረጋግጡ" },

  // Footer
  "footer.founder": { en: "Founded by Naol Mesfin – Certified by MInT", am: "በናኦል መስፍን የተመሰረተ – በMInT የተረጋገጠ" },
  "footer.madeWith": { en: "Made with", am: "የተሰራው በ" },
  "footer.forEveryChild": { en: "for every child", am: "ለእያንዳንዱ ልጅ" },
  "founder.empowering": { en: "Empowering inclusive education across Ethiopia", am: "በመላው ኢትዮጵያ አካታች ትምህርትን ማብቃት" },

  // Learning Lab
  "lab.title": { en: "Learning Lab", am: "የመማሪያ ቤተ-ሙከራ" },
  "lab.subtitle": { en: "Interactive modules designed for children with special learning needs", am: "ልዩ የመማር ፍላጎት ላላቸው ልጆች የተዘጋጁ መስተጋብራዊ ሞዱሎች" },
  "lab.lessons": { en: "lessons", am: "ትምህርቶች" },
  "lab.start": { en: "Start", am: "ጀምር" },
  "lab.locked": { en: "Locked", am: "ተቆልፏል" },
  "lab.back": { en: "Back to Modules", am: "ወደ ሞዱሎች ተመለስ" },
  "lab.module1.title": { en: "English Alphabet (A–H)", am: "የእንግሊዝኛ ፊደላት (A–H)" },
  "lab.module1.desc": { en: "Learn English letters with sounds, words, and pictures.", am: "የእንግሊዝኛ ፊደላትን ከድምጽ ጋር ተማሩ።" },
  "lab.module2.title": { en: "Numbers 1 to 10", am: "ቁጥሮች 1 እስከ 10" },
  "lab.module2.desc": { en: "Count, recognize, and play with numbers from 1 to 10.", am: "ቁጥሮችን ቆጥሩ እና ለዩ።" },
  "lab.module3.title": { en: "Social Skills – Greetings", am: "ማህበራዊ ክህሎት – ሰላምታ" },
  "lab.module3.desc": { en: "Interactive lessons on hello, thank you, and asking for help.", am: "ሰላም እና አመሰግናለሁ የሚያስተምሩ ትምህርቶች።" },
  "lab.module4.title": { en: "Colors & Shapes", am: "ቀለማትና ቅርጾች" },
  "lab.module4.desc": { en: "Recognize basic colors and shapes around us.", am: "መሰረታዊ ቀለማትና ቅርጾችን ይለዩ።" },
  "lab.module5.title": { en: "Animals & Sounds", am: "እንስሳትና ድምጾቻቸው" },
 "lab.module5.desc": { en: "Meet farm and wild animals and the sounds they make.", am: "እንስሳትን እና ድምጾቻቸውን ይተዋወቁ።" },
 "lab.module6.title": { en: "Body Parts", am: "የሰውነት ክፍሎች" },
 "lab.module6.desc": { en: "Learn the parts of the body and what they do.", am: "የሰውነት ክፍሎችን ይማሩ።" },
 "lab.module7.title": { en: "Food & Drinks", am: "ምግብና መጠጥ" },
 "lab.module7.desc": { en: "Healthy foods and drinks we enjoy every day.", am: "በየቀኑ የምንጠቀምባቸው ምግቦች እና መጠጦች።" },
 "lab.module8.title": { en: "Family Members", am: "የቤተሰብ አባላት" },
 "lab.module8.desc": { en: "Mom, Dad, siblings, grandparents and friends.", am: "እናት፣ አባት፣ ወንድም እህትና አያቶች።" },
 "lab.module9.title": { en: "Feelings & Emotions", am: "ስሜቶች" },
"lab.module9.desc": { en: "Recognize and name how you feel inside.", am: "የራስዎን ስሜቶች ይለዩ።" },
"lab.module10.title": { en: "Nature & Weather", am: "ተፈጥሮ" },
"lab.module10.desc": { en: "Sun, moon, rain, trees and more.", am: "ፀሐይ፣ ጨረቃ፣ ዝናብ።" },
"lab.module11.title": { en: "Transportation", am: "መጓጓዣ" },
"lab.module11.desc": { en: "Cars, buses, planes and trains.", am: "መኪና፣ አውቶብስ፣ አውሮፕላን።" },
"lab.module12.title": { en: "Safety & Hygiene", am: "ደህንነት እና ንፅህና" },
"lab.module12.desc": { en: "Stay clean, safe and healthy.", am: "ንፁህ እና ደህንነቱ የተጠበቀ ይሁኑ።" },

  // Lesson content
  "lesson.listen": { en: "Listen", am: "ያዳምጡ" },
  "lesson.next": { en: "Next", am: "ቀጣይ" },
  "lesson.previous": { en: "Previous", am: "ቀዳሚ" },
  "lesson.complete": { en: "Complete!", am: "ተጠናቅቋል!" },
  "lesson.of": { en: "of", am: "ከ" },

  // Dashboard
  "dash.title": { en: "Parent Dashboard", am: "የወላጅ ዳሽቦርድ" },
  "dash.subtitle": { en: "Track your child's learning journey with the Growth Tree", am: "የልጅዎን የመማር ጉዞ በእድገት ዛፍ ይከታተሉ" },
  "dash.growthTree": { en: "Growth Tree", am: "እድገት ዛፍ" },
  "dash.starMilestone": { en: "Each star represents a milestone achieved!", am: "እያንዳንዱ ኮከብ የተገኘ ግብን ይወክላል!" },
  "dash.moduleProgress": { en: "Module Progress", am: "የሞዱል ሂደት" },
  "dash.recentMilestones": { en: "Recent Milestones", am: "የቅርብ ጊዜ ግቦች" },
  "dash.milestone1": { en: "Completed first phonics module", am: "የመጀመሪያ ፎኒክስ ሞዱል ተጠናቋል" },
  "dash.milestone2": { en: "Learned 10 new pictograms", am: "10 አዲስ ምስሎችን ተማረ" },
  "dash.milestone3": { en: "Finished greetings social story", am: "ሰላมታ ማህበራዊ ታሪክ ተጠናቋል" },
  "dash.amharicPhonics": { en: "Amharic Phonics", am: "አማርኛ ፎኒክስ" },
  "dash.socialStories": { en: "Social Stories", am: "ማህበራዊ ታሪኮች" },
  "dash.cognitiveGames": { en: "Cognitive Games", am: "የአእምሮ ጨዋታዎች" },

  // Pictogram
  "picto.title": { en: "Pictogram Board", am: "የምስል ሰሌዳ" },
  "picto.subtitle": { en: "Tap a card to hear the word in Amharic", am: "ካርዱን ነካ ያድርጉ ቃሉን በአማርኛ ለመስማት" },
  "picto.lastSpoken": { en: "Last spoken", am: "የመጨረሻ ንግግር" },

  // Assessment
  "assess.title": { en: "AI Assessment", am: "AI ምዘና" },
  "assess.subtitle": { en: "Answer a few simple questions about your child. Our AI will suggest learning paths tailored to their needs. This is a screening tool, not a medical diagnosis.", am: "ስለ ልጅዎ ጥቂት ቀላል ጥያቄዎችን ይመልሱ። AI ለፍላጎታቸው የተዘጋጁ የመማር መንገዶችን ይጠቁማል። ይህ የማጣሪያ መሳሪያ ነው፣ ሕክምናዊ ምርመራ አይደለም።" },
  "assess.begin": { en: "Begin Screening", am: "ማጣሪያ ጀምር" },
  "assess.chatTitle": { en: "AI Screening Assistant", am: "AI የማጣሪያ ረዳት" },
  "assess.placeholder": { en: "Type your answer...", am: "መልስዎን ይጻፉ..." },
  "assess.goToLab": { en: "Go to Learning Lab", am: "ወደ የመማሪያ ቤተ-ሙከራ ሂድ" },

  // Quiz
  "quiz.title": { en: "Quiz", am: "ፈተና" },
  "quiz.score": { en: "Score", am: "ውጤት" },
  "quiz.complete": { en: "Quiz Complete!", am: "ፈተናው ተጠናቋል!" },
  "quiz.great": { en: "Excellent! You're a star learner! ⭐", am: "በጣም ጥሩ! ኮከብ ተማሪ ነህ! ⭐" },
  "quiz.good": { en: "Good job! Keep practicing! 💪", am: "ጥሩ ስራ! መለማመድህን ቀጥል! 💪" },
  "quiz.tryAgain": { en: "Let's review the lessons and try again! 📚", am: "ትምህርቶቹን እንከልስና እንደገና እንሞክር! 📚" },
  "quiz.retry": { en: "Try Again", am: "እንደገና ሞክር" },
  "quiz.correct": { en: "Correct! 🎉", am: "ትክክል! 🎉" },
  "quiz.incorrect": { en: "Not quite — keep learning!", am: "ትክክል አይደለም — መማርህን ቀጥል!" },
  "quiz.seeResults": { en: "See Results", am: "ውጤት ይመልከቱ" },
  "quiz.takeQuiz": { en: "Take Quiz", am: "ፈተና ይውሰዱ" },

  // Auth
  "auth.createAccount": { en: "Create Account", am: "ሂሳብ ፍጠር" },
  "auth.welcomeBack": { en: "Welcome Back", am: "እንኳን ደህና መጡ" },
  "auth.signUpDesc": { en: "Sign up to track your child's progress", am: "የልጅዎን እድገት ለመከታተል ይመዝገቡ" },
  "auth.signInDesc": { en: "Sign in to your ክንፍTech account", am: "ወደ ክንፍTech ሂሳብዎ ይግቡ" },
  "auth.email": { en: "Email", am: "ኢሜይል" },
  "auth.password": { en: "Password", am: "የይለፍ ቃል" },
  "auth.signUp": { en: "Sign Up", am: "ተመዝገብ" },
  "auth.signIn": { en: "Sign In", am: "ግባ" },
  "auth.hasAccount": { en: "Already have an account? Sign in", am: "ሂሳብ አለዎት? ይግቡ" },
  "auth.noAccount": { en: "Don't have an account? Sign up", am: "ሂሳብ የለዎትም? ይመዝገቡ" },

  // Sentence Builder
  "sentence.title": { en: "Sentence Builder", am: "ዓረፍተ ነገር ገንቢ" },
  "sentence.subtitle": { en: "Tap cards to build a sentence, then hear it spoken", am: "ካርዶችን ነካ ያድርጉ ዓረፍተ ነገር ለመገንባት" },
  "sentence.yourSentence": { en: "Your Sentence", am: "ዓረፍተ ነገርዎ" },
  "sentence.clear": { en: "Clear", am: "አጽዳ" },
  "sentence.speak": { en: "Speak", am: "ተናገር" },
  "sentence.tapToAdd": { en: "Tap cards below to build your sentence...", am: "ከታች ካርዶችን ነካ ያድርጉ..." },

  // Daily Routine
  "routine.title": { en: "Daily Routine", am: "የዕለት ተዕለት" },
  "routine.subtitle": { en: "Check off activities as your child completes them", am: "ልጅዎ ሲያጠናቅቅ ምልክት ያድርጉ" },
  "routine.completed": { en: "completed", am: "ተጠናቅቋል" },

  // Letter Tracing
  "tracing.title": { en: "Letter Tracing", am: "ፊደል መከተብ" },
  "tracing.subtitle": { en: "Trace the Amharic letter with your finger or mouse", am: "የአማርኛ ፊደልን በጣትዎ ወይም በመዳፊት ይከተቡ" },
  "tracing.clear": { en: "Erase", am: "ደምስስ" },

  // Parent Notes
  "notes.title": { en: "Session Notes", am: "የክፍለ ጊዜ ማስታወሻዎች" },
  "notes.subtitle": { en: "Log observations about your child's progress", am: "ስለ ልጅዎ እድገት ምልከታዎችን ይመዝግቡ" },
  "notes.placeholder": { en: "Write your observation here...", am: "ምልከታዎን እዚህ ይጻፉ..." },
  "notes.addNote": { en: "Add Note", am: "ማስታወሻ ጨምር" },
  "notes.saved": { en: "Note saved!", am: "ማስታወሻ ተቀምጧል!" },
  "notes.empty": { en: "No notes yet. Start journaling!", am: "ገና ማስታወሻ የለም።" },
  "notes.signInRequired": { en: "Please sign in to use session notes.", am: "የክፍለ ጊዜ ማስታወሻዎችን ለመጠቀም ይግቡ።" },

  // Navigation extras
  "nav.sentenceBuilder": { en: "Sentence Builder", am: "ዓረፍተ ነገር ገንቢ" },
  "nav.dailyRoutine": { en: "Daily Routine", am: "የዕለት ተዕለት" },
  "nav.letterTracing": { en: "Letter Tracing", am: "ፊደል መከተብ" },
  "nav.parentNotes": { en: "Session Notes", am: "ማስታወሻዎች" },

  // Rewards
  "rewards.title": { en: "Rewards", am: "ሽልማቶች" },
  "rewards.streak": { en: "Day Streak", am: "ተከታታይ ቀናት" },

  // Early Detection
  "detection.title": { en: "Early Detection Screening", am: "ቅድመ ምርመራ" },
  "detection.subtitle": { en: "Answer developmental questions about your child. AI will analyze patterns and generate a report you can share with a doctor.", am: "ስለ ልጅዎ የእድገት ጥያቄዎችን ይመልሱ። AI ንድፎችን ይመረምራል እና ለሐኪም የሚያካፍሉት ሪፖርት ያዘጋጃል።" },
  "detection.disclaimer": { en: "Important Disclaimer", am: "ማስጠንቀቂያ" },
  "detection.disclaimerText": { en: "This is a screening tool, NOT a medical diagnosis. Results should be shared with a qualified healthcare professional.", am: "ይህ የማጣሪያ መሳሪያ ነው፣ ሕክምናዊ ምርመራ አይደለም። ውጤቶችን ከብቁ ባለሙያ ጋር ያካፍሉ።" },
  "detection.begin": { en: "Begin Screening", am: "ማጣሪያ ጀምር" },
  "detection.question": { en: "Question", am: "ጥያቄ" },
  "detection.generateReport": { en: "Generate Report", am: "ሪፖርት ያዘጋጁ" },
  "detection.analyzing": { en: "Analyzing Responses…", am: "ምላሾችን በመተንተን ላይ…" },
  "detection.analyzingDesc": { en: "Our AI is reviewing your answers and generating a personalized report.", am: "AI ምላሾችዎን በመገምገም ግላዊ ሪፖርት በማዘጋጀት ላይ ነው።" },
  "detection.reportTitle": { en: "Screening Report", am: "የማጣሪያ ሪፖርት" },
  "detection.printReport": { en: "Print Report", am: "ሪፖርት አትም" },
  "detection.startOver": { en: "Start Over", am: "እንደገና ጀምር" },

  // Community Content
  "community.title": { en: "Community Therapy Library", am: "የማህበረሰብ ቴራፒ ቤተ-መጽሐፍት" },
  "community.subtitle": { en: "Browse and share lessons, activities, and resources created by therapists, teachers, and parents.", am: "በባለሙያዎች፣ አስተማሪዎች እና ወላጆች የተፈጠሩ ትምህርቶችን፣ እንቅስቃሴዎችን እና ሀብቶችን ይቃኙ እና ያካፍሉ።" },
  "community.contribute": { en: "Share Content", am: "ይዘት ያካፍሉ" },
  "community.cancel": { en: "Cancel", am: "ሰርዝ" },
  "community.titlePlaceholder": { en: "Title (e.g. 'Color Matching Game')", am: "ርዕስ" },
  "community.descPlaceholder": { en: "Brief description", am: "አጭር መግለጫ" },
  "community.bodyPlaceholder": { en: "Full content, instructions, or activity details…", am: "ሙሉ ይዘት፣ መመሪያዎች…" },
  "community.submit": { en: "Submit", am: "አስገባ" },
  "community.submitted": { en: "Content submitted! Thank you for contributing.", am: "ይዘት ቀርቧል! ስላበረከቱ እናመሰግናለን።" },
  "community.signInRequired": { en: "Please sign in to contribute.", am: "ለማበርከት ይግቡ።" },
  "community.empty": { en: "No content yet", am: "ገና ይዘት የለም" },
  "community.beFirst": { en: "Be the first to share a resource!", am: "ሀብት ለማካፈል የመጀመሪያ ይሁኑ!" },

  // Nav extras
  "nav.earlyDetection": { en: "Early Detection", am: "ቅድመ ምርመራ" },
  "nav.community": { en: "Community", am: "ማህበረሰብ" },
} as const;

type TranslationKey = keyof typeof translations;

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({} as LanguageContextType);

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("kinf-lang");
    return (saved === "am" ? "am" : "en") as Lang;
  });

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === "en" ? "am" : "en";
      localStorage.setItem("kinf-lang", next);
      return next;
    });
  }, []);

  const t = useCallback((key: TranslationKey) => {
    return translations[key]?.[lang] ?? key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
