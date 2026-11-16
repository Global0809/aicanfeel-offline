export type City = "new-york" | "london";
export type Campaign = {
  id: string;
  number: string;
  name: string;
  tape: string[];
  tagline: string;
  description: string;
  category: string;
  accent: string;
  palette: string[];
  usd: number;
  gbp: number;
  duration: string;
  leadDays: number;
  lead: string;
  crew: string;
  format: string;
  bestFor: string[];
  experience: string[];
  physical: string;
  included: string[];
  exclusions: string[];
};

export const campaigns: Campaign[] = [
  {
    id: "street-runway",
    number: "01",
    name: "The Street Runway",
    tape: ["STREET", "RUNWAY"],
    tagline: "Your collection. A city in motion.",
    description:
      "Two models turn your collection into a moving street-style editorial. Three hours of styled appearances, captured by a real filmmaker.",
    category: "Fashion",
    accent: "#2648ed",
    palette: ["#2648ed", "#ecebe2", "#101113"],
    usd: 5900,
    gbp: 4200,
    duration: "3-hour activation",
    leadDays: 21,
    lead: "Allow 3–4 weeks",
    crew: "2 models · filmmaker · producer",
    format: "Moving fashion editorial",
    bestFor: ["Fashion", "Footwear", "Eyewear", "Accessories"],
    experience: [
      "We style two complete looks around your collection.",
      "Models follow an approved walking route or partner-site itinerary.",
      "A filmmaker captures movement, details and the city around your brand.",
    ],
    physical:
      "Two adult models, up to two looks each, one compact route with three planned shooting points.",
    included: [
      "Casting and creative direction",
      "Two models for a three-hour activation",
      "On-site producer and filmmaker",
      "One 45–60 second cinematic film",
      "Three 15-second vertical edits",
      "15 edited stills",
      "20-minute scheduled Instagram Live",
      "Tracked campaign link and execution report",
    ],
    exclusions: [
      "Garments, accessories and product shipping",
      "Agency talent premiums or extended usage",
      "Venue hire and public permits",
    ],
  },
  {
    id: "qr-cube-crew",
    number: "02",
    name: "The QR Cube Crew",
    tape: ["SCAN", "THE CITY"],
    tagline: "A walking invitation to your brand.",
    description:
      "Two ambassadors in custom lightweight cube headpieces carry your message through an approved location. A genuine QR code leads directly to your campaign.",
    category: "Street",
    accent: "#e5e625",
    palette: ["#e5e625", "#181818", "#ece9e0"],
    usd: 7400,
    gbp: 5400,
    duration: "3-hour activation",
    leadDays: 21,
    lead: "Allow 3–4 weeks",
    crew: "2 ambassadors · filmmaker · producer",
    format: "Wearable brand activation",
    bestFor: ["App launches", "Product drops", "Events", "Local brands"],
    experience: [
      "We fabricate two lightweight, ventilated headpieces in your colour.",
      "Your actual campaign QR is printed and tested before the shoot.",
      "Ambassadors engage interested visitors while a producer manages the space.",
    ],
    physical:
      "Two custom cube headpieces, approximately 45 cm wide, with sightlines, ventilation and supervised breaks; two small tabletop display cubes and campaign cards.",
    included: [
      "Creative direction and two custom headpieces",
      "Two small display cubes and printed campaign cards",
      "Two ambassadors for three hours",
      "Genuine tested QR artwork",
      "Producer and filmmaker",
      "One 45–60 second cinematic film",
      "Three vertical edits and 15 stills",
      "20-minute scheduled Instagram Live",
      "Scan counts and execution report",
    ],
    exclusions: [
      "Landing-page build beyond a tracked redirect",
      "Venue hire and public permits",
      "Product giveaways",
    ],
  },
  {
    id: "live-brand-painting",
    number: "03",
    name: "The Live Brand Painting",
    tape: ["MAKE", "YOUR MARK"],
    tagline: "Watch your message become a work of art.",
    description:
      "A professional artist paints your brand story live on a commissioned, owner-approved surface. A physical artwork, a public moment and a cinematic making-of.",
    category: "Art",
    accent: "#e13724",
    palette: ["#e13724", "#e4b4ac", "#191516"],
    usd: 9900,
    gbp: 7400,
    duration: "4-hour activation",
    leadDays: 28,
    lead: "Allow 4–6 weeks",
    crew: "Artist · assistant · filmmaker · producer",
    format: "Live commissioned artwork",
    bestFor: ["Lifestyle brands", "Launches", "Culture", "Hospitality"],
    experience: [
      "Approve an original concept and colour plan before production.",
      "An artist completes a planned piece on a prepared temporary wall or agreed surface.",
      "Visitors watch the artwork develop, with your campaign link nearby.",
    ],
    physical:
      "One prepared reusable freestanding panel up to 2.4 m × 2.4 m, or an equivalent owner-approved wall area.",
    included: [
      "One artist concept and two revision rounds",
      "Professional artist and assistant",
      "Standard panel, paint and preparation",
      "Four-hour live painting session",
      "Filmmaker, producer and timelapse capture",
      "Hero film, three vertical edits and 15 stills",
      "20-minute scheduled Instagram Live",
      "Finished panel handover where agreed",
    ],
    exclusions: [
      "Unapproved walls or permanent facade works",
      "Structural works, lifts or conservation approvals",
      "Venue hire, public permits and distant freight",
    ],
  },
  {
    id: "giant-product-procession",
    number: "04",
    name: "The Giant Product Procession",
    tape: ["LARGER", "THAN LIFE"],
    tagline: "Give your next drop an impossible scale.",
    description:
      "A custom oversized garment or lightweight product prop becomes the centre of a choreographed walk through an approved pedestrian site.",
    category: "Spectacle",
    accent: "#789cbd",
    palette: ["#789cbd", "#25395d", "#ebe3d2"],
    usd: 17900,
    gbp: 12900,
    duration: "3-hour activation",
    leadDays: 42,
    lead: "Allow 6–8 weeks",
    crew: "6 carriers · filmmaker · producer · marshal",
    format: "Oversized physical product",
    bestFor: ["Denim", "Footwear", "Bags", "Product launches"],
    experience: [
      "We adapt one recognisable product into a safe oversized build.",
      "A small team rehearses a slow, controlled procession within the approved site.",
      "Ground-level filmmaking captures its scale without entering live traffic.",
    ],
    physical:
      "One lightweight fabric garment up to 3 m long, or equivalent manageable soft prop; final dimensions follow a safety review.",
    included: [
      "Prop design and fabrication allowance",
      "Six rehearsed carriers for three hours",
      "Producer and site marshal",
      "Filmmaker and planned ground-level coverage",
      "Hero film, three vertical edits and 15 stills",
      "20-minute scheduled Instagram Live",
      "Pack-down and execution report",
    ],
    exclusions: [
      "Live-road crossings and traffic closures",
      "Large rigid engineered structures or cranes",
      "Venue hire, permits and aerial filming",
    ],
  },
  {
    id: "impact-art-installation",
    number: "05",
    name: "The Impact Installation",
    tape: ["MAKE", "IT MATTER"],
    tagline: "A brand message you can walk around.",
    description:
      "A sculptural scene makes your brand purpose physical. Oversized objects and considered art direction invite visitors to pause, explore and understand.",
    category: "Art",
    accent: "#ee7732",
    palette: ["#ee7732", "#292b2b", "#c4beb1"],
    usd: 21900,
    gbp: 15900,
    duration: "4-hour activation",
    leadDays: 42,
    lead: "Allow 6–8 weeks",
    crew: "Art team · 2 hosts · filmmaker · producer",
    format: "Temporary sculptural installation",
    bestFor: [
      "Purpose-led brands",
      "Circular products",
      "Culture",
      "Awareness",
    ],
    experience: [
      "Develop one clear message with a coherent physical visual language.",
      "Install up to three lightweight scenic objects in a booked site.",
      "Hosts explain the artwork and invite visitors into its story.",
    ],
    physical:
      "One temporary installation footprint up to 3 m × 3 m with up to three lightweight props. Clearly labelled brand art.",
    included: [
      "Concept development and two revision rounds",
      "Three-prop scenic fabrication allowance",
      "Installation and removal crew",
      "Two hosts for four hours",
      "Producer and filmmaker",
      "Hero film, three vertical edits and 15 stills",
      "20-minute scheduled Instagram Live",
      "Site handback and execution report",
    ],
    exclusions: [
      "Police markings, uniforms or fake emergencies",
      "Unsupported environmental performance claims",
      "Venue, permits and complex engineering",
    ],
  },
  {
    id: "coffee-on-your-brand",
    number: "06",
    name: "Coffee, On Your Brand",
    tape: ["GOOD", "MORNING"],
    tagline: "Make someone’s morning. Introduce your brand.",
    description:
      "Your brand sponsors 100 drinks at a participating café. Custom sleeves and a thoughtful message turn a familiar ritual into a useful first impression.",
    category: "Experience",
    accent: "#74262e",
    palette: ["#74262e", "#eee1c9", "#2e201d"],
    usd: 6900,
    gbp: 4900,
    duration: "3-hour activation",
    leadDays: 21,
    lead: "Allow 3–4 weeks",
    crew: "Café partner · ambassador · filmmaker · producer",
    format: "Sponsored café experience",
    bestFor: ["Apps", "Subscriptions", "Local launches", "Everyday products"],
    experience: [
      "We agree a café, drink menu and a three-hour distribution window.",
      "The café serves up to 100 standard drinks with your branded sleeves.",
      "A host explains the campaign while filming captures the experience.",
    ],
    physical:
      "100 standard hot drinks from the agreed café menu, 100 printed sleeves and one compact branded counter sign.",
    included: [
      "Café coordination and creative direction",
      "100 drinks and branded sleeves",
      "One ambassador for three hours",
      "On-site producer and filmmaker",
      "Hero film, three vertical edits and 15 stills",
      "20-minute scheduled Instagram Live",
      "Drink tally and tracked offer report",
    ],
    exclusions: [
      "Café buyout and premium menu upgrades",
      "Street food vending or unlicensed service",
      "Additional drinks beyond the agreed cap",
    ],
  },
  {
    id: "product-tryout",
    number: "07",
    name: "The First Try",
    tape: ["TRY IT.", "FEEL IT."],
    tagline: "Let your product make its own introduction.",
    description:
      "A hosted trial lets people experience one clear product benefit. Real first impressions, captured with permission, become material for your next campaign.",
    category: "Experience",
    accent: "#a6cdb2",
    palette: ["#a6cdb2", "#204a38", "#ede5d2"],
    usd: 7400,
    gbp: 5200,
    duration: "3-hour activation",
    leadDays: 21,
    lead: "Allow 3–4 weeks",
    crew: "2 hosts · filmmaker · producer",
    format: "Hosted product demonstration",
    bestFor: ["Gadgets", "Accessories", "Apps", "Everyday products"],
    experience: [
      "We turn one product benefit into a simple three-minute demonstration.",
      "Two hosts invite visitors to try it at an agreed partner site.",
      "A filmmaker captures voluntary, honest reactions and product details.",
    ],
    physical:
      "One compact branded demo station, two hosts, and a target capacity of up to 40 short trials; attendance is not guaranteed.",
    included: [
      "Trial design and host briefing",
      "Two hosts and standard display styling",
      "Consent collection for featured interviews",
      "Producer and filmmaker",
      "Hero film, three vertical edits and 15 stills",
      "20-minute scheduled Instagram Live",
      "Trial tally and feedback summary",
    ],
    exclusions: [
      "Products, replenishment and shipping",
      "Regulated, medical or complex product claims",
      "Venue hire and specialist hygiene requirements",
    ],
  },
  {
    id: "neighbourhood-brand-trail",
    number: "08",
    name: "The Neighbourhood Trail",
    tape: ["FOLLOW", "THE STORY"],
    tagline: "Three stops. One brand worth discovering.",
    description:
      "A one-day trail connects three participating local businesses. Visitors follow a simple map, collect stamps and unlock a clearly stated reward.",
    category: "Experience",
    accent: "#edbd39",
    palette: ["#edbd39", "#202d44", "#cec7b8"],
    usd: 11900,
    gbp: 8900,
    duration: "4-hour activation",
    leadDays: 35,
    lead: "Allow 5–7 weeks",
    crew: "3 hosts · filmmaker · producer",
    format: "Three-location brand experience",
    bestFor: [
      "Lifestyle brands",
      "Neighbourhood launches",
      "Retail",
      "Community",
    ],
    experience: [
      "Build an easy walking trail between three agreed partner locations.",
      "Visitors follow a printed route card and collect three host-applied passport stamps.",
      "Finishers redeem a fixed reward, subject to the published quantity cap.",
    ],
    physical:
      "Three partner-site touchpoints within one walkable neighbourhood, branded signs, printed route cards, paper passports and a capped reward allowance.",
    included: [
      "Partner outreach and trail planning",
      "Three hosts for four hours",
      "Three signs, route cards, passports and stamp kits",
      "One tracked campaign QR to your approved landing page",
      "Reward allowance of $300 / £250",
      "Producer and filmmaker",
      "Hero film, three vertical edits and 15 stills",
      "20-minute scheduled Instagram Live",
      "Host-counted check-in and redemption report",
    ],
    exclusions: [
      "Partner venue fees or exclusive hire",
      "Chance-based prizes and purchase-entry lotteries",
      "Large-scale road or public-space occupation",
    ],
  },
  {
    id: "colour-block-performance",
    number: "09",
    name: "The Colour Takeover",
    tape: ["OWN", "THE COLOUR"],
    tagline: "Your palette. Six performers. One city moment.",
    description:
      "Six performers in your brand palette create a short, rehearsed visual sequence around a modular scenic set. Styling and simple choreography make your identity unmistakable.",
    category: "Spectacle",
    accent: "#dc368f",
    palette: ["#dc368f", "#e83235", "#1d171c"],
    usd: 12900,
    gbp: 9500,
    duration: "3-hour activation",
    leadDays: 28,
    lead: "Allow 4–6 weeks",
    crew: "6 performers · choreographer · filmmaker · producer",
    format: "Rehearsed colour performance",
    bestFor: ["Fashion", "Music", "Product launches", "Brand refreshes"],
    experience: [
      "Choose a coherent brand palette and a simple repeatable movement concept.",
      "Six performers rehearse a 60–90 second sequence.",
      "The performance repeats at planned times within an agreed venue.",
    ],
    physical:
      "Six coordinated costumes and six modular scenic units: four secured decorative blocks up to 1.8 m and two low, fabricator-approved seating blocks. No climbing or elevated perches.",
    included: [
      "Concept and basic choreography",
      "Six performers with rehearsal",
      "Six coordinated costumes and six modular scenic units",
      "Producer, choreographer and filmmaker",
      "Hero film, three vertical edits and 15 stills",
      "20-minute scheduled Instagram Live",
      "Execution report",
    ],
    exclusions: [
      "Unannounced road occupation or amplified sound",
      "Complex stunts, rigging or fire effects",
      "Venue hire, permits and commercial music rights",
    ],
  },
  {
    id: "portrait-pop-up",
    number: "10",
    name: "The Portrait Pop-Up",
    tape: ["YOU,", "IN FRAME"],
    tagline: "Give people a portrait worth keeping.",
    description:
      "A compact editorial portrait studio gives visitors a beautiful image in your brand’s visual world, with a keepsake print and a private digital delivery link.",
    category: "Experience",
    accent: "#ac98ce",
    palette: ["#ac98ce", "#6d2937", "#eee8da"],
    usd: 8400,
    gbp: 6200,
    duration: "3-hour activation",
    leadDays: 21,
    lead: "Allow 3–4 weeks",
    crew: "Photographer · host · filmmaker · producer",
    format: "Hosted editorial portrait station",
    bestFor: ["Eyewear", "Beauty", "Accessories", "Lifestyle"],
    experience: [
      "We build one considered backdrop in your brand palette.",
      "Visitors opt in for a short guided portrait sitting.",
      "Each participating visitor receives one small keepsake print and a private digital download link.",
    ],
    physical:
      "One backdrop up to 2.4 m wide, compact lighting, up to 30 portrait sittings and one 6 x 4 inch print per guest within three hours; attendance is not guaranteed.",
    included: [
      "Backdrop art direction and standard build",
      "Portrait photographer and host",
      "Up to 30 basic edited portrait deliveries",
      "One 6 x 4 inch keepsake print per guest, up to 30",
      "Producer and separate filmmaker",
      "Hero film, three vertical edits and 15 stills",
      "20-minute scheduled Instagram Live",
      "Delivery and participation report",
    ],
    exclusions: [
      "Makeup, hair styling or luxury set construction",
      "Advanced retouching, additional or large-format prints",
      "Venue hire and public permits",
    ],
  },
];

