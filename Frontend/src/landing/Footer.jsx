import { Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 px-6 border-t border-slate-900">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="text-white font-bold text-xl mb-1">LogiMind AI</h3>
          <p className="text-sm">
            Built for the Global Logistics Hackathon 2024
          </p>
        </div>

        <div className="flex items-center gap-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-800 text-xs font-mono text-emerald-400 border border-slate-700">
            Built in 24 Hours
          </span>
          <a href="#" className="hover:text-white transition-colors">
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-slate-900 text-center text-xs text-slate-600">
        &copy; {new Date().getFullYear()} LogiMind AI. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
