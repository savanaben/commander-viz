from ..utils import CARD_CATEGORIES, get_cards_from_category


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
        print(f"Shared cards: {len(shared_cards)}")
        for card in shared_cards:
            freq = card_frequencies.get(card, 0)
            print(f"  {card}: Used in {freq*100:.1f}% of commanders")
    
    # Average uniqueness of shared cards
    uniqueness_scores = [1 - card_frequencies.get(card, 0) for card in shared_cards]
    avg_uniqueness = sum(uniqueness_scores) / len(uniqueness_scores)
    
    if debug:
        print(f"Average uniqueness score: {avg_uniqueness:.3f}")
    
    return avg_uniqueness