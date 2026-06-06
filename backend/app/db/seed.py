"""
Database seeding script.
Populates the database with initial data from frontend mock data.
"""
import os
import sys
import json

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.db.models import (
    Trek, TrekImage, ItineraryDay, TrekFAQ,
    Expedition, ExpeditionDay,
    Guide, Testimonial, Office,
    BlogPost, BlogAuthor, User,
    SiteSettings,
)
from app.db.models.blog import BlogCategory, BlogTag, blog_post_tags
from app.db.models.page_content import PageSection
from app.core.security import get_password_hash


def seed_guides(db: Session):
    """Seed guide data."""
    guides_data = [
        {
            "name": "Rajesh Kumar",
            "bio": "Born and raised in the mountains of Uttarakhand, Rajesh has been leading treks for over 15 years. His deep knowledge of local terrain and culture makes every trek special.",
            "experience_years": 15,
            "profile_image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
            "specializations": ["High Altitude", "Winter Treks", "Photography Tours"],
            "rating": 4.9,
        },
        {
            "name": "Vikram Singh",
            "bio": "A certified mountaineer with experience on some of the world's highest peaks. Vikram brings technical expertise and a calm demeanor to challenging expeditions.",
            "experience_years": 12,
            "profile_image_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
            "specializations": ["Technical Climbing", "Expedition Leadership", "First Aid"],
            "rating": 4.8,
        },
        {
            "name": "Deepa Negi",
            "bio": "One of the few female trek leaders in the region, Deepa is passionate about making trekking accessible to everyone. Her encouraging nature helps first-timers feel confident.",
            "experience_years": 8,
            "profile_image_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300",
            "specializations": ["Beginner Friendly", "Women-Only Groups", "Nature Education"],
            "rating": 4.9,
        },
    ]
    
    for guide_data in guides_data:
        existing = db.query(Guide).filter(Guide.name == guide_data["name"]).first()
        if not existing:
            guide = Guide(**guide_data)
            db.add(guide)
    db.commit()
    print(f"[OK] Seeded {len(guides_data)} guides")


