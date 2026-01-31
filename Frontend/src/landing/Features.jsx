import { Section } from "../components/Section";
import features from "../../const/features";

const Features = () => {
  return (
    <Section className="bg-white">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Core Capabilities
        </h2>
        <p className="text-slate-600">
          Designed for the complexity of modern supply chains.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="flex gap-6 p-6 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
          >
            <div className="shrink-0">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

export default Features
