import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const comparisons = [
  {
    feature: "Queue Management",
    automated: "Instant queue management with smart token system",
    traditional: "Physical queue system with manual token distribution"
  },
  {
    feature: "Availability",
    automated: "24/7 availability through digital platform",
    traditional: "Limited to shop operating hours"
  },
  {
    feature: "Tracking",
    automated: "Real-time status tracking and notifications",
    traditional: "Manual status checking required"
  },
  {
    feature: "Payment",
    automated: "Secure digital payments and automated billing",
    traditional: "Cash or card payments at counter"
  },
  {
    feature: "Customization",
    automated: "Advanced print settings customization",
    traditional: "Basic print settings available"
  }
];

const ComparisonSection = () => {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Printing Methods Compared</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Discover how automated printing solutions revolutionize the traditional printing experience
          </p>
        </div>

        <div className="overflow-hidden shadow-sm rounded-lg">
          <div className="bg-white overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature</TableHead>
                  <TableHead className="text-left text-xs font-medium text-primary uppercase tracking-wider">Automated Printing</TableHead>
                  <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Traditional Printing</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisons.map((comparison, index) => (
                  <TableRow key={index} className={index % 2 === 1 ? "bg-gray-50" : ""}>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{comparison.feature}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{comparison.automated}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comparison.traditional}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="text-center mt-10">
          <Link href="/signup">
            <Button size="lg">
              Try Automated Printing Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