export const cityInfo = {
  "new-york": {
    name: "New York",
    country: "USA",
    currency: "USD",
    symbol: "$",
    timezone: "America/New_York",
  },
  london: {
    name: "London",
    country: "UK",
    currency: "GBP",
    symbol: "£",
    timezone: "Europe/London",
  },
} as const;
export function price(campaign: Campaign, city: City) {
  return city === "london" ? campaign.gbp : campaign.usd;
}
export function money(amount: number, city: City) {
  return new Intl.NumberFormat(city === "london" ? "en-GB" : "en-US", {
    style: "currency",
    currency: cityInfo[city].currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
export function campaignById(id: string) {
  return campaigns.find((c) => c.id === id);
}
export function photo(campaign: Campaign | string, index: number) {
  return `/campaigns/${typeof campaign === "string" ? campaign : campaign.id}/${String(index).padStart(2, "0")}.webp`;
}
export function coverPhoto(campaign: Campaign | string) {
  return `/campaigns/${typeof campaign === "string" ? campaign : campaign.id}/cover.webp`;
}
export const shotLabels = [
  "Art direction",
  "Portrait & material",
  "Composition study",
  "In the city",
  "The encounter",
  "Filming the moment",
  "Before doors open",
  "Audience perspective",
  "The final moment",
];
export const commonFAQ = [
  [
    "What does the activation duration include?",
    "The stated duration is your scheduled activation window, with planned crew breaks and repeated moments where appropriate. Setup, briefing and wrap follow the agreed crew call. Instagram Live is a separate scheduled 20-minute segment, rather than an uninterrupted broadcast of the whole activation.",
  ],
  [
    "Are these photographs of completed campaigns?",
    "These are commissioned concept visualizations. They show the intended creative direction, rather than past client work. Your location, casting, artwork and final production plan are approved before the activation.",
  ],
  [
    "Can I choose New York or London?",
    "Yes. Choose your preferred city and date in the booking brief. We confirm the local production partner, site permissions and availability before accepting a production deposit.",
  ],
  [
    "What is included in the starting price?",
    "The production scope listed for the package, filmmaker coverage, edited assets and a scheduled live segment. Venue hire, authority permit fees, tax and any clearly listed extras are itemized in your final proposal.",
  ],
  [
    "How does the Instagram Live work?",
    "A producer runs an agreed 20-minute Instagram Live from a dedicated phone rig, subject to your account being eligible, account access and network conditions. Smart-glasses POV is captured where supported and pretested. Newer Meta glasses do not support direct Instagram livestreaming. If a live connection fails, the recorded coverage is delivered.",
  ],
  [
    "Can I use the footage in Meta ads?",
    "The standard proposal includes a defined licence for brand-owned web and social use, including paid social in the US and UK for 90 days. Final talent, music and artwork rights are written into the approved scope. Extended use is quoted before production.",
  ],
  [
    "Do you guarantee impressions, sales or virality?",
    "We commit to the agreed staffing, production time and deliverables. Reports distinguish counted interactions and QR visits from estimates. Footfall, audience reaction, social reach and sales are not guaranteed.",
  ],
  [
    "When will I receive the film?",
    "The target is a first edit within seven business days of the activation, with one consolidated revision round. The signed production schedule confirms delivery dates.",
  ],
  [
    "What if it rains or a location is unavailable?",
    "We agree a weather decision point and a fallback before confirming the booking. Any rescheduling or committed third-party costs are shown in your production agreement.",
  ],
];
