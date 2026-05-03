import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Music, Users, Puzzle, Lock, Play, ArrowLeft, ArrowRight, Volume2, CheckCircle, HelpCircle, Trophy } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProgress } from "@/hooks/useProgress";
import { useAuth } from "@/contexts/AuthContext";
import { playTapSound, playCorrectSound, playWrongSound, playSuccessSound, speakAmharic } from "@/lib/sounds";

interface QuizQuestion {
  question: string;
  questionAm: string;
  options: string[];
  optionsAm: string[];
  correctIndex: number;
}

interface Lesson {
  title: string;
  titleAm: string;
  content: string;
  contentAm: string;
  amharicChar?: string;
  sound?: string;
}

interface Module {
  titleKey: string;
  descKey: string;
  icon: typeof BookOpen;
  color: string;
  unlocked: boolean;
  lessons: Lesson[];
  quiz: QuizQuestion[];
}

const mk = (title: string, content: string, char?: string, sound?: string): Lesson => ({
  title, titleAm: title, content, contentAm: content, amharicChar: char, sound: sound ?? char,
});
const mkQ = (q: string, opts: string[], correctIndex: number): QuizQuestion => ({
  question: q, questionAm: q, options: opts, optionsAm: opts, correctIndex,
});

const modulesData: Module[] = [
  {
    titleKey: "lab.module1.title",
    descKey: "lab.module1.desc",
    icon: BookOpen,
    color: "bg-kinf-blue-light text-primary",
    unlocked: true,
    lessons: [
      mk("Letter A", "A is for Apple 🍎. Say 'Ay'. Apple is red and sweet.", "A", "A for Apple"),
      mk("Letter B", "B is for Ball ⚽. Say 'Bee'. A ball can bounce.", "B", "B for Ball"),
      mk("Letter C", "C is for Cat 🐱. Say 'See'. A cat says meow.", "C", "C for Cat"),
      mk("Letter D", "D is for Dog 🐶. Say 'Dee'. A dog says woof.", "D", "D for Dog"),
      mk("Letter E", "E is for Egg 🥚. Say 'Ee'. We eat eggs for breakfast.", "E", "E for Egg"),
      mk("Letter F", "F is for Fish 🐟. Say 'Eff'. Fish swim in water.", "F", "F for Fish"),
      mk("Letter G", "G is for Goat 🐐. Say 'Jee'. Goats give milk.", "G", "G for Goat"),
      mk("Letter H", "H is for Hat 🎩. Say 'Aitch'. We wear a hat on our head.", "H", "H for Hat"),
      mk("Letter I", "I is for Ice 🧊. Say 'Eye'. Ice is cold.", "I", "I for Ice"),
      mk("Letter J", "J is for Juice 🧃. Say 'Jay'. Juice is sweet.", "J", "J for Juice"),
      mk("Letter K", "K is for Kite 🪁. Say 'Kay'. A kite flies in the wind.", "K", "K for Kite"),
      mk("Letter L", "L is for Lion 🦁. Say 'Ell'. The lion is brave.", "L", "L for Lion"),
      mk("Letter M", "M is for Moon 🌙. Say 'Em'. The moon shines at night.", "M", "M for Moon"),
      mk("Letter N", "N is for Nest 🪺. Say 'En'. Birds live in a nest.", "N", "N for Nest"),
      mk("Letter O", "O is for Orange 🍊. Say 'Oh'. Oranges are juicy.", "O", "O for Orange"),
      mk("Letter P", "P is for Pen 🖊️. Say 'Pee'. We write with a pen.", "P", "P for Pen"),
    ],
    quiz: [
      mkQ("Which letter is for Apple?", ["B", "A", "C", "D"], 1),
      mkQ("What sound does D make?", ["Dee", "Bee", "See", "Ee"], 0),
      mkQ("F is for…", ["Frog", "Fish", "Foot", "Fan"], 1),
      mkQ("A cat says…", ["Woof", "Moo", "Meow", "Quack"], 2),
      mkQ("K is for…", ["Key", "Kite", "Kid", "King"], 1),
      mkQ("Which letter comes after L?", ["K", "M", "N", "O"], 1),
      mkQ("Oranges are which letter?", ["A", "I", "O", "U"], 2),
      mkQ("We write with a…", ["Pan", "Pen", "Pin", "Pet"], 1),
    ],
  },
  {
    titleKey: "lab.module2.title",
    descKey: "lab.module2.desc",
    icon: Music,
    color: "bg-kinf-sage-light text-secondary",
    unlocked: true,
    lessons: [
      mk("Number 1", "One 🟦. Show me 1 finger!", "1", "One"),
      mk("Number 2", "Two 🟦🟦. Show me 2 fingers!", "2", "Two"),
      mk("Number 3", "Three 🟦🟦🟦. Three little birds.", "3", "Three"),
      mk("Number 4", "Four 🟦🟦🟦🟦. A square has 4 sides.", "4", "Four"),
      mk("Number 5", "Five ✋. A hand has 5 fingers.", "5", "Five"),
      mk("Number 6", "Six. 5 + 1 = 6.", "6", "Six"),
      mk("Number 7", "Seven. A week has 7 days.", "7", "Seven"),
      mk("Number 8", "Eight. A spider has 8 legs.", "8", "Eight"),
      mk("Number 9", "Nine. 10 - 1 = 9.", "9", "Nine"),
      mk("Number 10", "Ten 🙌. Two hands = 10 fingers.", "10", "Ten"),
      mk("Add: 2 + 3", "2 apples + 3 apples = 5 apples 🍎.", "5", "Two plus three is five"),
      mk("Add: 4 + 4", "4 + 4 = 8. Try with your fingers!", "8", "Four plus four is eight"),
      mk("Subtract: 5 - 2", "5 candies, eat 2, you have 3 left.", "3", "Five minus two is three"),
      mk("Subtract: 9 - 4", "9 - 4 = 5.", "5", "Nine minus four is five"),
      mk("Even & Odd", "2, 4, 6, 8, 10 are even. 1, 3, 5, 7, 9 are odd.", "🔢", "Even and odd numbers"),
    ],
    quiz: [
      mkQ("How many fingers on one hand?", ["3", "5", "7", "10"], 1),
      mkQ("What comes after 6?", ["5", "7", "8", "9"], 1),
      mkQ("How many days in a week?", ["5", "6", "7", "8"], 2),
      mkQ("A spider has __ legs.", ["6", "7", "8", "10"], 2),
      mkQ("2 + 3 = ?", ["4", "5", "6", "7"], 1),
      mkQ("9 - 4 = ?", ["3", "4", "5", "6"], 2),
      mkQ("Which number is even?", ["3", "5", "6", "9"], 2),
      mkQ("4 + 4 = ?", ["6", "7", "8", "9"], 2),
    ],
  },
  {
    titleKey: "lab.module3.title",
    descKey: "lab.module3.desc",
    icon: Users,
    color: "bg-kinf-warm-light text-accent",
    unlocked: true,
    lessons: [
      mk("Saying Hello", "When we meet someone, we wave and say 'Hello!'. Try it: Hello!", "👋", "Hello"),
      mk("Saying Thank You", "When someone helps us, we say 'Thank you!'. It makes them feel good.", "🙏", "Thank you"),
      mk("Asking for Help", "When we need help, we say 'Please help me'. It is okay to ask.", "✋", "Please help me"),
      mk("Sharing", "Sharing makes friends happy. Say 'This is for you' when you share.", "🤝", "This is for you"),
      mk("Saying Goodbye", "When we leave, we say 'Goodbye!' or 'See you later!'.", "👋", "Goodbye"),
      mk("Listening", "Good listeners use their eyes and ears. Look at the person who is speaking.", "👂", "Listen"),
      mk("Taking Turns", "We take turns when we play games. Wait for your turn patiently.", "🔄", "Take turns"),
      mk("Saying Sorry", "When we make a mistake, we say 'I'm sorry'. It heals friendships.", "💗", "I am sorry"),
      mk("Personal Space", "Stay an arm's length from others. This is called personal space.", "🤲", "Personal space"),
    ],
    quiz: [
      mkQ("What do you say when you meet someone?", ["Bye", "Hello", "Thanks", "Help"], 1),
      mkQ("Someone gives you a gift. You say…", ["Goodbye", "Hello", "Thank you", "Stop"], 2),
      mkQ("When you leave you say…", ["Hello", "Help", "Goodbye", "Yes"], 2),
      mkQ("If you bumped into someone you say…", ["Yay", "Sorry", "Bye", "Hi"], 1),
      mkQ("Good listeners use their…", ["Mouth", "Hands", "Eyes and ears", "Feet"], 2),
      mkQ("When playing a game we…", ["Yell", "Push", "Take turns", "Cheat"], 2),
    ],
  },
  {
    titleKey: "lab.module4.title",
    descKey: "lab.module4.desc",
    icon: Users,
    color: "bg-kinf-warm-light text-accent",
    unlocked: true,
    lessons: [
      mk("Red", "Red 🔴 like an apple or a tomato.", "🔴", "Red"),
      mk("Blue", "Blue 🔵 like the sky and the sea.", "🔵", "Blue"),
      mk("Yellow", "Yellow 🟡 like the sun and bananas.", "🟡", "Yellow"),
      mk("Green", "Green 🟢 like grass and leaves.", "🟢", "Green"),
      mk("Orange", "Orange 🟠 like a carrot or pumpkin.", "🟠", "Orange"),
      mk("Purple", "Purple 🟣 like a grape.", "🟣", "Purple"),
      mk("Black & White", "Black ⚫ is dark. White ⚪ is bright.", "⚫", "Black and white"),
      mk("Circle", "A circle ⭕ is round, like a ball.", "⭕", "Circle"),
      mk("Square", "A square 🟥 has 4 equal sides.", "🟥", "Square"),
      mk("Triangle", "A triangle 🔺 has 3 sides.", "🔺", "Triangle"),
      mk("Star", "A star ⭐ has 5 points.", "⭐", "Star"),
      mk("Heart", "A heart ❤️ shape means love.", "❤️", "Heart"),
    ],
    quiz: [
      mkQ("What color is the sky?", ["Red", "Blue", "Green", "Black"], 1),
      mkQ("How many sides does a triangle have?", ["2", "3", "4", "5"], 1),
      mkQ("Bananas are…", ["Red", "Blue", "Yellow", "Purple"], 2),
      mkQ("A ball is shaped like a…", ["Square", "Triangle", "Circle", "Star"], 2),
      mkQ("Carrots are usually…", ["Purple", "Orange", "Blue", "Pink"], 1),
      mkQ("A star has __ points.", ["3", "4", "5", "6"], 2),
      mkQ("Grass is…", ["Red", "Green", "Yellow", "Black"], 1),
    ],
  },
  {
    titleKey: "lab.module5.title",
    descKey: "lab.module5.desc",
    icon: Puzzle,
    color: "bg-kinf-blue-light text-primary",
    unlocked: true,
    lessons: [
      mk("Dog 🐶", "A dog is a pet. It says 'Woof!'.", "🐶", "Dog says woof"),
      mk("Cat 🐱", "A cat is a pet. It says 'Meow!'.", "🐱", "Cat says meow"),
      mk("Cow 🐄", "A cow gives us milk. It says 'Moo!'.", "🐄", "Cow says moo"),
      mk("Sheep 🐑", "A sheep gives us wool. It says 'Baa!'.", "🐑", "Sheep says baa"),
      mk("Lion 🦁", "A lion is the king of the jungle. It roars!", "🦁", "Lion roars"),
      mk("Elephant 🐘", "An elephant is huge with a long trunk.", "🐘", "Elephant"),
      mk("Bird 🐦", "A bird can fly. It sings 'Tweet!'.", "🐦", "Bird sings tweet"),
      mk("Fish 🐟", "A fish swims in the water.", "🐟", "Fish"),
      mk("Horse 🐴", "A horse can run very fast. It says 'Neigh!'.", "🐴", "Horse"),
      mk("Monkey 🐵", "A monkey loves bananas and climbs trees.", "🐵", "Monkey"),
      mk("Frog 🐸", "A frog hops and lives near water.", "🐸", "Frog"),
    ],
    quiz: [
      mkQ("A cow says…", ["Woof", "Meow", "Moo", "Baa"], 2),
      mkQ("Which animal can fly?", ["Cat", "Bird", "Dog", "Cow"], 1),
      mkQ("The 'king of the jungle' is the…", ["Elephant", "Sheep", "Lion", "Fish"], 2),
      mkQ("A fish lives in…", ["Trees", "Sky", "Water", "Sand"], 2),
      mkQ("Monkeys love to eat…", ["Fish", "Bananas", "Grass", "Meat"], 1),
      mkQ("A horse says…", ["Moo", "Baa", "Neigh", "Roar"], 2),
      mkQ("Which animal hops?", ["Frog", "Lion", "Cow", "Bird"], 0),
    ],
  },
  {
    titleKey: "lab.module6.title",
    descKey: "lab.module6.desc",
    icon: BookOpen,
    color: "bg-kinf-blue-light text-primary",
    unlocked: true,
    lessons: [
      mk("Head 🙂", "This is your head. It holds your brain and your face.", "🙂", "Head"),
      mk("Eyes 👀", "We see with our eyes. Two eyes help us look around.", "👀", "Eyes"),
      mk("Ears 👂", "We hear with our ears. They listen to sounds.", "👂", "Ears"),
      mk("Mouth 👄", "We talk and eat with our mouth.", "👄", "Mouth"),
      mk("Hands ✋", "We use our hands to touch, hold, and wave.", "✋", "Hands"),
      mk("Feet 🦶", "We walk and run with our feet.", "🦶", "Feet"),
      mk("Heart ❤️", "Our heart beats inside our chest. It keeps us alive.", "❤️", "Heart"),
      mk("Nose 👃", "We smell with our nose. It also helps us breathe.", "👃", "Nose"),
      mk("Teeth 🦷", "Teeth help us chew food. Brush them every day!", "🦷", "Teeth"),
    ],
    quiz: [
      mkQ("We see with our…", ["Ears", "Eyes", "Hands", "Feet"], 1),
      mkQ("We hear with our…", ["Eyes", "Mouth", "Ears", "Nose"], 2),
      mkQ("We walk with our…", ["Hands", "Feet", "Mouth", "Eyes"], 1),
      mkQ("Our heart is in our…", ["Head", "Hand", "Chest", "Foot"], 2),
      mkQ("We smell with our…", ["Eyes", "Nose", "Hands", "Ears"], 1),
      mkQ("We chew food with our…", ["Eyes", "Hair", "Teeth", "Knees"], 2),
    ],
  },
  {
    titleKey: "lab.module7.title",
    descKey: "lab.module7.desc",
    icon: Music,
    color: "bg-kinf-sage-light text-secondary",
    unlocked: true,
    lessons: [
      mk("Apple 🍎", "An apple is a sweet, crunchy fruit. Apples can be red or green.", "🍎", "Apple"),
      mk("Banana 🍌", "A banana is a yellow fruit. Peel it before you eat it!", "🍌", "Banana"),
      mk("Bread 🍞", "Bread is made from flour. We eat it for breakfast.", "🍞", "Bread"),
      mk("Milk 🥛", "Milk is a white drink that helps bones grow strong.", "🥛", "Milk"),
      mk("Water 💧", "Water keeps us healthy. Drink water every day!", "💧", "Water"),
      mk("Egg 🥚", "Eggs come from chickens. They are yummy when cooked.", "🥚", "Egg"),
      mk("Rice 🍚", "Rice is a small white grain. People eat rice all over the world.", "🍚", "Rice"),
      mk("Vegetables 🥦", "Vegetables make us strong. Carrots, broccoli, spinach!", "🥦", "Vegetables"),
      mk("Injera 🫓", "Injera is a soft Ethiopian flatbread. Yummy with stew!", "🫓", "Injera"),
    ],
    quiz: [
      mkQ("A banana is what color?", ["Red", "Yellow", "Blue", "Green"], 1),
      mkQ("What helps your bones grow strong?", ["Milk", "Soda", "Juice", "Tea"], 0),
      mkQ("What should we drink every day?", ["Water", "Cola", "Coffee", "Wine"], 0),
      mkQ("Eggs come from…", ["Cows", "Fish", "Chickens", "Sheep"], 2),
      mkQ("Injera is from which country?", ["Italy", "Ethiopia", "Japan", "Brazil"], 1),
      mkQ("Carrots are a kind of…", ["Fruit", "Meat", "Vegetable", "Grain"], 2),
    ],
  },
  {
    titleKey: "lab.module8.title",
    descKey: "lab.module8.desc",
    icon: Users,
    color: "bg-kinf-warm-light text-accent",
    unlocked: true,
    lessons: [
      mk("Mom 👩", "Your mom takes care of you. She loves you very much.", "👩", "Mom"),
      mk("Dad 👨", "Your dad also takes care of you. He keeps you safe.", "👨", "Dad"),
      mk("Sister 👧", "A sister is a girl in your family.", "👧", "Sister"),
      mk("Brother 👦", "A brother is a boy in your family.", "👦", "Brother"),
      mk("Grandma 👵", "Grandma is your mom or dad's mom. She tells stories.", "👵", "Grandma"),
      mk("Grandpa 👴", "Grandpa is your mom or dad's dad. He is wise.", "👴", "Grandpa"),
      mk("Friend 🤝", "A friend is someone who plays and shares with you.", "🤝", "Friend"),
      mk("Aunt & Uncle", "Your mom or dad's sister is your aunt. Their brother is your uncle.", "👨‍👩‍👧", "Aunt and uncle"),
      mk("Cousin", "Your aunt's or uncle's child is your cousin.", "🧒", "Cousin"),
    ],
    quiz: [
      mkQ("Who is your mom's mom?", ["Sister", "Aunt", "Grandma", "Friend"], 2),
      mkQ("A sister is a…", ["Boy", "Girl", "Pet", "Toy"], 1),
      mkQ("A friend is someone who…", ["Hits you", "Shares with you", "Steals", "Yells"], 1),
      mkQ("A brother is a…", ["Girl", "Boy", "Plant", "Car"], 1),
      mkQ("Your aunt's child is your…", ["Sister", "Cousin", "Grandpa", "Friend"], 1),
    ],
  },
  {
    titleKey: "lab.module9.title",
    descKey: "lab.module9.desc",
    icon: Puzzle,
    color: "bg-kinf-blue-light text-primary",
    unlocked: true,
    lessons: [
      mk("Happy 😊", "When something good happens, we feel happy. We smile!", "😊", "Happy"),
      mk("Sad 😢", "When something bad happens, we feel sad. It's okay to cry.", "😢", "Sad"),
      mk("Angry 😠", "Sometimes we feel angry. Take a deep breath. Count to 5.", "😠", "Angry"),
      mk("Scared 😨", "Feeling scared is okay. Tell a grown-up how you feel.", "😨", "Scared"),
      mk("Surprised 😲", "Surprise is when something happens that you did not expect.", "😲", "Surprised"),
      mk("Calm 😌", "Calm means quiet and peaceful. Slow breaths help us feel calm.", "😌", "Calm"),
      mk("Tired 😴", "When we are tired, we need to rest or sleep.", "😴", "Tired"),
      mk("Excited 🤩", "Excited means very happy about something coming up!", "🤩", "Excited"),
      mk("Proud 😎", "Proud means happy with what you did well.", "😎", "Proud"),
    ],
    quiz: [
      mkQ("Smiling means you are…", ["Sad", "Happy", "Angry", "Tired"], 1),
      mkQ("Crying often means you are…", ["Happy", "Sad", "Surprised", "Calm"], 1),
      mkQ("To calm down when angry, you can…", ["Yell loudly", "Hit something", "Take a deep breath", "Run away"], 2),
      mkQ("When you are tired you should…", ["Run", "Rest", "Eat candy", "Shout"], 1),
      mkQ("Finishing a hard puzzle makes you feel…", ["Sad", "Proud", "Scared", "Tired"], 1),
    ],
  },
  {
    titleKey: "lab.module10.title",
    descKey: "lab.module10.desc",
    icon: BookOpen,
    color: "bg-kinf-blue-light text-primary",
    unlocked: true,
    lessons: [
      mk("Sun ☀️", "The sun gives us light and warmth during the day.", "☀️", "Sun"),
      mk("Moon 🌙", "The moon shines in the sky at night.", "🌙", "Moon"),
      mk("Stars ⭐", "Stars twinkle far, far away in space.", "⭐", "Stars"),
      mk("Rain 🌧️", "Rain falls from clouds to water plants.", "🌧️", "Rain"),
      mk("Tree 🌳", "Trees give us shade, fruit, and clean air.", "🌳", "Tree"),
      mk("Flower 🌸", "Flowers smell sweet and make the world pretty.", "🌸", "Flower"),
      mk("Mountain ⛰️", "Mountains are very tall hills made of rock.", "⛰️", "Mountain"),
      mk("River 🏞️", "Rivers are long flows of water through the land.", "🏞️", "River"),
    ],
    quiz: [
      mkQ("What gives us light during the day?", ["Moon", "Sun", "Stars", "Lamp"], 1),
      mkQ("What falls from the clouds?", ["Snow only", "Rain", "Sand", "Light"], 1),
      mkQ("Trees give us…", ["Wifi", "Shade and fruit", "Cars", "Plastic"], 1),
      mkQ("A very tall hill is a…", ["River", "Mountain", "Cloud", "Forest"], 1),
    ],
  },
  {
    titleKey: "lab.module11.title",
    descKey: "lab.module11.desc",
    icon: Music,
    color: "bg-kinf-sage-light text-secondary",
    unlocked: true,
    lessons: [
      mk("Car 🚗", "A car has 4 wheels and takes us places on roads.", "🚗", "Car"),
      mk("Bus 🚌", "A bus is bigger than a car. Many people ride together.", "🚌", "Bus"),
      mk("Bicycle 🚲", "A bicycle has 2 wheels. We pedal to make it go.", "🚲", "Bicycle"),
      mk("Airplane ✈️", "An airplane flies high in the sky.", "✈️", "Airplane"),
      mk("Boat ⛵", "A boat floats on water and carries us across rivers and seas.", "⛵", "Boat"),
      mk("Train 🚆", "A train runs on tracks and is very long.", "🚆", "Train"),
    ],
    quiz: [
      mkQ("Which one flies?", ["Car", "Boat", "Airplane", "Train"], 2),
      mkQ("A bicycle has __ wheels.", ["1", "2", "3", "4"], 1),
      mkQ("Boats travel on…", ["Roads", "Sky", "Water", "Tracks"], 2),
      mkQ("Trains move on…", ["Roads", "Tracks", "Water", "Wind"], 1),
    ],
  },
  {
    titleKey: "lab.module12.title",
    descKey: "lab.module12.desc",
    icon: Users,
    color: "bg-kinf-warm-light text-accent",
    unlocked: true,
    lessons: [
      mk("Wash hands", "Wash your hands with soap before eating and after the toilet.", "🧼", "Wash hands"),
      mk("Brush teeth", "Brush your teeth in the morning and at night for healthy smiles.", "🪥", "Brush teeth"),
      mk("Cover a cough", "Cover your mouth with your elbow when you cough.", "🤧", "Cover your cough"),
      mk("Stop, look, listen", "Before crossing a road: STOP, LOOK both ways, then LISTEN.", "🚸", "Stop look listen"),
      mk("Strangers", "Don't go anywhere with people you don't know. Tell a grown-up.", "🛑", "Stranger danger"),
      mk("Healthy eating", "Eat fruits and vegetables every day for strong bodies.", "🥗", "Healthy eating"),
      mk("Sleep well", "Children need 9–11 hours of sleep to grow strong.", "🛏️", "Sleep well"),
    ],
    quiz: [
      mkQ("When should you wash hands?", ["Never", "Before eating", "Only Sundays", "Once a year"], 1),
      mkQ("Cover your cough with your…", ["Hands", "Elbow", "Hat", "Foot"], 1),
      mkQ("Before crossing a road…", ["Run fast", "Close eyes", "Stop, look, listen", "Sing"], 2),
      mkQ("If a stranger asks you to come…", ["Go with them", "Tell a grown-up", "Hide", "Yell at them"], 1),
    ],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

const LearningLab = () => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const { updateLessonProgress, updateQuizScore, getModuleProgress } = useProgress();
  const [activeModule, setActiveModule] = useState<number | null>(null);
  const [activeLesson, setActiveLesson] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // Save lesson progress as user navigates
  useEffect(() => {
    if (activeModule !== null && user) {
      const mod = modulesData[activeModule];
      updateLessonProgress(activeModule, activeLesson + 1, mod.lessons.length);
    }
  }, [activeLesson, activeModule]);

  const speak = (text: string) => {
    playTapSound();
    speakAmharic(text);
  };

  const resetModule = () => {
    setActiveModule(null);
    setActiveLesson(0);
    setShowQuiz(false);
    setQuizIndex(0);
    setQuizScore(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setQuizFinished(false);
  };

  const handleAnswer = (index: number) => {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);
    const mod = modulesData[activeModule!];
    if (index === mod.quiz[quizIndex].correctIndex) {
      setQuizScore((s) => s + 1);
      playCorrectSound();
    } else {
      playWrongSound();
    }
  };

  const nextQuizQuestion = () => {
    const mod = modulesData[activeModule!];
    if (quizIndex + 1 < mod.quiz.length) {
      setQuizIndex((i) => i + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      setQuizFinished(true);
      playSuccessSound();
      // Save quiz score
      if (user) {
        updateQuizScore(activeModule!, quizScore + (selectedAnswer === mod.quiz[quizIndex].correctIndex ? 0 : 0), mod.quiz.length, mod.lessons.length);
      }
    }
  };

  // Save final quiz score when quiz finishes
  useEffect(() => {
    if (quizFinished && activeModule !== null && user) {
      const mod = modulesData[activeModule];
      updateQuizScore(activeModule, quizScore, mod.quiz.length, mod.lessons.length);
    }
  }, [quizFinished]);

  // Quiz view
  if (activeModule !== null && showQuiz) {
    const mod = modulesData[activeModule];

    if (quizFinished) {
      const total = mod.quiz.length;
      const pct = Math.round((quizScore / total) * 100);
      return (
        <div className="min-h-screen py-12">
          <div className="container mx-auto max-w-md px-4 text-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-kinf-blue-light">
                <Trophy className="h-12 w-12 text-primary" />
              </div>
              <h2 className="mb-2 text-3xl font-extrabold text-foreground">{t("quiz.complete")}</h2>
              <p className="mb-4 text-lg text-muted-foreground">
                {quizScore}/{total} ({pct}%)
              </p>
              <p className="mb-8 text-sm text-muted-foreground">
                {pct >= 75 ? (t("quiz.great")) : pct >= 50 ? (t("quiz.good")) : (t("quiz.tryAgain"))}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={resetModule} variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {t("lab.back")}
                </Button>
                <Button onClick={() => { setQuizIndex(0); setQuizScore(0); setSelectedAnswer(null); setAnswered(false); setQuizFinished(false); }} className="gap-2 bg-gradient-kinf hover:opacity-90">
                  <HelpCircle className="h-4 w-4" />
                  {t("quiz.retry")}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      );
    }

    const q = mod.quiz[quizIndex];

    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto max-w-lg px-4">
          <Button variant="ghost" onClick={resetModule} className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t("lab.back")}
          </Button>

          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>{t("quiz.title")} – {quizIndex + 1}/{mod.quiz.length}</span>
            <span>{t("quiz.score")}: {quizScore}</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={quizIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <Card className="shadow-kinf-lg">
                <CardContent className="p-6">
                  <div className="mb-6 flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-kinf-blue-light">
                      <HelpCircle className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                      {lang === "am" ? q.questionAm : q.question}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {(lang === "am" ? q.optionsAm : q.options).map((opt, i) => {
                      let bg = "bg-muted hover:bg-muted/80";
                      if (answered) {
                        if (i === q.correctIndex) bg = "bg-secondary/20 border-secondary";
                        else if (i === selectedAnswer && i !== q.correctIndex) bg = "bg-destructive/20 border-destructive";
                      }
                      return (
                        <button
                          key={i}
                          onClick={() => handleAnswer(i)}
                          disabled={answered}
                          className={`w-full rounded-xl border-2 border-transparent px-4 py-3 text-left text-sm font-semibold transition-all ${bg} ${!answered ? "cursor-pointer" : ""}`}
                        >
                          <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-background text-xs font-bold">
                            {String.fromCharCode(65 + i)}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {answered && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center">
                      <p className={`mb-3 text-sm font-semibold ${selectedAnswer === q.correctIndex ? "text-secondary" : "text-destructive"}`}>
                        {selectedAnswer === q.correctIndex ? (t("quiz.correct")) : (t("quiz.incorrect"))}
                      </p>
                      <Button onClick={nextQuizQuestion} className="gap-2 bg-gradient-kinf hover:opacity-90">
                        {quizIndex + 1 < mod.quiz.length ? t("lesson.next") : t("quiz.seeResults")}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Lesson view
  if (activeModule !== null) {
    const mod = modulesData[activeModule];
    const lesson = mod.lessons[activeLesson];
    const isLast = activeLesson === mod.lessons.length - 1;

    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto max-w-2xl px-4">
          <Button variant="ghost" onClick={resetModule} className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t("lab.back")}
          </Button>

          <div className="mb-4 text-sm text-muted-foreground">
            {activeLesson + 1} {t("lesson.of")} {mod.lessons.length}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeLesson}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-kinf-lg">
                <CardContent className="p-8">
                  <h2 className="mb-2 text-2xl font-extrabold text-foreground">
                    {lang === "am" ? lesson.titleAm : lesson.title}
                  </h2>

                  {lesson.amharicChar && (
                    <div className="my-6 flex items-center justify-center">
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="flex h-32 w-32 items-center justify-center rounded-2xl bg-kinf-blue-light text-5xl font-bold text-primary shadow-kinf cursor-pointer"
                        onClick={() => lesson.sound && speak(lesson.sound)}
                      >
                        {lesson.amharicChar.length <= 2 ? lesson.amharicChar : lesson.amharicChar.slice(0, 2)}
                      </motion.div>
                    </div>
                  )}

                  <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                    {lang === "am" ? lesson.contentAm : lesson.content}
                  </p>

                  {lesson.sound && (
                    <div className="mb-6 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        onClick={() => speak(lesson.sound!)}
                        className="gap-2 border-primary/30"
                      >
                        <Volume2 className="h-4 w-4" />
                        {t("lesson.listen")}: {lesson.sound}
                      </Button>
                      {lesson.amharicChar && lesson.amharicChar.length > 2 && (
                        lesson.amharicChar.split("").filter(c => c.trim()).map((char, idx) => (
                          <Button
                            key={idx}
                            variant="ghost"
                            size="sm"
                            onClick={() => speak(char)}
                            className="gap-1 text-lg"
                          >
                            <Volume2 className="h-3 w-3" />
                            {char}
                          </Button>
                        ))
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      disabled={activeLesson === 0}
                      onClick={() => setActiveLesson((p) => p - 1)}
                      className="gap-1"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      {t("lesson.previous")}
                    </Button>

                    {isLast ? (
                      mod.quiz.length > 0 ? (
                        <Button
                          onClick={() => setShowQuiz(true)}
                          className="gap-2 bg-gradient-kinf hover:opacity-90"
                        >
                          <HelpCircle className="h-4 w-4" />
                          {t("quiz.takeQuiz")}
                        </Button>
                      ) : (
                        <Button
                          onClick={resetModule}
                          className="gap-2 bg-gradient-kinf hover:opacity-90"
                        >
                          <CheckCircle className="h-4 w-4" />
                          {t("lesson.complete")}
                        </Button>
                      )
                    ) : (
                      <Button
                        onClick={() => setActiveLesson((p) => p + 1)}
                        className="gap-1 bg-gradient-kinf hover:opacity-90"
                      >
                        {t("lesson.next")}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Progress dots */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {mod.lessons.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveLesson(i)}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  i === activeLesson ? "bg-primary" : i < activeLesson ? "bg-secondary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h1 className="mb-2 text-3xl font-extrabold text-foreground">{t("lab.title")}</h1>
          <p className="text-muted-foreground">{t("lab.subtitle")}</p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-5">
          {modulesData.map((mod, i) => {
            const prog = getModuleProgress(i);
            const pct = prog ? Math.round((prog.lessons_completed / prog.total_lessons) * 100) : 0;
            return (
              <motion.div
                key={mod.titleKey}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Card className={`transition-all ${mod.unlocked ? "shadow-kinf hover:-translate-y-0.5 hover:shadow-kinf-lg" : "opacity-70"}`}>
                  <CardContent className="flex items-center gap-5 p-5">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${mod.color}`}>
                      <mod.icon className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-foreground">{t(mod.titleKey as any)}</h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">{t(mod.descKey as any)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {mod.lessons.length} {t("lab.lessons")}
                        {mod.quiz.length > 0 && ` + ${t("quiz.title")}`}
                      </p>
                      {prog && pct > 0 && (
                        <div className="mt-2">
                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {pct}% {prog.completed && prog.quiz_score !== null ? `· Quiz: ${prog.quiz_score}/${prog.quiz_total}` : ""}
                          </p>
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      disabled={!mod.unlocked}
                      onClick={() => { setActiveModule(i); setActiveLesson(0); }}
                      className={mod.unlocked ? "gap-1 bg-gradient-kinf hover:opacity-90" : "gap-1"}
                    >
                      {mod.unlocked ? (
                        <>{prog && prog.completed ? <CheckCircle className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />} {prog && prog.completed ? t("quiz.retry") : t("lab.start")}</>
                      ) : (
                        <><Lock className="h-3.5 w-3.5" /> {t("lab.locked")}</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LearningLab;
