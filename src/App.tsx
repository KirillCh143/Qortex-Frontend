import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

function App() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col bg-gray-50">
        <Header title="Chat" />
        <div className="flex flex-1 items-center justify-center p-8">
          <h1 className="text-2xl font-bold text-primary">RAG Agent Frontend</h1>
        </div>
      </div>
    </div>
  );
}

export default App;
