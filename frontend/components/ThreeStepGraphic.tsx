import { Music2, Users, Play } from "lucide-react";

export function ThreeStepGraphic() {
  const steps = [
    {
      number: 1,
      icon: Music2,
      title: "Select Instrument",
      description: "Browse our premium collection and rent your ideal instrument",
    },
    {
      number: 2,
      icon: Users,
      title: "Match with Instructor",
      description: "Get paired with qualified teachers based on your profile",
    },
    {
      number: 3,
      icon: Play,
      title: "Begin Lessons",
      description: "Start your musical journey with expert guidance",
    },
  ];

  return (
    <div className="space-y-8">
      {steps.map((step, index) => (
        <div key={step.number} className="relative">
          <div className="flex items-start gap-4">
            {/* Icon Circle */}
            <div className="relative flex-shrink-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg">
                <step.icon className="h-8 w-8 text-white" />
              </div>
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-16 h-12 w-0.5 -translate-x-1/2 bg-gradient-to-b from-secondary to-primary/20"></div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pt-2">
              <div className="inline-block rounded-full bg-accent/10 px-3 py-1 mb-2">
                <span className="text-sm font-semibold text-accent">Step {step.number}</span>
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-muted-foreground">
                {step.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
