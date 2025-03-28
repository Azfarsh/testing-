import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import { PricingPlan } from "@shared/types";

const pricingPlans: PricingPlan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 0,
    period: "",
    description: "Perfect for occasional printing needs.",
    features: [
      "10 pages per month",
      "Basic document customization",
      "Standard print quality",
      "Pay-per-print beyond free pages"
    ]
  },
  {
    id: "pro",
    name: "Pro",
    price: 12.99,
    period: "/month",
    description: "Great for regular printing needs.",
    features: [
      "100 pages per month",
      "Advanced document customization",
      "Premium print quality",
      "Priority support",
      "Discounted rates beyond plan"
    ],
    isPopular: true
  },
  {
    id: "business",
    name: "Business",
    price: 29.99,
    period: "/month",
    description: "Ideal for small businesses and teams.",
    features: [
      "Unlimited pages",
      "Professional document customization",
      "Commercial print quality",
      "24/7 priority support",
      "Team management features",
      "API access"
    ]
  }
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const PricingSection = () => {
  return (
    <section className="bg-white py-16" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h2 
            className="text-3xl font-extrabold text-gray-900 sm:text-4xl"
            variants={fadeInUp}
          >
            Simple, Transparent Pricing
          </motion.h2>
          <motion.p 
            className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            Choose the perfect plan for your printing needs
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {pricingPlans.map((plan) => (
            <motion.div key={plan.id} variants={fadeInUp}>
              <Card className={`relative h-full ${plan.isPopular ? 'border-2 border-primary' : ''}}`}>
                {plan.isPopular && (
                  <div className="absolute top-0 right-0 -translate-y-1/2 px-3 py-1 bg-primary text-white text-sm font-medium rounded-full">
                    Popular
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <div className="mt-4 flex items-baseline justify-center">
                      <span className="text-5xl font-extrabold text-gray-900">
                        ${plan.price}
                      </span>
                      <span className="ml-1 text-xl font-semibold text-gray-500">
                        {plan.period}
                      </span>
                    </div>
                    <p className="mt-4 text-gray-500">{plan.description}</p>
                  </div>

                  <ul className="mt-6 space-y-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0">
                          <CheckIcon className="h-6 w-6 text-green-500" />
                        </div>
                        <p className="ml-3 text-gray-500">{feature}</p>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <Button 
                      className={`w-full ${plan.isPopular ? 'bg-primary hover:bg-primary/90' : ''}`}
                      variant={plan.isPopular ? 'default' : 'outline'}
                    >
                      Get Started
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;