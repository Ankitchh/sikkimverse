"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { Users, BookOpen, Music, FileText, Mic, Star, TrendingUp, ChevronRight, Play } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const COMMUNITY_DATA: Record<string, {
  name: string; emoji: string; description: string; colorPrimary: string; colorSecondary: string;
  region: string; totalSpeakers: number; preservationScore: number; languages: string[];
  endangermentLevel: string; history: string; scripts: string; festivals: string[];
  traditionalFood: string[]; attire: string; stories: { title: string; type: string; excerpt: string }[];
  songs: { title: string; occasion: string; duration: string }[];
  preservation: { aspect: string; score: number }[];
}> = {
  lepcha: {
    name: "Lepcha",
    emoji: "🌿",
    colorPrimary: "#16A34A",
    colorSecondary: "#15803D",
    region: "North & West Sikkim",
    totalSpeakers: 50000,
    preservationScore: 35,
    endangermentLevel: "Endangered",
    description: "The Lepcha (Róng) are the earliest known inhabitants of Sikkim, known as the 'Children of Nature'. Their unique Róng script is one of the few indigenous writing systems of the Himalayan region.",
    languages: ["Lepcha (Róng)", "Róng script"],
    history: "The Lepchas are believed to have lived in Sikkim since time immemorial. Their oral traditions speak of their origin from the union of two divine beings — the man Fodong Thinong and the woman Nazongnyu. They held a deep spiritual connection with nature, calling their homeland 'Mayel Lyang' — the hidden paradise.",
    scripts: "Róng script — written from left to right. One of the few surviving indigenous scripts of the Himalayan region.",
    festivals: ["Tendong Lho Rum Faat (August)", "Nambun Festival", "Lepcha New Year"],
    traditionalFood: ["Chang (millet beer)", "Sinki (fermented radish)", "Gundruk soup", "Chaang"],
    attire: "Women wear 'Dumdyam' (colourful woven dress) with intricate patterns. Men wear 'Thokro Dum' (white robe-like garment).",
    stories: [
      { title: "The Legend of Mayel Lyang", type: "Myth", excerpt: "In the beginning, when the world was still young, the divine parents Itbu-mo and Nazongnyu created the first Lepcha man and woman from the snows of Khangchendzonga..." },
      { title: "Mount Tendong and the Great Flood", type: "Legend", excerpt: "When the great flood came and threatened to swallow all of creation, Mount Tendong grew upward carrying the Lepcha people to safety on its summit..." },
      { title: "The Forest Spirit of Dzongu", type: "Folktale", excerpt: "Deep in the sacred forests of Dzongu, there lived a spirit who protected the trees and animals. Every Lepcha child knew to ask permission before taking anything from the forest..." },
    ],
    songs: [
      { title: "Lepcha Creation Song", occasion: "Ceremonial", duration: "3:42" },
      { title: "Harvest Blessing Chant", occasion: "Harvest Festival", duration: "5:15" },
      { title: "Wedding Joy Song (Renyong)", occasion: "Wedding", duration: "2:58" },
    ],
    preservation: [
      { aspect: "Oral Traditions", score: 45 },
      { aspect: "Script Usage", score: 25 },
      { aspect: "Songs & Music", score: 55 },
      { aspect: "Rituals", score: 40 },
      { aspect: "Language Speakers", score: 35 },
    ],
  },
  bhutia: {
    name: "Bhutia",
    emoji: "🏔️",
    colorPrimary: "#DC2626",
    colorSecondary: "#B91C1C",
    region: "East & North Sikkim",
    totalSpeakers: 70000,
    preservationScore: 48,
    endangermentLevel: "Vulnerable",
    description: "The Bhutia (Lhopos) are Tibetan-origin people who brought with them Tibetan Buddhism, the Tibetan script, and a rich tradition of monastery arts and ritual Cham dance.",
    languages: ["Sikkimese (Drenjongke)", "Tibetan script"],
    history: "The Bhutia people migrated to Sikkim between the 13th and 16th centuries from Tibet and Bhutan. They established the Chogyal kingdom of Sikkim in 1642. Their culture is deeply intertwined with Vajrayana Buddhism, and they have built numerous monasteries across the state.",
    scripts: "Tibetan script (Uchen) — used for religious texts, prayers, and the Sikkimese Bhutia (Drenjongke) language.",
    festivals: ["Losoong (December)", "Pang Lhabsol (August)", "Saga Dawa (May)", "Bumchu Festival"],
    traditionalFood: ["Thukpa (noodle soup)", "Momos", "Butter tea (Suja)", "Tsampa (roasted barley)"],
    attire: "Women wear 'Kho' (silk robe) with 'Pangden' (striped apron). Men wear 'Bakhu' (robe) with 'Khimkhab' embroidery.",
    stories: [
      { title: "Tashiding Monastery Stories", type: "History", excerpt: "The sacred monastery of Tashiding was founded by Ngadak Sempa Chembo, one of the three great lamas who established the Sikkimese Chogyal dynasty..." },
      { title: "The Snow Lion and the Dragon", type: "Myth", excerpt: "Long before the mountains had names, a mighty Snow Lion and a Dragon competed to see who would guard the valleys of Sikkim..." },
      { title: "Khangchendzonga — The Five Treasures", type: "Legend", excerpt: "The great peak of Khangchendzonga holds five treasures: gold, silver, jewels, grain, and holy scripture. These will be revealed when humanity needs them most..." },
    ],
    songs: [
      { title: "Monastery Morning Chant", occasion: "Daily Prayer", duration: "8:30" },
      { title: "Losoong Celebration Song", occasion: "New Year", duration: "4:15" },
      { title: "Cham Dance Drumbeat", occasion: "Pang Lhabsol", duration: "6:00" },
    ],
    preservation: [
      { aspect: "Oral Traditions", score: 60 },
      { aspect: "Script Usage", score: 55 },
      { aspect: "Songs & Music", score: 65 },
      { aspect: "Rituals", score: 70 },
      { aspect: "Language Speakers", score: 48 },
    ],
  },
  limbu: {
    name: "Limbu",
    emoji: "🎋",
    colorPrimary: "#92400E",
    colorSecondary: "#78350F",
    region: "East Sikkim",
    totalSpeakers: 120000,
    preservationScore: 75,
    endangermentLevel: "Vulnerable",
    description: "The Limbu are an ancient indigenous community with their own Sirijonga script and a rich warrior tradition. Their Mundhum oral scripture is a foundation of Kiranti civilization.",
    languages: ["Limbu (Yakthung Paan)", "Sirijonga script"],
    history: "The Limbu people are part of the Kiranti ethnic group, among the oldest inhabitants of the eastern Himalayan region. Their epic oral tradition, the Mundhum, records their history, philosophy, and cosmology. The Limbu had their own chieftaincy system (Limbu Raja) before Sikkim's unification.",
    scripts: "Sirijonga script — an ancient script attributed to the monk Sirijonga in the 9th century. Being revived actively.",
    festivals: ["Sakela (April/November)", "Chasok Tangnam (November)", "Udhauli/Ubhauli"],
    traditionalFood: ["Tongba (millet beer)", "Dhindo (millet porridge)", "Sel roti", "Aachar (pickle)"],
    attire: "Women wear 'Chamcha' and 'Mekhli' with silver ornaments. Men wear 'Daura Suruwal' with traditional headgear during festivals.",
    stories: [
      { title: "The Mundhum Creation", type: "Oral History", excerpt: "In the Kiranti cosmology, the world was created by Tagera Ningwaphuma, the supreme goddess, who shaped the earth from the cosmic ocean..." },
      { title: "Limbu Warrior Ballads", type: "History", excerpt: "The Limbu warriors were renowned across the Himalayan region. Their bravery is recorded in the Pallo Kirat oral traditions sung by the Phedangma shamans..." },
      { title: "Sakela — Dance of the Ancestors", type: "Myth", excerpt: "Every spring and autumn, the Limbu people perform the Sakela dance to honor their ancestors and the spirits of nature..." },
    ],
    songs: [
      { title: "Limbu Warrior Ballad", occasion: "Festival", duration: "4:20" },
      { title: "Phedangma Ritual Chant", occasion: "Shamanic Ritual", duration: "12:00" },
      { title: "Sakela Dance Song", occasion: "Sakela Festival", duration: "5:30" },
    ],
    preservation: [
      { aspect: "Oral Traditions", score: 80 },
      { aspect: "Script Usage", score: 65 },
      { aspect: "Songs & Music", score: 78 },
      { aspect: "Rituals", score: 75 },
      { aspect: "Language Speakers", score: 75 },
    ],
  },
  tamang: {
    name: "Tamang",
    emoji: "🐎",
    colorPrimary: "#7B3F00",
    colorSecondary: "#6B3A00",
    region: "West & South Sikkim",
    totalSpeakers: 150000,
    preservationScore: 62,
    endangermentLevel: "Vulnerable",
    description: "The Tamang are Tibeto-Burman people known for their distinctive Damphu drum music and Syabru dance. Their shamanic Bombo tradition is a living cultural treasure.",
    languages: ["Tamang", "Tibetan-derived script"],
    history: "The Tamang trace their ancestry to Tibet, arriving in Nepal and Sikkim centuries ago. The word 'Tamang' means 'horse traders' in Tibetan. They have maintained distinct shamanic Bombo rituals alongside Buddhist practices, creating a unique blend of beliefs.",
    scripts: "Tamang uses Devanagari and a form of Tibetan script for religious texts. Community efforts are underway to standardize a written form.",
    festivals: ["Tamu Lhosar (December)", "Sonam Lhosar", "Fagu Purnima (Holi)"],
    traditionalFood: ["Chang (millet beer)", "Gundruk soup", "Selroti", "Dhido"],
    attire: "Women wear 'Gunyu-Cholo' with a distinctive striped apron. Men wear white topi and daura-suruwal during festivals.",
    stories: [
      { title: "The Bombo and the Mountain Spirit", type: "Myth", excerpt: "In the high passes of the Himalayas, the first Bombo shaman received his powers from a mountain spirit who appeared as a white eagle..." },
      { title: "The Horse Traders of Tibet", type: "History", excerpt: "Long before the mountain roads were cut, Tamang horse traders carried salt, wool, and butter across the Himalayan passes connecting Tibet to the plains..." },
      { title: "Damphu — The Singing Drum", type: "Legend", excerpt: "The Damphu frame drum was first made by a craftsman who heard the gods speaking in the rhythm of rainfall on a monastery rooftop..." },
    ],
    songs: [
      { title: "Tamang Selo", occasion: "Festival & Celebration", duration: "3:55" },
      { title: "Bombo Chant", occasion: "Shamanic Ritual", duration: "15:00" },
      { title: "Tamu Lhosar Song", occasion: "New Year", duration: "4:40" },
    ],
    preservation: [
      { aspect: "Oral Traditions", score: 65 },
      { aspect: "Script Usage", score: 30 },
      { aspect: "Songs & Music", score: 72 },
      { aspect: "Rituals", score: 60 },
      { aspect: "Language Speakers", score: 62 },
    ],
  },
  rai: {
    name: "Rai",
    emoji: "🌾",
    colorPrimary: "#4A0E0E",
    colorSecondary: "#3D0B0B",
    region: "East & South Sikkim",
    totalSpeakers: 200000,
    preservationScore: 58,
    endangermentLevel: "Vulnerable",
    description: "The Rai (Kiranti) are among Sikkim's oldest communities, with a complex clan system and the Sakela ritual dance tradition. Their Bantawa and Chamling dialects are linguistically significant.",
    languages: ["Bantawa Rai", "Chamling", "Kulung", "Multiple Rai dialects"],
    history: "The Rai people are part of the Kiranti civilization — one of the oldest documented ethnic groups in the Himalayan region, mentioned in the Mahabharata. They had advanced agricultural systems and a sophisticated oral legal tradition called the 'Mundhum'.",
    scripts: "Most Rai languages use Devanagari, though community linguists are developing unique scripts for major Rai dialects.",
    festivals: ["Sakela (twice yearly)", "Ubhauli (April)", "Udhauli (November)", "Chasok"],
    traditionalFood: ["Tongba", "Kinema (fermented soybean)", "Aachar", "Pork dishes"],
    attire: "Women wear 'Pakhuwa' blouse and striped 'Hembari' skirt with handwoven shawl. Men wear traditional Dhoti-Suruwal during rituals.",
    stories: [
      { title: "The Phedangma and the Underworld", type: "Myth", excerpt: "When the great shaman Phedangma descended to the underworld to retrieve a stolen soul, she encountered the ancestors of all Rai clans living in the realm below..." },
      { title: "Kiranti Kings of Kathmandu", type: "History", excerpt: "Before the Shah dynasty, the Kiranti kings ruled the Kathmandu Valley for nearly two millennia. Their descendants, the Rai people, carry that ancient legacy..." },
      { title: "The First Sakela Dance", type: "Legend", excerpt: "The Sakela dance was taught to the first Rai families by the goddess Ningsamma, who stamped out a rhythm on the earth to show humans how to honor the seasons..." },
    ],
    songs: [
      { title: "Sakela Sili Dance Song", occasion: "Sakela Festival", duration: "6:15" },
      { title: "Mundhum Recitation", occasion: "Ritual Ceremony", duration: "20:00" },
      { title: "Rai Harvest Song", occasion: "Post-harvest", duration: "3:30" },
    ],
    preservation: [
      { aspect: "Oral Traditions", score: 70 },
      { aspect: "Script Usage", score: 25 },
      { aspect: "Songs & Music", score: 65 },
      { aspect: "Rituals", score: 62 },
      { aspect: "Language Speakers", score: 58 },
    ],
  },
  gurung: {
    name: "Gurung",
    emoji: "🦅",
    colorPrimary: "#1B4332",
    colorSecondary: "#166534",
    region: "West Sikkim",
    totalSpeakers: 80000,
    preservationScore: 65,
    endangermentLevel: "Vulnerable",
    description: "The Gurung people, renowned as Gurkha soldiers, have a rich shamanic Pye-Lhu Ghyabri tradition and an oral literary heritage that preserves the history of the Tamu people.",
    languages: ["Gurung (Tamu Kyui)", "Tibetan-Burman family"],
    history: "The Gurung (Tamu) people trace their origins to Tibet and settled in the Gandaki region of Nepal before spreading to Sikkim. Their cultural identity is anchored in the Pye and Lhu oral poetry traditions, recited by the Poju and Ghyabri shamans during birth, death, and seasonal rites.",
    scripts: "Gurung language is primarily oral. A 'Tamu script' has been developed by scholars but adoption is limited.",
    festivals: ["Tamu Lhosar (December)", "Ghatu Dance", "Rodhi gathering"],
    traditionalFood: ["Dhido", "Sel roti", "Gundruk", "Raksi (millet spirit)"],
    attire: "Women wear 'Gurung Cholo' blouse with 'Dhaka' cloth. Men wear white daura-suruwal with Dhaka topi.",
    stories: [
      { title: "The Pye-Lhu Creation Epic", type: "Oral History", excerpt: "The great Pye and Lhu poetry describes how the world was made by Parvati and Shiva, and how the Tamu people were placed in the high Himalayan valleys to guard the mountain passes..." },
      { title: "Gurung Warriors in Lahore", type: "History", excerpt: "The military valor of the Gurung soldier is legendary. Their courage was first tested in the armies of the Gorkha kings, who unified Nepal in the 18th century..." },
      { title: "The Ghatu Dancer's Vision", type: "Legend", excerpt: "The young Ghatu dancer enters a trance at the full moon, her body becoming a vessel for the goddess. She sees futures and speaks in the voice of the ancestors..." },
    ],
    songs: [
      { title: "Ghatu Dance Song", occasion: "Ghatu Festival", duration: "8:20" },
      { title: "Tamu Lhosar Celebration", occasion: "New Year", duration: "5:00" },
      { title: "Rodhi Night Song", occasion: "Youth Gathering", duration: "3:45" },
    ],
    preservation: [
      { aspect: "Oral Traditions", score: 70 },
      { aspect: "Script Usage", score: 20 },
      { aspect: "Songs & Music", score: 68 },
      { aspect: "Rituals", score: 65 },
      { aspect: "Language Speakers", score: 65 },
    ],
  },
  sherpa: {
    name: "Sherpa",
    emoji: "⛰️",
    colorPrimary: "#1E3A5F",
    colorSecondary: "#1A3352",
    region: "North Sikkim",
    totalSpeakers: 25000,
    preservationScore: 80,
    endangermentLevel: "Safe",
    description: "The Sherpa, world-renowned mountaineers, are Tibetan-origin people whose deep Buddhist faith, mountain wisdom, and yak herding culture define life at altitude above 3,000 metres.",
    languages: ["Sherpa (Sherpa Tshering)", "Tibetan script"],
    history: "The Sherpa migrated from the Kham region of eastern Tibet around 500 years ago, settling in high-altitude areas of Nepal and Sikkim. Their name means 'people of the east'. Their intimate knowledge of the Himalayan environment and their Buddhist faith have shaped a culture of resilience, hospitality, and spiritual depth.",
    scripts: "Tibetan (Uchen and Umey) scripts are used for Buddhist religious texts. Sherpa children learn in Nepali with Tibetan script in Buddhist schools.",
    festivals: ["Dumji (May/June)", "Mani Rimdu", "Losar (February)", "Saga Dawa"],
    traditionalFood: ["Tsampa", "Butter tea", "Shakpa stew", "Tongba", "Dried yak meat"],
    attire: "Women wear 'Mhen' (dress) with colorful striped apron. Men wear 'Chuba' robe tied at the waist, often with boots.",
    stories: [
      { title: "The Legend of Khumbu Yul-Lha", type: "Myth", excerpt: "The mountain god Khumbu Yul-Lha rides a white horse across the peaks. Before any major expedition, the Sherpa offer prayers to ask his permission to climb..." },
      { title: "Tenzing Norgay's Journey", type: "History", excerpt: "Tenzing Norgay Sherpa, born in Khumbu in 1914, became the first to stand on the summit of Everest. His story is the story of every Sherpa's courage and belonging to the mountains..." },
      { title: "The Yeti of the High Passes", type: "Legend", excerpt: "In the monastery of Pangboche, there is a hand they say belonged to a Yeti. The elders remember when these creatures walked openly among the peaks..." },
    ],
    songs: [
      { title: "Mani Rimdu Mask Dance", occasion: "Mani Rimdu Festival", duration: "N/A (multi-hour)" },
      { title: "Sherpa Wedding Song", occasion: "Wedding Ceremony", duration: "7:30" },
      { title: "Mountain Prayer (La Gyalo)", occasion: "Summit Prayer", duration: "2:15" },
    ],
    preservation: [
      { aspect: "Oral Traditions", score: 80 },
      { aspect: "Script Usage", score: 75 },
      { aspect: "Songs & Music", score: 85 },
      { aspect: "Rituals", score: 88 },
      { aspect: "Language Speakers", score: 80 },
    ],
  },
  mangar: {
    name: "Mangar",
    emoji: "🌺",
    colorPrimary: "#6D213C",
    colorSecondary: "#5C1A32",
    region: "South & West Sikkim",
    totalSpeakers: 40000,
    preservationScore: 55,
    endangermentLevel: "Vulnerable",
    description: "The Magar people have one of the region's oldest warrior traditions and a rich Dhami-Jhankri shamanic system. Their language is a crucial link in Tibeto-Burman linguistics.",
    languages: ["Magar (Kham-Magar)", "Tibeto-Burman family"],
    history: "The Magar people are believed to be among the earliest inhabitants of the Himalayan region, with origins predating recorded history. They were prominent in the armies of Prithvi Narayan Shah. Their Dhami-Jhankri tradition blends animism with Hindu elements, and their oral epics preserve genealogies stretching back dozens of generations.",
    scripts: "Magar is primarily an oral language, transcribed into Devanagari. Scholars have proposed a revival of the ancient Magar script.",
    festivals: ["Maghe Sankranti", "Udauli/Ubhauli", "Tihar", "Magar New Year"],
    traditionalFood: ["Dhido", "Jaad (rice beer)", "Gundruk", "Dhakane"],
    attire: "Women wear 'Gunyou-Cholo' with handwoven Dhaka fabric. Men wear Daura-Suruwal with Magar-specific jewelry during festivals.",
    stories: [
      { title: "The First Dhami's Vision", type: "Myth", excerpt: "The first Dhami shaman of the Magar people received his calling when the mountain deity appeared to him in the form of a tiger, teaching him the healing songs..." },
      { title: "Magar Warriors of the Gorkha Rifles", type: "History", excerpt: "For over two centuries, Magar men have served in the Gorkha regiments — their courage and loyalty becoming the defining reputation of the community worldwide..." },
      { title: "The Sacred Grove of Kul Devi", type: "Legend", excerpt: "Every Magar clan has a sacred grove where the clan goddess resides. These forests are never cut. The trees hold the memory of every ancestor who ever lived..." },
    ],
    songs: [
      { title: "Sorathi Folk Song", occasion: "Festival", duration: "4:10" },
      { title: "Jhankri Healing Chant", occasion: "Healing Ceremony", duration: "18:00" },
      { title: "Magar Wedding Deuda", occasion: "Wedding", duration: "5:45" },
    ],
    preservation: [
      { aspect: "Oral Traditions", score: 58 },
      { aspect: "Script Usage", score: 15 },
      { aspect: "Songs & Music", score: 60 },
      { aspect: "Rituals", score: 55 },
      { aspect: "Language Speakers", score: 55 },
    ],
  },
  newar: {
    name: "Newar",
    emoji: "🏛️",
    colorPrimary: "#4A235A",
    colorSecondary: "#3D1C4A",
    region: "Urban Sikkim (Gangtok & Namchi)",
    totalSpeakers: 35000,
    preservationScore: 70,
    endangermentLevel: "Safe",
    description: "The Newar are the original inhabitants of the Kathmandu Valley and skilled artisans. Their Newari (Nepal Bhasa) language is one of the few with a classical literary tradition in South Asia.",
    languages: ["Newari (Nepal Bhasa)", "Ranjana script", "Pracalit script"],
    history: "The Newar have inhabited the Kathmandu Valley for at least 2,000 years, building its famous temples and developing a sophisticated urban civilization. They introduced the pagoda architectural style to Asia, maintained trade routes to Tibet, and kept one of the richest festival calendars in the world. Newar communities in Sikkim settled as merchants and craftsmen.",
    scripts: "Ranjana and Pracalit scripts — classical Newar scripts used for religious manuscripts and inscriptions. Being actively taught in Newar schools.",
    festivals: ["Indra Jatra (September)", "Bisket Jatra", "Yenya Punhi", "Swanti (Newar New Year)"],
    traditionalFood: ["Wo (lentil patties)", "Chatamari (rice crepe)", "Bara", "Yomari", "Aila (spirits)"],
    attire: "Women wear 'Haku Patasi' (black sari with red border). Men wear 'Daura Suruwal' with Newar topi (cap) during festivals.",
    stories: [
      { title: "The Legend of Swayambhunath", type: "Myth", excerpt: "When the Kathmandu Valley was still a lake, the bodhisattva Manjushree cut the gorge at Chobar to drain it. The lotus of the lake became the Swayambhunath stupa..." },
      { title: "Newar Artisans and the Temple Builders", type: "History", excerpt: "The Newar craftsmen, known as Shilpakars, built the pagodas and temples of Nepal and Tibet. Their knowledge of woodcarving and metalwork was unmatched in all of Asia..." },
      { title: "Kumari — The Living Goddess", type: "Legend", excerpt: "In Kathmandu, a young Newar girl is chosen as the living goddess Kumari. She lives in the Kumari Ghar until puberty, worshipped by kings and commoners alike..." },
    ],
    songs: [
      { title: "Devi Bhajan (Devotional)", occasion: "Yenya Festival", duration: "6:00" },
      { title: "Dhimay Drum Ensemble", occasion: "Indra Jatra", duration: "N/A (procession)" },
      { title: "Newari Wedding Naykheen", occasion: "Wedding", duration: "4:25" },
    ],
    preservation: [
      { aspect: "Oral Traditions", score: 72 },
      { aspect: "Script Usage", score: 65 },
      { aspect: "Songs & Music", score: 75 },
      { aspect: "Rituals", score: 78 },
      { aspect: "Language Speakers", score: 70 },
    ],
  },
  sunwar: {
    name: "Sunwar",
    emoji: "☀️",
    colorPrimary: "#7D3C00",
    colorSecondary: "#6B3300",
    region: "South Sikkim",
    totalSpeakers: 15000,
    preservationScore: 60,
    endangermentLevel: "Vulnerable",
    description: "The Sunwar (Surel/Mukhiya) are a Kiranti people with a distinctive Jero-Sunwar language. Their blacksmithing tradition and oral Muddum epics are rare cultural assets.",
    languages: ["Sunwar (Koiche)", "Kiranti language family"],
    history: "The Sunwar are one of the lesser-known Kiranti groups, historically settled along the Sunkoshi river in Nepal and the Tista basin in Sikkim. Their Muddum oral tradition parallels the Mundhum of the Limbu and Rai. They are known for blacksmithing and their distinctive body tattoo traditions that encode clan identity.",
    scripts: "Sunwar has a small community of script users. A proposed Sunwar script exists but Devanagari is more commonly used.",
    festivals: ["Ubhauli/Udhauli", "Sakhewa", "Chasok Tangnam", "Sunwar New Year"],
    traditionalFood: ["Tongba", "Kinema", "Ghonghi (snail curry)", "Maize beer"],
    attire: "Women wear handwoven 'Mulako Lugha' dress. Men wear simple white garments with a traditional belt during ritual occasions.",
    stories: [
      { title: "The Blacksmith God's Blessing", type: "Myth", excerpt: "The first Sunwar blacksmith received the secret of working iron from the god Bichha Bhume, who appeared in a dream and showed him how to listen to the metal singing in the fire..." },
      { title: "Muddum — The First Law", type: "Oral History", excerpt: "The Sunwar Muddum contains the original laws given to the first community by the creator god. It explains how land should be shared, how disputes resolved, and how the dead should be honored..." },
      { title: "The Sunkoshi River Spirit", type: "Legend", excerpt: "The Sunkoshi River has a spirit that must be propitiated before every fishing season. The Sunwar priests perform the Nwagi ritual to ask the river's permission to take its fish..." },
    ],
    songs: [
      { title: "Sakhewa Welcoming Song", occasion: "Sakhewa Festival", duration: "5:20" },
      { title: "Muddum Recitation Excerpt", occasion: "Ritual", duration: "10:00" },
      { title: "Sunwar Harvest Song", occasion: "Post-harvest", duration: "3:15" },
    ],
    preservation: [
      { aspect: "Oral Traditions", score: 62 },
      { aspect: "Script Usage", score: 20 },
      { aspect: "Songs & Music", score: 60 },
      { aspect: "Rituals", score: 58 },
      { aspect: "Language Speakers", score: 60 },
    ],
  },
};

