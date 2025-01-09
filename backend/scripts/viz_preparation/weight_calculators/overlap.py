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