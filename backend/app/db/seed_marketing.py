"""
Seed data for marketing tools.

- Winter treks (Himachal + Uttarakhand) are inserted as DRAFTS: prices and itineraries are
  starting points that ops must review in admin before publishing.
- Marketing fields (pickup city, quiz tags, persona) are filled on known treks only where
  they are still empty, so re-running never overwrites admin edits.
- Departure cities are created as unpublished shells WITHOUT routes: bus/train times and
  fares must be collected and verified by ops (the publish gate enforces this).
"""

from sqlalchemy.orm import Session

from app.db.models import DepartureCity, ItineraryDay, Trek, TrekFAQ, TrekImage
from app.models.marketing import MarketingSettingsData
from app.services import marketing as marketing_service

WINTER = ["December", "January", "February", "March"]

IMG_SNOW_SUMMIT = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800"
IMG_SNOW_LAKE = "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800"
IMG_SNOW_FOREST = "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800"
IMG_HIGH = "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800"
IMG_VALLEY = "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800"
IMG_PASS = "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=800"

WINTER_EQUIPMENT = [
    "Trekking shoes with ankle support",
    "Thermal innerwear",
    "Down jacket",
    "Fleece jacket",
    "Waterproof gloves",
    "Woolen cap / balaclava",
    "UV sunglasses",
    "Backpack 40-50L",
    "Headlamp",
    "Trekking poles",
]
WINTER_INCLUDES = [
    "All meals during the trek",
    "Camping / homestay accommodation",
    "Experienced trek leader",
    "Forest permits",
    "First aid kit",
    "Microspikes",
]
WINTER_EXCLUDES = [
    "Personal gear",
    "Travel insurance",
    "Transport to pickup point",
    "Personal expenses",
]


def _days(*items):
    return [
        {
            "day": i,
            "title": title,
            "description": f"<p>{text}</p>",
            "elevation_gain": 0,
            "distance": 0,
        }
        for i, (title, text) in enumerate(items, start=1)
    ]


