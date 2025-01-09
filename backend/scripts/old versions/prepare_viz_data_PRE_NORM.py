#this version was pre adding in the normilization techniques
#issue was cards were more unique based on color


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

def calculate_card_overlap(cards1, cards2):
    """Calculate overlap between two card lists"""
    set1 = set(cards1)
    set2 = set(cards2)
    return len(set1.intersection(set2))

def get_cards_from_category(commander_data, commander, category):
    """Extract card names from nested category structure
    The JSON structure has categories nested like:
    commander_data[commander][category][category]"""
    try:
        if commander_data[commander] and category in commander_data[commander]:
            return [card["name"] for card in commander_data[commander][category][category]]
    except (KeyError, TypeError):
        pass
    return []

# Load commander data from JSON
print("Loading commander data...")
with open('commander_card_data.json', 'r') as f:
    commander_data = json.load(f)

# Debug output to verify data structure
print("\nDebug: Checking data structure...")
first_commander = list(commander_data.keys())[0]
print(f"First commander: {first_commander}")
print("Sample of card data structure:")
for category in CARD_CATEGORIES:
    cards = get_cards_from_category(commander_data, first_commander, category)
    if cards:
        print(f"\n{category} (first few cards):", cards[:3])

# Load the commander rankings CSV
print("Loading commander CSV...")
df = pd.read_csv('edhrec_commanders_complete.csv')

# Create nodes list - each node represents a commander
nodes = []
print("Processing nodes...")
for commander, data in commander_data.items():
    if data:  # Skip if data is None
        commander_info = df[df['Commander'] == commander].iloc[0]
        nodes.append({
            "id": commander,
            "deck_count": int(commander_info['Deck_Count'].replace(',', '')),
            "rank": int(commander_info['Rank']),
            # Add card type counts as metadata
            "card_counts": {
                category: len(get_cards_from_category(commander_data, commander, category))
                for category in CARD_CATEGORIES
            }
        })

print(f"Processed {len(nodes)} nodes")

# Create edges - each edge represents card overlap between two commanders
print("Processing edges...")
commanders = [n['id'] for n in nodes]  # Use only commanders we have nodes for
edge_data = []

# Compare each pair of commanders
for i in range(len(commanders)):
    if i % 10 == 0:  # Progress indicator
        print(f"Processing commander {i+1}/{len(commanders)}...")
    
    for j in range(i + 1, len(commanders)):
        cmd1 = commanders[i]
        cmd2 = commanders[j]
        
        if commander_data[cmd1] and commander_data[cmd2]:  # Skip if either commander has no data
            # Calculate overlap for each card type
            overlaps = {}
            total_overlap = 0
            
            for category in CARD_CATEGORIES:
                cards1 = get_cards_from_category(commander_data, cmd1, category)
                cards2 = get_cards_from_category(commander_data, cmd2, category)
                
                overlap = calculate_card_overlap(cards1, cards2)
                overlaps[category] = overlap
                total_overlap += overlap
            
            if total_overlap > 0:
                edge_data.append({
                    "source": cmd1,
                    "target": cmd2,
                    "weight": total_overlap,
                    "overlaps": overlaps
                })

print(f"\nProcessed {len(edge_data)} edges")

# Save the processed data
print("\nSaving processed data...")
with open('viz_data/nodes.json', 'w') as f:
    json.dump(nodes, f, indent=2)
with open('viz_data/edges.json', 'w') as f:
    json.dump(edge_data, f, indent=2)

print("Done! Data saved to viz_data/nodes.json and viz_data/edges.json")