export default function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const data = COMMUNITY_DATA[slug];

  if (!data) notFound();

  const tabs = ["Overview", "Language", "Stories", "Songs", "Learn"];

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Hero */}
      <div
        className="relative pt-16 pb-24 px-4 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${data.colorPrimary}ee, ${data.colorSecondary}cc, #1e4a8c88)` }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />

        <div className="max-w-3xl mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <span className="text-6xl">{data.emoji}</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mt-3">{data.name}</h1>
            <p className="text-white/80 mt-3 max-w-xl mx-auto text-sm leading-relaxed">{data.description}</p>

            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{(data.totalSpeakers / 1000).toFixed(0)}K</p>
                <p className="text-white/70 text-xs">Speakers</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{data.preservationScore}%</p>
                <p className="text-white/70 text-xs">Preservation</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{data.languages.length}</p>
                <p className="text-white/70 text-xs">Languages</p>
              </div>
            </div>

            <span className={cn(
              "mt-4 inline-block px-3 py-1 rounded-full text-xs font-semibold",
              data.preservationScore >= 70 ? "bg-green-500/30 text-green-200" :
              data.preservationScore >= 50 ? "bg-amber-500/30 text-amber-200" :
              "bg-red-500/30 text-red-200"
            )}>
              ⚠️ {data.endangermentLevel}
            </span>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-6 space-y-6">
        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3"
        >
          <Link href="/learn" className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-hover transition-colors shadow-md">
            <BookOpen className="w-4 h-4" /> Start Learning
          </Link>
          <Link href="/contribute" className="flex-1 flex items-center justify-center gap-2 py-3 border border-primary text-primary rounded-xl font-semibold text-sm hover:bg-primary/5 transition-colors">
            <Mic className="w-4 h-4" /> Contribute
          </Link>
        </motion.div>

        {/* Preservation Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-background-secondary rounded-2xl p-5 border border-border"
        >
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Language Health
          </h2>
          {data.preservation.map((p, i) => (
            <div key={p.aspect} className="mb-3 last:mb-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-foreground">{p.aspect}</span>
                <span className="text-xs font-semibold text-foreground-muted">{p.score}%</span>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p.score}%` }}
                  transition={{ duration: 0.7, delay: 0.2 + i * 0.1 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: p.score >= 70 ? "#16A34A" : p.score >= 50 ? "#D97706" : "#DC2626" }}
                />
              </div>
            </div>
          ))}
        </motion.div>

        {/* History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-background-secondary rounded-2xl p-5 border border-border"
        >
          <h2 className="font-semibold text-foreground mb-3">History & Origins</h2>
          <p className="text-sm text-foreground-secondary leading-relaxed">{data.history}</p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-background-tertiary rounded-xl p-3">
              <p className="text-xs text-foreground-muted mb-1">Script</p>
              <p className="text-sm font-medium text-foreground">{data.scripts.split("—")[0].trim()}</p>
            </div>
            <div className="bg-background-tertiary rounded-xl p-3">
              <p className="text-xs text-foreground-muted mb-1">Region</p>
              <p className="text-sm font-medium text-foreground">{data.region}</p>
            </div>
          </div>
        </motion.div>

        {/* Festivals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-background-secondary rounded-2xl p-5 border border-border"
        >
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            🎊 Festivals & Celebrations
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.festivals.map(f => (
              <Link key={f} href="/festivals"
                className="px-3 py-1.5 bg-background-tertiary border border-border rounded-full text-sm text-foreground hover:border-primary/40 transition-colors">
                {f}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Stories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-background-secondary rounded-2xl p-5 border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Stories & Oral History
            </h2>
            <Link href="/archive" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          <div className="space-y-4">
            {data.stories.map((story) => (
              <div key={story.title} className="border-b border-border last:border-0 pb-4 last:pb-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-medium text-foreground text-sm">{story.title}</h3>
                  <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full shrink-0">{story.type}</span>
                </div>
                <p className="text-xs text-foreground-muted leading-relaxed line-clamp-2">{story.excerpt}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Songs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-background-secondary rounded-2xl p-5 border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Music className="w-4 h-4 text-primary" /> Traditional Songs
            </h2>
            <Link href="/archive" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {data.songs.map((song) => (
              <div key={song.title} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <button className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                    <Play className="w-3 h-3 text-primary ml-0.5" />
                  </button>
                  <div>
                    <p className="text-sm font-medium text-foreground">{song.title}</p>
                    <p className="text-xs text-foreground-muted">{song.occasion}</p>
                  </div>
                </div>
                <span className="text-xs text-foreground-muted">{song.duration}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Food & Attire */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="bg-background-secondary rounded-2xl p-4 border border-border">
            <h3 className="font-semibold text-foreground text-sm mb-3">🍲 Traditional Food</h3>
            <ul className="space-y-1">
              {data.traditionalFood.map(f => (
                <li key={f} className="text-xs text-foreground-secondary flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-background-secondary rounded-2xl p-4 border border-border">
            <h3 className="font-semibold text-foreground text-sm mb-3">👘 Traditional Attire</h3>
            <p className="text-xs text-foreground-secondary leading-relaxed">{data.attire}</p>
          </div>
        </motion.div>

        {/* Contributors CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl p-5 text-white text-center relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${data.colorPrimary}, #1e4a8c)` }}
        >
          <Users className="w-8 h-8 mx-auto mb-2 opacity-80" />
          <h3 className="font-bold text-lg">Become a {data.name} Contributor</h3>
          <p className="text-white/80 text-sm mt-1 mb-4">Help preserve your community&apos;s language and culture for future generations</p>
          <Link href="/contribute" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl font-semibold text-sm transition-colors">
            <Star className="w-4 h-4" /> Start Contributing
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
