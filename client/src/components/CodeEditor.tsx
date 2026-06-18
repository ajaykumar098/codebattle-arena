import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  language?: string;
  onChange: (value: string) => void;
  height?: string;
}

export default function CodeEditor({
  value,
  language = 'javascript',
  onChange,
  height = '400px'
}: CodeEditorProps) {
  return (
    <Editor
      height={height}
      defaultLanguage={language}
      value={value}
      onChange={(val) => onChange(val ?? '')}
      theme="vs-dark"
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false
      }}
    />
  );
}
