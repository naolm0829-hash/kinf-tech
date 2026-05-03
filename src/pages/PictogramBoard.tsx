import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Volume2, Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { playTapSound, speakAmharic } from "@/lib/sounds";

interface Pictogram {
  emoji: string;
  amharic: string;
  english: string;
}

interface Category {
  key: string;
  labelEn: string;
  labelAm: string;
  items: Pictogram[];
}

const categories: Category[] = [
  {
    key: "essentials", labelEn: "Essentials", labelAm: "አስፈላጊ",
    items: [
      { emoji: "🍞", amharic: "ዳቦ", english: "Bread" },
      { emoji: "💧", amharic: "ውሃ", english: "Water" },
      { emoji: "😊", amharic: "ደስታ", english: "Happy" },
      { emoji: "😢", amharic: "ሀዘን", english: "Sad" },
      { emoji: "🏠", amharic: "ቤት", english: "Home" },
      { emoji: "👩", amharic: "እማማ", english: "Mom" },
      { emoji: "👨", amharic: "አባባ", english: "Dad" },
      { emoji: "🎒", amharic: "ትምህርት ቤት", english: "School" },
      { emoji: "🚽", amharic: "መጸዳጃ", english: "Bathroom" },
      { emoji: "🛏️", amharic: "መኝታ", english: "Sleep" },
      { emoji: "🍎", amharic: "ፖም", english: "Apple" },
      { emoji: "⭐", amharic: "ኮከብ", english: "Star" },
      { emoji: "❤️", amharic: "ፍቅር", english: "Love" },
      { emoji: "✋", amharic: "እርዳታ", english: "Help" },
      { emoji: "👋", amharic: "ሰላም", english: "Hello" },
      { emoji: "🙏", amharic: "አመሰግናለሁ", english: "Thank you" },
      { emoji: "✅", amharic: "አዎ", english: "Yes" },
      { emoji: "🚫", amharic: "አይ", english: "No" },
      { emoji: "🆘", amharic: "ድረሱልኝ", english: "Emergency" },
      { emoji: "🤒", amharic: "ታምሟል", english: "Sick" },
      { emoji: "🤕", amharic: "ጎድቶኛል", english: "Hurt" },
      { emoji: "😴", amharic: "ድካም", english: "Tired" },
      { emoji: "😡", amharic: "ቁጣ", english: "Angry" },
      { emoji: "😨", amharic: "ፍርሃት", english: "Scared" },
      { emoji: "😍", amharic: "እወዳለሁ", english: "I love it" },
      { emoji: "🙋", amharic: "እኔ", english: "Me" },
      { emoji: "👉", amharic: "አንተ", english: "You" },
      { emoji: "🤝", amharic: "ጓደኛ", english: "Friend" },
    ],
  },
  {
    key: "food", labelEn: "Food & Drink", labelAm: "ምግብና መጠጥ",
    items: [
      { emoji: "🍞", amharic: "ዳቦ", english: "Bread" },
      { emoji: "🥚", amharic: "እንቁላል", english: "Egg" },
      { emoji: "🥛", amharic: "ወተት", english: "Milk" },
      { emoji: "🧀", amharic: "አይብ", english: "Cheese" },
      { emoji: "🍚", amharic: "ሩዝ", english: "Rice" },
      { emoji: "🌽", amharic: "በቆሎ", english: "Corn" },
      { emoji: "🥔", amharic: "ድንች", english: "Potato" },
      { emoji: "🍅", amharic: "ቲማቲም", english: "Tomato" },
      { emoji: "🥕", amharic: "ካሮት", english: "Carrot" },
      { emoji: "🍌", amharic: "ሙዝ", english: "Banana" },
      { emoji: "🍎", amharic: "ፖም", english: "Apple" },
      { emoji: "🍊", amharic: "ብርቱካን", english: "Orange" },
      { emoji: "🍇", amharic: "ወይን", english: "Grapes" },
      { emoji: "🍉", amharic: "ሐብሐብ", english: "Watermelon" },
      { emoji: "🥭", amharic: "ማንጎ", english: "Mango" },
      { emoji: "🍗", amharic: "ስጋ", english: "Meat" },
      { emoji: "🐟", amharic: "ዓሣ", english: "Fish" },
      { emoji: "🍯", amharic: "ማር", english: "Honey" },
      { emoji: "🧈", amharic: "ቅቤ", english: "Butter" },
      { emoji: "☕", amharic: "ቡና", english: "Coffee" },
      { emoji: "🍵", amharic: "ሻይ", english: "Tea" },
      { emoji: "💧", amharic: "ውሃ", english: "Water" },
      { emoji: "🥤", amharic: "ለስላሳ", english: "Soda" },
      { emoji: "🍪", amharic: "ብስኩት", english: "Cookie" },
      { emoji: "🍰", amharic: "ኬክ", english: "Cake" },
    ],
  },
  {
    key: "animals", labelEn: "Animals", labelAm: "እንስሳት",
    items: [
      { emoji: "🐕", amharic: "ውሻ", english: "Dog" },
      { emoji: "🐈", amharic: "ድመት", english: "Cat" },
      { emoji: "🐄", amharic: "ላም", english: "Cow" },
      { emoji: "🐑", amharic: "በግ", english: "Sheep" },
      { emoji: "🐔", amharic: "ዶሮ", english: "Chicken" },
      { emoji: "🐴", amharic: "ፈረስ", english: "Horse" },
      { emoji: "🐘", amharic: "ዝሆን", english: "Elephant" },
      { emoji: "🦁", amharic: "አንበሳ", english: "Lion" },
      { emoji: "🐒", amharic: "ጦጣ", english: "Monkey" },
      { emoji: "🐦", amharic: "ወፍ", english: "Bird" },
      { emoji: "🐟", amharic: "ዓሣ", english: "Fish" },
      { emoji: "🐐", amharic: "ፍየል", english: "Goat" },
      { emoji: "🐢", amharic: "ኤሊ", english: "Turtle" },
      { emoji: "🐇", amharic: "ጥንቸል", english: "Rabbit" },
      { emoji: "🐍", amharic: "እባብ", english: "Snake" },
      { emoji: "🐝", amharic: "ንብ", english: "Bee" },
      { emoji: "🦋", amharic: "ቢራቢሮ", english: "Butterfly" },
      { emoji: "🐞", amharic: "ጎንግሎ", english: "Ladybug" },
      { emoji: "🐠", amharic: "ቀለማዊ ዓሳ", english: "Tropical fish" },
      { emoji: "🦒", amharic: "ቀጭኔ", english: "Giraffe" },
      { emoji: "🦓", amharic: "የሜዳ አህያ", english: "Zebra" },
      { emoji: "🐪", amharic: "ግመል", english: "Camel" },
    ],
  },
  {
    key: "colors", labelEn: "Colors", labelAm: "ቀለማት",
    items: [
      { emoji: "🔴", amharic: "ቀይ", english: "Red" },
      { emoji: "🔵", amharic: "ሰማያዊ", english: "Blue" },
      { emoji: "🟢", amharic: "አረንጓዴ", english: "Green" },
      { emoji: "🟡", amharic: "ቢጫ", english: "Yellow" },
      { emoji: "⚫", amharic: "ጥቁር", english: "Black" },
      { emoji: "⚪", amharic: "ነጭ", english: "White" },
      { emoji: "🟠", amharic: "ብርቱካናማ", english: "Orange" },
      { emoji: "🟣", amharic: "ወይን ጠጅ", english: "Purple" },
      { emoji: "🤎", amharic: "ቡናማ", english: "Brown" },
      { emoji: "💗", amharic: "ሮዝ", english: "Pink" },
      { emoji: "🩶", amharic: "ግራጫ", english: "Gray" },
      { emoji: "🩵", amharic: "ሰማያዊ ፈዛዛ", english: "Light Blue" },
      { emoji: "🩷", amharic: "ሮዝ ፈዛዛ", english: "Light Pink" },
      { emoji: "💚", amharic: "አረንጓዴ ልብ", english: "Mint" },
    ],
  },
  {
    key: "numbers", labelEn: "Numbers", labelAm: "ቁጥሮች",
    items: [
      { emoji: "0️⃣", amharic: "ዜሮ", english: "Zero" },
      { emoji: "1️⃣", amharic: "አንድ", english: "One" },
      { emoji: "2️⃣", amharic: "ሁለት", english: "Two" },
      { emoji: "3️⃣", amharic: "ሦስት", english: "Three" },
      { emoji: "4️⃣", amharic: "አራት", english: "Four" },
      { emoji: "5️⃣", amharic: "አምስት", english: "Five" },
      { emoji: "6️⃣", amharic: "ስድስት", english: "Six" },
      { emoji: "7️⃣", amharic: "ሰባት", english: "Seven" },
      { emoji: "8️⃣", amharic: "ስምንት", english: "Eight" },
      { emoji: "9️⃣", amharic: "ዘጠኝ", english: "Nine" },
      { emoji: "🔟", amharic: "አስር", english: "Ten" },
      { emoji: "💯", amharic: "መቶ", english: "Hundred" },
    ],
  },
  {
    key: "body", labelEn: "Body Parts", labelAm: "የሰውነት ክፍሎች",
    items: [
      { emoji: "👀", amharic: "ዓይን", english: "Eyes" },
      { emoji: "👃", amharic: "አፍንጫ", english: "Nose" },
      { emoji: "👄", amharic: "አፍ", english: "Mouth" },
      { emoji: "👂", amharic: "ጆሮ", english: "Ear" },
      { emoji: "🤚", amharic: "እጅ", english: "Hand" },
      { emoji: "🦶", amharic: "እግር", english: "Foot" },
      { emoji: "🦷", amharic: "ጥርስ", english: "Teeth" },
      { emoji: "💪", amharic: "ክንድ", english: "Arm" },
      { emoji: "🧠", amharic: "አንጎል", english: "Brain" },
      { emoji: "❤️", amharic: "ልብ", english: "Heart" },
      { emoji: "👅", amharic: "ምላስ", english: "Tongue" },
      { emoji: "🦵", amharic: "እግር ቋንጃ", english: "Leg" },
      { emoji: "🫁", amharic: "ሳንባ", english: "Lungs" },
      { emoji: "💇", amharic: "ጸጉር", english: "Hair" },
    ],
  },
  {
    key: "actions", labelEn: "Actions", labelAm: "ድርጊቶች",
    items: [
      { emoji: "🏃", amharic: "ሩጫ", english: "Run" },
      { emoji: "🚶", amharic: "መራመድ", english: "Walk" },
      { emoji: "🪑", amharic: "ቁጭ ማለት", english: "Sit" },
      { emoji: "🧍", amharic: "መቆም", english: "Stand" },
      { emoji: "🛌", amharic: "መተኛት", english: "Sleep" },
      { emoji: "🍽️", amharic: "መብላት", english: "Eat" },
      { emoji: "🥤", amharic: "መጠጣት", english: "Drink" },
      { emoji: "📚", amharic: "ማንበብ", english: "Read" },
      { emoji: "✏️", amharic: "መጻፍ", english: "Write" },
      { emoji: "🎨", amharic: "መሳል", english: "Draw" },
      { emoji: "🎵", amharic: "ማዳመጥ", english: "Listen" },
      { emoji: "🗣️", amharic: "መናገር", english: "Speak" },
      { emoji: "🤲", amharic: "መጫወት", english: "Play" },
      { emoji: "🛁", amharic: "መታጠብ", english: "Wash" },
      { emoji: "🦷", amharic: "ጥርስ መፋቅ", english: "Brush teeth" },
      { emoji: "💃", amharic: "መደነስ", english: "Dance" },
      { emoji: "🎤", amharic: "መዝፈን", english: "Sing" },
      { emoji: "🤗", amharic: "ማቀፍ", english: "Hug" },
    ],
  },
  {
    key: "places", labelEn: "Places", labelAm: "ቦታዎች",
    items: [
      { emoji: "🏠", amharic: "ቤት", english: "Home" },
      { emoji: "🏫", amharic: "ትምህርት ቤት", english: "School" },
      { emoji: "🏥", amharic: "ሆስፒታል", english: "Hospital" },
      { emoji: "🛒", amharic: "ሱቅ", english: "Shop" },
      { emoji: "⛪", amharic: "ቤተ ክርስቲያን", english: "Church" },
      { emoji: "🕌", amharic: "መስጊድ", english: "Mosque" },
      { emoji: "🌳", amharic: "ፓርክ", english: "Park" },
      { emoji: "🏖️", amharic: "የባህር ዳርቻ", english: "Beach" },
      { emoji: "🏞️", amharic: "ሜዳ", english: "Field" },
      { emoji: "🏔️", amharic: "ተራራ", english: "Mountain" },
      { emoji: "🚉", amharic: "ጣቢያ", english: "Station" },
      { emoji: "🍴", amharic: "ምግብ ቤት", english: "Restaurant" },
    ],
  },
  {
    key: "weather", labelEn: "Weather", labelAm: "የአየር ሁኔታ",
    items: [
      { emoji: "☀️", amharic: "ፀሐይ", english: "Sun" },
      { emoji: "🌧️", amharic: "ዝናብ", english: "Rain" },
      { emoji: "⛅", amharic: "ደመና", english: "Clouds" },
      { emoji: "🌪️", amharic: "ዐውሎ ንፋስ", english: "Storm" },
      { emoji: "❄️", amharic: "በረዶ", english: "Snow" },
      { emoji: "🌈", amharic: "ቀስተ ደመና", english: "Rainbow" },
      { emoji: "🌬️", amharic: "ንፋስ", english: "Wind" },
      { emoji: "🌡️", amharic: "ሙቀት", english: "Hot" },
      { emoji: "🥶", amharic: "ቀዝቃዛ", english: "Cold" },
      { emoji: "🌙", amharic: "ጨረቃ", english: "Moon" },
      { emoji: "⭐", amharic: "ኮከብ", english: "Star" },
    ],
  },
  {
    key: "transport", labelEn: "Transport", labelAm: "መጓጓዣ",
    items: [
      { emoji: "🚗", amharic: "መኪና", english: "Car" },
      { emoji: "🚌", amharic: "አውቶቡስ", english: "Bus" },
      { emoji: "🚕", amharic: "ታክሲ", english: "Taxi" },
      { emoji: "🚲", amharic: "ብስክሌት", english: "Bicycle" },
      { emoji: "🏍️", amharic: "ሞተር ሳይክል", english: "Motorcycle" },
      { emoji: "🚂", amharic: "ባቡር", english: "Train" },
      { emoji: "✈️", amharic: "አውሮፕላን", english: "Airplane" },
      { emoji: "🚁", amharic: "ሄሊኮፕተር", english: "Helicopter" },
      { emoji: "🛵", amharic: "ስኩተር", english: "Scooter" },
      { emoji: "🚜", amharic: "ትራክተር", english: "Tractor" },
      { emoji: "🚤", amharic: "ጀልባ", english: "Boat" },
    ],
  },
  {
    key: "clothes", labelEn: "Clothes", labelAm: "ልብሶች",
    items: [
      { emoji: "👕", amharic: "ቲሸርት", english: "Shirt" },
      { emoji: "👖", amharic: "ሱሪ", english: "Pants" },
      { emoji: "👗", amharic: "ቀሚስ", english: "Dress" },
      { emoji: "🧥", amharic: "ጃኬት", english: "Jacket" },
      { emoji: "🧦", amharic: "ካልሲ", english: "Socks" },
      { emoji: "👟", amharic: "ጫማ", english: "Shoes" },
      { emoji: "🎩", amharic: "ኮፍያ", english: "Hat" },
      { emoji: "🧤", amharic: "ጓንቲ", english: "Gloves" },
      { emoji: "🧣", amharic: "ሻርፕ", english: "Scarf" },
      { emoji: "👓", amharic: "መነጽር", english: "Glasses" },
    ],
  },
  {
    key: "shapes", labelEn: "Shapes", labelAm: "ቅርጾች",
    items: [
      { emoji: "🔵", amharic: "ክብ", english: "Circle" },
      { emoji: "🟥", amharic: "አራት ማዕዘን", english: "Square" },
      { emoji: "🔺", amharic: "ሦስት ማዕዘን", english: "Triangle" },
      { emoji: "⭐", amharic: "ኮከብ", english: "Star" },
      { emoji: "❤️", amharic: "ልብ", english: "Heart" },
      { emoji: "💎", amharic: "አልማዝ", english: "Diamond" },
      { emoji: "🟫", amharic: "ሬክታንግል", english: "Rectangle" },
      { emoji: "⬡", amharic: "ስድስት ማዕዘን", english: "Hexagon" },
    ],
  },
];

