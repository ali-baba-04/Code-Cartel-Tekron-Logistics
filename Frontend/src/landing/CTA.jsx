import { Section } from "../components/Section";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <Section className="bg-white">
      <div className="bg-emerald-900 rounded-3xl p-12 md:p-24 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Logistics That Adapts as the Road Changes
          </h2>
          <p className="text-emerald-100/80 text-lg mb-10">
            Because the best decision isn't made once — it's made continuously.
          </p>
          <button className="bg-white text-emerald-900 px-8 py-4 rounded-lg font-bold hover:bg-emerald-50 transition-colors shadow-lg inline-flex items-center gap-2">
            Build Smarter Logistics with AI
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Section>
  );
};

export default CTA;
