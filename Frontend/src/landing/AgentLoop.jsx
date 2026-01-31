import { Section } from "../components/Section";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import steps from "../../const/steps.js";

const AgentLoop = () => {
  return (
    <Section className="bg-slate-50 relative overflow-hidden">
      <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0" />

      <div className="text-center mb-16 relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          The Agent Loop
        </h2>
        <p className="text-lg text-slate-600">
          A continuous cycle of intelligence that never sleeps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:shadow-md transition-shadow"
          >
            <div
              className={`w-16 h-16 ${step.bg} rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
            >
              <step.icon className={`w-8 h-8 ${step.color}`} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              {step.title}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};

export default AgentLoop;
