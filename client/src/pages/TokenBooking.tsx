import React, { useState, useEffect } from 'react';

// Utility function to replace the cn function from utils
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

// Icon components to replace lucide-react dependencies
const CheckCircle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const Clock = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const Gem = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M6 3h12l4 6-10 13L2 9z" />
    <path d="M11 3 8 9l4 13 4-13-3-6" />
    <path d="M2 9h20" />
  </svg>
);

const ChevronRight = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const AlertTriangle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const Zap = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const Star = (props: React.SVGProps<SVGSVGElement> & { fill?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={props.fill || "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

import { RouteComponentProps } from 'wouter';

interface TokenBookingProps extends RouteComponentProps {
  normalTokens?: {
    available: number;
    total: number;
    waitTime: string;
  };
  priorityTokens?: {
    available: number;
    total: number;
    waitTime: string;
    price: string;
  };
  onSelectToken?: (type: 'normal' | 'priority') => void;
  onProceed?: (type: 'normal' | 'priority') => void;
}

export const TokenBooking: React.FC<TokenBookingProps> = ({
  normalTokens = { available: 50, total: 50, waitTime: '~45 min' },
  priorityTokens = { available: 20, total: 20, waitTime: '~20 min', price: '₹150' },
  onSelectToken,
  onProceed
}) => {
  const [selectedToken, setSelectedToken] = useState<'normal' | 'priority' | null>(null);
  const [isPulsingPriority, setIsPulsingPriority] = useState(true);

  // Animation effect for priority card
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsingPriority(prev => !prev);
    }, 2500);
    
    return () => clearInterval(interval);
  }, []);

  const handleTokenSelect = (type: 'normal' | 'priority') => {
    setSelectedToken(type);
    if (onSelectToken) {
      onSelectToken(type);
    }
  };

  const handleProceed = () => {
    if (selectedToken && onProceed) {
      onProceed(selectedToken);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Token Booking</h2>
        <p className="text-slate-600 mt-2">Choose between free normal processing or premium priority service.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Normal Token Card */}
        <div 
          className={cn(
            "rounded-xl overflow-hidden transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer border-2",
            selectedToken === 'normal' 
              ? "border-blue-500 bg-blue-50" 
              : "border-transparent bg-white"
          )}
          onClick={() => handleTokenSelect('normal')}
        >
          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Normal Token</h3>
                <span className="text-blue-700 font-medium text-sm bg-blue-100 px-2 py-0.5 rounded-full">Free</span>
              </div>
              <CheckCircle 
                className={cn(
                  "w-6 h-6 transition-opacity", 
                  selectedToken === 'normal' ? "text-blue-500 opacity-100" : "opacity-0"
                )} 
              />
            </div>
            
            <div className="mb-4">
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(normalTokens.available / normalTokens.total) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-sm text-slate-600">
                <span>{normalTokens.available}/{normalTokens.total}</span>
                {normalTokens.available < 10 && (
                  <span className="flex items-center text-amber-600">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Running low
                  </span>
                )}
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-slate-700">
                <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
                <span>Standard queue with regular processing time</span>
              </div>
              <div className="flex items-center text-slate-700">
                <Clock className="w-4 h-4 mr-2 text-blue-500" />
                <span>{normalTokens.waitTime} wait</span>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Token Card */}
        <div 
          className={cn(
            "rounded-xl overflow-hidden transition-all duration-300 cursor-pointer border-2 relative transform hover:scale-[1.02]",
            selectedToken === 'priority' 
              ? "border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg" 
              : "border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-md",
            isPulsingPriority ? "shadow-xl" : "shadow-md"
          )}
          onClick={() => handleTokenSelect('priority')}
          style={{ 
            boxShadow: selectedToken === 'priority' || isPulsingPriority 
              ? '0 0 15px rgba(147, 51, 234, 0.3)' 
              : undefined 
          }}
        >
          {/* Recommended Badge */}
          <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1 text-sm font-bold transform translate-x-2 -translate-y-0 rotate-12 shadow-md z-10">
            RECOMMENDED
          </div>
          
          {/* Glow effect for priority */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 opacity-0 transition-opacity duration-1000",
            isPulsingPriority ? "opacity-100" : "opacity-0"
          )}></div>
          
          <div className="p-5 relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-purple-900 flex items-center">
                  Priority Token
                  <Zap className="h-5 w-5 text-yellow-500 ml-2" />
                </h3>
                <span className="text-white font-bold px-3 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600">
                  {priorityTokens.price}
                </span>
              </div>
              <CheckCircle 
                className={cn(
                  "w-6 h-6 transition-opacity", 
                  selectedToken === 'priority' ? "text-purple-500 opacity-100" : "opacity-0"
                )} 
              />
            </div>
            
            <div className="mb-4">
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                  style={{ width: `${(priorityTokens.available / priorityTokens.total) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-sm text-slate-600">
                <span>{priorityTokens.available}/{priorityTokens.total}</span>
                {priorityTokens.available < 10 && (
                  <span className="flex items-center text-amber-600">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Running low
                  </span>
                )}
              </div>
            </div>
            
            {/* Highlighted features section */}
            <div className="rounded-lg bg-white/60 backdrop-blur-sm p-3 border border-purple-200 mb-4">
              <div className="text-lg font-semibold text-purple-800 mb-2 flex items-center">
                <Star className="h-4 w-4 text-yellow-500 mr-2" fill="#EAB308" />
                Premium Features
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-slate-700">
                  <Gem className="w-4 h-4 mr-2 text-purple-600" />
                  <span>Express processing with priority handling</span>
                </div>
                <div className="flex items-center text-slate-700">
                  <Clock className="w-4 h-4 mr-2 text-purple-600" />
                  <span className="font-medium text-purple-800">{priorityTokens.waitTime} wait</span>
                </div>
                <div className="flex items-center text-slate-700">
                  <Zap className="w-4 h-4 mr-2 text-purple-600" />
                  <span>Skip the line with instant processing</span>
                </div>
              </div>
            </div>
            
            <div className="mt-2 text-sm text-purple-600 font-medium flex items-center bg-purple-100 px-3 py-1.5 rounded-full">
              <Gem className="w-4 h-4 mr-2 text-purple-500" />
              <span className="italic">Priority tokens serving you faster!</span>
            </div>
          </div>
          
          {/* Bottom banner */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-2 px-4 text-center">
            <span className="text-white font-medium text-sm">VIP Experience • Premium Service</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          className={cn(
            "px-8 py-3 rounded-full font-medium flex items-center transition-all text-white shadow-md",
            selectedToken ? (
              selectedToken === 'normal' 
                ? "bg-blue-600 hover:bg-blue-700" 
                : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg"
            ) : "bg-gray-200 text-gray-400 cursor-not-allowed"
          )}
          onClick={handleProceed}
          disabled={!selectedToken}
          style={{ 
            boxShadow: selectedToken === 'priority' 
              ? '0 4px 14px rgba(147, 51, 234, 0.3)' 
              : undefined 
          }}
        >
          {selectedToken ? (
            <>
              Proceed with {selectedToken === 'normal' ? 'Normal' : 'Priority'} Token
              <ChevronRight className="ml-2 w-5 h-5" />
            </>
          ) : (
            <>
              Select a Token Type
              <ChevronRight className="ml-2 w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TokenBooking;