# Starting points researched from public 2026-27 winter trek guides; review before publishing.
WINTER_TREKS = [
    {
        "trek": {
            "name": "Kuari Pass Trek",
            "slug": "kuari-pass",
            "difficulty": "moderate",
            "duration": 6,
            "price": 11999,
            "max_altitude": 3800,
            "distance": 33,
            "location": "Chamoli, Uttarakhand",
            "short_description": "Lord Curzon's trail with some of the best views of Nanda Devi, "
            "Dronagiri and Kamet in winter.",
            "description": "<p><strong>Kuari Pass</strong> is a winter favourite for trekkers who "
            "want big Himalayan panoramas without technical climbing. The trail climbs through oak "
            "and rhododendron forest to open snow slopes with Nanda Devi, Dronagiri and Kamet in "
            "view for most of the walk.</p>",
            "featured_image": IMG_HIGH,
            "pickup_city": "Rishikesh",
            "quiz_tags": ["views", "pass_crossing", "snow_forest"],
            "quiz_persona": "The Panorama Hunter",
            "quiz_share_line": "Nanda Devi views all day. I'm a Kuari Pass trekker.",
        },
        "itinerary": _days(
            ("Rishikesh to Joshimath", "Drive along the Alaknanda valley to Joshimath."),
            ("Joshimath to Gulling", "Short drive and first trek day through village trails."),
            ("Gulling to Tali", "Climb through oak forest to snow-covered Tali campsite."),
            ("Tali to Kuari Pass and back", "Summit push for wide views of the Garhwal giants."),
            ("Tali to Joshimath", "Descend to the road head and drive to Joshimath."),
            ("Joshimath to Rishikesh", "Drive back to Rishikesh. Trek concludes."),
        ),
        "faqs": [
            (
                "Is Kuari Pass good for beginners?",
                "Fit beginners can do it, but it is longer and "
                "steeper than Kedarkantha. Some prior trekking helps.",
            ),
        ],
    },
    {
        "trek": {
            "name": "Dayara Bugyal Trek",
            "slug": "dayara-bugyal",
            "difficulty": "easy",
            "duration": 5,
            "price": 8999,
            "max_altitude": 3600,
            "distance": 20,
            "location": "Uttarkashi, Uttarakhand",
            "short_description": "Vast snow meadows with Bandarpoonch views. One of the best "
            "effort-to-reward winter treks.",
            "description": "<p><strong>Dayara Bugyal</strong> is a huge high-altitude meadow that "
            "turns into an endless snowfield in winter. Gentle gradients make it ideal for "
            "families and first-timers who want deep snow without a hard summit day.</p>",
            "featured_image": IMG_SNOW_FOREST,
            "pickup_city": "Dehradun",
            "quiz_tags": ["meadow", "snow_forest", "views"],
            "quiz_persona": "The Snow Meadow Dreamer",
            "quiz_share_line": "Endless snow meadows. I'm a Dayara Bugyal trekker.",
        },
        "itinerary": _days(
            ("Dehradun to Raithal", "Drive via Uttarkashi to the village of Raithal."),
            ("Raithal to Gui", "Trek through oak and rhododendron forest to Gui campsite."),
            ("Gui to Dayara Bugyal and back", "Walk across the snow meadows with peak views."),
            ("Gui to Raithal", "Descend through the forest back to Raithal."),
            ("Raithal to Dehradun", "Drive back to Dehradun. Trek concludes."),
        ),
        "faqs": [
            (
                "Is Dayara Bugyal suitable for families?",
                "Yes. It is one of the gentlest winter "
                "treks and works well for fit teenagers and first-timers.",
            ),
        ],
    },
    {
        "trek": {
            "name": "Chopta Chandrashila Trek",
            "slug": "chopta-chandrashila",
            "difficulty": "easy",
            "duration": 4,
            "price": 7999,
            "max_altitude": 3960,
            "distance": 15,
            "location": "Rudraprayag, Uttarakhand",
            "short_description": "Short winter summit past Tungnath, the world's highest Shiva "
            "temple, with a 360-degree sunrise view.",
            "description": "<p>The <strong>Chopta Chandrashila</strong> trek packs a real summit "
            "into a long weekend. The trail passes Tungnath temple before a steep final climb to "
            "Chandrashila peak for sunrise over Nanda Devi, Trishul and Chaukhamba.</p>",
            "featured_image": IMG_SNOW_SUMMIT,
            "pickup_city": "Rishikesh",
            "quiz_tags": ["summit", "culture", "views"],
            "quiz_persona": "The Temple-Top Summiteer",
            "quiz_share_line": "Sunrise above Tungnath. I'm a Chandrashila trekker.",
        },
        "itinerary": _days(
            ("Rishikesh to Chopta", "Drive through Devprayag and Rudraprayag to Chopta."),
            ("Chopta to Tungnath", "Trek to Tungnath temple and rest for the summit push."),
            ("Chandrashila summit and back to Chopta", "Pre-dawn climb for sunrise on the top."),
            ("Chopta to Rishikesh", "Drive back to Rishikesh. Trek concludes."),
        ),
        "faqs": [
            (
                "Can I do Chandrashila in a long weekend?",
                "Yes. It is one of the shortest winter " "summit treks from Rishikesh.",
            ),
        ],
    },
    {
        "trek": {
            "name": "Nag Tibba Trek",
            "slug": "nag-tibba",
            "difficulty": "easy",
            "duration": 2,
            "price": 4499,
            "max_altitude": 3022,
            "distance": 16,
            "location": "Tehri Garhwal, Uttarakhand",
            "short_description": "The classic weekend snow trek near Dehradun with views of "
            "Bandarpoonch and Swargarohini.",
            "description": "<p><strong>Nag Tibba</strong> is the easiest way to stand on snow in "
            "a weekend. Leave Delhi on Friday night, summit on Saturday or Sunday and be back at "
            "work on Monday.</p>",
            "featured_image": IMG_SNOW_FOREST,
            "pickup_city": "Dehradun",
            "quiz_tags": ["weekend", "summit", "snow_forest"],
            "quiz_persona": "The Weekend Escape Artist",
            "quiz_share_line": "Two days, one snow peak. I'm a Nag Tibba trekker.",
        },
        "itinerary": _days(
            ("Dehradun to Pantwari and trek to base camp", "Drive to Pantwari and climb to camp."),
            ("Summit and return to Dehradun", "Early summit, descend to Pantwari, drive back."),
        ),
        "faqs": [
            (
                "Is there snow on Nag Tibba?",
                "Usually from late December to February, depending on " "snowfall that season.",
            ),
        ],
    },
    {
        "trek": {
            "name": "Har Ki Dun Trek",
            "slug": "har-ki-dun",
            "difficulty": "moderate",
            "duration": 7,
            "price": 12999,
            "max_altitude": 3566,
            "distance": 47,
            "location": "Uttarkashi, Uttarakhand",
            "short_description": "Ancient villages, snowy forests and the cradle-shaped valley "
            "below Swargarohini.",
            "description": "<p><strong>Har Ki Dun</strong> follows the Tons river past centuries-"
            "old villages like Osla to a wide valley beneath Swargarohini. In winter the upper "
            "valley is quiet and snowbound.</p>",
            "featured_image": IMG_VALLEY,
            "pickup_city": "Dehradun",
            "quiz_tags": ["culture", "snow_forest", "solitude"],
            "quiz_persona": "The Valley Storyteller",
            "quiz_share_line": "Old villages and snowy valleys. I'm a Har Ki Dun trekker.",
            "best_season": WINTER + ["April", "May", "October", "November"],
        },
        "itinerary": _days(
            ("Dehradun to Sankri", "Drive via Mussoorie and Purola to Sankri."),
            ("Sankri to Pauni Garaat", "Drive to Taluka and trek along the Supin river."),
            ("Pauni Garaat to Kalkattiyadhar", "Pass Osla village to the forest campsite."),
            ("Explore Har Ki Dun valley", "Walk into the valley below Swargarohini and return."),
            ("Kalkattiyadhar to Pauni Garaat", "Descend along the river."),
            ("Pauni Garaat to Sankri", "Trek to Taluka and drive to Sankri."),
            ("Sankri to Dehradun", "Drive back to Dehradun. Trek concludes."),
        ),
        "faqs": [
            (
                "How cold is Har Ki Dun in winter?",
                "Nights drop well below freezing in the upper "
                "valley; proper layering and a warm sleeping bag are essential.",
            ),
        ],
    },
    {
        "trek": {
            "name": "Dodital Trek",
            "slug": "dodital",
            "difficulty": "moderate",
            "duration": 5,
            "price": 9499,
            "max_altitude": 3024,
            "distance": 44,
            "location": "Uttarkashi, Uttarakhand",
            "short_description": "A quiet forest trail to a frozen emerald lake believed to be "
            "the birthplace of Lord Ganesha.",
            "description": "<p><strong>Dodital</strong> is one of the least crowded winter treks "
            "in Uttarakhand. Dense oak and deodar forest leads to a lake that freezes over in "
            "January and February.</p>",
            "featured_image": IMG_SNOW_LAKE,
            "pickup_city": "Dehradun",
            "quiz_tags": ["frozen_lake", "solitude", "snow_forest"],
            "quiz_persona": "The Quiet Trail Seeker",
            "quiz_share_line": "A frozen lake and an empty trail. I'm a Dodital trekker.",
        },
        "itinerary": _days(
            ("Dehradun to Sangamchatti", "Drive via Uttarkashi to the road head."),
            ("Sangamchatti to Bebra", "Trek through Agoda village to Bebra."),
            ("Bebra to Dodital", "Climb through forest to the frozen lake."),
            ("Dodital to Sangamchatti", "Descend back to the road head."),
            ("Sangamchatti to Dehradun", "Drive back to Dehradun. Trek concludes."),
        ),
        "faqs": [
            ("Is Dodital crowded?", "No. It is one of the quietest winter treks in the region."),
        ],
    },
    {
        "trek": {
            "name": "Triund Trek",
            "slug": "triund",
            "difficulty": "easy",
            "duration": 2,
            "price": 2999,
            "max_altitude": 2850,
            "distance": 18,
            "location": "McLeod Ganj, Himachal Pradesh",
            "short_description": "Short ridge trek above McLeod Ganj with the Dhauladhar range "
            "and Kangra valley at your feet.",
            "description": "<p><strong>Triund</strong> is the most popular first snow trek in "
            "Himachal. The ridge top gets snow in peak winter and the night sky is superb.</p>",
            "featured_image": IMG_SNOW_SUMMIT,
            "pickup_city": "McLeod Ganj",
            "quiz_tags": ["weekend", "views"],
            "quiz_persona": "The Dhauladhar Weekender",
            "quiz_share_line": "Snowy ridge, starry night. I'm a Triund trekker.",
            "best_season": WINTER + ["April", "May", "October", "November"],
        },
        "itinerary": _days(
            ("McLeod Ganj to Triund", "Trek via Gallu Devi temple to the Triund ridge."),
            ("Triund to McLeod Ganj", "Sunrise over the Dhauladhars and descend."),
        ),
        "faqs": [
            (
                "Do I need microspikes on Triund in winter?",
                "Yes. The last stretch gets icy after " "snowfall; we provide microspikes.",
            ),
        ],
    },
    {
        "trek": {
            "name": "Prashar Lake Trek",
            "slug": "prashar-lake",
            "difficulty": "easy",
            "duration": 2,
            "price": 3999,
            "max_altitude": 2730,
            "distance": 15,
            "location": "Mandi, Himachal Pradesh",
            "short_description": "A sacred lake with a floating island and a pagoda temple, "
            "partly frozen in winter.",
            "description": "<p><strong>Prashar Lake</strong> sits in a snowy bowl above Mandi with "
            "the ancient Prashar Rishi temple on its shore. A gentle trail makes it a great family "
            "winter trek.</p>",
            "featured_image": IMG_SNOW_LAKE,
            "pickup_city": "Mandi",
            "quiz_tags": ["weekend", "frozen_lake", "culture"],
            "quiz_persona": "The Sacred Lake Seeker",
            "quiz_share_line": "A frozen lake and a floating island. I'm a Prashar Lake trekker.",
        },
        "itinerary": _days(
            ("Mandi to Baggi and trek to Prashar Lake", "Drive to Baggi and climb to the lake."),
            ("Prashar Lake to Mandi", "Sunrise at the temple and return."),
        ),
        "faqs": [
            ("Is the lake frozen in winter?", "It partly freezes in January and February."),
        ],
    },
    {
        "trek": {
            "name": "Kheerganga Trek",
            "slug": "kheerganga",
            "difficulty": "easy",
            "duration": 2,
            "price": 3499,
            "max_altitude": 2960,
            "distance": 24,
            "location": "Kasol, Himachal Pradesh",
            "short_description": "Parvati valley forest trail to natural hot springs surrounded "
            "by snow.",
            "description": "<p><strong>Kheerganga</strong> starts near our Kasol base and climbs "
            "through deodar forest to natural hot springs. Soaking in hot water with snow around "
            "you is the highlight.</p>",
            "featured_image": IMG_SNOW_FOREST,
            "pickup_city": "Kasol",
            "quiz_tags": ["weekend", "hot_springs", "snow_forest"],
            "quiz_persona": "The Hot Spring Hiker",
            "quiz_share_line": "Hot springs in the snow. I'm a Kheerganga trekker.",
            "best_season": WINTER + ["April", "May", "June", "September", "October", "November"],
        },
        "itinerary": _days(
            ("Kasol to Kheerganga", "Drive to Barshaini and trek through Nakthan village."),
            ("Kheerganga to Kasol", "Morning at the hot springs and descend."),
        ),
        "faqs": [
            (
                "Is Kheerganga open in winter?",
                "The trail is open but camps are limited after heavy "
                "snowfall; we confirm conditions before every batch.",
            ),
        ],
    },
    {
        "trek": {
            "name": "Kareri Lake Trek",
            "slug": "kareri-lake",
            "difficulty": "easy",
            "duration": 3,
            "price": 5999,
            "max_altitude": 2934,
            "distance": 26,
            "location": "Dharamshala, Himachal Pradesh",
            "short_description": "Offbeat Dhauladhar trek to a glacial lake that freezes in "
            "winter.",
            "description": "<p><strong>Kareri Lake</strong> is a quieter alternative to Triund. "
            "The trail follows a mountain stream through Kareri village to a shallow glacial lake "
            "below the Minkiani pass.</p>",
            "featured_image": IMG_SNOW_LAKE,
            "pickup_city": "Dharamshala",
            "quiz_tags": ["frozen_lake", "solitude"],
            "quiz_persona": "The Hidden Lake Explorer",
            "quiz_share_line": "A hidden frozen lake. I'm a Kareri Lake trekker.",
            "best_season": WINTER + ["April", "May", "October", "November"],
        },
        "itinerary": _days(
            ("Dharamshala to Reoti", "Drive to Kareri village and trek to Reoti."),
            ("Reoti to Kareri Lake and back", "Climb to the lake and explore."),
            ("Reoti to Dharamshala", "Descend to Kareri village and drive back."),
        ),
        "faqs": [
            (
                "Is Kareri Lake harder than Triund?",
                "It is longer but gentler; the challenge in " "winter is snow on the upper trail.",
            ),
        ],
    },
]

