// Sample passages and EXAMPLE outputs, verbatim from Master Doc Section 11.
// The example outputs were prepared by the team. They are not measured model outputs.
import { matchPictogram } from "../utils/pictograms";
import { wordCount } from "../utils/wordcount";

export type Pictogram = string | null; // file name in /pictograms, or null

export interface EasySentence { id: number; text: string; key: string; pictogram: Pictogram; }
export type Question =
  | { id: number; type: "choice"; question: string; options: [string, string]; correct: 0 | 1; support: number; source: "model" | "template" }
  | { id: number; type: "yesno"; question: string; answer: boolean; support: number; source: "model" | "template" };

export interface Passage {
  id: "p1" | "p2" | "p3";
  title: string;
  subject: string;
  text: string;
  easyRead: EasySentence[];
  quiz: Question[];
}

type RawSentence = Omit<EasySentence, "pictogram">;

/** Attach a pictogram with the exact-lemma rule. A sentence with no match gets none. */
function withPictograms(raw: RawSentence[]): EasySentence[] {
  return raw.map((s) => ({ ...s, pictogram: matchPictogram(s.key, s.text)?.file ?? null }));
}

const P1_TEXT =
  "The water cycle describes how water moves around our planet. It has no start and no end. The Sun heats water in oceans, rivers and lakes. Some of this water changes into a gas called water vapour. This change is called evaporation. Plants also release water vapour into the air through their leaves. The warm vapour rises high into the sky. Higher up, the air is much colder. The cold air cools the vapour, and it turns back into tiny drops of liquid water. This change is called condensation. Millions of these tiny drops join together to form clouds. When the drops in a cloud grow too heavy, they fall to the ground as rain. In very cold places, they fall as snow or hail. This is called precipitation. Some of the rain flows over the land into rivers and finally returns to the sea. Some soaks into the ground and becomes groundwater, which farmers and villages often draw from wells. Then the Sun heats the water again, and the cycle begins once more. Without the water cycle, there would be no fresh water for people, animals or crops.";

const P2_TEXT =
  "A Gram Panchayat is the local government of a village. People in the village vote to choose its members. These members are called ward members. The Panchayat has a leader, who is called the Sarpanch. The Gram Panchayat takes care of common needs in the village. It looks after clean drinking water, village roads, street lights and cleanliness. It also keeps records of births and deaths. To do this work, the Panchayat gets money from the government and from small local taxes. Every adult in the village can attend the Gram Sabha. The Gram Sabha is a meeting where villagers discuss problems and plans. People can ask questions about how the money is spent. The villagers elect the Panchayat for five years. After five years, a new election is held. If the Panchayat does not work well, voters can choose different members in the next election. In this way, villagers have a say in decisions that affect their daily lives.";

const P3_TEXT =
  "A seed holds a tiny new plant inside it. The seed needs three things to start growing: water, warmth and air. When a seed is planted in soil, it takes in water and swells up. This process is called germination. First, a small root grows downward. The root holds the plant in the soil and takes in water and minerals. Next, a shoot grows upward towards the light. Green leaves open on the shoot. The leaves use sunlight to make food for the plant. This process is called photosynthesis. As the plant gets bigger, its stem becomes thicker and stronger. After some time, the plant may grow flowers. The flowers make new seeds, and the cycle can start again. Some seeds, such as beans, sprout in just a few days. Other seeds, such as mango seeds, can take a few weeks. Without enough water, a seed will not grow. Farmers plant seeds at the right time of year because the weather affects how well seeds grow.";

export const PASSAGES: Passage[] = [
  {
    id: "p1",
    title: "The water cycle",
    subject: "Science",
    text: P1_TEXT,
    easyRead: withPictograms([
      { id: 1, text: "Water moves around the Earth again and again.", key: "water" },
      { id: 2, text: "The Sun heats the water in seas and rivers.", key: "Sun" },
      { id: 3, text: "The warm water rises up into the sky.", key: "sky" },
      { id: 4, text: "Up high, it is cold, and clouds form.", key: "clouds" },
      { id: 5, text: "Rain falls from the clouds.", key: "rain" },
      { id: 6, text: "The rain flows back to the rivers and the sea.", key: "rivers" },
    ]),
    quiz: [
      { id: 1, type: "yesno", question: "Does the Sun heat the water in seas and rivers?", answer: true, support: 2, source: "model" },
      { id: 2, type: "choice", question: "What falls from the clouds?", options: ["Rain", "Sand"], correct: 0, support: 5, source: "model" },
      { id: 3, type: "yesno", question: "Does the water stop moving?", answer: false, support: 1, source: "model" },
      { id: 4, type: "choice", question: "Where does the rain flow back to?", options: ["Rivers and the sea", "The Sun"], correct: 0, support: 6, source: "model" },
    ],
  },
  {
    id: "p2",
    title: "The Gram Panchayat",
    subject: "Civics",
    text: P2_TEXT,
    easyRead: withPictograms([
      { id: 1, text: "The Gram Panchayat is the government of a village.", key: "village" },
      { id: 2, text: "People in the village vote for its members.", key: "vote" },
      { id: 3, text: "The leader is called the Sarpanch.", key: "leader" },
      { id: 4, text: "The Panchayat looks after water, roads and street lights.", key: "water" },
      { id: 5, text: "You can ask questions at the Gram Sabha.", key: "questions" },
      { id: 6, text: "A new election is held every 5 years.", key: "election" },
    ]),
    quiz: [
      { id: 1, type: "yesno", question: "Do people in the village vote for the members?", answer: true, support: 2, source: "model" },
      { id: 2, type: "choice", question: "What is the leader called?", options: ["Sarpanch", "Teacher"], correct: 0, support: 3, source: "model" },
      { id: 3, type: "yesno", question: "Does the Panchayat look after roads?", answer: true, support: 4, source: "model" },
      { id: 4, type: "choice", question: "How often is a new election held?", options: ["Every 5 years", "Every day"], correct: 0, support: 6, source: "model" },
    ],
  },
  {
    id: "p3",
    title: "How a seed grows",
    subject: "Biology",
    text: P3_TEXT,
    easyRead: withPictograms([
      { id: 1, text: "A seed has a tiny plant inside it.", key: "seed" },
      { id: 2, text: "The seed needs water, warmth and air.", key: "water" },
      { id: 3, text: "First, a root grows down into the soil.", key: "root" },
      { id: 4, text: "Then a shoot grows up towards the light.", key: "light" },
      { id: 5, text: "Green leaves use sunlight to make food.", key: "leaves" },
      { id: 6, text: "The plant grows flowers, and flowers make new seeds.", key: "flowers" },
    ]),
    quiz: [
      { id: 1, type: "yesno", question: "Does a seed need water to grow?", answer: true, support: 2, source: "model" },
      { id: 2, type: "choice", question: "What grows down into the soil first?", options: ["The root", "The flower"], correct: 0, support: 3, source: "model" },
      { id: 3, type: "yesno", question: "Do leaves use sunlight to make food?", answer: true, support: 5, source: "model" },
      { id: 4, type: "choice", question: "What do flowers make?", options: ["New seeds", "New roots"], correct: 0, support: 6, source: "model" },
    ],
  },
];

export function getPassage(id: Passage["id"]): Passage {
  return PASSAGES.find((p) => p.id === id) ?? PASSAGES[0];
}

export function passageWordCount(p: Passage): number {
  return wordCount(p.text);
}
