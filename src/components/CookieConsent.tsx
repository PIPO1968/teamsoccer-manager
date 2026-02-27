
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cookie } from "lucide-react";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (!cookieConsent) {
      setIsVisible(true);
      setShowFloatingButton(false);
    } else {
      setIsVisible(false);
      setShowFloatingButton(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
    setShowFloatingButton(true);
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setIsVisible(false);
    setShowFloatingButton(true);
  };

  const handleReopenConsent = () => {
    setIsVisible(true);
    setShowFloatingButton(false);
  };

  return (
    <>
      {/* Cookie Consent Banner */}
      {isVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm">
          <Card className="mx-4 mb-4 p-6 bg-white border border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-lg">🍪</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">We value your privacy</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      We and our <span className="text-teamsoccer-green font-medium">partners</span> use cookies and other tracking technologies to improve your experience on our website. We may store and/or access information on a device and process personal data, such as your IP address and browsing data, for personalised advertising and content, advertising and content measurement, audience research and services development.
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Please note that your consent will be valid across all our subdomains. You can change or withdraw your consent at any time using the cookie button.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:gap-2">
                <Button
                  onClick={handleReject}
                  variant="outline"
                  className="text-sm px-6 py-2"
                >
                  Reject All
                </Button>
                <Button
                  onClick={handleAccept}
                  className="text-sm px-6 py-2 bg-teamsoccer-green hover:bg-teamsoccer-green-dark text-white"
                >
                  Accept All
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Floating Cookie Button */}
      {showFloatingButton && (
        <button
          onClick={handleReopenConsent}
          className="fixed bottom-4 right-4 z-40 w-12 h-12 bg-teamsoccer-green hover:bg-teamsoccer-green-dark text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          title="Cookie Preferences"
        >
          <Cookie className="w-6 h-6" />
        </button>
      )}
    </>
  );
};

export default CookieConsent;
