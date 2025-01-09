import json
import os
import math



nodes = []

# Create viz_data directory if it doesn't exist
os.makedirs('viz_data', exist_ok=True)

# Define card categories for analysis
# These categories help organize cards and calculate overlaps separately for each type
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

def load_card_metadata():
    """
    Load color identity information from Scryfall data.
    This is crucial for color-based normalization of overlaps.
    
    For example: When comparing two commanders that share only red,
    we want to primarily consider red cards and colorless cards in their overlap.
    """
    card_colors = {}
    print("Loading card metadata...")
    with open('default-cards-20241223222017.json', 'r', encoding='utf-8') as f:
        for line in f:
            try:
                card = json.loads(line.strip().rstrip(','))
                card_colors[card['name']] = {
                    'color_identity': card['color_identity'],
                    'rarity': card.get('rarity', 'common')  # Stored for potential future weighting
                }
            except json.JSONDecodeError:
                continue
    return card_colors

def calculate_card_frequencies(commander_data):
    """
    Calculate how often each card appears across ALL commanders.
    
    Example:
    - Sol Ring appears in 160/200 commanders -> frequency 0.8 -> uniqueness 0.2
    - Niche tribal card in 10/200 commanders -> frequency 0.05 -> uniqueness 0.95
    """
    card_frequencies = {}
    total_commanders = len(commander_data)
    
    # Count how many commanders use each card
    for commander, data in commander_data.items():
        if data and 'card_groups' in data:
            for category in CARD_CATEGORIES:
                cards = get_cards_from_category(commander_data, commander, category)
                for card in cards:
                    card_frequencies[card] = card_frequencies.get(card, 0) + 1
    
    # Convert to frequency ratio (0 to 1)
    return {card: count/total_commanders for card, count in card_frequencies.items()}

def get_commander_colors(commander_data, commander_name):
    """Get color identity for a commander from the extracted data"""
    return set(commander_data.get(commander_name, {}).get('color_identity', []))

def calculate_normalized_overlap(cmd1, cmd2, cards1, cards2, commander_data, card_metadata):
    """
    Calculate overlap between commanders normalized by their shared colors.
    
    This addresses the color identity restriction in EDH:
    - A mono-red deck can only use red and colorless cards
    - A 5-color deck can use any cards
    
    The normalization process:
    1. Find shared colors between commanders
    2. Count only cards that could legally go in both decks
    3. Normalize by the minimum possible shared cards
    
    Example:
    - If two commanders share only red, we mainly consider red cards
    - This prevents artificial high overlap just because both use generic staples
    """
    colors1 = get_commander_colors(commander_data, cmd1)
    colors2 = get_commander_colors(commander_data, cmd2)
    shared_colors = colors1.intersection(colors2)
    
    overlap = len(set(cards1).intersection(cards2))
    
    if not shared_colors:
        # If no shared colors, only consider colorless cards
        colorless_cards1 = [c for c in cards1 if not card_metadata.get(c, {}).get('color_identity', [])]
        colorless_cards2 = [c for c in cards2 if not card_metadata.get(c, {}).get('color_identity', [])]
        possible_overlap = min(len(colorless_cards1), len(colorless_cards2))
    else:
        # For shared colors, consider cards that could go in both decks
        shared_color_cards1 = [c for c in cards1 if not (set(card_metadata.get(c, {}).get('color_identity', [])) - shared_colors)]
        shared_color_cards2 = [c for c in cards2 if not (set(card_metadata.get(c, {}).get('color_identity', [])) - shared_colors)]
        possible_overlap = min(len(shared_color_cards1), len(shared_color_cards2))
    
    return overlap / possible_overlap if possible_overlap > 0 else 0

def normalize_raw_weight(raw_weight, max_possible_overlap):
    """
    Convert raw card overlap count to a ratio (0 to 1).
    This helps compare overlaps between decks of different sizes.
    """
    return raw_weight / max_possible_overlap if max_possible_overlap > 0 else 0

