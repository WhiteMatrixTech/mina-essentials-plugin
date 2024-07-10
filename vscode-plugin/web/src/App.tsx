// @ts-expect-error 测试功能
const vscode = acquireVsCodeApi();

function App() {
  const handleConfig = () => {
    console.log("click1111", vscode);
    vscode.postMessage({
      command: "config",
    });
  };

  const handleCompile = () => {
    vscode.postMessage({
      command: "compile",
    });
  };

  const handleDeploy = () => {
    vscode.postMessage({
      command: "deploy",
    });
  };

  return (
    <>
      <div className="flex flex-col gap-2 mt-2">
        <button
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          onClick={handleConfig}
        >
          Config
        </button>

        <button
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          onClick={handleCompile}
        >
          Compile
        </button>

        <button
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          onClick={handleDeploy}
        >
          Deploy
        </button>
      </div>
    </>
  );
}

export default App;
