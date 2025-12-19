
import React, { useState, useEffect, useRef } from 'react';
import { HistoryItem, SmartResponse } from './types';
import KeypadButton from './components/Keypad';
import Visualizer from './components/Visualizer';
import { getMathExplanation, solveComplexProblem, solveWithVision } from './services/geminiService';

const App: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSmartLoading, setIsSmartLoading] = useState(false);
  const [smartResponse, setSmartResponse] = useState<SmartResponse | null>(null);
  const [smartInput, setSmartInput] = useState('');
  const [isScientific, setIsScientific] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const historyEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, smartResponse]);

  const handleKeyClick = (val: string) => {
    if (val === 'C') {
      setDisplay('0');
      setSmartResponse(null);
      return;
    }
    if (val === 'Del') {
      setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
      return;
    }
    if (val === '=') {
      calculateResult();
      return;
    }

    setDisplay(prev => {
      // Handle scientific prefixing
      if (['sin', 'cos', 'tan', 'log', 'ln', 'sqrt'].includes(val)) {
        return (prev === '0' ? '' : prev) + val + '(';
      }
      if (prev === '0' && !['.', '+', '-', '*', '/', ')', '^'].includes(val)) return val;
      return prev + val;
    });
  };

  const calculateResult = () => {
    try {
      // Simple sanitization and eval replacement for common math tokens
      let expr = display
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/log/g, 'Math.log10')
        .replace(/ln/g, 'Math.log')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/pi/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/\^/g, '**');
      
      const result = eval(expr).toString();
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        expression: display,
        result,
        timestamp: new Date()
      };
      setHistory(prev => [newItem, ...prev].slice(0, 50));
      setDisplay(result);
    } catch (err) {
      setDisplay('Syntax Error');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSmartLoading(true);
    setSmartResponse(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const response = await solveWithVision(base64, file.type);
        setSmartResponse(response);
        if ('result' in response) setDisplay((response as any).result);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSmartLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSmartSolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smartInput.trim()) return;
    
    setIsSmartLoading(true);
    setSmartResponse(null);
    try {
      const response = await solveComplexProblem(smartInput);
      setSmartResponse(response);
      if ('result' in response) setDisplay((response as any).result);
      setSmartInput('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSmartLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col lg:flex-row h-screen overflow-hidden font-['Inter']">
      
      {/* Sidebar: Navigation & History */}
      <aside className="w-full lg:w-72 bg-slate-900/30 border-r border-slate-800 flex flex-col h-full z-10">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="font-bold text-white text-sm">G</span>
            </div>
            <h1 className="font-bold text-lg tracking-tight">Math Studio <span className="text-cyan-400">Pro</span></h1>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Scientific Assistant</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[11px] font-bold text-slate-500 uppercase">Recent Calculations</h2>
            <button onClick={() => setHistory([])} className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors">Clear</button>
          </div>
          {history.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl">
              <p className="text-xs text-slate-600">No session history</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id} 
                className="group p-3 bg-slate-800/20 border border-slate-800 rounded-xl hover:border-cyan-500/30 hover:bg-slate-800/40 transition-all cursor-pointer"
                onClick={() => { setDisplay(item.expression); getMathExplanation(item.expression, item.result).then(setSmartResponse); }}
              >
                <p className="text-[10px] text-slate-500 mono truncate mb-1">{item.expression}</p>
                <p className="text-sm font-bold text-cyan-400 mono">= {item.result}</p>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 bg-slate-800/50 hover:bg-slate-700 transition-all rounded-xl border border-slate-700 flex items-center justify-center gap-2 text-xs font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Scan Problem
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

        {/* Unified Display Panel */}
        <div className="p-6 lg:p-8 flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Calculator Section */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[2rem] p-8 shadow-2xl relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="h-10 text-slate-500 text-right mono text-sm mb-2 opacity-60">
                  {history.length > 0 && history[0].expression + ' ='}
                </div>
                <div className="text-5xl font-light text-white text-right mono tracking-tighter truncate selection:bg-cyan-500/30">
                  {display}
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setIsScientific(!isScientific)}
                  className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${isScientific ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-slate-800/50 text-slate-500 border-slate-700'}`}
                >
                  {isScientific ? 'Scientific: ON' : 'Standard Mode'}
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {isScientific && (
                  <>
                    <KeypadButton label="sin" onClick={handleKeyClick} type="scientific" />
                    <KeypadButton label="cos" onClick={handleKeyClick} type="scientific" />
                    <KeypadButton label="tan" onClick={handleKeyClick} type="scientific" />
                    <KeypadButton label="sqrt" onClick={handleKeyClick} type="scientific" />
                    <KeypadButton label="log" onClick={handleKeyClick} type="scientific" />
                    <KeypadButton label="ln" onClick={handleKeyClick} type="scientific" />
                    <KeypadButton label="(" onClick={handleKeyClick} type="scientific" />
                    <KeypadButton label=")" onClick={handleKeyClick} type="scientific" />
                    <KeypadButton label="pi" onClick={handleKeyClick} type="scientific" />
                    <KeypadButton label="e" onClick={handleKeyClick} type="scientific" />
                    <KeypadButton label="^" onClick={handleKeyClick} type="scientific" />
                    <KeypadButton label="mod" onClick={handleKeyClick} type="scientific" />
                  </>
                )}
                <KeypadButton label="C" onClick={handleKeyClick} type="action" />
                <KeypadButton label="Del" onClick={handleKeyClick} type="action" />
                <KeypadButton label="/" onClick={handleKeyClick} type="operator" />
                <KeypadButton label="*" onClick={handleKeyClick} type="operator" />

                <KeypadButton label="7" onClick={handleKeyClick} />
                <KeypadButton label="8" onClick={handleKeyClick} />
                <KeypadButton label="9" onClick={handleKeyClick} />
                <KeypadButton label="-" onClick={handleKeyClick} type="operator" />

                <KeypadButton label="4" onClick={handleKeyClick} />
                <KeypadButton label="5" onClick={handleKeyClick} />
                <KeypadButton label="6" onClick={handleKeyClick} />
                <KeypadButton label="+" onClick={handleKeyClick} type="operator" />

                <KeypadButton label="1" onClick={handleKeyClick} />
                <KeypadButton label="2" onClick={handleKeyClick} />
                <KeypadButton label="3" onClick={handleKeyClick} />
                <KeypadButton label="=" onClick={handleKeyClick} className="row-span-2 h-full" />

                <KeypadButton label="0" onClick={handleKeyClick} className="col-span-2" />
                <KeypadButton label="." onClick={handleKeyClick} />
              </div>

              <form onSubmit={handleSmartSolve} className="relative">
                <input 
                  type="text" 
                  value={smartInput}
                  onChange={(e) => setSmartInput(e.target.value)}
                  placeholder="Describe a problem..."
                  className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl py-4 px-6 pr-14 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm placeholder:text-slate-600"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-cyan-600 rounded-xl hover:bg-cyan-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </button>
              </form>
            </div>

            {/* Analysis & Visualization Section */}
            <div className="lg:col-span-7 space-y-6 min-h-0">
              {isSmartLoading ? (
                <div className="h-full flex flex-col items-center justify-center min-h-[400px] border border-slate-800 rounded-[2.5rem] bg-slate-900/20 backdrop-blur-md">
                   <div className="relative">
                      <div className="w-16 h-16 border-2 border-cyan-500/20 rounded-full animate-ping absolute inset-0"></div>
                      <div className="w-16 h-16 border-b-2 border-cyan-400 rounded-full animate-spin"></div>
                   </div>
                   <p className="mt-6 text-sm font-medium text-slate-400 animate-pulse uppercase tracking-[0.2em]">Analyzing concepts</p>
                </div>
              ) : smartResponse ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                  
                  {/* Step-by-Step Display */}
                  <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-800 bg-slate-800/30 flex items-center justify-between">
                      <h3 className="text-sm font-bold tracking-widest text-cyan-400 uppercase">Intelligence Report</h3>
                      <button onClick={() => setSmartResponse(null)} className="text-slate-500 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="p-8 space-y-8">
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Core Explanation</h4>
                        <p className="text-slate-300 leading-relaxed text-sm italic border-l-2 border-cyan-500/30 pl-4 py-1">
                          {smartResponse.explanation}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Logic Flow</h4>
                        {smartResponse.steps.map((step, i) => (
                          <div key={i} className="flex gap-4 group">
                            <span className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:bg-cyan-500 group-hover:text-white group-hover:border-cyan-400 transition-all">
                              {i+1}
                            </span>
                            <p className="text-slate-400 text-sm leading-snug group-hover:text-slate-200 transition-colors">{step}</p>
                          </div>
                        ))}
                      </div>

                      {smartResponse.visualData && (
                        <div className="pt-4">
                          <Visualizer data={smartResponse.visualData.points} label={smartResponse.visualData.label} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[400px] border border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12 bg-slate-900/10">
                  <div className="w-20 h-20 bg-slate-800/50 rounded-[2rem] flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  </div>
                  <h3 className="text-slate-300 font-bold text-lg mb-2">Workspace Idle</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto">
                    Calculation results, graphs, and AI insights will appear here once you start your session.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