const PictogramBoard = () => {
  const [lastSpoken, setLastSpoken] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState(0);
  const [search, setSearch] = useState("");
  const { lang, t } = useLanguage();

  const speak = (text: string) => {
    setLastSpoken(text);
    playTapSound();
    speakAmharic(text);
  };

  const items = useMemo(() => {
    const cat = categories[activeCategory];
    if (!search.trim()) return cat.items;
    const q = search.toLowerCase();
    return cat.items.filter(
      (it) => it.english.toLowerCase().includes(q) || it.amharic.includes(search)
    );
  }, [activeCategory, search]);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-3xl font-extrabold text-foreground">{t("picto.title")}</h1>
          <p className="text-muted-foreground">{t("picto.subtitle")}</p>
          {lastSpoken && (
            <motion.p
              key={lastSpoken}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-primary"
            >
              <Volume2 className="h-4 w-4" />
              {t("picto.lastSpoken")}: {lastSpoken}
            </motion.p>
          )}
        </div>

        <div className="mx-auto mb-4 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search pictograms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="mx-auto mb-6 flex max-w-5xl flex-wrap justify-center gap-2">
          {categories.map((c, i) => (
            <Button
              key={c.key}
              variant={i === activeCategory ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(i)}
              className={i === activeCategory ? "bg-gradient-kinf hover:opacity-90" : ""}
            >
              {lang === "am" ? c.labelAm : c.labelEn}
            </Button>
          ))}
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {items.map((p, i) => (
            <motion.div
              key={`${categories[activeCategory].key}-${p.english}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.02, 0.4) }}
            >
              <Card
                className="cursor-pointer transition-all hover:-translate-y-1 hover:shadow-kinf-lg active:scale-95"
                onClick={() => speak(p.english)}
              >
                <CardContent className="flex flex-col items-center p-4">
                  <span className="mb-2 text-4xl">{p.emoji}</span>
                  <span className="text-base font-bold text-foreground">{p.amharic}</span>
                  <span className="text-xs text-muted-foreground">{p.english}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        {items.length === 0 && (
          <p className="mt-8 text-center text-sm text-muted-foreground">No pictograms found.</p>
        )}
      </div>
    </div>
  );
};

export default PictogramBoard;
