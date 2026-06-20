function buildJavaWrapper(code, functionName, paramTypes) {
  // Generate stdin-parsing lines for each parameter type using only JDK helpers (no Gson available)
  const parseLines = paramTypes.map((type, i) => {
    switch (type) {
      case 'int':
        return `        int arg${i} = Integer.parseInt(lines[${i}].trim());`;
      case 'double':
        return `        double arg${i} = Double.parseDouble(lines[${i}].trim());`;
      case 'boolean':
        return `        boolean arg${i} = Boolean.parseBoolean(lines[${i}].trim());`;
      case 'String':
        return `        String arg${i} = stripQuotes(lines[${i}].trim());`;
      case 'int[]':
        return `        int[] arg${i} = parseIntArray(lines[${i}]);`;
      case 'String[]':
        return `        String[] arg${i} = parseStringArray(lines[${i}]);`;
      case 'boolean[]':
        return `        boolean[] arg${i} = parseBooleanArray(lines[${i}]);`;
      case 'double[]':
        return `        double[] arg${i} = parseDoubleArray(lines[${i}]);`;
      case 'int[][]':
        return `        int[][] arg${i} = parseInt2DArray(lines[${i}]);`;
      default:
        return `        String arg${i} = lines[${i}];`;
    }
  }).join('\n');

  const argNames = paramTypes.map((_, i) => `arg${i}`).join(', ');

  return `
import java.util.*;

public class Main {
${indent(code, 4)}

    public static void main(String[] args) throws Exception {
        java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(System.in));
        java.util.List<String> lineList = new java.util.ArrayList<>();
        String line;
        while ((line = reader.readLine()) != null) {
            lineList.add(line);
        }
        String[] lines = lineList.toArray(new String[0]);

${parseLines}

        Object result = ${functionName}(${argNames});
        System.out.println(serialize(result));
    }

    static String stripQuotes(String s) {
        s = s.trim();
        if (s.length() >= 2 && s.charAt(0) == '"' && s.charAt(s.length() - 1) == '"') {
            return s.substring(1, s.length() - 1);
        }
        return s;
    }

    static String[] splitTopLevel(String s) {
        s = s.trim();
        s = s.substring(1, s.length() - 1);
        if (s.trim().isEmpty()) return new String[0];
        java.util.List<String> parts = new java.util.ArrayList<>();
        int depth = 0;
        boolean inQuotes = false;
        StringBuilder cur = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '"') inQuotes = !inQuotes;
            if (!inQuotes) {
                if (c == '[') depth++;
                if (c == ']') depth--;
            }
            if (c == ',' && depth == 0 && !inQuotes) {
                parts.add(cur.toString());
                cur.setLength(0);
            } else {
                cur.append(c);
            }
        }
        parts.add(cur.toString());
        return parts.toArray(new String[0]);
    }

    static int[] parseIntArray(String line) {
        String[] parts = splitTopLevel(line.trim());
        int[] result = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            result[i] = Integer.parseInt(parts[i].trim());
        }
        return result;
    }

    static double[] parseDoubleArray(String line) {
        String[] parts = splitTopLevel(line.trim());
        double[] result = new double[parts.length];
        for (int i = 0; i < parts.length; i++) {
            result[i] = Double.parseDouble(parts[i].trim());
        }
        return result;
    }

    static boolean[] parseBooleanArray(String line) {
        String[] parts = splitTopLevel(line.trim());
        boolean[] result = new boolean[parts.length];
        for (int i = 0; i < parts.length; i++) {
            result[i] = Boolean.parseBoolean(parts[i].trim());
        }
        return result;
    }

    static String[] parseStringArray(String line) {
        String[] parts = splitTopLevel(line.trim());
        String[] result = new String[parts.length];
        for (int i = 0; i < parts.length; i++) {
            result[i] = stripQuotes(parts[i].trim());
        }
        return result;
    }

    static int[][] parseInt2DArray(String line) {
        String[] outerParts = splitTopLevel(line.trim());
        int[][] result = new int[outerParts.length][];
        for (int i = 0; i < outerParts.length; i++) {
            result[i] = parseIntArray(outerParts[i].trim());
        }
        return result;
    }

    static String serialize(Object result) {
        if (result == null) return "null";
        if (result instanceof int[]) return Arrays.toString((int[]) result).replace(" ", "");
        if (result instanceof double[]) return Arrays.toString((double[]) result).replace(" ", "");
        if (result instanceof boolean[]) return Arrays.toString((boolean[]) result).replace(" ", "");
        if (result instanceof Object[]) {
            Object[] arr = (Object[]) result;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < arr.length; i++) {
                if (arr[i] instanceof String) sb.append('"').append(arr[i]).append('"');
                else sb.append(arr[i]);
                if (i < arr.length - 1) sb.append(",");
            }
            sb.append("]");
            return sb.toString();
        }
        if (result instanceof String) return '"' + (String)result + '"';
        if (result instanceof Boolean) return result.toString();
        return result.toString();
    }
}
`;
}

function indent(code, spaces) {
  const pad = ' '.repeat(spaces);
  return code.split('\n').map(line => pad + line).join('\n');
}

module.exports = { buildJavaWrapper };
