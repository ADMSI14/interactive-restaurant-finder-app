"""
0-1 Knapsack Problem - Backtracking Algorithms

This module implements two backtracking algorithms for the 0-1 knapsack problem:
(a) Generate all possible subsets and their total profits (ignoring weight limit)
(b) Find maximum profit subset with total weight <= W
"""


def knapsack_all_subsets(w, b):
    """
    (a) Backtracking algorithm to output total profits for all possible subsets,
    ignoring knapsack limit W.
    
    This function generates all 2^n possible subsets and calculates their total profit.
    
    Args:
        w: List of weights [w[0], w[1], ..., w[n-1]]
        b: List of profits [b[0], b[1], ..., b[n-1]]
    
    Returns:
        List of tuples (total_profit, subset_mask) where subset_mask is a binary string
        representing which items are included (e.g., "101" means items 0 and 2 are included)
    """
    n = len(w)
    results = []
    
    def backtrack(index, current_profit, subset_mask):
        """
        Recursive backtracking function to explore all subsets.
        
        Args:
            index: Current item index being considered
            current_profit: Total profit of current subset
            subset_mask: Binary string representing current subset selection
        """
        # Base case: processed all items
        if index == n:
            results.append((current_profit, subset_mask))
            return
        
        # Option 1: Don't include current item
        backtrack(index + 1, current_profit, subset_mask + "0")
        
        # Option 2: Include current item
        backtrack(index + 1, current_profit + b[index], subset_mask + "1")
    
    # Start backtracking from index 0
    backtrack(0, 0, "")
    return results


def knapsack_max_profit(w, b, W):
    """
    (b) Backtracking algorithm to find the subset with maximum total profit
    such that total weight <= W.
    
    This function uses backtracking with pruning to find the optimal solution.
    
    Args:
        w: List of weights [w[0], w[1], ..., w[n-1]]
        b: List of profits [b[0], b[1], ..., b[n-1]]
        W: Maximum weight capacity of knapsack
    
    Returns:
        Tuple (max_profit, best_subset) where:
        - max_profit: Maximum total profit achievable
        - best_subset: Binary string representing the optimal subset
    """
    n = len(w)
    max_profit = [0]  # Use list to allow modification in nested function
    best_subset = [None]  # Store the best subset found so far
    
    def backtrack(index, current_weight, current_profit, subset_mask):
        """
        Recursive backtracking function with pruning.
        
        Args:
            index: Current item index being considered
            current_weight: Total weight of current subset
            current_profit: Total profit of current subset
            subset_mask: Binary string representing current subset selection
        """
        # Base case: processed all items
        if index == n:
            if current_profit > max_profit[0]:
                max_profit[0] = current_profit
                best_subset[0] = subset_mask
            return
        
        # Option 1: Don't include current item
        backtrack(index + 1, current_weight, current_profit, subset_mask + "0")
        
        # Option 2: Include current item (only if weight constraint allows)
        if current_weight + w[index] <= W:
            backtrack(
                index + 1,
                current_weight + w[index],
                current_profit + b[index],
                subset_mask + "1"
            )
    
    # Start backtracking from index 0
    backtrack(0, 0, 0, "")
    return max_profit[0], best_subset[0] if best_subset[0] is not None else "0" * n


def knapsack_max_profit_optimized(w, b, W):
    """
    (b) Optimized backtracking algorithm with additional pruning using
    upper bound (greedy) to skip branches that cannot yield better solutions.
    
    This is an enhanced version that uses a greedy upper bound to prune
    more branches, potentially improving performance in practice.
    
    Args:
        w: List of weights [w[0], w[1], ..., w[n-1]]
        b: List of profits [b[0], b[1], ..., b[n-1]]
        W: Maximum weight capacity of knapsack
    
    Returns:
        Tuple (max_profit, best_subset) where:
        - max_profit: Maximum total profit achievable
        - best_subset: Binary string representing the optimal subset
    """
    n = len(w)
    max_profit = [0]
    best_subset = [None]
    
    def calculate_upper_bound(index, current_weight, current_profit, remaining_capacity):
        """
        Calculate upper bound using greedy approach (fractional knapsack).
        This provides an optimistic estimate of the maximum profit achievable
        from the current state.
        """
        if remaining_capacity <= 0:
            return current_profit
        
        bound = current_profit
        
        # Greedily add items that can fit completely
        i = index
        while i < n and w[i] <= remaining_capacity:
            bound += b[i]
            remaining_capacity -= w[i]
            i += 1
        
        # Add fraction of next item if there's remaining capacity
        if i < n and remaining_capacity > 0:
            bound += (b[i] * remaining_capacity) / w[i]
        
        return bound
    
    def backtrack(index, current_weight, current_profit, subset_mask):
        """
        Recursive backtracking with pruning using upper bound.
        """
        # Base case: processed all items
        if index == n:
            if current_profit > max_profit[0]:
                max_profit[0] = current_profit
                best_subset[0] = subset_mask
            return
        
        # Pruning: Check if upper bound can exceed current best
        remaining_capacity = W - current_weight
        upper_bound = calculate_upper_bound(index, current_weight, current_profit, remaining_capacity)
        
        if upper_bound <= max_profit[0]:
            return  # Prune this branch - cannot yield better solution
        
        # Option 1: Don't include current item
        backtrack(index + 1, current_weight, current_profit, subset_mask + "0")
        
        # Option 2: Include current item (only if weight constraint allows)
        if current_weight + w[index] <= W:
            backtrack(
                index + 1,
                current_weight + w[index],
                current_profit + b[index],
                subset_mask + "1"
            )
    
    # Start backtracking from index 0
    backtrack(0, 0, 0, "")
    return max_profit[0], best_subset[0] if best_subset[0] is not None else "0" * n


