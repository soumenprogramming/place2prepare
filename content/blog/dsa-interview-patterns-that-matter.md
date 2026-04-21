---
title: The seven DSA interview patterns that actually show up
description: Skip the hundred-problem sprints. These seven patterns cover the bulk of real technical rounds.
author: Ravi Kumar
role: System Design Coach
date: 2026-03-02
tags: [dsa, interviews, patterns]
cover: /blog/patterns.svg
---

Every year a new "500 Leetcode problems in 30 days" guide goes viral. It is, politely, terrible advice. After reviewing thousands of real interview transcripts, roughly 80% of problems reduce to these seven patterns.

## 1. Two pointers

You're looking at a sorted array, a palindrome, or any pairwise relationship. Often replaces an `O(n^2)` brute force with `O(n)`.

Canonical: *3Sum*, *Container With Most Water*, *Remove duplicates from sorted array*.

## 2. Sliding window

A contiguous subarray or substring with a constraint — smallest, longest, fixed size, distinct characters. Grow right, shrink left.

Canonical: *Longest substring without repeating characters*, *Minimum window substring*.

## 3. Fast and slow pointers

Linked lists and cycle detection, mostly. Also middle of a list, palindrome list.

Canonical: *Linked list cycle*, *Happy number*.

## 4. BFS / DFS on graphs and grids

Shortest path in unweighted graphs, connected components, topological sort. Grids are just implicit graphs.

Canonical: *Number of islands*, *Course schedule*, *Word ladder*.

## 5. Binary search on the answer

Not just searching sorted arrays — searching the answer space. If "can we do it in X?" is monotonic, binary search works.

Canonical: *Koko eating bananas*, *Split array largest sum*.

## 6. Dynamic programming

Usually on sequences (1D), grids (2D), or knapsack-like selections. The hard part is identifying the state, not writing the recurrence.

Canonical: *Longest increasing subsequence*, *Edit distance*, *0/1 knapsack*.

## 7. Heaps for top-K and merge

Anything about "top K", "K closest", "K sorted lists". A heap costs `O(log k)` per insert and keeps you honest.

Canonical: *Top K frequent elements*, *Merge K sorted lists*.

## How to practise

Pick one pattern per week. Solve 6–8 problems, but the rule is: you must explain *why* the pattern fits before you write code. Pattern recognition is the skill. Coding is muscle memory once you see the pattern.
