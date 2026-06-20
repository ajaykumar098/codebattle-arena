const { buildJavaWrapper } = require('../src/judge/javaWrapper');

const userCode = `public static int[] twoSum(int[] nums, int target) {
    java.util.Map<Integer, Integer> map = new java.util.HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (map.containsKey(complement)) {
            return new int[] { map.get(complement), i };
        }
        map.put(nums[i], i);
    }
    return new int[] {};
}`;

const paramTypes = ["int[]", "int"];
const functionName = "twoSum";

const wrapped = buildJavaWrapper(userCode, functionName, paramTypes);
console.log(wrapped);
