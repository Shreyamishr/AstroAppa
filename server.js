// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(".")); // serve index.html

// SECURITY: put your key in .env as OPENAI_API_KEY=sk-xxxx
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ---------- Numerology helpers (deterministic) ----------
function reduceDigit(n){ let x=n; while(x>=10){ let s=0; while(x>0){s+=x%10; x=Math.floor(x/10);} x=s; } return x; }
function natureText(n){
  switch(n){
    case 1: return "Planet: Sun — Leadership, confidence, late success; ego/stubborn streak possible.";
    case 2: return "Planet: Moon — Emotional, creative, attractive mind; possessive/fluctuating.";
    case 3: return "Planet: Jupiter — Self-control, spiritual, disciplined; high moral values.";
    case 4: return "Planet: Rahu — Short-tempered, anti-system, stubborn; intelligent planner.";
    case 5: return "Planet: Mercury — Social, calculative, money-minded; good communicator/business.";
    case 6: return "Planet: Venus — Loving, romantic, creative; luxury, aesthetics, showy at times.";
    case 7: return "Planet: Ketu — Researcher, traveler, deep thinker; one-life-area dissatisfaction.";
    case 8: return "Planet: Saturn — Hardworking, outspoken; slow starter; money-minded, wise advisor.";
    case 9: return "Planet: Mars — Bold, determined, blunt; self-respect high; patience lower.";
    default: return "—";
  }
}
function loshuPlacementSet(list){
  const grid = Array.from({length:3},()=>Array(3).fill(false));
  for(const d of new Set(list)){
    switch(d){
      case 1: grid[2][1]=true; break;
      case 2: grid[0][2]=true; break;
      case 3: grid[1][0]=true; break;
      case 4: grid[0][0]=true; break;
      case 5: grid[1][1]=true; break;
      case 6: grid[2][2]=true; break;
      case 7: grid[1][2]=true; break;
      case 8: grid[2][0]=true; break;
      case 9: grid[0][1]=true; break;
    }
  }
  return grid;
}
function gridChecker(grid){
  const ok = new Array(8).fill(false);
  if (grid[0][0]&&grid[0][1]&&grid[0][2]) ok[0]=true;
  if (grid[1][0]&&grid[1][1]&&grid[1][2]) ok[1]=true;
  if (grid[2][0]&&grid[2][1]&&grid[2][2]) ok[2]=true;
  if (grid[0][0]&&grid[1][0]&&grid[2][0]) ok[3]=true;
  if (grid[0][1]&&grid[1][1]&&grid[2][1]) ok[4]=true;
  if (grid[0][2]&&grid[1][2]&&grid[2][2]) ok[5]=true;
  if (grid[0][0]&&grid[1][1]&&grid[2][2]) ok[6]=true;
  if (grid[0][2]&&grid[1][1]&&grid[2][0]) ok[7]=true;
  return ok;
}
function strengthsFromFlags(flags){
  const list=[];
  if (flags[0]) list.push("Genius line: Logical clarity and sharp analysis.");
  if (flags[1]) list.push("Artistic line: Heart-led decisions; life pleasure improves with age.");
  if (flags[2]) list.push("Practical line: Analytical, unmanipulable; strong financial planning.");
  if (flags[3]) list.push("Vision line: Disciplined, organized thought process.");
  if (flags[4]) list.push("Will line: High willpower and patience.");
  if (flags[5]) list.push("Action line: Quick executor; grabs opportunities.");
  if (flags[6]) list.push("Success diagonal: Smartness, luxury, material ease.");
  if (flags[7]) list.push("Stability diagonal: Financial management, mental steadiness.");
  return list;
}
function missingFlags(grid){
  const miss = new Array(8).fill(true);
  if (grid[0][0]||grid[0][1]||grid[0][2]) miss[0]=false;
  if (grid[1][0]||grid[1][1]||grid[1][2]) miss[1]=false;
  if (grid[2][0]||grid[2][1]||grid[2][2]) miss[2]=false;
  if (grid[0][0]||grid[1][0]||grid[2][0]) miss[3]=false;
  if (grid[0][1]||grid[1][1]||grid[2][1]) miss[4]=false;
  if (grid[0][2]||grid[1][2]||grid[2][2]) miss[5]=false;
  if (grid[0][0]||grid[1][1]||grid[2][2]) miss[6]=false;
  if (grid[0][2]||grid[1][1]||grid[2][0]) miss[7]=false;
  return miss;
}
function missingTexts(miss){
  const out=[];
  if (miss[0]) out.push("Memory dips; challenges after mid-20s—build recall systems.");
  if (miss[1]) out.push("Bouts of loneliness/fear; invest in emotional grounding.");
  if (miss[2]) out.push("Love setbacks; practice patience and clarity in bonds.");
  if (miss[3]) out.push("Confusions/temptations; prioritize long-term over instant relief.");
  if (miss[4]) out.push("People-pleasing; protect your mood and boundaries.");
  if (miss[5]) out.push("Laziness cycles; maintain routine and momentum.");
  if (miss[6]) out.push("Suspicion/trust issues; verify, don't over-doubt.");
  if (miss[7]) out.push("Stubborn/frustrated patches; cultivate flexibility.");
  return out;
}
function freqMeaning(digit,count){
  let s="";
  switch(digit){
    case 1: s = (count===1)?"Good in communication; weaker expression.":(count===2)?"Good in both speech & expression.":(count===3)?"Over-talkative or very introvert.":"Tongue conflicts; contradictions."; break;
    case 2: s = (count===1)?"Emotionally balanced; family-centric.":(count===2)?"Intuitive; trusts emotions.":(count===3)?"Over-sensitive; holds on long.":"Mood dips; extreme sensitivity."; break;
    case 3: s = (count===1)?"Knowledge-seeking; creative; people-savvy.":(count===2)?"Writerly; spiritual; shows knowledge.":(count===3)?"Daydreamer; argumentative; very talkative.":"Over-thinker; self-obsessed."; break;
    case 4: s = (count===1)?"Practical; asset-building; hands-on.":(count===2)?"Great observation/organization.":(count===3)?"Struggles in work/personal spheres.":"High potential; misaligned career."; break;
    case 5: s = (count===1)?"Excitable; loving; quick cool-down.":(count===2)?"Lucky; convincing; strong will.":"Over-adventurous; risk-prone."; break;
    case 6: s = (count===1)?"Presentable; luxury; responsible; artsy.":(count===2)?"Creative; attraction; dominant/material.":"Moody; insecurity/doubt; health watch."; break;
    case 7: s = (count===1)?"One-field dissatisfaction; heartbreak once.":(count===2)?"Strong intuition; marriage tests.":(count===3)?"Affair-prone; indulgent.":"Bond dissatisfaction; negative lens."; break;
    case 8: s = (count===1)?"Multitasker; decisive; respects money.":(count===2)?"Hasty at times; cautious mindset.":(count===3)?"Stubborn; struggles; expensive taste.":"Distracted; unstable; repurposeful focus."; break;
    case 9: s = (count===1)?"Spiritual; passionate; anger under control.":(count===2)?"Creative; helpful; critical streak.":(count===3)?"Anger/frustration spikes; hasty.":"High anger; relationship strain."; break;
  }
  return s;
}

