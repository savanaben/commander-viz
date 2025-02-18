import os
from .data_loaders import load_commander_data, load_card_metadata, save_results
from .data_processors import process_nodes, process_edges
from .weight_calculators.uniqueness import calculate_card_frequencies
from .weight_calculators.tribes import normalize_tribe_counts
from .utils import print_example_frequencies, print_tribe_distribution

def main():
    """Main execution function for preparing visualization data"""
    
    # Create viz_data directory if it doesn't exist
    viz_data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'viz_data')
    os.makedirs(viz_data_path, exist_ok=True)

    # Load data sources
    commander_data = load_commander_data()
    card_metadata = load_card_metadata()







    # Process nodes first
    nodes = process_nodes(commander_data, card_metadata)





    # Calculate global card frequencies
    print("Calculating global card frequencies...")
    card_frequencies = calculate_card_frequencies(commander_data)
    print_example_frequencies(card_frequencies)

    # Calculate normalized tribe weights
    print("Calculating normalized tribe weights...")
    normalized_tribes = normalize_tribe_counts(commander_data, debug=True)  # Set debug=True to see distributions

    # Process edges with all weight calculations
    edges = process_edges(
        commander_data=commander_data,
        nodes=nodes,
        card_metadata=card_metadata,
        card_frequencies=card_frequencies,
        normalized_tribes=normalized_tribes,
        debug=True
    )

    # Print tribe weight distribution for debugging
    tribe_weights = [edge['tribes_weight'] for edge in edges if edge['tribes_weight'] > 0]
    print_tribe_distribution(tribe_weights)

    # Save processed data
    save_results(nodes, edges)

if __name__ == "__main__":
    main()