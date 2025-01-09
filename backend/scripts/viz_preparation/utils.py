# Constants moved from main file
CARD_CATEGORIES = [
    "High Synergy Cards",  # Cards that have strong synergy with the commander
    "New Cards",           # Recently released cards
    "Creatures",
    "Instants",
    "Sorceries",
    "Enchantments",
    "Mana Artifacts",
    "Planeswalkers",
    "Utility Lands",
    "Lands"
]

# Example pairs for debugging specific commander combinations
DEBUG_PAIRS = [
    ("The Ur-Dragon", "Tiamat"),  # Dragon tribal commanders
    ("Atraxa, Praetors' Voice", "Vorinclex, Monstrous Raider")  # Superfriends/counters commanders
]

def get_cards_from_category(commander_data, commander, category):
    """
    Helper function to safely get cards from a category for a commander.
    Handles missing data gracefully.
    """
    if not commander_data.get(commander, {}).get('card_groups', {}):
        return []
    # Extract just the card names from the card dictionaries
    cards = commander_data[commander]['card_groups'].get(category, [])
    return [card['name'] for card in cards]  # Changed this line to extract card names


def print_example_frequencies(card_frequencies):
    """Debug helper to print example card frequencies"""
    print("\nExample Card Frequencies:")
    example_cards = ["Sol Ring", "Chatterstorm", "Arcane Signet"]  # Common staples
    for card in example_cards:
        freq = card_frequencies.get(card, 0)
        print(f"{card}: Used in {freq*100:.1f}% of all commanders")

def print_tribe_distribution(tribe_weights):
    """Helper function to print tribal weight distribution for debugging"""
    if tribe_weights:
        print("\nTribal Weight Distribution:")
        weight_distribution = {
            "0.0-0.2": len([w for w in tribe_weights if w <= 0.2]),
            "0.2-0.4": len([w for w in tribe_weights if 0.2 < w <= 0.4]),
            "0.4-0.6": len([w for w in tribe_weights if 0.4 < w <= 0.6]),
            "0.6-0.8": len([w for w in tribe_weights if 0.6 < w <= 0.8]),
            "0.8-1.0": len([w for w in tribe_weights if w > 0.8])
        }
        print("Weight distribution:", weight_distribution)
        print(f"Min weight: {min(tribe_weights):.3f}")
        print(f"Max weight: {max(tribe_weights):.3f}")

def print_processing_progress(current, total):
    """Helper function to print progress during commander processing"""
    if current % 10 == 0:
        print(f"Processing commander {current+1}/{total}...")