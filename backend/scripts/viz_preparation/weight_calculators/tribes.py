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