# Marketing fields for treks that already exist in the base seed (filled only where empty).
EXISTING_TREK_MARKETING = {
    "kedarkantha": {
        "pickup_city": "Dehradun",
        "pickup_time": "6:00 AM",
        "quiz_tags": ["summit", "snow_forest", "views"],
        "quiz_persona": "The Sunrise Summiteer",
        "quiz_share_line": "My first snow summit is waiting. I'm a Kedarkantha trekker.",
    },
    "brahmatal": {
        "pickup_city": "Rishikesh",
        "pickup_time": "5:00 AM",
        "quiz_tags": ["frozen_lake", "views", "snow_forest"],
        "quiz_persona": "The Frozen Lake Wanderer",
        "quiz_share_line": "Frozen lakes and Trishul views. I'm a Brahmatal trekker.",
    },
    "roopkund": {
        "pickup_city": "Kathgodam",
        "quiz_tags": ["extreme", "views"],
        "quiz_persona": "The Mystery Lake Climber",
    },
    "valley-of-flowers": {
        "pickup_city": "Haridwar",
        "quiz_tags": ["culture", "views"],
        "quiz_persona": "The Flower Valley Wanderer",
    },
    "hampta-pass": {
        "pickup_city": "Manali",
        "quiz_tags": ["pass_crossing", "views"],
        "quiz_persona": "The Valley Crosser",
    },
    "sar-pass": {
        "pickup_city": "Kasol",
        "quiz_tags": ["pass_crossing", "snow_forest"],
        "quiz_persona": "The Snow Slider",
    },
}