def calculate_uniqueness_weight(cards1, cards2, card_frequencies, debug=False):
    """
    Calculate uniqueness based on how rarely cards are used across ALL commanders.
    
    High uniqueness = cards that few commanders use
    Low uniqueness = format staples used by many commanders
    """
    shared_cards = set(cards1).intersection(cards2)
    if not shared_cards:
        return 0
    
    if debug:
        print("\nCard Usage Across All Commanders:")
        print("--------------------------------")
        for card in shared_cards:
            frequency = card_frequencies.get(card, 0)
            uniqueness = 1 - frequency
            print(f"{card:<30} | Used by {frequency*100:>5.1f}% of commanders | Uniqueness: {uniqueness:.3f}")
        print("--------------------------------")
    
    # Average uniqueness of shared cards
    uniqueness_scores = [1 - card_frequencies.get(card, 0) for card in shared_cards]
    return sum(uniqueness_scores) / len(uniqueness_scores)


def get_cards_from_category(commander_data, commander, category):
    """
    Extract list of card names from a specific category in the commander data.
    Handles missing data gracefully by returning empty list.
    """
    try:
        card_groups = commander_data[commander].get('card_groups', {})
        return [card["name"] for card in card_groups.get(category, [])]
    except (KeyError, TypeError, AttributeError):
        return []

def calculate_category_normalized_overlap(cmd1, cmd2, category, cards1, cards2, commander_data, card_metadata):
    """
    Calculate color-normalized overlap for a category.
    This only considers the color-identity restrictions and shared cards,
    without mixing in uniqueness calculations.
    
    Returns: A score (0-1) representing how many cards they share,
    normalized by their color restrictions.
    """
    return calculate_normalized_overlap(cmd1, cmd2, cards1, cards2, commander_data, card_metadata)






def normalize_tribe_counts(commander_data, debug=False):
    """
    Normalize tribe counts for each commander by their total tribal decks count.
    
    Example:
    If Ur-Dragon has tribes:
    - Dragons: 8,000 decks
    - 5-color: 2,000 decks
    - Tribal: 1,000 decks
    Total tribal decks = 11,000
    
    Then normalized weights would be:
    - Dragons: 0.727 (8000/11000)
    - 5-color: 0.182 (2000/11000)
    - Tribal: 0.091 (1000/11000)
    """
    normalized_tribes = {}
    
    for commander, data in commander_data.items():
        if not data or 'tribes' not in data:
            continue
            
        # Calculate total tribal decks by summing all tribe counts
        total_tribal_decks = sum(tribe['count'] for tribe in data['tribes'])
        
        if total_tribal_decks == 0:
            continue
            
        # Normalize each tribe's count by total tribal decks
        normalized_tribes[commander] = {
            tribe['name']: tribe['count'] / total_tribal_decks
            for tribe in data['tribes']
        }
        
        if debug:
            print(f"\n{commander} Tribe Distribution:")
            print(f"Total Tribal Decks: {total_tribal_decks}")
            for tribe, weight in sorted(normalized_tribes[commander].items(), 
                                      key=lambda x: x[1], reverse=True):
                print(f"{tribe:<20}: {weight:.3f}")
    
    return normalized_tribes

def calculate_tribes_weight(cmd1, cmd2, normalized_tribes, debug=False):
    """
    Calculate similarity weight based on shared tribes.
    Returns raw score representing tribal similarity.
    """
    if cmd1 not in normalized_tribes or cmd2 not in normalized_tribes:
        return 0
    
    tribes1 = normalized_tribes[cmd1]
    tribes2 = normalized_tribes[cmd2]
    
    # Find shared tribes
    shared_tribes = set(tribes1.keys()) & set(tribes2.keys())
    if not shared_tribes:
        return 0
    
    if debug:
        print(f"\nShared Tribes between {cmd1} and {cmd2}:")
        for tribe in shared_tribes:
            print(f"Tribe: {tribe:<20} | {cmd1}: {tribes1[tribe]:.3f} | {cmd2}: {tribes2[tribe]:.3f}")
    
    # Calculate similarity for each shared tribe
    tribe_similarities = []
    for tribe in shared_tribes:
        # Use the minimum weight to avoid overvaluing minor themes
        similarity = min(tribes1[tribe], tribes2[tribe])
        tribe_similarities.append(similarity)
    
    # Return the strongest tribal connection
    return max(tribe_similarities) if tribe_similarities else 0