def print_subset_details(subset_mask, w, b):
    """
    Helper function to print details of a subset.
    
    Args:
        subset_mask: Binary string representing the subset
        w: List of weights
        b: List of profits
    """
    selected_items = []
    total_weight = 0
    total_profit = 0
    
    for i in range(len(subset_mask)):
        if subset_mask[i] == '1':
            selected_items.append(i)
            total_weight += w[i]
            total_profit += b[i]
    
    print(f"  Subset: {subset_mask}")
    print(f"  Selected items: {selected_items}")
    print(f"  Total weight: {total_weight}")
    print(f"  Total profit: {total_profit}")
    print()


if __name__ == "__main__":
    # Example usage
    print("=" * 60)
    print("0-1 KNAPSACK PROBLEM - BACKTRACKING ALGORITHMS")
    print("=" * 60)
    
    # Example data
    weights = [10, 20, 30]
    profits = [60, 100, 120]
    capacity = 50
    
    print(f"\nItems:")
    for i in range(len(weights)):
        print(f"  Item {i}: weight = {weights[i]}, profit = {profits[i]}")
    print(f"\nKnapsack capacity: {capacity}")
    
    # Part (a): All subsets
    print("\n" + "-" * 60)
    print("(a) ALL POSSIBLE SUBSETS (ignoring weight limit)")
    print("-" * 60)
    all_subsets = knapsack_all_subsets(weights, profits)
    
    print(f"\nTotal number of subsets: {len(all_subsets)}")
    print(f"\nAll subsets with their profits:\n")
    
    for profit, subset_mask in sorted(all_subsets, key=lambda x: x[0], reverse=True):
        print_subset_details(subset_mask, weights, profits)
    
    # Part (b): Maximum profit with weight constraint
    print("\n" + "-" * 60)
    print("(b) MAXIMUM PROFIT WITH WEIGHT CONSTRAINT")
    print("-" * 60)
    
    max_profit, best_subset = knapsack_max_profit(weights, profits, capacity)
    
    print(f"\nMaximum profit: {max_profit}")
    print(f"\nOptimal subset:")
    print_subset_details(best_subset, weights, profits)
    
    # Time complexity analysis
    print("\n" + "=" * 60)
    print("TIME COMPLEXITY ANALYSIS")
    print("=" * 60)
    print("\n(a) All Subsets Algorithm:")
    print("  - Time Complexity: O(2^n * n)")
    print("    * There are 2^n possible subsets to generate")
    print("    * For each subset, we need O(n) time to build the subset mask")
    print("    * Space Complexity: O(2^n) to store all results")
    print("    * Recursion depth: O(n)")
    print("\n(b) Maximum Profit Algorithm (Basic):")
    print("  - Time Complexity: O(2^n)")
    print("    * In worst case, we explore all 2^n possible subsets")
    print("    * Weight constraint pruning reduces branches, but worst case")
    print("      still explores exponential number of nodes")
    print("  - Space Complexity: O(n) for recursion stack")
    print("\n(b) Maximum Profit Algorithm (Optimized with Upper Bound):")
    print("  - Time Complexity: O(2^n) in worst case, but much better")
    print("    in practice due to additional pruning")
    print("  - Upper bound pruning helps skip branches that cannot")
    print("    yield better solutions, improving average case performance")

