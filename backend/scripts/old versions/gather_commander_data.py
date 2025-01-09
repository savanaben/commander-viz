from pyedhrec import EDHRec
import pandas as pd
import time
import json

def get_card_data(edhrec, commander):
    """Get all card data for a specific commander"""
    try:
        time.sleep(1)  # Rate limiting
        return {
            "High Synergy Cards": edhrec.get_high_synergy_cards(commander),
            "New Cards": edhrec.get_new_cards(commander),
            "Creatures": edhrec.get_top_creatures(commander),
            "Instants": edhrec.get_top_instants(commander),
            "Sorceries": edhrec.get_top_sorceries(commander),
            "Enchantments": edhrec.get_top_enchantments(commander),
            "Artifacts": edhrec.get_top_artifacts(commander),
            "Mana Artifacts": edhrec.get_top_mana_artifacts(commander),
            "Planeswalkers": edhrec.get_top_planeswalkers(commander),
            "Utility Lands": edhrec.get_top_utility_lands(commander),
            "Lands": edhrec.get_top_lands(commander)
        }
    except Exception as e:
        print(f"Error getting data for {commander}: {e}")
        return None

# Read top 200 commanders
df = pd.read_csv('edhrec_commanders_complete.csv')
top_200 = df.head(200)

# Initialize EDHRec client
edhrec = EDHRec()

# Gather data for all commanders
commander_data = {}
for _, row in top_200.iterrows():
    commander = row['Commander']
    print(f"Getting data for {commander}...")
    commander_data[commander] = get_card_data(edhrec, commander)

# Save to JSON file
with open('commander_card_data.json', 'w') as f:
    json.dump(commander_data, f)