def calculate_tribes_simplified_weight(cmd1, cmd2, normalized_tribes, top_n=10, position_decay=0.85, debug=False):
    """
    Calculate tribal similarity based on overlap in top N tribes with position-weighted scoring.
    
    Args:
        cmd1, cmd2: Commander names
        normalized_tribes: Dict of commander tribe data
        top_n: Number of top tribes to consider (default 10)
        position_decay: Factor to decay position importance (default 0.85)
        debug: Print debug info
    
    Returns:
        Float between 0-1 representing tribal similarity
    """
    if cmd1 not in normalized_tribes or cmd2 not in normalized_tribes:
        return 0
    
    def get_top_tribes(commander):
        tribes = normalized_tribes[commander]
        return sorted(tribes.items(), key=lambda x: x[1], reverse=True)[:top_n]
    
    top_tribes1 = get_top_tribes(cmd1)
    top_tribes2 = get_top_tribes(cmd2)
    
    if debug:
        print(f"\nTop {top_n} tribes for {cmd1}:")
        for i, (tribe, weight) in enumerate(top_tribes1):
            print(f"#{i+1}: {tribe:<20} ({weight:.3f})")
        print(f"\nTop {top_n} tribes for {cmd2}:")
        for i, (tribe, weight) in enumerate(top_tribes2):
            print(f"#{i+1}: {tribe:<20} ({weight:.3f})")
    
    # Calculate position weights using decay factor
    position_weights = [position_decay ** i for i in range(top_n)]
    
    # Find matching tribes and their positions
    tribes1_dict = {tribe: (i, weight) for i, (tribe, weight) in enumerate(top_tribes1)}
    tribes2_dict = {tribe: (i, weight) for i, (tribe, weight) in enumerate(top_tribes2)}
    
    total_score = 0
    max_possible_score = sum(position_weights)  # Maximum score if all top tribes matched perfectly
    
    # Calculate scores for matching tribes
    for tribe in set(tribes1_dict.keys()) & set(tribes2_dict.keys()):
        pos1, weight1 = tribes1_dict[tribe]
        pos2, weight2 = tribes2_dict[tribe]
        
        # Score based on positions and tribe weights
        position_score = (position_weights[pos1] + position_weights[pos2]) / 2
        match_score = position_score * min(weight1, weight2)  # Use minimum weight to be conservative
        total_score += match_score
        
        if debug:
            print(f"\nMatched tribe: {tribe}")
            print(f"Positions: #{pos1+1} and #{pos2+1}")
            print(f"Position weight: {position_score:.3f}")
            print(f"Match score: {match_score:.3f}")
    
    final_score = total_score / max_possible_score if max_possible_score > 0 else 0
    
    if debug:
        print(f"\nFinal score: {final_score:.3f}")
    
    return final_score










# Load data sources
print("Loading commander data...")
with open('extracted_commander_data.json', 'r') as f:
    commander_data = json.load(f)

card_metadata = load_card_metadata()
card_frequencies = calculate_card_frequencies(commander_data)

# Create nodes (commanders)
print("Processing nodes...")
for commander, data in commander_data.items():
    if data:  # Skip if data is None
        nodes.append({
            "id": commander,
            "deck_count": data['deck_count'],
            "rank": data['rank'],
            "colors": data['color_identity'],
            "card_counts": {
                category: len(get_cards_from_category(commander_data, commander, category))
                for category in CARD_CATEGORIES
            }
        })

print(f"Processed {len(nodes)} nodes")

# Create edges (relationships between commanders)
print("Processing edges...")
commanders = [n['id'] for n in nodes]
edge_data = []

# First calculate global card frequencies
print("Calculating global card frequencies...")
card_frequencies = calculate_card_frequencies(commander_data)

# Debug: Print some example card frequencies
print("\nExample Card Frequencies:")
example_cards = ["Sol Ring", "Chatterstorm", "Arcane Signet"]  # Common staples
for card in example_cards:
    freq = card_frequencies.get(card, 0)
    print(f"{card}: Used in {freq*100:.1f}% of all commanders")
    
# Example: Debug uniqueness for specific commanders
debug_pairs = [
    ("The Ur-Dragon", "Tiamat"),  # Dragon tribal commanders
    ("Atraxa, Praetors' Voice", "Vorinclex, Monstrous Raider")  # Superfriends/counters commanders
]

# normalized tribe weight
print("Calculating normalized tribe weights...")
normalized_tribes = normalize_tribe_counts(commander_data, debug=True)  # Set debug=True to see distributions

