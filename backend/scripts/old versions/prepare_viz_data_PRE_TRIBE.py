import json
import pandas as pd
import networkx as nx
import os

# Create viz_data directory if it doesn't exist
os.makedirs('viz_data', exist_ok=True)

# Define all card categories we want to analyze
CARD_CATEGORIES = [
    "High Synergy Cards",
    "New Cards",
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
    """Load card metadata from Scryfall data"""
    card_colors = {}
    print("Loading card metadata...")
    with open('default-cards-20241223222017.json', 'r', encoding='utf-8') as f:
        for line in f:
            try:
                card = json.loads(line.strip().rstrip(','))
                card_colors[card['name']] = {
                    'color_identity': card['color_identity'],
                    'rarity': card.get('rarity', 'common')  # for potential rarity weighting
                }
            except json.JSONDecodeError:
                continue
    return card_colors

def calculate_card_frequencies(commander_data):
    """Calculate how frequently each card appears across all commanders"""
    card_frequencies = {}
    total_commanders = len(commander_data)
    
    for commander in commander_data:
        for category in CARD_CATEGORIES:
            cards = get_cards_from_category(commander_data, commander, category)
            for card in cards:
                card_frequencies[card] = card_frequencies.get(card, 0) + 1
    
    # Convert to frequency ratio (0 to 1)
    # If a card appears in all decks, it will have value 1
    # If a card appears in 10% of decks, it will have value 0.1
    return {card: count/total_commanders for card, count in card_frequencies.items()}

def get_commander_colors(commander_name, card_metadata):
    """Get color identity for a commander"""
    return set(card_metadata.get(commander_name, {}).get('color_identity', []))

def calculate_normalized_overlap(cmd1, cmd2, cards1, cards2, card_metadata):
    """Calculate color-normalized overlap between commanders"""
    # Get color identities
    colors1 = get_commander_colors(cmd1, card_metadata)
    colors2 = get_commander_colors(cmd2, card_metadata)
    shared_colors = colors1.intersection(colors2)
    
    # Calculate actual overlap
    overlap = len(set(cards1).intersection(cards2))
    
    # If they share no colors, normalize by colorless cards only
    if not shared_colors:
        colorless_cards1 = [c for c in cards1 if not card_metadata.get(c, {}).get('color_identity', [])]
        colorless_cards2 = [c for c in cards2 if not card_metadata.get(c, {}).get('color_identity', [])]
        possible_overlap = min(len(colorless_cards1), len(colorless_cards2))
    else:
        # Calculate potential overlap based on shared colors
        shared_color_cards1 = [c for c in cards1 if not (set(card_metadata.get(c, {}).get('color_identity', [])) - shared_colors)]
        shared_color_cards2 = [c for c in cards2 if not (set(card_metadata.get(c, {}).get('color_identity', [])) - shared_colors)]
        possible_overlap = min(len(shared_color_cards1), len(shared_color_cards2))
    
    return overlap / possible_overlap if possible_overlap > 0 else 0


#  normalize raw weights to a 0 to 1 value
def normalize_raw_weight(raw_weight, max_possible_overlap):
    """Normalize raw weight to be between 0 and 1"""
    return raw_weight / max_possible_overlap if max_possible_overlap > 0 else 0




def calculate_uniqueness_weight(cards1, cards2, card_frequencies):
    """Calculate weighted overlap considering card uniqueness"""
    # Find cards that both commanders share
    shared_cards = set(cards1).intersection(cards2)
    if not shared_cards:
        return 0
    
    # For each shared card, convert its frequency to a uniqueness score
    # Example: if a card appears in 20% of decks (frequency 0.2)
    # Its uniqueness score would be (1 - 0.2) = 0.8
    uniqueness_scores = [1 - card_frequencies.get(card, 0) for card in shared_cards]
   
    # Average the uniqueness scores
    return sum(uniqueness_scores) / len(shared_cards)

def get_cards_from_category(commander_data, commander, category):
    """Extract card names from nested category structure"""
    try:
        if commander_data[commander] and category in commander_data[commander]:
            return [card["name"] for card in commander_data[commander][category][category]]
    except (KeyError, TypeError):
        pass
    return []

def calculate_category_normalized_overlap(cmd1, cmd2, category, cards1, cards2, card_metadata, card_frequencies):
    """Calculate normalized overlap with uniqueness weighting"""
    # Base color-normalized overlap
    color_normalized = calculate_normalized_overlap(cmd1, cmd2, cards1, cards2, card_metadata)
    
    # Uniqueness weight
    uniqueness_weight = calculate_uniqueness_weight(cards1, cards2, card_frequencies)
    
    # Combine scores (adjustable weights)
    return (color_normalized * 0.7) + (uniqueness_weight * 0.3)

# Load commander data from JSON
print("Loading commander data...")
with open('commander_card_data.json', 'r') as f:
    commander_data = json.load(f)

# Load card metadata
card_metadata = load_card_metadata()

# Calculate card frequencies
print("Calculating card frequencies...")
card_frequencies = calculate_card_frequencies(commander_data)

# Load the commander rankings CSV
print("Loading commander CSV...")
df = pd.read_csv('edhrec_commanders_complete.csv')

# Create nodes list - each node represents a commander
nodes = []
print("Processing nodes...")
for commander, data in commander_data.items():
    if data:  # Skip if data is None
        commander_info = df[df['Commander'] == commander].iloc[0]
        color_identity = get_commander_colors(commander, card_metadata)
        nodes.append({
            "id": commander,
            "deck_count": int(commander_info['Deck_Count'].replace(',', '')),
            "rank": int(commander_info['Rank']),
            "colors": list(color_identity),
            "card_counts": {
                category: len(get_cards_from_category(commander_data, commander, category))
                for category in CARD_CATEGORIES
            }
        })

print(f"Processed {len(nodes)} nodes")

# Create edges with normalized and uniqueness-weighted overlaps
print("Processing edges...")
commanders = [n['id'] for n in nodes]
edge_data = []

# Compare each pair of commanders and process all data
for i in range(len(commanders)):
    #progress status output
    if i % 10 == 0:
        print(f"Processing commander {i+1}/{len(commanders)}...")
    
    for j in range(i + 1, len(commanders)):
        cmd1 = commanders[i]
        cmd2 = commanders[j]
        
        if commander_data[cmd1] and commander_data[cmd2]:
            normalized_overlaps = {}
            raw_overlaps = {}
            uniqueness_scores = {}
            
            # Calculate maximum possible overlap for normalization
            total_cards1 = sum(len(get_cards_from_category(commander_data, cmd1, cat)) 
                             for cat in CARD_CATEGORIES)
            total_cards2 = sum(len(get_cards_from_category(commander_data, cmd2, cat)) 
                             for cat in CARD_CATEGORIES)
            max_possible_overlap = min(total_cards1, total_cards2)
            
            for category in CARD_CATEGORIES:
                cards1 = get_cards_from_category(commander_data, cmd1, category)
                cards2 = get_cards_from_category(commander_data, cmd2, category)
                
                # Calculate various overlap metrics
                raw_overlap = len(set(cards1).intersection(cards2))
                normalized_overlap = calculate_category_normalized_overlap(
                    cmd1, cmd2, category, cards1, cards2, card_metadata, card_frequencies
                )
                uniqueness_score = calculate_uniqueness_weight(cards1, cards2, card_frequencies)
                
                normalized_overlaps[category] = normalized_overlap
                raw_overlaps[category] = raw_overlap
                uniqueness_scores[category] = uniqueness_score
            
            # Calculate composite scores
            total_raw_overlap = sum(raw_overlaps.values())
            normalized_raw_weight = normalize_raw_weight(total_raw_overlap, max_possible_overlap)
            total_normalized_overlap = sum(normalized_overlaps.values()) / len(CARD_CATEGORIES)
            avg_uniqueness = sum(uniqueness_scores.values()) / len(CARD_CATEGORIES)
            
            # Final composite score combining all factors
            composite_score = (
                total_normalized_overlap * 0.6 +  # Color-normalized overlap
                avg_uniqueness * 0.4              # Uniqueness factor
            )
            
            if composite_score > 0:
                edge_data.append({
                    "source": cmd1,
                    "target": cmd2,
                    "raw_weight": round(normalized_raw_weight, 3),  # Now normalized between 0-1
                    "normalized_weight": total_normalized_overlap,
                    "uniqueness_weight": avg_uniqueness,
                    "composite_weight": composite_score,
                    "raw_overlaps": raw_overlaps,
                    "normalized_overlaps": normalized_overlaps,
                    "uniqueness_scores": uniqueness_scores
                })

print(f"\nProcessed {len(edge_data)} edges")

# Before saving the data, round the values:
for edge in edge_data:
    edge['normalized_weight'] = round(edge['normalized_weight'], 3)
    edge['uniqueness_weight'] = round(edge['uniqueness_weight'], 3)
    edge['composite_weight'] = round(edge['composite_weight'], 3)
    # Also round the category-specific overlaps
    for category in edge['normalized_overlaps']:
        edge['normalized_overlaps'][category] = round(edge['normalized_overlaps'][category], 3)


# Save the processed data
print("\nSaving processed data...")
with open('viz_data/nodes.json', 'w') as f:
    json.dump(nodes, f, indent=2)
with open('viz_data/edges.json', 'w') as f:
    json.dump(edge_data, f, indent=2)

print("Done! Data saved to viz_data/nodes.json and viz_data/edges.json")