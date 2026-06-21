declare global {
  interface Window {
    pyodide: any;
    loadPyodide: () => Promise<any>;
  }
}

let pyodideInstance: any = null;

function indentCode(code: string, spaces: number = 4): string {
  const indent = ' '.repeat(spaces);
  return code.split('\n').map(line => indent + line).join('\n');
}

export async function loadPyodideRuntime(): Promise<any> {
  if (window.pyodide) {
    return window.pyodide;
  }

  if (!window.loadPyodide) {
    throw new Error('Pyodide is not loaded. Make sure the script tag is in index.html');
  }

  pyodideInstance = await window.loadPyodide();
  window.pyodide = pyodideInstance;
  return pyodideInstance;
}

export async function runPythonTestCase(
  userCode: string,
  functionName: string,
  input: string
): Promise<{ output: string; error: string | null }> {
  try {
    const pyodide = await loadPyodideRuntime();

    // Set the input value in the Python environment
    pyodide.globals.set('input', input);
    pyodide.globals.set('functionName', functionName);

    // Build the Python wrapper script with error handling
    const pythonScript = `
import json
import sys
import traceback
from io import StringIO

# Capture stdout and stderr
old_stdout = sys.stdout
old_stderr = sys.stderr
old_stdin = sys.stdin
sys.stdout = captured_output = StringIO()
sys.stderr = captured_error = StringIO()

try:
    # Always set stdin first (doesn't hurt function mode)
    sys.stdin = StringIO(input)
    
    # Run the user code
${indentCode(userCode)}
    
    # Check if the function exists in the local namespace
    has_function = functionName in globals()
    if has_function:
        # Function-based solution: parse input as JSON and call the function
        lines = input.strip().split('\\n')
        args = [json.loads(line) for line in lines if line.strip()]
        result = globals()[functionName](*args)
        print(json.dumps(result))
except Exception as e:
    # Capture the full traceback
    traceback.print_exc()
    print(f"ERROR: {type(e).__name__}: {e}", file=sys.stderr)
finally:
    # Restore stdout, stderr, and stdin
    sys.stdout = old_stdout
    sys.stderr = old_stderr
    sys.stdin = old_stdin
    raw_output = captured_output.getvalue()
    error_output = captured_error.getvalue()
    
    # For standalone scripts, extract the last non-empty line as the final answer
    if not has_function:
        output_lines = [line for line in raw_output.strip().split('\\n') if line.strip()]
        output = output_lines[-1] if output_lines else ''
    else:
        output = raw_output
`;

    // Run the Python code
    await pyodide.runPythonAsync(pythonScript);

    // Get the captured output and error
    const output = await pyodide.runPythonAsync('output');
    const errorOutput = await pyodide.runPythonAsync('error_output');
    
    if (errorOutput) {
      return { output: '', error: errorOutput };
    }
    
    return { output, error: null };
  } catch (error) {
    // Catch any pyodide-level errors (e.g., runtime not loaded)
    return { output: '', error: error instanceof Error ? error.message : String(error) };
  }
}
