from .utils import CARD_CATEGORIES, DEBUG_PAIRS, get_cards_from_category, print_processing_progress
from .weight_calculators.overlap import calculate_normalized_overlap, normalize_raw_weight
from .weight_calculators.uniqueness import calculate_uniqueness_weight
from .weight_calculators.tribes import calculate_tribes_weight, calculate_tribes_simplified_weight

def process_nodes(commander_data):
    nodes = []
    print("Processing nodes...")
    for commander, data in commander_data.items():
        if data:  # Skip empty entries
            node = {
                "id": commander,
                "deck_count": data['deck_count'],  # Added
                "rank": data['rank'],             # Added
                "colors": data['color_identity'],  # Renamed from color_identity
                "card_counts": {                   # Added
                    category: len(get_cards_from_category(commander_data, commander, category))
                    for category in CARD_CATEGORIES
                }
            }
            nodes.append(node)
    
    print(f"Processed {len(nodes)} nodes")
    return nodes

def process_edges(commander_data, nodes, card_metadata, card_frequencies, normalized_tribes, debug=False):
    """
    Process relationships between commanders into edges for visualization.
    Calculates various weight metrics for each relationship.
    """
    print("Processing edges...")

    # Debug: Print some example card frequencies
    print("\nExample Card Frequencies:")
    example_cards = ["Sol Ring", "Chatterstorm", "Arcane Signet"]
    for card in example_cards:
        freq = card_frequencies.get(card, 0)
        print(f"{card}: Used in {freq*100:.1f}% of all commanders")


    commanders = [n['id'] for n in nodes]
    edge_data = []
    
    # Compare each pair of commanders
    for i in range(len(commanders)):
        print_processing_progress(i, len(commanders))
        
        for j in range(i + 1, len(commanders)):
            cmd1 = commanders[i]
            cmd2 = commanders[j]
            
            # Debug specific commander pairs
            if (cmd1, cmd2) in DEBUG_PAIRS or (cmd2, cmd1) in DEBUG_PAIRS:
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
                
                # Simplified tribes weight calculation
                tribes_simplified_weight = calculate_tribes_simplified_weight(
                    cmd1, 
                    cmd2, 
                    normalized_tribes,
                    top_n=3,          # Configurable: number of top tribes to consider
                    position_decay=0.85,  # Configurable: how quickly position importance decays
                    debug=(cmd1, cmd2) in DEBUG_PAIRS  # Debug for specific pairs
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
    return edge_data