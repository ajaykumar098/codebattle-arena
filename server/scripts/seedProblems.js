require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('../src/models/Problem');

const problems = [
  {
    title: 'Two Sum',
    slug: 'two-sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    functionName: 'twoSum',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] == 9' }
    ],
    testCases: [
      { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isHidden: false },
      { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isHidden: false },
      { input: '[3,3]\n6', expectedOutput: '[0,1]', isHidden: true }
    ],
    starterCode: 'def twoSum(nums, target):\n    # Write your code here\n    pass',
    paramTypes: ['List[int]', 'int'],
    returnType: 'List[int]'
  },
  {
    title: 'Reverse String',
    slug: 'reverse-string',
    description: 'Write a function that reverses a string. The input string is given as an array of characters s.',
    difficulty: 'Easy',
    tags: ['String', 'Two Pointers'],
    functionName: 'reverseString',
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' }
    ],
    testCases: [
      { input: '["h","e","l","l","o"]', expectedOutput: '["o","l","l","e","h"]', isHidden: false },
      { input: '["H","a","n","n","a","h"]', expectedOutput: '["h","a","n","n","a","H"]', isHidden: true }
    ],
    starterCode: 'def reverseString(s):\n    # Write your code here\n    pass',
    paramTypes: ['List[str]'],
    returnType: 'List[str]'
  },
  {
    title: 'Valid Palindrome',
    slug: 'valid-palindrome',
    description: 'Given a string s, determine if it is a palindrome, considering only alphanumeric characters and ignoring cases.',
    difficulty: 'Easy',
    tags: ['String', 'Two Pointers'],
    functionName: 'isPalindrome',
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true' }
    ],
    testCases: [
      { input: '"A man, a plan, a canal: Panama"', expectedOutput: 'true', isHidden: false },
      { input: '"race a car"', expectedOutput: 'false', isHidden: false },
      { input: '" "', expectedOutput: 'true', isHidden: true }
    ],
    starterCode: 'def isPalindrome(s):\n    # Write your code here\n    pass',
    paramTypes: ['str'],
    returnType: 'bool'
  },
  {
    title: 'FizzBuzz',
    slug: 'fizzbuzz',
    description: 'Given an integer n, return a string array answer where answer[i] == "FizzBuzz" if i is divisible by 3 and 5, "Fizz" if divisible by 3, "Buzz" if divisible by 5, or str(i) otherwise.',
    difficulty: 'Easy',
    tags: ['Math', 'String'],
    functionName: 'fizzBuzz',
    examples: [
      { input: 'n = 5', output: '["1","2","Fizz","4","Buzz"]' }
    ],
    testCases: [
      { input: '5', expectedOutput: '["1","2","Fizz","4","Buzz"]', isHidden: false },
      { input: '15', expectedOutput: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]', isHidden: true }
    ],
    starterCode: 'def fizzBuzz(n):\n    # Write your code here\n    pass',
    paramTypes: ['int'],
    returnType: 'List[str]'
  },
  {
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    description: 'Given a string s containing just the characters (){}[], determine if the input string is valid (every open bracket closed by the same type, in the correct order).',
    difficulty: 'Easy',
    tags: ['String', 'Stack'],
    functionName: 'isValid',
    examples: [
      { input: 's = "()[]{}"', output: 'true' }
    ],
    testCases: [
      { input: '"()"', expectedOutput: 'true', isHidden: false },
      { input: '"(]"', expectedOutput: 'false', isHidden: false },
      { input: '"{[]}"', expectedOutput: 'true', isHidden: true }
    ],
    starterCode: 'def isValid(s):\n    # Write your code here\n    pass',
    paramTypes: ['str'],
    returnType: 'bool'
  },
  {
    title: 'Merge Two Sorted Arrays',
    slug: 'merge-two-sorted-arrays',
    description: 'Given two sorted integer arrays, merge them into one sorted array and return it.',
    difficulty: 'Easy',
    tags: ['Array', 'Two Pointers'],
    functionName: 'mergeArrays',
    examples: [
      { input: 'a = [1,3,5], b = [2,4,6]', output: '[1,2,3,4,5,6]' }
    ],
    testCases: [
      { input: '[1,3,5]\n[2,4,6]', expectedOutput: '[1,2,3,4,5,6]', isHidden: false },
      { input: '[]\n[1]', expectedOutput: '[1]', isHidden: true }
    ],
    starterCode: 'def mergeArrays(a, b):\n    # Write your code here\n    pass',
    paramTypes: ['List[int]', 'List[int]'],
    returnType: 'List[int]'
  },
  {
    title: 'Maximum Subarray',
    slug: 'maximum-subarray',
    description: 'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum, and return its sum.',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming'],
    functionName: 'maxSubArray',
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6' }
    ],
    testCases: [
      { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6', isHidden: false },
      { input: '[1]', expectedOutput: '1', isHidden: false },
      { input: '[5,4,-1,7,8]', expectedOutput: '23', isHidden: true }
    ],
    starterCode: 'def maxSubArray(nums):\n    # Write your code here\n    pass',
    paramTypes: ['List[int]'],
    returnType: 'int'
  },
  {
    title: 'Climbing Stairs',
    slug: 'climbing-stairs',
    description: 'You are climbing a staircase with n steps. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    difficulty: 'Easy',
    tags: ['Dynamic Programming'],
    functionName: 'climbStairs',
    examples: [
      { input: 'n = 3', output: '3' }
    ],
    testCases: [
      { input: '2', expectedOutput: '2', isHidden: false },
      { input: '3', expectedOutput: '3', isHidden: false },
      { input: '5', expectedOutput: '8', isHidden: true }
    ],
    starterCode: 'def climbStairs(n):\n    # Write your code here\n    pass',
    paramTypes: ['int'],
    returnType: 'int'
  },
  {
    title: 'Best Time to Buy and Sell Stock',
    slug: 'best-time-buy-sell-stock',
    description: 'You are given an array prices where prices[i] is the price of a stock on day i. Maximize profit by choosing a single day to buy and a different day in the future to sell.',
    difficulty: 'Easy',
    tags: ['Array', 'Dynamic Programming'],
    functionName: 'maxProfit',
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5' }
    ],
    testCases: [
      { input: '[7,1,5,3,6,4]', expectedOutput: '5', isHidden: false },
      { input: '[7,6,4,3,1]', expectedOutput: '0', isHidden: true }
    ],
    starterCode: 'def maxProfit(prices):\n    # Write your code here\n    pass',
    paramTypes: ['List[int]'],
    returnType: 'int'
  },
  {
    title: 'Contains Duplicate',
    slug: 'contains-duplicate',
    description: 'Given an integer array nums, return true if any value appears at least twice in the array, and false if every element is distinct.',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    functionName: 'containsDuplicate',
    examples: [
      { input: 'nums = [1,2,3,1]', output: 'true' }
    ],
    testCases: [
      { input: '[1,2,3,1]', expectedOutput: 'true', isHidden: false },
      { input: '[1,2,3,4]', expectedOutput: 'false', isHidden: true }
    ],
    starterCode: 'def containsDuplicate(nums):\n    # Write your code here\n    pass',
    paramTypes: ['List[int]'],
    returnType: 'bool'
  },
  {
    title: 'Single Number',
    slug: 'single-number',
    description: 'Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.',
    difficulty: 'Easy',
    tags: ['Array', 'Bit Manipulation'],
    functionName: 'singleNumber',
    examples: [
      { input: 'nums = [4,1,2,1,2]', output: '4' }
    ],
    testCases: [
      { input: '[2,2,1]', expectedOutput: '1', isHidden: false },
      { input: '[4,1,2,1,2]', expectedOutput: '4', isHidden: true }
    ],
    starterCode: 'def singleNumber(nums):\n    # Write your code here\n    pass',
    paramTypes: ['List[int]'],
    returnType: 'int'
  },
  {
    title: 'Move Zeroes',
    slug: 'move-zeroes',
    description: 'Given an integer array nums, move all 0s to the end while maintaining the relative order of the non-zero elements. Return the resulting array.',
    difficulty: 'Easy',
    tags: ['Array', 'Two Pointers'],
    functionName: 'moveZeroes',
    examples: [
      { input: 'nums = [0,1,0,3,12]', output: '[1,3,12,0,0]' }
    ],
    testCases: [
      { input: '[0,1,0,3,12]', expectedOutput: '[1,3,12,0,0]', isHidden: false },
      { input: '[0]', expectedOutput: '[0]', isHidden: true }
    ],
    starterCode: 'def moveZeroes(nums):\n    # Write your code here\n    pass',
    paramTypes: ['List[int]'],
    returnType: 'List[int]'
  },
  {
    title: 'Missing Number',
    slug: 'missing-number',
    description: 'Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing.',
    difficulty: 'Easy',
    tags: ['Array', 'Math'],
    functionName: 'missingNumber',
    examples: [
      { input: 'nums = [3,0,1]', output: '2' }
    ],
    testCases: [
      { input: '[3,0,1]', expectedOutput: '2', isHidden: false },
      { input: '[0,1]', expectedOutput: '2', isHidden: true }
    ],
    starterCode: 'def missingNumber(nums):\n    # Write your code here\n    pass',
    paramTypes: ['List[int]'],
    returnType: 'int'
  },
  {
    title: 'Valid Anagram',
    slug: 'valid-anagram',
    description: 'Given two strings s and t, return true if t is an anagram of s, and false otherwise.',
    difficulty: 'Easy',
    tags: ['String', 'Hash Table'],
    functionName: 'isAnagram',
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: 'true' }
    ],
    testCases: [
      { input: '"anagram"\n"nagaram"', expectedOutput: 'true', isHidden: false },
      { input: '"rat"\n"car"', expectedOutput: 'false', isHidden: true }
    ],
    starterCode: 'def isAnagram(s, t):\n    # Write your code here\n    pass',
    paramTypes: ['str', 'str'],
    returnType: 'bool'
  },
  {
    title: 'First Unique Character in a String',
    slug: 'first-unique-character',
    description: 'Given a string s, find the first non-repeating character in it and return its index. If it does not exist, return -1.',
    difficulty: 'Easy',
    tags: ['String', 'Hash Table'],
    functionName: 'firstUniqChar',
    examples: [
      { input: 's = "leetcode"', output: '0' }
    ],
    testCases: [
      { input: '"leetcode"', expectedOutput: '0', isHidden: false },
      { input: '"aabb"', expectedOutput: '-1', isHidden: true }
    ],
    starterCode: 'def firstUniqChar(s):\n    # Write your code here\n    pass',
    paramTypes: ['str'],
    returnType: 'int'
  },
  {
    title: 'Longest Common Prefix',
    slug: 'longest-common-prefix',
    description: 'Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string.',
    difficulty: 'Easy',
    tags: ['String'],
    functionName: 'longestCommonPrefix',
    examples: [
      { input: 'strs = ["flower","flow","flight"]', output: '"fl"' }
    ],
    testCases: [
      { input: '["flower","flow","flight"]', expectedOutput: '"fl"', isHidden: false },
      { input: '["dog","racecar","car"]', expectedOutput: '""', isHidden: true }
    ],
    starterCode: 'def longestCommonPrefix(strs):\n    # Write your code here\n    pass',
    paramTypes: ['List[str]'],
    returnType: 'str'
  },
  {
    title: 'Roman to Integer',
    slug: 'roman-to-integer',
    description: 'Given a roman numeral, convert it to an integer.',
    difficulty: 'Easy',
    tags: ['String', 'Math'],
    functionName: 'romanToInt',
    examples: [
      { input: 's = "III"', output: '3' }
    ],
    testCases: [
      { input: '"III"', expectedOutput: '3', isHidden: false },
      { input: '"LVIII"', expectedOutput: '58', isHidden: false },
      { input: '"MCMXCIV"', expectedOutput: '1994', isHidden: true }
    ],
    starterCode: 'def romanToInt(s):\n    # Write your code here\n    pass',
    paramTypes: ['str'],
    returnType: 'int'
  },
  {
    title: 'Plus One',
    slug: 'plus-one',
    description: 'You are given a large integer represented as an array of digits. Increment the large integer by one and return the resulting array of digits.',
    difficulty: 'Easy',
    tags: ['Array', 'Math'],
    functionName: 'plusOne',
    examples: [
      { input: 'digits = [1,2,3]', output: '[1,2,4]' }
    ],
    testCases: [
      { input: '[1,2,3]', expectedOutput: '[1,2,4]', isHidden: false },
      { input: '[9,9]', expectedOutput: '[1,0,0]', isHidden: true }
    ],
    starterCode: 'def plusOne(digits):\n    # Write your code here\n    pass',
    paramTypes: ['List[int]'],
    returnType: 'List[int]'
  },
  {
    title: 'Sqrt(x)',
    slug: 'sqrtx',
    description: 'Given a non-negative integer x, return the square root of x rounded down to the nearest integer.',
    difficulty: 'Easy',
    tags: ['Math', 'Binary Search'],
    functionName: 'mySqrt',
    examples: [
      { input: 'x = 8', output: '2' }
    ],
    testCases: [
      { input: '4', expectedOutput: '2', isHidden: false },
      { input: '8', expectedOutput: '2', isHidden: true }
    ],
    starterCode: 'def mySqrt(x):\n    # Write your code here\n    pass',
    paramTypes: ['int'],
    returnType: 'int'
  },
  {
    title: 'Search Insert Position',
    slug: 'search-insert-position',
    description: 'Given a sorted array of distinct integers and a target value, return the index if the target is found, or the index where it would be inserted in order.',
    difficulty: 'Easy',
    tags: ['Array', 'Binary Search'],
    functionName: 'searchInsert',
    examples: [
      { input: 'nums = [1,3,5,6], target = 5', output: '2' }
    ],
    testCases: [
      { input: '[1,3,5,6]\n5', expectedOutput: '2', isHidden: false },
      { input: '[1,3,5,6]\n2', expectedOutput: '1', isHidden: true }
    ],
    starterCode: 'def searchInsert(nums, target):\n    # Write your code here\n    pass',
    paramTypes: ['List[int]', 'int'],
    returnType: 'int'
  },
  {
    title: 'Majority Element',
    slug: 'majority-element',
    description: 'Given an array nums of size n, return the majority element (the element that appears more than n/2 times).',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    functionName: 'majorityElement',
    examples: [
      { input: 'nums = [2,2,1,1,1,2,2]', output: '2' }
    ],
    testCases: [
      { input: '[3,2,3]', expectedOutput: '3', isHidden: false },
      { input: '[2,2,1,1,1,2,2]', expectedOutput: '2', isHidden: true }
    ],
    starterCode: 'def majorityElement(nums):\n    # Write your code here\n    pass',
    paramTypes: ['List[int]'],
    returnType: 'int'
  },
  {
    title: 'Power of Two',
    slug: 'power-of-two',
    description: 'Given an integer n, return true if it is a power of two. Otherwise, return false.',
    difficulty: 'Easy',
    tags: ['Math', 'Bit Manipulation'],
    functionName: 'isPowerOfTwo',
    examples: [
      { input: 'n = 16', output: 'true' }
    ],
    testCases: [
      { input: '1', expectedOutput: 'true', isHidden: false },
      { input: '16', expectedOutput: 'true', isHidden: false },
      { input: '3', expectedOutput: 'false', isHidden: true }
    ],
    starterCode: 'def isPowerOfTwo(n):\n    # Write your code here\n    pass',
    paramTypes: ['int'],
    returnType: 'bool'
  },
  {
    title: 'Reverse Integer',
    slug: 'reverse-integer',
    description: 'Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range, return 0.',
    difficulty: 'Medium',
    tags: ['Math'],
    functionName: 'reverseInt',
    examples: [
      { input: 'x = 123', output: '321' }
    ],
    testCases: [
      { input: '123', expectedOutput: '321', isHidden: false },
      { input: '-123', expectedOutput: '-321', isHidden: false },
      { input: '120', expectedOutput: '21', isHidden: true }
    ],
    starterCode: 'def reverseInt(x):\n    # Write your code here\n    pass',
    paramTypes: ['int'],
    returnType: 'int'
  },
  {
    title: 'Palindrome Number',
    slug: 'palindrome-number',
    description: 'Given an integer x, return true if x is a palindrome integer, and false otherwise, without converting it to a string.',
    difficulty: 'Easy',
    tags: ['Math'],
    functionName: 'isPalindromeNumber',
    examples: [
      { input: 'x = 121', output: 'true' }
    ],
    testCases: [
      { input: '121', expectedOutput: 'true', isHidden: false },
      { input: '-121', expectedOutput: 'false', isHidden: true }
    ],
    starterCode: 'def isPalindromeNumber(x):\n    # Write your code here\n    pass',
    paramTypes: ['int'],
    returnType: 'bool'
  },
  {
    title: 'Container With Most Water',
    slug: 'container-with-most-water',
    description: 'Given n non-negative integers representing heights of vertical lines, find two lines that together with the x-axis form a container that holds the most water.',
    difficulty: 'Medium',
    tags: ['Array', 'Two Pointers'],
    functionName: 'maxArea',
    examples: [
      { input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49' }
    ],
    testCases: [
      { input: '[1,8,6,2,5,4,8,3,7]', expectedOutput: '49', isHidden: false },
      { input: '[1,1]', expectedOutput: '1', isHidden: true }
    ],
    starterCode: 'def maxArea(height):\n    # Write your code here\n    pass',
    paramTypes: ['List[int]'],
    returnType: 'int'
  },
  {
    title: 'Group Anagrams',
    slug: 'group-anagrams',
    description: 'Given an array of strings strs, group the anagrams together. You can return the answer in any order.',
    difficulty: 'Medium',
    tags: ['String', 'Hash Table'],
    functionName: 'groupAnagrams',
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' }
    ],
    testCases: [
      { input: '["eat","tea","tan","ate","nat","bat"]', expectedOutput: '[["bat"],["nat","tan"],["ate","eat","tea"]]', isHidden: false },
      { input: '[""]', expectedOutput: '[[""]]', isHidden: true }
    ],
    starterCode: 'def groupAnagrams(strs):\n    # Write your code here\n    pass',
    paramTypes: ['List[str]'],
    returnType: 'List[List[str]]'
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    difficulty: 'Medium',
    tags: ['String', 'Sliding Window'],
    functionName: 'lengthOfLongestSubstring',
    examples: [
      { input: 's = "abcabcbb"', output: '3' }
    ],
    testCases: [
      { input: '"abcabcbb"', expectedOutput: '3', isHidden: false },
      { input: '"bbbbb"', expectedOutput: '1', isHidden: false },
      { input: '"pwwkew"', expectedOutput: '3', isHidden: true }
    ],
    starterCode: 'def lengthOfLongestSubstring(s):\n    # Write your code here\n    pass',
    paramTypes: ['str'],
    returnType: 'int'
  },
  {
    title: '3Sum',
    slug: '3sum',
    description: 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.',
    difficulty: 'Medium',
    tags: ['Array', 'Two Pointers'],
    functionName: 'threeSum',
    examples: [
      { input: 'nums = [-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]' }
    ],
    testCases: [
      { input: '[-1,0,1,2,-1,-4]', expectedOutput: '[[-1,-1,2],[-1,0,1]]', isHidden: false },
      { input: '[0,1,1]', expectedOutput: '[]', isHidden: true }
    ],
    starterCode: 'def threeSum(nums):\n    # Write your code here\n    pass',
    paramTypes: ['List[int]'],
    returnType: 'List[List[int]]'
  },
  {
    title: 'Product of Array Except Self',
    slug: 'product-of-array-except-self',
    description: 'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. Do not use division.',
    difficulty: 'Medium',
    tags: ['Array'],
    functionName: 'productExceptSelf',
    examples: [
      { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]' }
    ],
    testCases: [
      { input: '[1,2,3,4]', expectedOutput: '[24,12,8,6]', isHidden: false },
      { input: '[-1,1,0,-3,3]', expectedOutput: '[0,0,9,0,0]', isHidden: true }
    ],
    starterCode: 'def productExceptSelf(nums):\n    # Write your code here\n    pass',
    paramTypes: ['List[int]'],
    returnType: 'List[int]'
  },
  {
    title: 'Top K Frequent Elements',
    slug: 'top-k-frequent-elements',
    description: 'Given an integer array nums and an integer k, return the k most frequent elements.',
    difficulty: 'Medium',
    tags: ['Array', 'Hash Table', 'Heap'],
    functionName: 'topKFrequent',
    examples: [
      { input: 'nums = [1,1,1,2,2,3], k = 2', output: '[1,2]' }
    ],
    testCases: [
      { input: '[1,1,1,2,2,3]\n2', expectedOutput: '[1,2]', isHidden: false },
      { input: '[1]\n1', expectedOutput: '[1]', isHidden: true }
    ],
    starterCode: 'def topKFrequent(nums, k):\n    # Write your code here\n    pass',
    paramTypes: ['List[int]', 'int'],
    returnType: 'List[int]'
  },
  {
    title: 'Kth Largest Element in an Array',
    slug: 'kth-largest-element',
    description: 'Given an integer array nums and an integer k, return the kth largest element in the array.',
    difficulty: 'Medium',
    tags: ['Array', 'Heap', 'Sorting'],
    functionName: 'findKthLargest',
    examples: [
      { input: 'nums = [3,2,1,5,6,4], k = 2', output: '5' }
    ],
    testCases: [
      { input: '[3,2,1,5,6,4]\n2', expectedOutput: '5', isHidden: false },
      { input: '[3,2,3,1,2,4,5,5,6]\n4', expectedOutput: '4', isHidden: true }
    ],
    starterCode: 'def findKthLargest(nums, k):\n    # Write your code here\n    pass',
    paramTypes: ['List[int]', 'int'],
    returnType: 'int'
  },
  {
    title: 'Coin Change',
    slug: 'coin-change',
    description: 'Given an integer array coins representing coin denominations and an integer amount, return the fewest number of coins needed to make up that amount. Return -1 if not possible.',
    difficulty: 'Medium',
    tags: ['Dynamic Programming'],
    functionName: 'coinChange',
    examples: [
      { input: 'coins = [1,2,5], amount = 11', output: '3' }
    ],
    testCases: [
      { input: '[1,2,5]\n11', expectedOutput: '3', isHidden: false },
      { input: '[2]\n3', expectedOutput: '-1', isHidden: true }
    ],
    starterCode: 'def coinChange(coins, amount):\n    # Write your code here\n    pass',
    paramTypes: ['List[int]', 'int'],
    returnType: 'int'
  },
  {
    title: 'Word Break',
    slug: 'word-break',
    description: 'Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.',
    difficulty: 'Medium',
    tags: ['Dynamic Programming', 'String'],
    functionName: 'wordBreak',
    examples: [
      { input: 's = "leetcode", wordDict = ["leet","code"]', output: 'true' }
    ],
    testCases: [
      { input: '"leetcode"\n["leet","code"]', expectedOutput: 'true', isHidden: false },
      { input: '"catsandog"\n["cats","dog","sand","and","cat"]', expectedOutput: 'false', isHidden: true }
    ],
    starterCode: 'def wordBreak(s, wordDict):\n    # Write your code here\n    pass',
    paramTypes: ['str', 'List[str]'],
    returnType: 'bool'
  },
  {
    title: 'House Robber',
    slug: 'house-robber',
    description: 'Given an array nums representing money in each house, return the maximum amount you can rob without robbing two adjacent houses.',
    difficulty: 'Medium',
    tags: ['Dynamic Programming'],
    functionName: 'rob',
    examples: [
      { input: 'nums = [1,2,3,1]', output: '4' }
    ],
    testCases: [
      { input: '[1,2,3,1]', expectedOutput: '4', isHidden: false },
      { input: '[2,7,9,3,1]', expectedOutput: '12', isHidden: true }
    ],
    starterCode: 'def rob(nums):\n    # Write your code here\n    pass',
    paramTypes: ['List[int]'],
    returnType: 'int'
  },
  {
    title: 'Number of Islands',
    slug: 'number-of-islands',
    description: 'Given an m x n 2D binary grid which represents a map of 1s (land) and 0s (water), return the number of islands.',
    difficulty: 'Medium',
    tags: ['Graph', 'DFS', 'BFS'],
    functionName: 'numIslands',
    examples: [
      { input: 'grid = [["1","1","0"],["1","1","0"],["0","0","1"]]', output: '2' }
    ],
    testCases: [
      { input: '[["1","1","0"],["1","1","0"],["0","0","1"]]', expectedOutput: '2', isHidden: false },
      { input: '[["1","0"],["0","1"]]', expectedOutput: '2', isHidden: true }
    ],
    starterCode: 'def numIslands(grid):\n    # Write your code here\n    pass',
    paramTypes: ['List[List[str]]'],
    returnType: 'int'
  },
  {
    title: 'Course Schedule',
    slug: 'course-schedule',
    description: 'There are numCourses courses labeled 0 to numCourses-1. Given prerequisites, determine if you can finish all courses.',
    difficulty: 'Medium',
    tags: ['Graph', 'DFS', 'Topological Sort'],
    functionName: 'canFinish',
    examples: [
      { input: 'numCourses = 2, prerequisites = [[1,0]]', output: 'true' }
    ],
    testCases: [
      { input: '2\n[[1,0]]', expectedOutput: 'true', isHidden: false },
      { input: '2\n[[1,0],[0,1]]', expectedOutput: 'false', isHidden: true }
    ],
    starterCode: 'def canFinish(numCourses, prerequisites):\n    # Write your code here\n    pass',
    paramTypes: ['int', 'List[List[int]]'],
    returnType: 'bool'
  },
  {
    title: 'Merge Intervals',
    slug: 'merge-intervals',
    description: 'Given an array of intervals, merge all overlapping intervals and return an array of the non-overlapping intervals.',
    difficulty: 'Medium',
    tags: ['Array', 'Sorting'],
    functionName: 'merge',
    examples: [
      { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]' }
    ],
    testCases: [
      { input: '[[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]', isHidden: false },
      { input: '[[1,4],[4,5]]', expectedOutput: '[[1,5]]', isHidden: true }
    ],
    starterCode: 'def merge(intervals):\n    # Write your code here\n    pass',
    paramTypes: ['List[List[int]]'],
    returnType: 'List[List[int]]'
  },
  {
    title: 'Longest Palindromic Substring',
    slug: 'longest-palindromic-substring',
    description: 'Given a string s, return the longest palindromic substring in s.',
    difficulty: 'Medium',
    tags: ['String', 'Dynamic Programming'],
    functionName: 'longestPalindrome',
    examples: [
      { input: 's = "babad"', output: '"bab"' }
    ],
    testCases: [
      { input: '"babad"', expectedOutput: '"bab"', isHidden: false },
      { input: '"cbbd"', expectedOutput: '"bb"', isHidden: true }
    ],
    starterCode: 'def longestPalindrome(s):\n    # Write your code here\n    pass',
    paramTypes: ['str'],
    returnType: 'str'
  },
  {
    title: 'Spiral Matrix',
    slug: 'spiral-matrix',
    description: 'Given an m x n matrix, return all elements of the matrix in spiral order.',
    difficulty: 'Medium',
    tags: ['Array', 'Matrix'],
    functionName: 'spiralOrder',
    examples: [
      { input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]', output: '[1,2,3,6,9,8,7,4,5]' }
    ],
    testCases: [
      { input: '[[1,2,3],[4,5,6],[7,8,9]]', expectedOutput: '[1,2,3,6,9,8,7,4,5]', isHidden: false },
      { input: '[[1,2,3,4],[5,6,7,8],[9,10,11,12]]', expectedOutput: '[1,2,3,4,8,12,11,10,9,5,6,7]', isHidden: true }
    ],
    starterCode: 'def spiralOrder(matrix):\n    # Write your code here\n    pass',
    paramTypes: ['List[List[int]]'],
    returnType: 'List[int]'
  },
  {
    title: 'Rotate Image',
    slug: 'rotate-image',
    description: 'You are given an n x n 2D matrix representing an image. Rotate the image by 90 degrees clockwise, in place, and return it.',
    difficulty: 'Medium',
    tags: ['Array', 'Matrix'],
    functionName: 'rotate',
    examples: [
      { input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]', output: '[[7,4,1],[8,5,2],[9,6,3]]' }
    ],
    testCases: [
      { input: '[[1,2,3],[4,5,6],[7,8,9]]', expectedOutput: '[[7,4,1],[8,5,2],[9,6,3]]', isHidden: false }
    ],
    starterCode: 'def rotate(matrix):\n    # Write your code here\n    pass',
    paramTypes: ['List[List[int]]'],
    returnType: 'List[List[int]]'
  },
  {
    title: 'Set Matrix Zeroes',
    slug: 'set-matrix-zeroes',
    description: 'Given an m x n integer matrix, if an element is 0, set its entire row and column to 0. Return the modified matrix.',
    difficulty: 'Medium',
    tags: ['Array', 'Matrix'],
    functionName: 'setZeroes',
    examples: [
      { input: 'matrix = [[1,1,1],[1,0,1],[1,1,1]]', output: '[[1,0,1],[0,0,0],[1,0,1]]' }
    ],
    testCases: [
      { input: '[[1,1,1],[1,0,1],[1,1,1]]', expectedOutput: '[[1,0,1],[0,0,0],[1,0,1]]', isHidden: false }
    ],
    starterCode: 'def setZeroes(matrix):\n    # Write your code here\n    pass',
    paramTypes: ['List[List[int]]'],
    returnType: 'List[List[int]]'
  },
  {
    title: 'Trapping Rain Water',
    slug: 'trapping-rain-water',
    description: 'Given n non-negative integers representing an elevation map, compute how much water it can trap after raining.',
    difficulty: 'Hard',
    tags: ['Array', 'Two Pointers'],
    functionName: 'trap',
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' }
    ],
    testCases: [
      { input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6', isHidden: false },
      { input: '[4,2,0,3,2,5]', expectedOutput: '9', isHidden: true }
    ],
    starterCode: 'def trap(height):\n    # Write your code here\n    pass',
    paramTypes: ['List[int]'],
    returnType: 'int'
  },
  {
    title: 'Median of Two Sorted Arrays',
    slug: 'median-of-two-sorted-arrays',
    description: 'Given two sorted arrays nums1 and nums2, return the median of the two sorted arrays.',
    difficulty: 'Hard',
    tags: ['Array', 'Binary Search'],
    functionName: 'findMedianSortedArrays',
    examples: [
      { input: 'nums1 = [1,3], nums2 = [2]', output: '2.0' }
    ],
    testCases: [
      { input: '[1,3]\n[2]', expectedOutput: '2.0', isHidden: false },
      { input: '[1,2]\n[3,4]', expectedOutput: '2.5', isHidden: true }
    ],
    starterCode: 'def findMedianSortedArrays(nums1, nums2):\n    # Write your code here\n    pass',
    paramTypes: ['List[int]', 'List[int]'],
    returnType: 'float'
  },
  {
    title: 'Word Ladder',
    slug: 'word-ladder',
    description: 'Given two words beginWord and endWord, and a wordList, return the length of the shortest transformation sequence, changing one letter at a time.',
    difficulty: 'Hard',
    tags: ['Graph', 'BFS'],
    functionName: 'ladderLength',
    examples: [
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: '5' }
    ],
    testCases: [
      { input: '"hit"\n"cog"\n["hot","dot","dog","lot","log","cog"]', expectedOutput: '5', isHidden: false },
      { input: '"hit"\n"cog"\n["hot","dot","dog","lot","log"]', expectedOutput: '0', isHidden: true }
    ],
    starterCode: 'def ladderLength(beginWord, endWord, wordList):\n    # Write your code here\n    pass',
    paramTypes: ['str', 'str', 'List[str]'],
    returnType: 'int'
  },
  {
    title: 'N-Queens Count',
    slug: 'n-queens-count',
    description: 'The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other. Return the number of distinct solutions.',
    difficulty: 'Hard',
    tags: ['Backtracking'],
    functionName: 'totalNQueens',
    examples: [
      { input: 'n = 4', output: '2' }
    ],
    testCases: [
      { input: '4', expectedOutput: '2', isHidden: false },
      { input: '1', expectedOutput: '1', isHidden: true }
    ],
    starterCode: 'def totalNQueens(n):\n    # Write your code here\n    pass',
    paramTypes: ['int'],
    returnType: 'int'
  },
  {
    title: 'Sliding Window Maximum',
    slug: 'sliding-window-maximum',
    description: 'Given an array nums and a sliding window of size k moving from left to right, return the max sliding window.',
    difficulty: 'Hard',
    tags: ['Array', 'Sliding Window', 'Heap'],
    functionName: 'maxSlidingWindow',
    examples: [
      { input: 'nums = [1,3,-1,-3,5,3,6,7], k = 3', output: '[3,3,5,5,6,7]' }
    ],
    testCases: [
      { input: '[1,3,-1,-3,5,3,6,7]\n3', expectedOutput: '[3,3,5,5,6,7]', isHidden: false },
      { input: '[1]\n1', expectedOutput: '[1]', isHidden: true }
    ],
    starterCode: 'def maxSlidingWindow(nums, k):\n    # Write your code here\n    pass',
    paramTypes: ['List[int]', 'int'],
    returnType: 'List[int]'
  },
  {
    title: 'Minimum Window Substring',
    slug: 'minimum-window-substring',
    description: 'Given two strings s and t, return the minimum window substring of s such that every character in t (including duplicates) is included in the window.',
    difficulty: 'Hard',
    tags: ['String', 'Sliding Window'],
    functionName: 'minWindow',
    examples: [
      { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"' }
    ],
    testCases: [
      { input: '"ADOBECODEBANC"\n"ABC"', expectedOutput: '"BANC"', isHidden: false },
      { input: '"a"\n"a"', expectedOutput: '"a"', isHidden: true }
    ],
    starterCode: 'def minWindow(s, t):\n    # Write your code here\n    pass',
    paramTypes: ['str', 'str'],
    returnType: 'str'
  },
  {
    title: 'Excel Sheet Column Number',
    slug: 'excel-sheet-column-number',
    description: 'Given a string columnTitle that represents the column title as appears in an Excel sheet, return its corresponding column number.',
    difficulty: 'Easy',
    tags: ['Math', 'String'],
    functionName: 'titleToNumber',
    examples: [
      { input: 'columnTitle = "AB"', output: '28' }
    ],
    testCases: [
      { input: '"A"', expectedOutput: '1', isHidden: false },
      { input: '"AB"', expectedOutput: '28', isHidden: false },
      { input: '"ZY"', expectedOutput: '701', isHidden: true }
    ],
    starterCode: 'def titleToNumber(columnTitle):\n    # Write your code here\n    pass',
    paramTypes: ['str'],
    returnType: 'int'
  },
  {
    title: 'Remove Duplicates from Sorted Array',
    slug: 'remove-duplicates-sorted-array',
    description: 'Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. Return the number of unique elements.',
    difficulty: 'Easy',
    tags: ['Array', 'Two Pointers'],
    functionName: 'removeDuplicates',
    examples: [
      { input: 'nums = [1,1,2]', output: '2' }
    ],
    testCases: [
      { input: '[1,1,2]', expectedOutput: '2', isHidden: false },
      { input: '[0,0,1,1,1,2,2,3,3,4]', expectedOutput: '5', isHidden: true }
    ],
    starterCode: 'def removeDuplicates(nums):\n    # Write your code here\n    pass',
    paramTypes: ['List[int]'],
    returnType: 'int'
  },
  {
    title: 'Implement strStr()',
    slug: 'implement-strstr',
    description: 'Given two strings needle and haystack, return the index of the first occurrence of needle in haystack, or -1 if needle is not part of haystack.',
    difficulty: 'Easy',
    tags: ['String'],
    functionName: 'strStr',
    examples: [
      { input: 'haystack = "sadbutsad", needle = "sad"', output: '0' }
    ],
    testCases: [
      { input: '"sadbutsad"\n"sad"', expectedOutput: '0', isHidden: false },
      { input: '"leetcode"\n"leeto"', expectedOutput: '-1', isHidden: true }
    ],
    starterCode: 'def strStr(haystack, needle):\n    # Write your code here\n    pass',
    paramTypes: ['str', 'str'],
    returnType: 'int'
  },
  {
    title: "Pascal's Triangle",
    slug: 'pascals-triangle',
    description: "Given an integer numRows, return the first numRows of Pascal's triangle.",
    difficulty: 'Easy',
    tags: ['Array', 'Dynamic Programming'],
    functionName: 'generate',
    examples: [
      { input: 'numRows = 5', output: '[[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]' }
    ],
    testCases: [
      { input: '5', expectedOutput: '[[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]', isHidden: false },
      { input: '1', expectedOutput: '[[1]]', isHidden: true }
    ],
    starterCode: 'def generate(numRows):\n    # Write your code here\n    pass',
    paramTypes: ['int'],
    returnType: 'List[List[int]]'
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    let inserted = 0;
    let skipped = 0;

    for (const p of problems) {
      const exists = await Problem.findOne({ slug: p.slug });
      if (exists) {
        skipped++;
        continue;
      }
      await Problem.create(p);
      inserted++;
    }

    console.log(`Seed complete. Inserted: ${inserted}, Skipped (already existed): ${skipped}`);
    console.log(`Total problems in DB now: ${await Problem.countDocuments()}`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