app.post("/api/reading", async (req,res)=>{
  try{
    const { name, dob, time, place, lat, lng, driver, conductor, nameNumber } = req.body;

    // Build Lo Shu list = driver, conductor, nameNumber + DOB digits (excluding 0 & '/')
    const list = [driver, conductor, nameNumber];
    for(const ch of dob){ if (ch!=='/' && ch!=='0') list.push(parseInt(ch,10)); }
    list.sort((a,b)=>a-b);

    // Frequencies map
    const freq = new Map();
    for(const v of list){ freq.set(v,(freq.get(v)||0)+1); }
    const freqTexts = [];
    for(const [digit,count] of freq.entries()){
      const t = freqMeaning(digit,count);
      if (t) freqTexts.push(`${digit} (x${count}): ${t}`);
    }

    // Strengths & Missing
    const grid = loshuPlacementSet(list);
    const flags = gridChecker(grid);
    const strengths = strengthsFromFlags(flags);
    const missing = missingTexts(missingFlags(grid));

    // Nature para (deterministic)
    const nature = natureText(driver);

    // Compose prompt for ChatGPT: structured, grounded on above
    const system = "You are an expert Vedic-style numerology and practical life coach. Write clear, kind, specific paragraphs. Avoid generic fluff. Use simple, human tone. Keep it grounded in provided numbers; do not invent astrological ephemeris.";
    const user = `
Create a detailed but concise reading (5–8 short paragraphs) for:
- Name: ${name}
- DOB: ${dob}${time ? ` ${time}` : ""}${place ? ` (${place})` : ""}${(lat && lng) ? ` [${lat},${lng}]` : ""}
- Driver: ${driver}, Conductor: ${conductor}, Name Number: ${nameNumber}
- Planet Nature (Driver): ${nature}
- Lo Shu strengths: ${strengths.length? strengths.join("; "):"None"}
- Focus/Missing areas: ${missing.length? missing.join("; "):"None"}
- Digit frequencies: ${freqTexts.join(" | ")}

Sections to cover:
1) Core Personality synthesis (weave driver/conductor/name number + nature).
2) Career & Money — practical advice and 2–3 actionable suggestions.
3) Relationships — communication style, compatibility cues, boundaries.
4) Health & Balance — lifestyle practices linked to focus areas.
5) Luck & Timing — favorable days/numbers/colors; how to use them weekly.
6) Remedies/Rituals — simple habits (journaling, charity, mantra, fasting, environment tweaks).

Keep it specific to the inputs. Avoid predicting medical/legal outcomes. Do not claim certainty.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // use a capable, cost-effective model
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      temperature: 0.7
    });

    const detailed = completion.choices?.[0]?.message?.content?.trim() || "";

    // Short overview paragraph (also via model or simple synthesis)
    const overview = `${name.split(" ")[0]} ke numbers (Driver ${driver}, Conductor ${conductor}, Name ${nameNumber}) aapki core vibe ko define karte hain. ${nature}`;

    res.json({
      overview,
      nature,
      strengths,
      focus: missing,
      detailed
    });
  }catch(err){
    console.error(err);
    res.status(500).json({ error: "Failed to generate reading" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Server running on http://localhost:${PORT}`));