def seed_treks(db: Session):
    """Seed trek data with complete information including itineraries, FAQs, and equipment."""
    
    treks_data = [
        {
            "trek": {
                "name": "Hampta Pass Trek",
                "slug": "hampta-pass",
                "difficulty": "moderate",
                "duration": 5,
                "price": 12999,
                "best_season": ["May", "June", "September", "October"],
                "max_altitude": 4270,
                "distance": 35,
                "description": "<p>One of the most dramatic crossovers in the Himalayas, <strong>Hampta Pass</strong> takes you from the lush green valleys of Kullu to the barren landscapes of Lahaul. This trek is a study in contrasts - verdant meadows give way to stark moonscapes as you cross the pass.</p><p>The trek begins from Jobra and winds through dense forests, alpine meadows, and river crossings before ascending to the pass at 4,270 meters. The descent into Lahaul Valley reveals a completely different world - arid, windswept, and eerily beautiful.</p>",
                "short_description": "Cross from lush Kullu valley to barren Lahaul desert in this dramatic Himalayan crossover trek.",
                "featured_image": "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=800",
                "location": "Kullu-Lahaul, Himachal Pradesh",
                "status": "published",
                "group_size_min": 4,
                "group_size_max": 15,
                "includes": ["All meals during trek", "Camping equipment", "Professional guide", "Forest permits", "First aid kit", "Kitchen tent with cook"],
                "excludes": ["Personal gear", "Travel insurance", "Tips to staff", "Transport to base"],
                "equipment_list": ["Trekking shoes", "Backpack (40-50L)", "Warm layers", "Rain jacket", "Sunscreen", "Sunglasses", "Water bottle", "Headlamp", "Trekking poles", "Woolen cap"],
                "rating": 4.8,
                "review_count": 124,
                "featured": True,
                "map_embed": '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d109091.97!2d77.15!3d32.25!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39048708163fd03f%3A0x8129a80efe5c8f63!2sHampta%20Pass!5e0!3m2!1sen!2sin!4v1234567890" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            },
            "itinerary": [
                {"day": 1, "title": "Manali to Jobra - Trek to Chika", "description": "<p>Morning drive from Manali to Jobra (3,150m). The drive takes about 2 hours through scenic mountain roads. From Jobra, we begin our trek through dense forests of pine and deodar. The trail is gentle and follows the Rani Nallah stream.</p><p>Camp at Chika (3,050m) surrounded by towering peaks.</p>", "elevation_gain": 100, "distance": 6},
                {"day": 2, "title": "Chika to Balu Ka Ghera", "description": "<p>Today's trek takes us through beautiful meadows and alongside glacial streams. The landscape opens up revealing stunning views of surrounding peaks. We cross several small streams before reaching the campsite.</p><p>Balu Ka Ghera means 'enclosure of sand' - a wide sandy river bed at 3,600m.</p>", "elevation_gain": 550, "distance": 8},
                {"day": 3, "title": "Balu Ka Ghera to Siagoru via Hampta Pass", "description": "<p>The big day! Early morning start for the climb to Hampta Pass (4,270m). The ascent is steep but manageable. At the pass, witness the dramatic change in landscape - from green Kullu to brown Lahaul.</p><p>Descend to Siagoru (3,900m) in Lahaul Valley. Overnight camp.</p>", "elevation_gain": 670, "distance": 11},
                {"day": 4, "title": "Siagoru to Chatru - Drive to Chandratal", "description": "<p>Short trek down to Chatru (3,360m). After lunch, optional drive to Chandratal Lake (4,300m) - the 'Moon Lake'. The crescent-shaped lake is one of the most beautiful in the Himalayas.</p><p>Return to Chatru for overnight stay.</p>", "elevation_gain": 0, "distance": 6},
                {"day": 5, "title": "Chatru to Manali", "description": "<p>Morning drive back to Manali via Rohtang Pass (if open) or Atal Tunnel. The journey offers spectacular views of the Lahaul Valley and Himalayan peaks.</p><p>Reach Manali by afternoon. Trek concludes.</p>", "elevation_gain": 0, "distance": 0},
            ],
            "faqs": [
                {"question": "What is the best time to do Hampta Pass Trek?", "answer": "The best time is from May to June and September to October. July-August sees heavy rainfall and landslides. The pass remains snow-covered till mid-May.", "display_order": 0},
                {"question": "Is Hampta Pass suitable for beginners?", "answer": "Yes, with basic fitness. It's rated moderate - perfect for first-time Himalayan trekkers. You should be able to walk 8-10 km daily and climb gradients.", "display_order": 1},
                {"question": "What permits are required?", "answer": "Forest permits are required and arranged by us. No additional permits needed. Carry a valid ID proof.", "display_order": 2},
                {"question": "Is Chandratal Lake visit included?", "answer": "Yes! The Chandratal Lake visit is included on Day 4. It's an optional excursion but highly recommended.", "display_order": 3},
            ],
        },
        {
            "trek": {
                "name": "Kedarkantha Trek",
                "slug": "kedarkantha",
                "difficulty": "easy",
                "duration": 6,
                "price": 9999,
                "best_season": ["December", "January", "February", "March"],
                "max_altitude": 3810,
                "distance": 20,
                "description": "<p><strong>Kedarkantha</strong> is widely regarded as one of the best winter treks in India. The trail passes through ancient villages, dense pine forests, and snow-covered meadows before reaching the summit at 3,810 meters.</p><p>What makes this trek special is the 360-degree panoramic view from the summit - you can see peaks like Swargarohini, Black Peak, Bandarpoonch, and Ranglana. The summit push on fresh snow, watching the sunrise paint the Himalayas golden, is a memory you'll cherish forever.</p>",
                "short_description": "A perfect winter trek with pristine snow trails and 360-degree summit views.",
                "featured_image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
                "location": "Uttarkashi, Uttarakhand",
                "status": "published",
                "group_size_min": 4,
                "group_size_max": 20,
                "includes": ["All meals", "Quality camping equipment", "Experienced guide", "Forest permits", "First aid", "Microspikes for snow"],
                "excludes": ["Personal gear", "Travel insurance", "Personal expenses"],
                "equipment_list": ["Trekking shoes with ankle support", "Thermal innerwear", "Down jacket", "Fleece jacket", "Waterproof gloves", "Balaclava", "Sunglasses UV protected", "Backpack 40-50L", "Water bottle", "Headlamp", "Lip balm", "Sunscreen SPF 50+"],
                "rating": 4.9,
                "review_count": 256,
                "featured": True,
                "map_embed": '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d54534.97!2d78.0!3d31.05!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3909d8b59bc7c2e5%3A0x27b8d5c4d6c96f8f!2sKedarkantha!5e0!3m2!1sen!2sin" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            },
            "itinerary": [
                {"day": 1, "title": "Dehradun to Sankri", "description": "<p>Early morning pickup from Dehradun (6 AM). Drive through scenic Mussoorie and along the Yamuna Valley. The journey takes 8-9 hours with stops for lunch and tea breaks.</p><p>Arrive at Sankri (1,920m), a beautiful Himalayan village. Overnight in guesthouse.</p>", "elevation_gain": 1280, "distance": 0},
                {"day": 2, "title": "Sankri to Juda Ka Talab", "description": "<p>Begin trek through dense oak and pine forests. The trail is well-marked and gradually gains altitude. Cross small streams and wooden bridges.</p><p>Reach Juda Ka Talab (2,700m) - a stunning frozen lake surrounded by towering trees. Camp near the lake.</p>", "elevation_gain": 780, "distance": 4},
                {"day": 3, "title": "Juda Ka Talab to Kedarkantha Base", "description": "<p>Trek through snow-laden trails and open meadows. The views start opening up as we gain altitude. On clear days, you can see glimpses of Himalayan peaks.</p><p>Reach Kedarkantha Base Camp (3,400m). The campsite offers stunning sunset views.</p>", "elevation_gain": 700, "distance": 3},
                {"day": 4, "title": "Summit Day - Base to Summit to Hargaon", "description": "<p>Early morning start (3-4 AM) for the summit push. Trek on steep snow slopes under starlit skies. Watch the magical sunrise from the summit (3,810m) with 360° views of over 13 Himalayan peaks!</p><p>Descend to Hargaon Camp (3,050m) for overnight stay.</p>", "elevation_gain": 410, "distance": 6},
                {"day": 5, "title": "Hargaon to Sankri", "description": "<p>Descend through beautiful forest trails back to Sankri. The descent is easy and takes about 4 hours. Enjoy hot lunch at Sankri.</p><p>Evening free to explore the village and interact with locals. Overnight in guesthouse.</p>", "elevation_gain": 0, "distance": 6},
                {"day": 6, "title": "Sankri to Dehradun", "description": "<p>After breakfast, drive back to Dehradun. Reach by evening (6-7 PM). Trek concludes with beautiful memories!</p><p>You can also extend your stay in Mussoorie or explore Dehradun.</p>", "elevation_gain": 0, "distance": 0},
            ],
            "faqs": [
                {"question": "When does it snow in Kedarkantha?", "answer": "Snow starts falling from late November and stays till March. January-February sees the heaviest snowfall with trails covered in 2-3 feet of snow.", "display_order": 0},
                {"question": "Is this trek suitable for first-timers?", "answer": "Absolutely! Kedarkantha is one of the best treks for beginners. The trail is well-marked, altitude is manageable, and the summit day, while challenging, is achievable with basic fitness.", "display_order": 1},
                {"question": "What temperatures can I expect?", "answer": "Daytime: -5°C to 10°C, Nighttime: -10°C to -15°C in peak winter. Proper layering is essential. We provide quality sleeping bags rated for -15°C.", "display_order": 2},
                {"question": "Do I need any technical skills?", "answer": "No technical skills required. We provide microspikes for walking on snow. Basic fitness to walk 4-6 hours daily is sufficient.", "display_order": 3},
            ],
        },
        {
            "trek": {
                "name": "Valley of Flowers Trek",
                "slug": "valley-of-flowers",
                "difficulty": "moderate",
                "duration": 6,
                "price": 14999,
                "best_season": ["July", "August", "September"],
                "max_altitude": 3658,
                "distance": 38,
                "description": "<p>The <strong>Valley of Flowers</strong> is a UNESCO World Heritage Site and one of India's most spectacular natural wonders. Located in the Chamoli district of Uttarakhand, this alpine valley bursts into a riot of colors during monsoon with over 600 species of flowering plants.</p><p>The valley was discovered in 1931 by British mountaineer Frank Smythe and has since captivated botanists, photographers, and nature lovers. Combined with the sacred Hemkund Sahib, this trek offers both natural beauty and spiritual significance.</p>",
                "short_description": "Walk through a UNESCO World Heritage Site carpeted with exotic Himalayan flowers.",
                "featured_image": "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800",
                "location": "Chamoli, Uttarakhand",
                "status": "published",
                "group_size_min": 4,
                "group_size_max": 16,
                "includes": ["All meals", "Quality tents", "Professional guide", "Entry permits to VOF", "First aid kit", "Porter for common luggage"],
                "excludes": ["Personal porter", "Travel insurance", "Personal expenses", "Helicopter services"],
                "equipment_list": ["Waterproof trekking shoes", "Rain jacket", "Poncho", "Waterproof backpack cover", "Quick-dry clothes", "Umbrella", "Gaiters", "Trekking poles", "Camera with rain protection", "Binoculars", "First aid kit"],
                "rating": 4.7,
                "review_count": 89,
                "featured": True,
                "map_embed": '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d54000.97!2d79.6!3d30.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39a78f53f6d3cdc7%3A0x15c5aa89c5fa7b2b!2sValley%20of%20Flowers!5e0!3m2!1sen!2sin" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            },
            "itinerary": [
                {"day": 1, "title": "Haridwar/Rishikesh to Govindghat", "description": "<p>Long scenic drive from Haridwar through the Alaknanda Valley. Pass through Devprayag (confluence of Bhagirathi and Alaknanda), Rudraprayag, and Joshimath.</p><p>Reach Govindghat (1,800m) by evening. Overnight in guesthouse.</p>", "elevation_gain": 1500, "distance": 0},
                {"day": 2, "title": "Govindghat to Ghangaria", "description": "<p>Trek begins along the Pushpawati River. The trail is well-paved and passes through beautiful villages. You can also take a helicopter or pony (at extra cost).</p><p>Reach Ghangaria (3,049m), the base camp for both Valley of Flowers and Hemkund Sahib.</p>", "elevation_gain": 1249, "distance": 13},
                {"day": 3, "title": "Ghangaria to Valley of Flowers and back", "description": "<p>Early start for the Valley of Flowers (3,658m). The trail follows the Pushpawati River into a magical world of blooming flowers. Spend 4-5 hours exploring the valley.</p><p>Spot rare flowers like Brahma Kamal, Blue Poppy, and hundreds of other species. Return to Ghangaria by evening.</p>", "elevation_gain": 609, "distance": 8},
                {"day": 4, "title": "Ghangaria to Hemkund Sahib and back", "description": "<p>Trek to Hemkund Sahib (4,329m), one of the highest Gurudwaras in the world. The trail is steep but spiritually rewarding. The glacial lake and surrounding peaks create a divine atmosphere.</p><p>Return to Ghangaria. Optional: Second day in Valley of Flowers instead.</p>", "elevation_gain": 1280, "distance": 12},
                {"day": 5, "title": "Ghangaria to Govindghat to Joshimath", "description": "<p>Descend back to Govindghat. The downhill trek is easier and takes about 4 hours. From Govindghat, drive to Joshimath (1,890m).</p><p>Explore Joshimath - visit ancient Shankaracharya Math and local markets. Overnight in hotel.</p>", "elevation_gain": 0, "distance": 13},
                {"day": 6, "title": "Joshimath to Haridwar/Rishikesh", "description": "<p>Drive back to Haridwar/Rishikesh. The journey offers last glimpses of the majestic Himalayas. Reach by late evening.</p><p>Trek concludes. Carry back memories of nature's most beautiful canvas!</p>", "elevation_gain": 0, "distance": 0},
            ],
            "faqs": [
                {"question": "When is the Valley of Flowers open?", "answer": "The Valley is open from June 1 to October 31. Peak bloom is from mid-July to mid-August. The national park remains closed rest of the year due to snow.", "display_order": 0},
                {"question": "How much does the permit cost?", "answer": "Entry permit costs ₹150 for Indians and ₹600 for foreigners per day. We include 1-day permit in our package. Additional days at extra cost.", "display_order": 1},
                {"question": "Can we use helicopter to Ghangaria?", "answer": "Yes, helicopter services operate from Govindghat to Ghangaria (₹2,500-3,500 one way). This is not included in our package but can be arranged.", "display_order": 2},
                {"question": "Is it very rainy during trek season?", "answer": "Yes, expect rainfall as the valley is at its best during monsoon. Carry good rain gear. The rain adds to the valley's charm and keeps flowers blooming!", "display_order": 3},
            ],
        },
        {
            "trek": {
                "name": "Roopkund Trek",
                "slug": "roopkund",
                "difficulty": "difficult",
                "duration": 8,
                "price": 18999,
                "best_season": ["May", "June", "September", "October"],
                "max_altitude": 5029,
                "distance": 53,
                "description": "<p><strong>Roopkund</strong>, also known as the 'Mystery Lake' or 'Skeleton Lake', is one of India's most intriguing and challenging treks. At 5,029 meters, this glacial lake contains hundreds of ancient human skeletons dating back to 850 AD.</p><p>The trek takes you through some of the most stunning landscapes in the Garhwal Himalayas - from oak forests to vast alpine meadows (Bugyal), and finally to the stark, rocky terrain surrounding the mysterious lake. The views of Nanda Ghunti and Trishul from Bedni Bugyal are unforgettable.</p>",
                "short_description": "Trek to the mysterious skeleton lake at 5,029m - a challenging high-altitude adventure.",
                "featured_image": "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800",
                "location": "Chamoli, Uttarakhand",
                "status": "published",
                "group_size_min": 4,
                "group_size_max": 12,
                "includes": ["All meals", "High altitude camping gear", "Experienced guide", "Permits", "First aid with oxygen", "Kitchen and dining tents"],
                "excludes": ["Personal gear", "Travel insurance", "Porter charges", "Emergency evacuation"],
                "equipment_list": ["High ankle trekking boots", "Gaiters", "Trekking poles", "Backpack 60L", "Sleeping bag liner", "Down jacket", "Thermal layers", "Balaclava", "Snow goggles", "Headlamp with extra batteries", "Personal first aid", "High SPF sunscreen", "Water purification tablets"],
                "fitness_level": "High fitness level required",
                "experience_required": "Previous high altitude trekking experience recommended",
                "rating": 4.6,
                "review_count": 67,
                "featured": False,
                "map_embed": '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d54200.97!2d79.7!3d30.3!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39a79a73ed7f3c65%3A0x7d95cbf5ac75b82c!2sRoopkund%20Lake!5e0!3m2!1sen!2sin" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            },
            "itinerary": [
                {"day": 1, "title": "Kathgodam to Lohajung", "description": "<p>Drive from Kathgodam railway station through scenic Kumaon hills. Pass through Almora, Kausani (tea gardens), and Gwaldam.</p><p>Reach Lohajung (2,350m) by evening. Briefing and gear check. Overnight in guesthouse.</p>", "elevation_gain": 1050, "distance": 0},
                {"day": 2, "title": "Lohajung to Didna Village", "description": "<p>Trek begins with descent to Wan village followed by ascent to Didna. The trail passes through beautiful villages and terraced farms. First views of Trishul and Nanda Ghunti appear.</p><p>Didna (2,600m) is a quaint village with friendly locals. Overnight in homestay/camp.</p>", "elevation_gain": 250, "distance": 9},
                {"day": 3, "title": "Didna to Ali Bugyal", "description": "<p>Today we enter the high altitude meadows. The climb is steep initially through rhododendron forests. As we gain altitude, vast meadows (bugyals) open up.</p><p>Ali Bugyal (3,400m) is one of Asia's largest high altitude meadows. Stunning 360° views. Camp in meadows.</p>", "elevation_gain": 800, "distance": 10},
                {"day": 4, "title": "Ali Bugyal to Ghora Lotani to Bedni Bugyal", "description": "<p>Trek through more meadows to Ghora Lotani and then to Bedni Bugyal. The views keep getting better with Trishul dominating the horizon.</p><p>Bedni Bugyal (3,560m) has a beautiful temple and lake. Magical sunset over the peaks. Overnight camp.</p>", "elevation_gain": 160, "distance": 7},
                {"day": 5, "title": "Bedni Bugyal to Bhagwabasa", "description": "<p>The landscape changes dramatically as we leave meadows behind. Rocky terrain with patches of snow. The trail to Bhagwabasa is challenging.</p><p>Bhagwabasa (4,100m) is the last camp before Roopkund. Acclimatization is crucial here. Early dinner and rest.</p>", "elevation_gain": 540, "distance": 6},
                {"day": 6, "title": "Bhagwabasa to Roopkund to Bhagwabasa", "description": "<p>Pre-dawn start for Roopkund (5,029m). The climb is steep and demanding on scree and snow. Reach the mysterious skeleton lake and witness the haunting sight of ancient bones.</p><p>Optional: Climb to Junargali (5,100m) for views of Nanda Devi. Descend to Bhagwabasa.</p>", "elevation_gain": 929, "distance": 6},
                {"day": 7, "title": "Bhagwabasa to Bedni to Wan", "description": "<p>Long descent day. Trek back through Bedni and Ali Bugyals. The descent is easier but long. Reach Wan village (2,400m) by evening.</p><p>Celebrate successful summit at camp/guesthouse in Wan.</p>", "elevation_gain": 0, "distance": 20},
                {"day": 8, "title": "Wan to Lohajung to Kathgodam", "description": "<p>Short trek or drive to Lohajung. Then long drive back to Kathgodam. Trek concludes with memories of conquering one of India's most challenging treks!</p><p>Reach Kathgodam by late evening.</p>", "elevation_gain": 0, "distance": 0},
            ],
            "faqs": [
                {"question": "How fit do I need to be for Roopkund?", "answer": "High fitness is essential. You should be able to run 5km in 30 minutes and climb 10-15 floors without stopping. Start training 2-3 months before the trek.", "display_order": 0},
                {"question": "What is the mystery behind the skeletons?", "answer": "The skeletons are believed to be remains of a 9th century group caught in a deadly hailstorm. DNA studies show they were a mix of locals and people from Mediterranean region.", "display_order": 1},
                {"question": "Is there risk of altitude sickness?", "answer": "Yes, at 5,029m AMS is a real risk. We follow proper acclimatization schedules and our guides are trained to identify symptoms. Diamox is recommended.", "display_order": 2},
                {"question": "Can beginners attempt Roopkund?", "answer": "Not recommended. You should have completed at least 2-3 high altitude treks (above 4,000m) before attempting Roopkund. The altitude and terrain are demanding.", "display_order": 3},
            ],
        },
        {
            "trek": {
                "name": "Sar Pass Trek",
                "slug": "sar-pass",
                "difficulty": "moderate",
                "duration": 5,
                "price": 11999,
                "best_season": ["April", "May", "June"],
                "max_altitude": 4200,
                "distance": 48,
                "description": "<p>The <strong>Sar Pass Trek</strong> from Kasol is a classic Himalayan adventure that offers the perfect mix of beautiful meadows, dense forests, and thrilling snow experiences. The highlight is the exciting snow slide from Sar Pass to Biskeri Thach!</p><p>Starting from the hippie town of Kasol in Parvati Valley, the trek takes you through magical forests, across streams, and up to the pass at 4,200m. The views of Parvati Valley and surrounding peaks are spectacular throughout.</p>",
                "short_description": "Classic trek from Kasol featuring snow slides, alpine meadows, and stunning vistas.",
                "featured_image": "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800",
                "location": "Kasol, Himachal Pradesh",
                "status": "published",
                "group_size_min": 4,
                "group_size_max": 15,
                "includes": ["All meals", "Camping gear", "Professional guide", "Forest permits", "First aid"],
                "excludes": ["Personal gear", "Travel insurance", "Personal expenses"],
                "equipment_list": ["Trekking shoes", "Backpack 40-50L", "Warm clothes", "Rain jacket", "Gloves", "Sun cap", "Sunscreen", "Water bottle", "Headlamp", "Trekking poles"],
                "rating": 4.5,
                "review_count": 98,
                "featured": False,
                "map_embed": '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d54300.97!2d77.3!3d32.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3904589e564e29d%3A0xffef191b834adcc2!2sSar%20Pass!5e0!3m2!1sen!2sin" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            },
            "itinerary": [
                {"day": 1, "title": "Kasol to Grahan Village", "description": "<p>Trek starts from Kasol (1,640m). Cross the Parvati River on a wooden bridge and begin ascending through beautiful forests. The trail is steep initially but well-marked.</p><p>Reach Grahan Village (2,350m), one of the oldest and most beautiful villages in Parvati Valley. Camp near the village.</p>", "elevation_gain": 710, "distance": 8},
                {"day": 2, "title": "Grahan to Min Thach", "description": "<p>Continue climbing through dense oak and maple forests. The trail gets steeper as we approach the treeline. Beautiful wildflowers dot the path in spring.</p><p>Reach Min Thach (3,300m), a stunning meadow with views of surrounding peaks. Camp in the meadow.</p>", "elevation_gain": 950, "distance": 7},
                {"day": 3, "title": "Min Thach to Nagaru via Sar Pass", "description": "<p>Early start for Sar Pass (4,200m). The climb is challenging but rewarding. At the pass, enjoy panoramic views of the Parvati Valley and distant peaks.</p><p>The exciting part - slide down on snow to Biskeri Thach! Continue to Nagaru (3,700m) for overnight camp.</p>", "elevation_gain": 900, "distance": 10},
                {"day": 4, "title": "Nagaru to Biskeri Thach to Barshaini", "description": "<p>Descend through beautiful meadows and forests. The trail offers stunning views of the Parvati Valley. Reach Biskeri Thach for lunch.</p><p>Continue descent to Barshaini (2,200m). Drive to Kasol. Celebration dinner! Overnight in Kasol.</p>", "elevation_gain": 0, "distance": 15},
                {"day": 5, "title": "Buffer Day / Departure", "description": "<p>Buffer day in case of weather delays. If not needed, explore Kasol - visit cafes, shop for souvenirs, or take a dip in Parvati River.</p><p>Departure to your onward destination. Trek concludes.</p>", "elevation_gain": 0, "distance": 0},
            ],
            "faqs": [
                {"question": "Is the snow slide safe?", "answer": "Yes! The snow slide is one of the highlights and is completely safe when done with guide supervision. You slide on your backside with proper technique. It's fun!", "display_order": 0},
                {"question": "What is the best time for Sar Pass?", "answer": "April to June is ideal. Earlier (April-May) means more snow for sliding. June offers clearer skies but less snow. The pass is closed in winter.", "display_order": 1},
                {"question": "How is the trail difficulty?", "answer": "Moderate difficulty. The climb to Sar Pass is challenging but doable for anyone with basic fitness. The descent after the snow slide is easier.", "display_order": 2},
                {"question": "Is Kasol worth exploring?", "answer": "Absolutely! Kasol is a beautiful town known for its cafes, Israeli cuisine, and laid-back vibe. Spend an extra day if you can to soak in the atmosphere.", "display_order": 3},
            ],
        },
        {
            "trek": {
                "name": "Brahmatal Trek",
                "slug": "brahmatal",
                "difficulty": "moderate",
                "duration": 6,
                "price": 10999,
                "best_season": ["December", "January", "February", "March"],
                "max_altitude": 3425,
                "distance": 24,
                "description": "<p><strong>Brahmatal</strong> is emerging as one of the best winter treks in India, offering frozen lakes, stunning snow trails, and spectacular views of Mt. Trishul and Nanda Ghunti. The trek gets its name from the mythological tale of Lord Brahma meditating here.</p><p>What makes Brahmatal special is that it offers incredible views with relatively moderate difficulty. The frozen Brahmatal and Bekaltal lakes are mesmerizing, and the summit offers one of the best panoramas in the Garhwal region. Perfect for those who want a winter experience without extreme challenges.</p>",
                "short_description": "Winter trek featuring frozen alpine lakes and views of majestic Himalayan peaks.",
                "featured_image": "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800",
                "location": "Chamoli, Uttarakhand",
                "status": "published",
                "group_size_min": 4,
                "group_size_max": 18,
                "includes": ["All meals", "Quality winter camping gear", "Experienced guide", "Permits", "First aid with oxygen", "Microspikes"],
                "excludes": ["Personal gear", "Travel insurance", "Personal expenses"],
                "equipment_list": ["Waterproof trekking boots", "Gaiters", "Thermal innerwear", "Fleece jacket", "Down jacket", "Waterproof outer layer", "Woolen/fleece gloves", "Balaclava", "Sunglasses UV protected", "Trekking poles", "Backpack with rain cover", "Headlamp", "Lip balm", "Sunscreen SPF 50+"],
                "rating": 4.8,
                "review_count": 112,
                "featured": True,
                "map_embed": '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d54100.97!2d79.5!3d30.1!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39a79db8b2f56c3d%3A0x4bd3a38cf6e9a2f8!2sBrahmatal!5e0!3m2!1sen!2sin" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            },
            "itinerary": [
                {"day": 1, "title": "Rishikesh to Lohajung", "description": "<p>Early morning departure from Rishikesh (5 AM). Scenic drive through Devprayag, Rudraprayag, Karanprayag, and Tharali. The route follows the Alaknanda and Pindar rivers.</p><p>Reach Lohajung (2,350m) by evening. Briefing session. Overnight in guesthouse.</p>", "elevation_gain": 2010, "distance": 0},
                {"day": 2, "title": "Lohajung to Bekaltal", "description": "<p>Trek begins through snow-covered trails and beautiful oak forests. The winter sun filtering through snow-laden trees creates magical scenes. Gradual ascent through the forest.</p><p>Reach Bekaltal (2,845m) - a beautiful frozen lake surrounded by forest. Camp near the lake. Explore the frozen lake in the evening.</p>", "elevation_gain": 495, "distance": 6},
                {"day": 3, "title": "Bekaltal to Brahmatal via Tilandi", "description": "<p>Ascend to Tilandi through open ridges with stunning views of Trishul (7,120m), Nanda Ghunti (6,309m), and other peaks. Continue to Brahmatal - the main frozen lake.</p><p>Brahmatal (3,350m) is stunningly beautiful in winter, completely frozen and snow-covered. Camp near the lake.</p>", "elevation_gain": 505, "distance": 6},
                {"day": 4, "title": "Brahmatal Summit and back to Daldum", "description": "<p>Early morning summit push to Brahmatal Top (3,425m). The sunrise views are spectacular with Mt. Trishul turning golden. 360° views of Himalayan giants!</p><p>Descend to Daldum (2,600m) for overnight camp. The descent is long but through beautiful terrain.</p>", "elevation_gain": 75, "distance": 9},
                {"day": 5, "title": "Daldum to Lohajung", "description": "<p>Final descent through forest trails to Lohajung. The trek ends by noon. Enjoy hot lunch and reminisce about the trek.</p><p>Evening free to explore Lohajung village. Certificate distribution. Overnight in guesthouse.</p>", "elevation_gain": 0, "distance": 5},
                {"day": 6, "title": "Lohajung to Rishikesh", "description": "<p>After breakfast, drive back to Rishikesh. The journey offers beautiful views of the Garhwal Himalayas. Reach Rishikesh by evening.</p><p>Trek concludes with wonderful winter memories!</p>", "elevation_gain": 0, "distance": 0},
            ],
            "faqs": [
                {"question": "How cold does it get on Brahmatal?", "answer": "Expect temperatures between -5°C to -15°C at night and 0°C to 5°C during the day in peak winter. Proper layering is essential. Our sleeping bags are rated for -15°C.", "display_order": 0},
                {"question": "Is the lake really frozen?", "answer": "Yes! From December to February, Brahmatal is completely frozen and covered with snow. Walking on the frozen lake is an incredible experience!", "display_order": 1},
                {"question": "How does it compare to Kedarkantha?", "answer": "Brahmatal is slightly easier than Kedarkantha with lower maximum altitude. The highlights are different - Kedarkantha has a dramatic summit while Brahmatal has frozen lakes.", "display_order": 2},
                {"question": "What special gear do I need for winter?", "answer": "Waterproof boots, gaiters, and proper layering are essential. We provide microspikes for icy patches. See our complete equipment list for details.", "display_order": 3},
            ],
        },
    ]
    
    for trek_entry in treks_data:
        trek_data = trek_entry["trek"]
        existing = db.query(Trek).filter(Trek.slug == trek_data["slug"]).first()
        
        if not existing:
            # Create trek
            trek = Trek(**trek_data)
            db.add(trek)
            db.flush()  # Get trek ID
            
            # Add itinerary days
            for day_data in trek_entry.get("itinerary", []):
                day = ItineraryDay(trek_id=trek.id, **day_data)
                db.add(day)
            
            # Add FAQs
            for faq_data in trek_entry.get("faqs", []):
                faq = TrekFAQ(trek_id=trek.id, **faq_data)
                db.add(faq)
            
            # Add default images
            default_images = [
                {"url": trek_data["featured_image"], "caption": trek_data["name"], "display_order": 0},
            ]
            for img_data in default_images:
                img = TrekImage(trek_id=trek.id, **img_data)
                db.add(img)
    
    db.commit()
    print(f"[OK] Seeded {len(treks_data)} treks with itineraries, FAQs, and images")


def seed_expeditions(db: Session):
    """Seed expedition data."""
    expeditions_data = [
        {
            "name": "Black Peak Expedition",
            "slug": "black-peak",
            "difficulty": "expert",
            "duration": 12,
            "summit_altitude": 6387,
            "base_altitude": 3800,
            "location": "Gangotri, Uttarakhand",
            "region": "Garhwal Himalayas",
            "description": "Black Peak (Kalanag) is one of the most challenging and rewarding peaks in the Indian Himalayas.",
            "short_description": "A challenging 6,387m summit expedition in the Garhwal Himalayas with technical climbing and glacier crossings.",
            "highlights": [
                "Summit at 6,387 meters",
                "Technical climbing experience",
                "Stunning views of Gangotri glacier",
                "Acclimatization at scenic camps",
                "Certificate of achievement",
            ],
            "requirements": {
                "experience": "Minimum 2 high-altitude treks (above 4,500m) completed",
                "fitnessLevel": "Excellent cardiovascular fitness",
                "technicalSkills": ["Basic rope work", "Crampon walking", "Ice axe usage"],
            },
            "equipment": {
                "provided": ["Mountaineering boots", "Crampons and ice axe", "Climbing harness", "Ropes"],
                "personal": ["Layered clothing", "Down jacket", "Trekking poles", "Sunglasses"],
            },
            "price": 65000,
            "group_size_min": 4,
            "group_size_max": 12,
            "season": ["May", "June", "September", "October"],
            "success_rate": 72,
            "image": "/images/expeditions/black-peak.jpg",
            "safety_info": "This expedition includes trained guides, emergency oxygen, and evacuation protocols.",
            "rating": 4.7,
            "review_count": 23,
            "featured": True,
        },
        {
            "name": "Friendship Peak Expedition",
            "slug": "friendship-peak",
            "difficulty": "advanced",
            "duration": 8,
            "summit_altitude": 5289,
            "base_altitude": 3500,
            "location": "Manali, Himachal Pradesh",
            "region": "Pir Panjal Range",
            "description": "Friendship Peak is the perfect introduction to high-altitude mountaineering.",
            "short_description": "An ideal first summit at 5,289m near Manali - perfect introduction to Himalayan mountaineering.",
            "highlights": [
                "Perfect first summit for aspiring mountaineers",
                "Technical training included",
                "Stunning 360° views from summit",
                "Beautiful base camp at Lady Leg meadow",
                "Easy access from Manali",
            ],
            "requirements": {
                "experience": "At least one high-altitude trek recommended",
                "fitnessLevel": "Good cardiovascular fitness",
                "technicalSkills": ["None required - training provided"],
            },
            "equipment": {
                "provided": ["Mountaineering boots", "Crampons and ice axe", "Climbing harness", "Helmet"],
                "personal": ["Warm clothing layers", "Down jacket", "Gloves", "Sunglasses"],
            },
            "price": 28000,
            "group_size_min": 4,
            "group_size_max": 15,
            "season": ["April", "May", "June", "September", "October"],
            "success_rate": 85,
            "image": "/images/expeditions/friendship-peak.jpg",
            "safety_info": "Includes certified guides, emergency evacuation plan, and first aid kit.",
            "rating": 4.9,
            "review_count": 67,
            "featured": True,
        },
    ]
    
    for exp_data in expeditions_data:
        existing = db.query(Expedition).filter(Expedition.slug == exp_data["slug"]).first()
        if not existing:
            expedition = Expedition(**exp_data)
            db.add(expedition)
    db.commit()
    print(f"[OK] Seeded {len(expeditions_data)} expeditions")


def seed_testimonials(db: Session):
    """Seed testimonial data."""
    testimonials_data = [
        {
            "name": "Priya Sharma",
            "role": "Software Engineer",
            "location": "Bangalore",
            "image_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
            "testimonial": "The Kedarkantha trek was absolutely magical! The guides were professional, the food was great, and the views were breathtaking.",
            "trek_name": "Kedarkantha Trek",
            "rating": 5.0,
            "verified": True,
            "tags": ["Great Guides", "Amazing Views", "Beginner Friendly"],
            "helpful_count": 24,
            "date": "2024-12-15",
            "featured": True,
        },
        {
            "name": "Rahul Verma",
            "role": "Marketing Manager",
            "location": "Mumbai",
            "image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
            "testimonial": "Global Events Travels made my dream of trekking in the Himalayas come true. Their attention to safety was impressive.",
            "trek_name": "Hampta Pass Trek",
            "rating": 5.0,
            "verified": True,
            "tags": ["Safety First", "Beautiful Camps", "Well Organized"],
            "helpful_count": 18,
            "date": "2024-11-20",
            "featured": True,
        },
        {
            "name": "Ananya Patel",
            "role": "Doctor",
            "location": "Delhi",
            "image_url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
            "testimonial": "I've done multiple treks with this team and every time they exceed expectations. The Valley of Flowers was like walking through paradise.",
            "trek_name": "Valley of Flowers",
            "rating": 5.0,
            "verified": True,
            "tags": ["Amazing Views", "Repeat Customer", "Paradise"],
            "helpful_count": 31,
            "date": "2024-09-10",
            "featured": True,
        },
    ]
    
    for test_data in testimonials_data:
        existing = db.query(Testimonial).filter(
            Testimonial.name == test_data["name"],
            Testimonial.trek_name == test_data["trek_name"]
        ).first()
        if not existing:
            testimonial = Testimonial(**test_data)
            db.add(testimonial)
    db.commit()
    print(f"[OK] Seeded {len(testimonials_data)} testimonials")


def seed_offices(db: Session):
    """Seed office data."""
    offices_data = [
        {
            "name": "Himachal Office (HQ)",
            "address": "Global Camp's by Global Events Travels, Aleo road petrol pump near Chandarmaki Cottage, NSB Hotel",
            "city": "Manali",
            "state": "Himachal Pradesh",
            "pincode": "175131",
            "landmarks": "Near Aleo Road Petrol Pump, NSB Hotel",
            "phone": "+91 63833 13359",
            "email": "himachal@globaleventstravels.com",
            "lat": 32.2299,
            "lng": 77.1889,
            "map_url": "https://maps.google.com/?q=32.2299,77.1889",
            "image": "/images/offices/manali.jpg",
        },
        {
            "name": "Chennai Office",
            "address": "306, 1st Main Road, MKB Nagar",
            "city": "Chennai",
            "state": "Tamil Nadu",
            "pincode": "600039",
            "phone": "+91 63833 13359",
            "email": "chennai@globaleventstravels.com",
            "lat": 13.1175,
            "lng": 80.1434,
            "map_url": "https://maps.google.com/?q=13.1175,80.1434",
            "image": "/images/offices/chennai.jpg",
        },
        {
            "name": "Kasol Office",
            "address": "Casanova Camp's Choj Bridge, Near Bus Stand, Manikaran Road, Near Volvo",
            "city": "Kasol, Sosan",
            "state": "Himachal Pradesh",
            "pincode": "175101",
            "landmarks": "Choj Bridge, Near Volvo Bus Stand",
            "phone": "+91 63833 13359",
            "email": "kasol@globaleventstravels.com",
            "lat": 32.0167,
            "lng": 77.3167,
            "map_url": "https://maps.google.com/?q=32.0167,77.3167",
            "image": "/images/offices/kasol.jpg",
        },
        {
            "name": "Dehradun Office",
            "address": "Kugiyal Niwas, Vimal Kumar Singh, Ganesh Vihar Lane 6, Mata Mandir Road",
            "city": "Dehradun",
            "state": "Uttarakhand",
            "pincode": "248001",
            "landmarks": "Near Kukreja Institute, Mata Mandir Road",
            "phone": "+91 63833 13359",
            "email": "dehradun@globaleventstravels.com",
            "lat": 30.2871,
            "lng": 78.0211,
            "map_url": "https://maps.google.com/?q=30.2871,78.0211",
            "image": "/images/offices/dehradun.jpg",
        },
    ]
    
    for office_data in offices_data:
        existing = db.query(Office).filter(Office.name == office_data["name"]).first()
        if not existing:
            office = Office(**office_data)
            db.add(office)
    db.commit()
    print(f"[OK] Seeded {len(offices_data)} offices")


def seed_page_content(db: Session):
    """Seed editable page content sections for home, about, and expeditions."""
    sections_data = [
        # Home hero (booking-focused)
        {
            "page": "home",
            "key": "hero",
            "title": "Plan Your Perfect Himalayan Trek",
            "subtitle": "Book trusted treks across the Himalayas with expert guides.",
            "badge_text": "Now booking for 2026 season",
            "body_html": None,
            "image_url": None,
            "cta_label": None,
            "cta_url": None,
            "display_order": 0,
            "is_active": True,
        },
        # Home hero primary CTA
        {
            "page": "home",
            "key": "hero_primary_cta",
            "title": None,
            "subtitle": None,
            "badge_text": None,
            "body_html": None,
            "image_url": None,
            "cta_label": "Explore Treks",
            "cta_url": "/treks",
            "display_order": 0,
            "is_active": True,
        },
        # Home hero secondary CTA
        {
            "page": "home",
            "key": "hero_secondary_cta",
            "title": None,
            "subtitle": None,
            "badge_text": None,
            "body_html": None,
            "image_url": None,
            "cta_label": "Get Free Itinerary on WhatsApp",
            "cta_url": "#whatsapp-form",
            "display_order": 0,
            "is_active": True,
        },
        # Featured treks urgency defaults (JSON: next_batch, seats_text)
        {
            "page": "home",
            "key": "featured_defaults",
            "title": None,
            "subtitle": None,
            "badge_text": None,
            "body_html": json.dumps({"next_batch": "14 Jan 2026", "seats_text": "Only 6 seats left"}),
            "image_url": None,
            "cta_label": None,
            "cta_url": None,
            "display_order": 0,
            "is_active": True,
        },
        # Why Choose Us - trust stats (JSON array: { value, label })
        {
            "page": "home",
            "key": "why_choose_us",
            "title": None,
            "subtitle": None,
            "badge_text": None,
            "body_html": json.dumps([
                {"value": "10,000+", "label": "Happy Trekkers"},
                {"value": "4.8", "label": "Average Rating"},
                {"value": "8+", "label": "Years Experience"},
                {"value": "✓", "label": "No Hidden Costs"},
            ]),
            "image_url": None,
            "cta_label": None,
            "cta_url": None,
            "display_order": 0,
            "is_active": True,
        },
        # Budget treks section
        {
            "page": "home",
            "key": "budget_treks",
            "title": "Budget Friendly Treks",
            "subtitle": "Amazing treks under ₹10,000",
            "badge_text": None,
            "body_html": None,
            "image_url": None,
            "cta_label": None,
            "cta_url": None,
            "display_order": 0,
            "is_active": True,
        },
        # Popular destinations (JSON array: { name, slug, image, trek_count })
        {
            "page": "home",
            "key": "destinations",
            "title": None,
            "subtitle": None,
            "badge_text": None,
            "body_html": json.dumps([
                {"name": "Uttarakhand", "slug": "uttarakhand", "image": "https://media3.thrillophilia.com/filestore/efftugji6q4448bt7s45z1js5tp5_1600680960_shutterstock_562139776.jpg?w=400&dpr=2", "trek_count": 9},
                {"name": "Himachal Pradesh", "slug": "himachal-pradesh", "image": "https://res.cloudinary.com/dyiffrkzh/image/upload/c_fill,f_auto,fl_progressive.strip_profile,g_center,h_400,q_auto,w_700/v1728899306/banbanjara/vtbgtzdxrbbyjjo2s1wc.webp", "trek_count": 10},
                {"name": "Uttarkashi", "slug": "uttarkashi", "image": "https://media1.thrillophilia.com/filestore/ylm7jv5cf5sf8nzp45db2rdh20om_shutterstock_1151786492.jpg?w=400&dpr=2", "trek_count": 1},
                {"name": "Srinagar", "slug": "srinagar", "image": "https://d26dp53kz39178.cloudfront.net/media/uploads/products/5_result_3-1683719790067.webp", "trek_count": 1},
            ]),
            "image_url": None,
            "cta_label": None,
            "cta_url": None,
            "display_order": 0,
            "is_active": True,
        },
        # Home expeditions section
        {
            "page": "home",
            "key": "expeditions",
            "title": "Himalayan Expeditions",
            "subtitle": "Push your limits with our expertly guided mountaineering expeditions. Conquer legendary peaks with safety and expertise.",
            "badge_text": None,
            "body_html": None,
            "image_url": None,
            "cta_label": None,
            "cta_url": None,
            "display_order": 0,
            "is_active": True,
        },
        # Sticky WhatsApp button label
        {
            "page": "home",
            "key": "whatsapp_cta",
            "title": None,
            "subtitle": None,
            "badge_text": None,
            "body_html": None,
            "image_url": None,
            "cta_label": "Chat for Itinerary",
            "cta_url": None,
            "display_order": 0,
            "is_active": True,
        },
        # Home hero stats (used by HeroHome for first stat item)
        {
            "page": "home",
            "key": "hero_stats",
            "title": None,
            "subtitle": None,
            "badge_text": None,
            # value|label format: first stat; remaining stats still use defaults
            "body_html": "50+|Trek Routes",
            "image_url": None,
            "cta_label": None,
            "cta_url": None,
            "display_order": 1,
            "is_active": True,
        },
        # Home statistics (used by Statistics section as JSON array)
        {
            "page": "home",
            "key": "stats",
            "title": None,
            "subtitle": None,
            "badge_text": None,
            "body_html": json.dumps(
                [
                    {
                        "value": "50+",
                        "label": "Trek Routes",
                        "description": "Across the Himalayas",
                    },
                    {
                        "value": "10,000+",
                        "label": "Happy Trekkers",
                        "description": "And counting",
                    },
                    {
                        "value": "15+",
                        "label": "Expert Guides",
                        "description": "Certified professionals",
                    },
                    {
                        "value": "8+",
                        "label": "Years Experience",
                        "description": "In adventure tourism",
                    },
                ]
            ),
            "image_url": None,
            "cta_label": None,
            "cta_url": None,
            "display_order": 2,
            "is_active": True,
        },
        # Home CTA
        {
            "page": "home",
            "key": "cta",
            "title": "Ready for Your Next Adventure?",
            "subtitle": "Join thousands of happy trekkers who have discovered the magic of the Himalayas with us. Your adventure of a lifetime awaits.",
            "badge_text": None,
            "body_html": None,
            "image_url": None,
            "cta_label": "Explore Treks",
            "cta_url": "/treks",
            "display_order": 3,
            "is_active": True,
        },
        # About hero
        {
            "page": "about",
            "key": "hero",
            "title": "About Us",
            "subtitle": "Passionate about mountains, committed to your safety, dedicated to creating unforgettable experiences.",
            "badge_text": None,
            "body_html": None,
            "image_url": None,
            "cta_label": None,
            "cta_url": None,
            "display_order": 0,
            "is_active": True,
        },
        # About story
        {
            "page": "about",
            "key": "story",
            "title": "Born in the Mountains, Built for Adventure",
            "subtitle": None,
            "badge_text": "Our Story",
            "body_html": (
                "<p>Global Events Travels was founded in 2016 by a group of passionate "
                "mountaineers who believed that everyone deserves to experience the magic "
                "of the Himalayas. What started as a small team of friends leading treks "
                "has grown into one of the most trusted adventure travel companies in India.</p>"
                "<p>Our founders grew up in the mountains of Uttarakhand and Himachal Pradesh. "
                "They know every trail, every peak, and every hidden gem. This deep local "
                "knowledge, combined with international safety standards, is what sets us apart.</p>"
                "<p>Today, we've helped over 10,000 trekkers from around the world discover the "
                "beauty of the Indian Himalayas. But our mission remains the same: to provide "
                "safe, sustainable, and unforgettable mountain experiences.</p>"
            ),
            "image_url": None,
            "cta_label": None,
            "cta_url": None,
            "display_order": 1,
            "is_active": True,
        },
        # Expeditions hero
        {
            "page": "expeditions",
            "key": "hero",
            "title": "Himalayan Expeditions",
            "subtitle": "Push your limits with expertly guided mountaineering expeditions. From technical climbing to summit glory, experience the Himalayas like never before.",
            "badge_text": "⛰️ High Altitude Adventures",
            "body_html": None,
            "image_url": None,
            "cta_label": None,
            "cta_url": None,
            "display_order": 0,
            "is_active": True,
        },
        # Expeditions safety banner
        {
            "page": "expeditions",
            "key": "safety",
            "title": "Safety First Approach",
            "subtitle": None,
            "badge_text": None,
            "body_html": (
                "All our expeditions are led by certified mountaineers with emergency protocols, "
                "satellite communication, and insurance coverage. Previous high-altitude experience "
                "is required for most expeditions."
            ),
            "image_url": None,
            "cta_label": None,
            "cta_url": None,
            "display_order": 1,
            "is_active": True,
        },
    ]

    created_count = 0
    for data in sections_data:
        existing = (
            db.query(PageSection)
            .filter(PageSection.page == data["page"], PageSection.key == data["key"])
            .first()
        )
        if not existing:
            section = PageSection(**data)
            db.add(section)
            created_count += 1

    db.commit()
    print(f"[OK] Seeded {created_count} page content sections")


def seed_blog(db: Session):
    """Seed blog authors, categories, tags, and posts with proper relationships."""
    from datetime import datetime

    # --- Authors ---
    authors_data = [
        {
            "name": "Rajesh Kumar",
            "avatar": "/images/team/rajesh.jpg",
            "bio": "Senior Trek Leader with 15+ years of Himalayan experience",
            "role": "Head Guide",
        },
        {
            "name": "Deepa Negi",
            "avatar": "/images/team/deepa.jpg",
            "bio": "Passionate about making trekking accessible to everyone",
            "role": "Trek Leader",
        },
        {
            "name": "Vikram Singh",
            "avatar": "/images/team/vikram.jpg",
            "bio": "Certified mountaineer and gear expert",
            "role": "Expedition Leader",
        },
    ]

    author_map = {}
    for ad in authors_data:
        existing = db.query(BlogAuthor).filter(BlogAuthor.name == ad["name"]).first()
        if existing:
            author_map[ad["name"]] = existing.id
        else:
            author = BlogAuthor(**ad)
            db.add(author)
            db.flush()
            author_map[ad["name"]] = author.id
    db.commit()
    print(f"[OK] Seeded {len(authors_data)} blog authors")

    # --- Categories ---
    categories_data = [
        {"name": "Trek Guides", "slug": "trek-guide", "display_order": 1},
        {"name": "Budget Tips", "slug": "budget-tips", "display_order": 2},
        {"name": "Destinations", "slug": "destination", "display_order": 3},
        {"name": "Gear Reviews", "slug": "gear-review", "display_order": 4},
        {"name": "Safety", "slug": "safety", "display_order": 5},
        {"name": "Season Guides", "slug": "season-guide", "display_order": 6},
        {"name": "Travel Tips", "slug": "travel-tips", "display_order": 7},
    ]

    cat_map = {}  # slug -> id
    created_cats = 0
    for cd in categories_data:
        existing = db.query(BlogCategory).filter(BlogCategory.slug == cd["slug"]).first()
        if existing:
            cat_map[cd["slug"]] = existing.id
        else:
            cat = BlogCategory(**cd)
            db.add(cat)
            db.flush()
            cat_map[cd["slug"]] = cat.id
            created_cats += 1
    db.commit()
    print(f"[OK] Seeded {len(categories_data)} blog categories ({created_cats} new)")

    # --- Tags ---
    all_tag_names = [
        "Summer Treks", "India", "2025", "Best Treks", "Himalayas",
        "Kheerganga", "Kasol", "Beginners", "Budget Trek", "Himachal",
        "Gear", "Packing", "Equipment", "Tips", "Preparation",
    ]

    tag_map = {}  # name -> id
    created_tags = 0
    for tname in all_tag_names:
        tslug = tname.lower().replace(" ", "-")
        existing = db.query(BlogTag).filter(BlogTag.slug == tslug).first()
        if existing:
            tag_map[tname] = existing.id
        else:
            t = BlogTag(name=tname, slug=tslug)
            db.add(t)
            db.flush()
            tag_map[tname] = t.id
            created_tags += 1
    db.commit()
    print(f"[OK] Seeded {len(all_tag_names)} blog tags ({created_tags} new)")

    # --- Posts ---
    posts_data = [
        {
            "title": "13 Best Summer Treks in India for 2025",
            "slug": "best-summer-treks-india-2025",
            "excerpt": "Discover the most breathtaking summer treks in India. From the Valley of Flowers to Hampta Pass, find your perfect adventure.",
            "content": "# 13 Best Summer Treks in India for 2025\n\nSummer in India is the perfect time to escape to the mountains...",
            "content_type": "markdown",
            "author_id": author_map["Rajesh Kumar"],
            "publish_date": "2024-12-20",
            "featured_image": "/images/blog/summer-treks.jpg",
            "category": "season-guide",
            "category_id": cat_map["season-guide"],
            "read_time": 12,
            "featured": True,
            "status": "published",
            "published_at": datetime(2024, 12, 20),
            "meta_description": "Complete guide to the 13 best summer treks in India for 2025.",
            "_tags": ["Summer Treks", "India", "2025", "Best Treks", "Himalayas"],
        },
        {
            "title": "Complete Guide: Kasol to Kheerganga Trek",
            "slug": "kasol-kheerganga-trek-beginners-guide",
            "excerpt": "Everything you need to know about the famous Kasol to Kheerganga trek. Perfect for first-time trekkers.",
            "content": "# Complete Guide: Kasol to Kheerganga Trek\n\nThe Kasol to Kheerganga trek is one of the most popular beginner-friendly treks...",
            "content_type": "markdown",
            "author_id": author_map["Deepa Negi"],
            "publish_date": "2024-12-15",
            "featured_image": "/images/blog/kheerganga.jpg",
            "category": "trek-guide",
            "category_id": cat_map["trek-guide"],
            "read_time": 8,
            "featured": True,
            "status": "published",
            "published_at": datetime(2024, 12, 15),
            "meta_description": "Complete beginner guide to Kasol Kheerganga trek.",
            "_tags": ["Kheerganga", "Kasol", "Beginners", "Budget Trek", "Himachal"],
        },
        {
            "title": "Essential Trekking Gear: What to Pack",
            "slug": "essential-trekking-gear-himalayan-treks",
            "excerpt": "A comprehensive packing guide for Himalayan treks. Learn what gear is essential.",
            "content": "# Essential Trekking Gear\n\nPacking for a Himalayan trek can be overwhelming...",
            "content_type": "markdown",
            "author_id": author_map["Vikram Singh"],
            "publish_date": "2024-12-10",
            "featured_image": "/images/blog/trekking-gear.jpg",
            "category": "gear-review",
            "category_id": cat_map["gear-review"],
            "read_time": 10,
            "featured": False,
            "status": "published",
            "published_at": datetime(2024, 12, 10),
            "meta_description": "Complete packing guide for Himalayan treks.",
            "_tags": ["Gear", "Packing", "Equipment", "Tips", "Preparation"],
        },
    ]

    for pd in posts_data:
        tag_names = pd.pop("_tags")
        existing = db.query(BlogPost).filter(BlogPost.slug == pd["slug"]).first()
        if not existing:
            post = BlogPost(**pd)
            # Assign tags via relationship
            post.tags_rel = [
                db.query(BlogTag).get(tag_map[tn]) for tn in tag_names if tn in tag_map
            ]
            db.add(post)
        else:
            # Update existing posts to use category_id and tags_rel
            if not existing.category_id and pd.get("category_id"):
                existing.category_id = pd["category_id"]
            if not existing.tags_rel:
                existing.tags_rel = [
                    db.query(BlogTag).get(tag_map[tn]) for tn in tag_names if tn in tag_map
                ]
            if existing.status != "published":
                existing.status = "published"
                existing.published_at = pd.get("published_at")
            if pd.get("content_type") == "markdown" and existing.content_type != "markdown":
                existing.content_type = "markdown"
    db.commit()
    print(f"[OK] Seeded {len(posts_data)} blog posts with categories and tags")


def seed_site_settings(db: Session):
    """Seed default site settings (single row)."""
    existing = db.query(SiteSettings).filter(SiteSettings.id == 1).first()
    if not existing:
        settings = SiteSettings(
            id=1,
            company_name="Global Events Travels",
            tagline="Adventure Awaits in the Himalayas",
            description="Discover amazing treks and expeditions in the Himalayas with experienced guides and unforgettable experiences.",
            url="https://globaleventstravels.com",
            email="info@globaleventstravels.com",
            phone="+91 63833 13359",
            address="Manali, Himachal Pradesh, India",
            facebook_url="https://www.facebook.com/TheTrekkingCommunity",
            instagram_url="https://www.instagram.com/global_events_travels",
            twitter_url="#",
            youtube_url="https://www.youtube.com/@globaleventstravels6010",
        )
        db.add(settings)
        db.commit()
        print("[OK] Seeded site settings")
    else:
        print("[OK] Site settings already exist")


def seed_admin_user(db: Session):
    """Seed default admin user."""
    admin_email = "admin@globaleventstravels.com"
    
    existing = db.query(User).filter(User.email == admin_email).first()
    if not existing:
        admin_user = User(
            email=admin_email,
            hashed_password=get_password_hash("admin123"),  # Change this in production!
            full_name="Admin User",
            role="superadmin",
            is_active=True,
            is_verified=True,
        )
        db.add(admin_user)
        db.commit()
        print("[OK] Seeded admin user (email: admin@globaleventstravels.com, password: admin123)")
    else:
        print("[OK] Admin user already exists")


def seed_all(drop_all: bool = True):
    """Run all seed functions."""
    print("\n[*] Starting database seeding...\n")
    
    # Drop all tables if requested (for schema changes)
    if drop_all:
        print("[*] Dropping all existing tables...")
        Base.metadata.drop_all(bind=engine)
    
    # Create tables
    print("[*] Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    # Create session
    db = SessionLocal()
    
    try:
        seed_admin_user(db)
        seed_site_settings(db)
        seed_guides(db)
        seed_treks(db)
        seed_expeditions(db)
        seed_testimonials(db)
        seed_offices(db)
        seed_blog(db)
        seed_page_content(db)
        
        print("\n[OK] Database seeding completed successfully!\n")
    except Exception as e:
        print(f"\n[ERROR] Error seeding database: {e}\n")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    # Ensure data directory exists
    os.makedirs("data", exist_ok=True)
    seed_all()

