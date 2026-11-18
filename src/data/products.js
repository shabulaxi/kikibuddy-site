// Confirmed copy from 真实产品详情页文案.md. Unknown quantities, frequencies
// and application areas are omitted. Set prices and checkout links here.
const pair = (zh, en) => ({ zh, en });
const spec = (label_zh, label_en, zh, en = zh) => ({ label_zh, label_en, ...pair(zh, en) });
const catsDogs = spec('适用对象', 'Suitable for', '猫、狗', 'Cats & dogs');
export const products = [
  {
    slug: 'paw-nose-balm', name_zh: '爪鼻膏', name_en: 'Paw & Nose Balm',
    tagline_zh: '滚一圈，护住它每天走路、闻世界的两个地方。',
    tagline_en: 'ONE ROLL. FOR THE PAWS THAT WALK, AND THE NOSE THAT KNOWS THE WORLD.',
    points: [pair('椰子油 + 乳木果油', 'Coconut Oil + Shea Butter'), pair('保护 · 滋养 · 修护', 'Protect · Nourish · Repair'), pair('舔舐安全，全季可用，滚珠设计好上手', 'Safe if licked. All-season care. Easy roll-on.')],
    specs: [spec('净含量', 'Net content', '2 fl oz（60 mL）', '2 fl oz (60 mL)'), spec('形态', 'Format', '滚珠瓶', 'Roll-on'), catsDogs],
    usage: [pair('取下瓶盖，滚珠朝下轻压出膏体。', 'Remove the cap. Gently press with the roller facing down to release the balm.'), pair('均匀涂于爪垫、鼻尖干燥处。', 'Apply evenly to dry areas on the paw pads and nose.')],
    notes: [pair('仅供外用；如宠物出现持续不适，停用并咨询兽医。', 'For external use only. If discomfort persists, stop use and consult a veterinarian.'), pair('存放于阴凉干燥处，避免高温阳光直射。', 'Store in a cool, dry place, away from heat and direct sunlight.')],
    image: '/assets/856a8980624f2309.webp', lifestyle: '/assets/b3fa1ccaa74d4f8e.webp',
    video_webm: null, video_mp4: '/video/loops/product-01-paw-balm-loop.mp4',
    price: null, compareAtPrice: null, buyUrl: null, currency: 'CNY'
  },
  {
    slug: 'ear-rinse', name_zh: '宠物洗耳液', name_en: 'Pet Ear Rinse',
    tagline_zh: '清洁、除味，一次做完，不吵它。', tagline_en: 'CLEAN. DEODORISED. DONE — WITHOUT A FUSS.',
    points: [pair('强效止痒', 'Strong Anti-Itch'), pair('清洁 + 除味', 'Cleanses & Deodorizes'), pair('无酒精，添加植物萃取，舔舐安全', 'No Alcohol. Added Plant Extracts. Safe if Licked.')],
    specs: [spec('净含量', 'Net content', '100 mL / 3.38 FL OZ'), spec('形态', 'Format', '弯嘴瓶', 'Angled-nozzle bottle'), catsDogs],
    // The supplied ear-rinse directions are explicitly marked as an unconfirmed draft.
    usage: [],
    notes: [pair('耳道有伤口、红肿或持续异味时，先咨询兽医再使用。', 'Consult a veterinarian before use if the ear canal has wounds, redness or persistent odour.'), pair('仅供外用；不要让液体长时间滞留在耳道深处。', 'For external use only. Do not allow liquid to remain deep in the ear canal for prolonged periods.')],
    image: '/assets/2efc331f33473519.webp', lifestyle: '/assets/cff05b51e77e8d67.webp',
    video_webm: null, video_mp4: '/video/loops/product-02-ear-rinse-loop.mp4',
    price: null, compareAtPrice: null, buyUrl: null, currency: 'CNY'
  },
  {
    slug: 'odor-spray', name_zh: '除臭喷雾', name_en: 'Pet Odor Remover Spray',
    tagline_zh: '异味停下的地方，日常继续。', tagline_en: 'WHERE THE SMELL STOPS, THE DAY GOES ON.',
    points: [pair('四种香型：柠檬 · 薰衣草 · 草莓 · 咖啡', 'Four scents: Lemon · Lavender · Strawberry · Coffee'), pair('去除尿味与排泄物异味', 'Removes urine and waste odours'), pair('猫狗通用', 'For Cats & Dogs')],
    specs: [spec('净含量', 'Net content', '250 mL'), spec('香型', 'Scents', '柠檬 / 薰衣草 / 草莓 / 咖啡', 'Lemon / Lavender / Strawberry / Coffee'), catsDogs],
    usage: [], notes: [],
    image: '/assets/cb96eb0cbd37fae1.webp', lifestyle: '/assets/22d1c4a7826a943c.webp',
    video_webm: null, video_mp4: '/video/loops/product-03-odor-spray-loop.mp4',
    price: null, compareAtPrice: null, buyUrl: null, currency: 'CNY'
  },
  {
    slug: 'dental-spray', name_zh: '洁牙喷雾', name_en: 'Pet Dental Spray',
    tagline_zh: '不用牙刷，也能好好照顾它的牙。', tagline_en: 'NO BRUSH. STILL, A CLEAN MOUTH.',
    points: [pair('免刷牙', 'No Brushing Required'), pair('对抗牙菌斑', 'Fight Plaque'), pair('清新口气', 'Freshen Breath')],
    specs: [spec('净含量', 'Net content', '40 mL'), catsDogs],
    usage: [],
    notes: [pair('日常护理用品，不能替代兽医洁牙与诊疗。', 'For routine care. This product does not replace professional dental cleaning or veterinary treatment.'), pair('如宠物出现持续口腔不适，停用并咨询兽医。', 'If oral discomfort persists, stop use and consult a veterinarian.')],
    image: '/assets/b85b51e4384765d2.webp', lifestyle: '/assets/50cddb8ed12e8e85.webp',
    video_webm: null, video_mp4: '/video/loops/product-04-dental-spray-loop.mp4',
    price: null, compareAtPrice: null, buyUrl: null, currency: 'CNY'
  },
  {
    slug: 'shampoo', name_zh: '二合一洗护香波', name_en: '2-in-1 Shampoo',
    tagline_zh: '洗一次，洁净和柔顺都留下。', tagline_en: 'ONE WASH. CLEAN — AND SOFT AFTER.',
    points: [pair('洗护二合一：清洁 + 护理', '2-in-1: Wash & Care'), pair('低敏配方，pH 平衡', 'Hypoallergenic. Balanced pH'), pair('止痒、抗菌', 'Anti-Itch & Antibacterial')],
    specs: [spec('形态', 'Format', '泵头瓶', 'Pump bottle'), catsDogs],
    usage: [pair('打湿毛发，取适量香波揉出泡沫。', 'Wet the coat, apply shampoo and work into a lather.'), pair('轻揉全身，停留片刻后冲洗干净。', 'Massage gently through the coat, leave briefly, then rinse thoroughly.')],
    notes: [pair('如宠物出现持续皮肤不适，停用并咨询兽医。', 'If skin discomfort persists, stop use and consult a veterinarian.')],
    image: '/assets/2ec345c9bed021e0.webp', lifestyle: '/assets/225ae34505fb914e.webp',
    video_webm: null, video_mp4: '/video/loops/product-05-shampoo-loop.mp4',
    price: null, compareAtPrice: null, buyUrl: null, currency: 'CNY'
  }
];