CITY_SHELLS = [
    {
        "name": "Dehradun",
        "slug": "dehradun",
        "state": "Uttarakhand",
        "display_order": 0,
        "meta_title": "Treks from Dehradun: Pickup Points, Routes & Local Tips",
        "meta_description": "Winter treks starting from Dehradun: Kedarkantha, Dayara Bugyal, "
        "Nag Tibba and more. Pickup timings, how to reach and where to stay the night before.",
        "intro_html": "<p>Dehradun is the pickup point for Kedarkantha (6:00 AM), Dayara Bugyal, "
        "Nag Tibba, Har Ki Dun and Dodital, and our Dehradun office is a short ride from the "
        "pickup. [Ops: add local details - exact pickup landmark, where to wait, rental "
        "shops.]</p>",
    },
    {
        "name": "Delhi",
        "slug": "delhi",
        "state": "Delhi NCR",
        "display_order": 1,
        "meta_title": "Winter Treks from Delhi: Bus & Train Routes, Real Costs",
        "meta_description": "How to reach Kedarkantha, Brahmatal, Nag Tibba and other winter treks "
        "from Delhi: verified bus and train options, our group departures and leave planner.",
        "intro_html": "<p>Most Delhi trekkers reach Uttarakhand winter treks via Dehradun or "
        "Rishikesh overnight, and Himachal treks via Manali or Kasol. We also run group "
        "departures from Delhi. [Ops: add departure point, timing, fog tips.]</p>",
    },
    {
        "name": "Chandigarh",
        "slug": "chandigarh",
        "state": "Chandigarh",
        "display_order": 2,
        "meta_title": "Treks from Chandigarh: Himachal & Uttarakhand Routes",
        "meta_description": "Treks from Chandigarh to Kasol, Manali, Dharamshala and Dehradun: "
        "verified bus routes, fares, timings and our group departures.",
        "intro_html": "<p>Chandigarh is the gateway to Himachal (Kasol, Manali, Dharamshala) and "
        "also connects to Dehradun for Uttarakhand winter treks. We run group departures from "
        "Chandigarh. [Ops: add ISBT details, timings, local tips.]</p>",
    },
    {
        "name": "Lucknow",
        "slug": "lucknow",
        "state": "Uttar Pradesh",
        "display_order": 3,
        "meta_title": "Treks from Lucknow: Trains to Dehradun, Rishikesh & Kathgodam",
        "meta_description": "Plan a Himalayan trek from Lucknow: overnight trains and buses to "
        "Dehradun, Haridwar and Kathgodam, with real timings and fares.",
        "intro_html": "<p>From Lucknow, overnight trains are the easiest way to reach Dehradun, "
        "Haridwar (for Rishikesh) and Kathgodam. [Ops: add train names, timings, local tips.]</p>",
    },
]


