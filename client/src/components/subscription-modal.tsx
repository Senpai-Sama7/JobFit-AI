import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Crown, Star, Zap, X } from "lucide-react";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (plan: 'plus' | 'pro') => void;
}

export default function SubscriptionModal({ isOpen, onClose, onSubscribe }: SubscriptionModalProps) {
  const freeFeatures = [
    "View ATS score for uploaded resumes",
    "See top 3 role matches",
    "Basic resume parsing",
    "1 resume upload per month"
  ];

  const plusFeatures = [
    "10 resume generations per month",
    "Full access to all role matches",
    "Basic resume tailoring",
    "Export resumes (PDF, DOCX, TXT)",
    "ATS optimization insights",
    "Email support"
  ];

  const proFeatures = [
    "30 resume generations per month",
    "Full access to all role matches", 
    "Advanced resume tailoring",
    "AI interview cheat sheets (5 jobs)",
    "Export optimized resumes",
    "Priority customer support",
    "Advanced analytics dashboard",
    "Custom templates"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto glass-card border-0">
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center space-x-2 text-2xl">
            <Crown className="h-6 w-6 text-primary-600" />
            <span>Upgrade to JobFit AI Premium</span>
          </DialogTitle>
          <p className="text-grey-600 mt-2">
            Unlock the full power of AI-driven resume optimization
          </p>
        </DialogHeader>

        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6">
            {/* Free Plan */}
            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-grey-900">Free</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-grey-900">$0</span>
                    <span className="text-grey-600">/month</span>
                  </div>
                  <Badge variant="outline" className="mt-2">Current Plan</Badge>
                </div>

                <div className="space-y-3">
                  {freeFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-success-600 flex-shrink-0" />
                      <span className="text-sm text-grey-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full mt-6" disabled>
                  Current Plan
                </Button>
              </CardContent>
            </Card>

            {/* Plus Plan */}
            <Card className="glass-card border-0 ring-2 ring-primary-400 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary-600 text-white px-4 py-1">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
              
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-grey-900">Plus</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-primary-600">$0.99</span>
                    <span className="text-grey-600">/month</span>
                  </div>
                  <p className="text-sm text-grey-600 mt-1">10 resume generations</p>
                </div>

                <div className="space-y-3">
                  {plusFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-primary-600 flex-shrink-0" />
                      <span className="text-sm text-grey-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => onSubscribe('plus')}
                  className="w-full mt-6 bg-primary-600 text-white hover:bg-primary-700"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Upgrade to Plus
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="glass-card border-0 ring-2 ring-purple-400 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-600 text-white px-4 py-1">
                  <Crown className="h-3 w-3 mr-1" />
                  Pro
                </Badge>
              </div>
              
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-grey-900">Pro</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-purple-600">$4.99</span>
                    <span className="text-grey-600">/month</span>
                  </div>
                  <p className="text-sm text-grey-600 mt-1">30 resumes + AI interviews</p>
                </div>

                <div className="space-y-3">
                  {proFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-purple-600 flex-shrink-0" />
                      <span className="text-sm text-grey-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => onSubscribe('pro')}
                  className="w-full mt-6 bg-purple-600 text-white hover:bg-purple-700"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Security & Trust */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-6 text-sm text-grey-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success-600" />
                <span>Secure payments via Stripe</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success-600" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success-600" />
                <span>30-day money back guarantee</span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-center mt-6">
            <Button variant="ghost" onClick={onClose} className="text-grey-600">
              <X className="h-4 w-4 mr-2" />
              Maybe later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}