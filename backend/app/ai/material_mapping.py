"""Material mapping and object classification dictionary for EcoCraft AI.

Converts Computer Vision labels into kid-friendly waste objects, estimated materials,
and safety evaluations.
"""
from typing import Dict, Any, List, Optional

# Supported material categories in EcoCraft AI
SUPPORTED_MATERIALS = [
    "plastic",
    "cardboard",
    "paper",
    "metal",
    "glass",
    "fabric",
    "wood",
    "organic"
]

# Hazardous/Unsafe waste classes that must be blocked for child safety
HAZARDOUS_OBJECT_KEYWORDS = [
    "syringe", "needle", "battery", "accumulator", "chemical", "poison", "blade",
    "razor", "pill bottle", "medicine", "knife", "cleaver", "gas bottle", "lighter",
    "broken glass", "fluorescent bulb", "paint can", "aerosol"
]

# Mapping table connecting common object identifiers (including ImageNet classes) to material & kid-friendly name
OBJECT_MATERIAL_MAP: Dict[str, Dict[str, Any]] = {
    # Plastic
    "phone case": {
        "display_name": "Phone Case / Protective Cover",
        "material": "plastic",
        "description": "Rigid or flexible silicone/polycarbonate gadget cover",
        "is_safe": True,
        "opportunities": [
            "MagSafe Wall Key & Memo Dock",
            "Artist's Thumb Paint Palette",
            "Waterproof Soap & Sponge Bubble Dock",
            "Acoustic Phone Megaphone Speaker",
            "Desktop Reading Stand & Secret Vault"
        ]
    },
    "phone cover": {
        "display_name": "Phone Case / Protective Cover",
        "material": "plastic",
        "description": "Protective case or smartphone cover",
        "is_safe": True,
        "opportunities": [
            "MagSafe Wall Key & Memo Dock",
            "Artist's Thumb Paint Palette",
            "Waterproof Soap & Sponge Bubble Dock",
            "Acoustic Phone Megaphone Speaker",
            "Desktop Reading Stand & Secret Vault"
        ]
    },
    "cellular telephone": {
        "display_name": "Phone Case / Tech Accessory",
        "material": "plastic",
        "description": "Smartphone casing or protective bumper",
        "is_safe": True,
        "opportunities": [
            "MagSafe Wall Key & Memo Dock",
            "Artist's Thumb Paint Palette",
            "Waterproof Soap & Sponge Bubble Dock",
            "Acoustic Phone Megaphone Speaker"
        ]
    },
    "hand-held computer": {
        "display_name": "Phone Case / Electronic Cover",
        "material": "plastic",
        "description": "Protective hard plastic shell",
        "is_safe": True,
        "opportunities": [
            "MagSafe Wall Key & Memo Dock",
            "Artist's Thumb Paint Palette",
            "Desktop Reading Stand & Secret Vault"
        ]
    },
    "web site": {
        "display_name": "Phone Case / Gadget Cover",
        "material": "plastic",
        "description": "Rectangular plastic cover or case with cutouts",
        "is_safe": True,
        "opportunities": [
            "MagSafe Wall Key & Memo Dock",
            "Artist's Thumb Paint Palette",
            "Waterproof Soap & Sponge Bubble Dock",
            "Acoustic Phone Megaphone Speaker"
        ]
    },
    "ipod": {
        "display_name": "Phone Cover / Accessory Case",
        "material": "plastic",
        "description": "Portable electronic sleeve or case",
        "is_safe": True,
        "opportunities": [
            "Artist's Thumb Paint Palette",
            "MagSafe Wall Key Dock",
            "Waterproof Sponge Bubble Dock"
        ]
    },
    "water bottle": {
        "display_name": "Plastic Water Bottle",
        "material": "plastic",
        "description": "Clear polyethylene terephthalate (PET) beverage bottle",
        "is_safe": True,
        "opportunities": ["Self-Watering Planter", "Cosmic Jetpack Rocket", "Sparkling Sensory Calm Bottle", "Piggy Bank"]
    },
    "plastic bottle": {
        "display_name": "Plastic Bottle",
        "material": "plastic",
        "description": "Standard household plastic bottle",
        "is_safe": True,
        "opportunities": ["Bird Feeder", "Herb Planter", "Bowling Pin Game", "Wind Spinner"]
    },
    "pop bottle": {
        "display_name": "Soda / Pop Bottle",
        "material": "plastic",
        "description": "Carbonated soda plastic bottle",
        "is_safe": True,
        "opportunities": ["Rocket Ship", "Greenhouse Cloche", "Pencil Caddy"]
    },
    "bottle cap": {
        "display_name": "Plastic Bottle Caps",
        "material": "plastic",
        "description": "Colorful rigid bottle caps",
        "is_safe": True,
        "opportunities": ["Mosaic Tile Art", "Mini Stampers", "Memory Matching Game", "Math Counter Tokens"]
    },
    "pill bottle": {
        "display_name": "Medicine / Pill Bottle",
        "material": "plastic",
        "description": "Prescription or medicine container",
        "is_safe": False,
        "safety_warning": "Medicine bottles may contain residual chemicals. Please ask a parent to safely dispose of this in a pharmacy take-back bin."
    },
    # Cardboard
    "carton": {
        "display_name": "Cardboard Carton / Box",
        "material": "cardboard",
        "description": "Corrugated cardboard shipping carton or shoebox",
        "is_safe": True,
        "opportunities": ["Mini Puppet Theater", "Cardboard Castle Fortress", "Marble Run Maze", "Toy Car Garage"]
    },
    "cardboard box": {
        "display_name": "Cardboard Delivery Box",
        "material": "cardboard",
        "description": "Delivery box or food packaging carton",
        "is_safe": True,
        "opportunities": ["Epic Castle", "Cardboard Shield & Sword", "Tabletop Foosball", "Shadow Puppet Theater"]
    },
    "egg carton": {
        "display_name": "Pulp Egg Carton",
        "material": "cardboard",
        "description": "Molded pulp paper egg tray",
        "is_safe": True,
        "opportunities": ["Busy Bee & Caterpillar Critters", "Mushroom Forest Wreath", "Seedling Nursery Tray", "Color Sorter Tray"]
    },
    "paper roll": {
        "display_name": "Cardboard Paper Roll",
        "material": "cardboard",
        "description": "Cardboard tube from paper towels or toilet paper",
        "is_safe": True,
        "opportunities": ["Wise Owl Family", "Kaleidoscope Telescope", "Rocket Launcher Tube", "Desk Organizer Station"]
    },
    # Paper
    "newspaper": {
        "display_name": "Daily Newspaper / Newsprint",
        "material": "paper",
        "description": "Folded printed newsprint paper",
        "is_safe": True,
        "opportunities": ["Seed Starter Origami Pots", "Papier-Mâché Creature", "Eco Gift Wrap", "Paper Beads"]
    },
    "magazine": {
        "display_name": "Colorful Magazine Pages",
        "material": "paper",
        "description": "Glossy colorful printed pages",
        "is_safe": True,
        "opportunities": ["Rolled Paper Coasters", "Collage Landscape Art", "Folded Origami Frogs"]
    },
    "paper cup": {
        "display_name": "Paper Drinking Cup",
        "material": "paper",
        "description": "Single-use paper cup",
        "is_safe": True,
        "opportunities": ["String Phone Telephone", "Wind Chime Bells", "Tower Stacking Safari"]
    },
    # Metal
    "tin can": {
        "display_name": "Tin Food Can",
        "material": "metal",
        "description": "Cylindrical steel or aluminum soup/food can",
        "is_safe": True,
        "safety_warning": "Adult assistance is required to inspect edges and smooth any sharp rim with pliers and tape before crafting.",
        "opportunities": ["Starlit Lantern Luminary", "Robot Pencil Caddy", "Wind Chime Melodies", "Bongo Drum Set"]
    },
    "aluminum can": {
        "display_name": "Beverage Can",
        "material": "metal",
        "description": "Aluminum soda or sparkling water can",
        "is_safe": True,
        "safety_warning": "Adult supervision required when working with aluminum cans.",
        "opportunities": ["Desktop Pencil Pot", "Planter Pot"]
    },
    # Glass
    "glass jar": {
        "display_name": "Glass Jam / Sauce Jar",
        "material": "glass",
        "description": "Clean glass container with lid",
        "is_safe": True,
        "safety_warning": "Glass requires adult supervision. Never craft with cracked or chipped glass jars.",
        "opportunities": ["Enchanted Fairy Light Lantern", "Ocean-in-a-Jar Snowglobe", "Layered Sand Art", "Pencil Vase"]
    },
    # Fabric
    "fabric scraps": {
        "display_name": "Old Fabric / T-Shirt",
        "material": "fabric",
        "description": "Worn cotton shirts, denim, or cloth scraps",
        "is_safe": True,
        "opportunities": ["No-Sew T-Shirt Tote Bag", "Braided Jump Rope", "Fabric Bookmark", "Sock Puppet Monster"]
    },
    "t-shirt": {
        "display_name": "Old Cotton T-Shirt",
        "material": "fabric",
        "description": "Outgrown or worn-out jersey cotton shirt",
        "is_safe": True,
        "opportunities": ["No-Sew Farmers Market Tote", "Twisted Headband", "Soft Pet Toy"]
    },
    # Wood
    "popsicle stick": {
        "display_name": "Wooden Popsicle Sticks",
        "material": "wood",
        "description": "Clean craft or ice cream wooden sticks",
        "is_safe": True,
        "opportunities": ["Rustic Photo Frame", "Fairy Tale Bridge", "Treasure Box Trinket Case"]
    }
}