def seed_winter_treks(db: Session) -> None:
    added = 0
    for entry in WINTER_TREKS:
        data = dict(entry["trek"])
        if db.query(Trek).filter(Trek.slug == data["slug"]).first():
            continue
        data.setdefault("best_season", list(WINTER))
        trek = Trek(
            **data,
            status="draft",
            featured=False,
            group_size_min=4,
            group_size_max=15,
            includes=list(WINTER_INCLUDES),
            excludes=list(WINTER_EXCLUDES),
            equipment_list=list(WINTER_EQUIPMENT),
            rating=0.0,
            review_count=0,
        )
        db.add(trek)
        db.flush()
        for day in entry["itinerary"]:
            db.add(ItineraryDay(trek_id=trek.id, **day))
        for order, (question, answer) in enumerate(entry["faqs"]):
            db.add(TrekFAQ(trek_id=trek.id, question=question, answer=answer, display_order=order))
        db.add(TrekImage(trek_id=trek.id, url=data["featured_image"], caption=data["name"]))
        added += 1
    db.commit()
    print(f"[OK] Seeded {added} winter treks as drafts (review prices, then publish in admin)")


def seed_trek_marketing_fields(db: Session) -> None:
    updated = 0
    for slug, fields in EXISTING_TREK_MARKETING.items():
        trek = db.query(Trek).filter(Trek.slug == slug).first()
        if not trek:
            continue
        changed = False
        for field, value in fields.items():
            if not getattr(trek, field):
                setattr(trek, field, value)
                changed = True
        updated += int(changed)
    db.commit()
    print(f"[OK] Filled empty marketing fields on {updated} existing treks")


def seed_marketing_settings(db: Session) -> None:
    if marketing_service.get_settings_row(db):
        print("[OK] Marketing settings already exist")
        return
    marketing_service.save_settings(db, MarketingSettingsData())
    print("[OK] Seeded default marketing settings")


def seed_departure_cities(db: Session) -> None:
    added = 0
    for shell in CITY_SHELLS:
        if db.query(DepartureCity).filter(DepartureCity.slug == shell["slug"]).first():
            continue
        db.add(DepartureCity(**shell, is_published=False, local_tips=[], faqs=[]))
        added += 1
    db.commit()
    print(f"[OK] Seeded {added} draft departure cities (add verified routes before publishing)")


def seed_marketing(db: Session) -> None:
    seed_winter_treks(db)
    seed_trek_marketing_fields(db)
    seed_marketing_settings(db)
    seed_departure_cities(db)
