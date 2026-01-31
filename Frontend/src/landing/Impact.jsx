import { Section } from "../components/Section";

const stats = [
  { label: "Reduction in Empty Miles", value: "24%" },
  { label: "Increase in Fleet Profit", value: "18%" },
  { label: "Faster Decision Time", value: "<1s" },
];

const Impact = () => {
  return (
    <Section className="bg-slate-900 text-white">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Why Continuous Decisions Win
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            The road is dynamic. Traffic jams happen, loads get cancelled, and
            spot prices surge. Static plans fail because they ignore this
            reality.
            <br />
            <br />
            LogiMind adapts as the world changes, ensuring you never leave money
            on the table.
          </p>

          <div className="space-y-4">
            {[
              "Fewer empty return trips",
              "Better truck utilization",
              "Higher driver income stability",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                </div>
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-slate-800 p-6 rounded-2xl border border-slate-700 text-center"
            >
              <div className="text-4xl font-bold text-emerald-400 mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

export default Impact
