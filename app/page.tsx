"use client";

import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Download, Copy, Trash2 } from "lucide-react";
import Script from "next/script";
import { loadPyodide } from "pyodide/pyodide.js";
import { useLoadPyodide, usePyodide } from "@/hooks/usePyodide";

export default function PythonEditor() {
  const [code, setCode] = useState(
    "# Write your Python code here\nprint('Hello, World!')"
  );
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const editorRef = useRef<any>(null);
  // const { pyodide, isLoading, error } = usePyodide();

  const { loadPyodide, isLoading, error } = useLoadPyodide();

  const [selectedTab, setSelectedTab] = useState("output");

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  console.log(isLoading, error);
  const executeCode = async () => {
    setIsExecuting(true);
    setOutput("Loading Python interpreter...");

    try {
      const pyodide = await loadPyodide();

      if (error || !pyodide) {
        setOutput(
          "Loading Python interpreter... This may take a few seconds on first run."
        );

        return;
      }

      setOutput("Executing code...");

      pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
`);

      pyodide?.runPython(code);

      console.log(pyodide.runPython("sys.stdout.getvalue()"));

      const stdout = pyodide.runPython("sys.stdout.getvalue()");

      setOutput(stdout || "Code executed successfully (no output)");
    } catch (err) {
      const error = err as Error;
      if ("message" in error) {
        setOutput(error.message);
      }

      setOutput("An error occurred while executing the code.");
    }

    setIsExecuting(false);
  };

  const clearCode = () => {
    setCode("# Write your Python code here");
    setOutput("");
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const downloadCode = () => {
    const element = document.createElement("a");
    const file = new Blob([code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "python_code.py";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Python Online Editor</h1>

      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.27.4/full/pyodide.js"
        strategy="beforeInteractive"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center">
                <span>Editor</span>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={clearCode}
                    title="Clear code"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyCode}
                    title="Copy code"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={downloadCode}
                    title="Download code"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => {
                      executeCode();

                      selectedTab !== "output" && setSelectedTab("output");
                    }}
                    disabled={isExecuting}
                    title="Run code"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Run
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden h-[500px]">
                <Editor
                  height="100%"
                  defaultLanguage="python"
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  onMount={handleEditorDidMount}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 4,
                    wordWrap: "on",
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="h-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="output">Output</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
            </TabsList>
            <TabsContent value="output" className="h-full">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Execution Output</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-black text-green-400 p-4 rounded-md h-[400px] overflow-auto font-mono whitespace-pre-wrap">
                    {output || "Run your code to see output here"}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="examples">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Example Snippets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div
                      className="p-3 bg-secondary rounded-md cursor-pointer hover:bg-secondary/80"
                      onClick={() =>
                        setCode("# Hello World\nprint('Hello, World!')")
                      }
                    >
                      <h3 className="font-medium">Hello World</h3>
                      <p className="text-sm text-muted-foreground">
                        Basic print statement
                      </p>
                    </div>

                    <div
                      className="p-3 bg-secondary rounded-md cursor-pointer hover:bg-secondary/80"
                      onClick={() =>
                        setCode(
                          "# For Loop\nfor i in range(5):\n    print(f'Number: {i}')"
                        )
                      }
                    >
                      <h3 className="font-medium">For Loop</h3>
                      <p className="text-sm text-muted-foreground">
                        Basic iteration example
                      </p>
                    </div>

                    <div
                      className="p-3 bg-secondary rounded-md cursor-pointer hover:bg-secondary/80"
                      onClick={() =>
                        setCode(
                          "# Function Definition\ndef fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a\n\n# Print first 10 Fibonacci numbers\nfor i in range(10):\n    print(f'Fibonacci({i}) = {fibonacci(i)}')"
                        )
                      }
                    >
                      <h3 className="font-medium">Fibonacci Sequence</h3>
                      <p className="text-sm text-muted-foreground">
                        Function definition and recursion
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