# Compare each pair of commanders
for i in range(len(commanders)):
    if i % 10 == 0:
        print(f"Processing commander {i+1}/{len(commanders)}...")
    
    for j in range(i + 1, len(commanders)):
        cmd1 = commanders[i]
        cmd2 = commanders[j]
        
        # debug check here
        if (cmd1, cmd2) in debug_pairs or (cmd2, cmd1) in debug_pairs:
            print(f"\nAnalyzing uniqueness between {cmd1} and {cmd2}")
            for category in CARD_CATEGORIES:
                cards1 = get_cards_from_category(commander_data, cmd1, category)
                cards2 = get_cards_from_category(commander_data, cmd2, category)
                print(f"\nCategory: {category}")
                uniqueness_score = calculate_uniqueness_weight(cards1, cards2, card_frequencies, debug=True)

        if commander_data[cmd1] and commander_data[cmd2]:
            normalized_overlaps = {}
            raw_overlaps = {}
            uniqueness_scores = {}
            
            # Calculate maximum possible overlap for raw weight normalization
            total_cards1 = sum(len(get_cards_from_category(commander_data, cmd1, cat)) 
                            for cat in CARD_CATEGORIES)
            total_cards2 = sum(len(get_cards_from_category(commander_data, cmd2, cat)) 
                            for cat in CARD_CATEGORIES)
            max_possible_overlap = min(total_cards1, total_cards2)

            # Process each category separately
            for category in CARD_CATEGORIES:
                cards1 = get_cards_from_category(commander_data, cmd1, category)
                cards2 = get_cards_from_category(commander_data, cmd2, category)
                
                # Keep track of different overlap metrics
                raw_overlap = len(set(cards1).intersection(cards2))
                normalized_overlap = calculate_normalized_overlap(
                    cmd1, cmd2, cards1, cards2, commander_data, card_metadata
                )
                uniqueness_score = calculate_uniqueness_weight(cards1, cards2, card_frequencies)
                
                raw_overlaps[category] = raw_overlap
                normalized_overlaps[category] = normalized_overlap
                uniqueness_scores[category] = uniqueness_score

            # Calculate final weights
            tribes_weight = calculate_tribes_weight(cmd1, cmd2, normalized_tribes)
            total_raw_overlap = sum(raw_overlaps.values())
            normalized_raw_weight = normalize_raw_weight(total_raw_overlap, max_possible_overlap)
            total_normalized_overlap = sum(normalized_overlaps.values()) / len(CARD_CATEGORIES)
            avg_uniqueness = sum(uniqueness_scores.values()) / len(CARD_CATEGORIES)
            
            #  simplified tribes weight calculation
            tribes_simplified_weight = calculate_tribes_simplified_weight(
                cmd1, 
                cmd2, 
                normalized_tribes,
                top_n=3,          # Configurable: number of top tribes to consider
                position_decay=0.85,  # Configurable: how quickly position importance decays
                debug=(cmd1, cmd2) in debug_pairs  # Debug for specific pairs
            )

            # Calculate composite score (blend of normalized overlap and uniqueness)
            composite_score = (total_normalized_overlap * 0.5) + (avg_uniqueness * 0.5)

            # Only create edge if there's meaningful overlap
            if composite_score > 0:
                edge_data.append({
                    "source": cmd1,
                    "target": cmd2,
                    "raw_weight": round(normalized_raw_weight, 3),
                    "normalized_weight": round(total_normalized_overlap, 3),
                    "uniqueness_weight": round(avg_uniqueness, 3),
                    "tribes_weight": round(tribes_weight, 3),
                    "tribes_simplified_weight": round(tribes_simplified_weight, 3),
                    "composite_weight": round(composite_score, 3),
                    "raw_overlaps": raw_overlaps,
                    "normalized_overlaps": normalized_overlaps,
                    "uniqueness_scores": uniqueness_scores
                })

print(f"\nProcessed {len(edge_data)} edges")

# Print tribe weight distribution for debugging
tribe_weights = [edge['tribes_weight'] for edge in edge_data if edge['tribes_weight'] > 0]
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

# Save results
print("\nSaving processed data...")
with open('viz_data/nodes.json', 'w') as f:
    json.dump(nodes, f, indent=2)
with open('viz_data/edges.json', 'w') as f:
    json.dump(edge_data, f, indent=2)

print("Done! Data saved to viz_data/nodes.json and viz_data/edges.json")