def map_prediction_to_material(label: str) -> Dict[str, Any]:
    """Map a computer vision prediction label into an estimated material and safe craft guidance."""
    clean_label = label.lower().strip()

    # Check for hazardous materials first
    for hazard in HAZARDOUS_OBJECT_KEYWORDS:
        if hazard in clean_label:
            return {
                "display_name": label.title(),
                "material": "hazardous",
                "is_safe": False,
                "safety_notice": f"Hazard detected ({hazard}). This item is NOT safe for children's DIY crafts. Please ask an adult to dispose of it safely.",
                "suggested_opportunities": []
            }

    # Direct match or substring match in our object dictionary
    for key, info in OBJECT_MATERIAL_MAP.items():
        if key in clean_label or clean_label in key:
            return {
                "display_name": info["display_name"],
                "material": info["material"],
                "is_safe": info.get("is_safe", True),
                "safety_notice": info.get("safety_warning"),
                "suggested_opportunities": info.get("opportunities", [])
            }

    # Keyword heuristics for unknown items
    if any(k in clean_label for k in ["bottle", "jug", "flask", "tub", "container", "plastic", "bucket"]):
        return {
            "display_name": label.title(),
            "material": "plastic",
            "is_safe": True,
            "safety_notice": None,
            "suggested_opportunities": ["Planters", "Pen Organizers", "Toys"]
        }
    elif any(k in clean_label for k in ["box", "carton", "cardboard", "package", "pack", "tray"]):
        return {
            "display_name": label.title(),
            "material": "cardboard",
            "is_safe": True,
            "safety_notice": None,
            "suggested_opportunities": ["Castles", "Mazes", "Puppet Theaters"]
        }
    elif any(k in clean_label for k in ["paper", "book", "newspaper", "envelope", "scroll", "sheet"]):
        return {
            "display_name": label.title(),
            "material": "paper",
            "is_safe": True,
            "safety_notice": None,
            "suggested_opportunities": ["Origami", "Seed Pots", "Gift Wrap"]
        }
    elif any(k in clean_label for k in ["can", "tin", "aluminum", "foil", "metal", "steel"]):
        return {
            "display_name": label.title(),
            "material": "metal",
            "is_safe": True,
            "safety_notice": "Adult supervision advised: smooth any sharp edges before crafting.",
            "suggested_opportunities": ["Lanterns", "Desk Caddies", "Drums"]
        }
    elif any(k in clean_label for k in ["glass", "jar", "goblet", "pitcher", "vase"]):
        return {
            "display_name": label.title(),
            "material": "glass",
            "is_safe": True,
            "safety_notice": "Glass can shatter if dropped. Adult supervision required.",
            "suggested_opportunities": ["Lanterns", "Terrariums", "Snowglobes"]
        }
    elif any(k in clean_label for k in ["cloth", "shirt", "fabric", "textile", "sock", "glove", "denim"]):
        return {
            "display_name": label.title(),
            "material": "fabric",
            "is_safe": True,
            "safety_notice": None,
            "suggested_opportunities": ["Tote Bags", "Puppets", "Braided Bracelets"]
        }

    # Default fallback
    return {
        "display_name": label.title(),
        "material": "cardboard",  # safe default common material
        "is_safe": True,
        "safety_notice": "Material estimated by AI. You can manually correct the material below if needed.",
        "suggested_opportunities": ["Creative Recycled DIY Projects"]
    }
