import json
import os

# Get the path to the scripts directory (parent of viz_preparation)
SCRIPTS_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def load_commander_data(filepath='extracted_commander_data.json'):
    """Load commander data from JSON file."""
    print("Loading commander data...")
    full_path = os.path.join(SCRIPTS_DIR, filepath)
    with open(full_path, 'r') as f:
        return json.load(f)

def load_card_metadata():
    """
    Load color identity and additional metadata from Scryfall data.
    Now includes: color identity, rarity, release date, image URIs, 
    EDHREC data, and type line.
    """
    card_metadata = {}
    print("Loading card metadata...")
    metadata_path = os.path.join(SCRIPTS_DIR, 'default-cards-20241223222017.json')
    
    with open(metadata_path, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                card = json.loads(line.strip().rstrip(','))
                card_metadata[card['name']] = {
                    'color_identity': card['color_identity'],
                    'rarity': card.get('rarity', 'common'),
                    'released_at': card.get('released_at'),
                    'image_uris': {
                        'small': card.get('image_uris', {}).get('small'),
                        'normal': card.get('image_uris', {}).get('normal')
                    },
                    'edhrec_rank': card.get('edhrec_rank'),
                    'type_line': card.get('type_line')
                }
            except json.JSONDecodeError:
                continue
    return card_metadata

def save_results(nodes, edges, output_dir='viz_data'):
    """Save processed nodes and edges to JSON files."""
    # Create viz_data directory in the scripts folder
    output_path = os.path.join(SCRIPTS_DIR, output_dir)
    os.makedirs(output_path, exist_ok=True)
    
    print("\nSaving processed data...")
    with open(os.path.join(output_path, 'nodes.json'), 'w') as f:
        json.dump(nodes, f, indent=2)
    with open(os.path.join(output_path, 'edges.json'), 'w') as f:
        json.dump(edges, f, indent=2)
      # json.dump(edges, f, separators=(',', ':'))  # Remove whitespace

    print("Done! Data saved to viz_data/nodes.json and viz_data/edges.json")