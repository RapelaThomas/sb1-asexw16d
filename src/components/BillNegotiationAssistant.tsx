import React, { useState } from 'react';
import { Phone, DollarSign, Calendar, Trash2, CheckCircle, AlertTriangle, BarChart3, Clock, Zap } from 'lucide-react';
import { BillNegotiation, Bill, Currency } from '../types';
import { formatCurrency } from '../utils/advancedCalculations';

interface BillNegotiationAssistantProps {
  negotiations: BillNegotiation[];
  bills: Bill[];
  currency: Currency;
  onMarkNegotiated: (billId: string, success: boolean, newAmount?: number) => void;
  onDeleteNegotiation: (negotiationId: string) => void;
}

const BillNegotiationAssistant: React.FC<BillNegotiationAssistantProps> = ({
  negotiations,
  bills,
  currency,
  onMarkNegotiated,
  onDeleteNegotiation
}) => {
  const [activeNegotiation, setActiveNegotiation] = useState<string | null>(null);
  const [negotiationResult, setNegotiationResult] = useState({
    success: false,
    newAmount: ''
  });

  const totalPotentialSavings = negotiations.reduce((sum, neg) => sum + neg.potentialSavings, 0);
  const annualSavings = totalPotentialSavings * 12;

  const handleSubmitResult = (negotiationId: string) => {
    const negotiation = negotiations.find(n => n.id === negotiationId);
    if (!negotiation) return;
    
    onMarkNegotiated(
      negotiation.billId, 
      negotiationResult.success, 
      negotiationResult.success ? parseFloat(negotiationResult.newAmount) : undefined
    );
    
    setActiveNegotiation(null);
    setNegotiationResult({ success: false, newAmount: '' });
  };

  const getBillCategory = (billId: string) => {
    const bill = bills.find(b => b.id === billId);
    return bill?.category || 'other';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'utility': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300';
      case 'subscription': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300';
      case 'insurance': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getSuccessProbabilityColor = (probability: number) => {
    if (probability >= 0.7) return 'text-green-600';
    if (probability >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bill Negotiation Assistant</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Identify and negotiate bills to reduce your expenses</p>
        </div>
      </div>

      {/* Savings Summary */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-sm p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Potential Savings</h3>
          <DollarSign className="h-6 w-6" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-green-100">Monthly Savings</p>
            <p className="text-3xl font-bold">{formatCurrency(totalPotentialSavings, currency)}</p>
          </div>
          <div>
            <p className="text-green-100">Annual Savings</p>
            <p className="text-3xl font-bold">{formatCurrency(annualSavings, currency)}</p>
          </div>
          <div>
            <p className="text-green-100">Negotiation Opportunities</p>
            <p className="text-3xl font-bold">{negotiations.length}</p>
          </div>
        </div>
      </div>

      {/* Negotiation Opportunities */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Negotiation Opportunities</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-600">
          {negotiations.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No negotiation opportunities found</p>
            </div>
          ) : (
            negotiations.map((negotiation) => (
              <div key={negotiation.id} className="px-6 py-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{negotiation.billName}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(getBillCategory(negotiation.billId))}`}>
                        {getBillCategory(negotiation.billId)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Current: {formatCurrency(negotiation.currentAmount, currency)}
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        Potential Savings: {formatCurrency(negotiation.potentialSavings, currency)}/month
                      </span>
                    </div>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Best time to call: {negotiation.bestTimeToCall}
                      </span>
                      <span className={`ml-4 text-xs font-medium ${getSuccessProbabilityColor(negotiation.successProbability)}`}>
                        {Math.round(negotiation.successProbability * 100)}% success probability
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveNegotiation(activeNegotiation === negotiation.id ? null : negotiation.id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 text-sm"
                  >
                    {activeNegotiation === negotiation.id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
                
                {activeNegotiation === negotiation.id && (
                  <div className="mt-4 space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Negotiation Tips</h5>
                      <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                        {negotiation.negotiationTips.map((tip, index) => (
                          <li key={index} className="flex items-start">
                            <Zap className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Competitor Rates</h5>
                      <div className="space-y-2">
                        {negotiation.competitorRates.map((rate, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Competitor {index + 1}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(rate, currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Record Negotiation Result</h5>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id={`success-${negotiation.id}`}
                              checked={negotiationResult.success}
                              onChange={() => setNegotiationResult({ ...negotiationResult, success: true })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                            />
                            <label htmlFor={`success-${negotiation.id}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                              Successful
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id={`failure-${negotiation.id}`}
                              checked={!negotiationResult.success}
                              onChange={() => setNegotiationResult({ ...negotiationResult, success: false })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                            />
                            <label htmlFor={`failure-${negotiation.id}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                              Unsuccessful
                            </label>
                          </div>
                        </div>
                        
                        {negotiationResult.success && (
                          <div>
                            <label htmlFor={`newAmount-${negotiation.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              New Amount
                            </label>
                            <input
                              type="number"
                              id={`newAmount-${negotiation.id}`}
                              value={negotiationResult.newAmount}
                              onChange={(e) => setNegotiationResult({ ...negotiationResult, newAmount: e.target.value })}
                              placeholder="0.00"
                              step="0.01"
                              min="0"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        )}
                        
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleSubmitResult(negotiation.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
                          >
                            Save Result
                          </button>
                          <button
                            onClick={() => onDeleteNegotiation(negotiation.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Negotiation Guide */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Negotiation Guide</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Before You Call</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Research competitor rates and offers</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Review your usage and payment history</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Have your account information ready</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Call during non-peak hours</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">During the Call</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Be polite but firm in your request</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Mention competitor offers</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Ask to speak with retention department if needed</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Be willing to cancel if you don't get a good offer</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="font-medium text-yellow-800 dark:text-yellow-300">Pro Tips</span>
            </div>
            <ul className="mt-2 space-y-1 text-sm text-yellow-700 dark:text-yellow-400">
              <li>• Always be prepared to follow through if you threaten to cancel</li>
              <li>• Take notes during your call, including representative's name</li>
              <li>• Ask for the offer in writing via email</li>
              <li>• Set a calendar reminder to negotiate again when the promotion ends</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Success Stories */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Success Stories</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-800 dark:text-green-300">Internet Bill</h4>
              </div>
              <p className="text-sm text-green-700 dark:text-green-400">
                "I saved $25/month on my internet bill just by calling and mentioning a competitor's offer."
              </p>
              <p className="text-xs text-green-600 dark:text-green-500 mt-2">
                Annual savings: $300
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-800 dark:text-green-300">Insurance</h4>
              </div>
              <p className="text-sm text-green-700 dark:text-green-400">
                "Reduced my auto insurance by $40/month by bundling with renter's insurance and asking for discounts."
              </p>
              <p className="text-xs text-green-600 dark:text-green-500 mt-2">
                Annual savings: $480
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-800 dark:text-green-300">Subscriptions</h4>
              </div>
              <p className="text-sm text-green-700 dark:text-green-400">
                "Got 50% off my streaming services for 6 months by mentioning I was considering canceling."
              </p>
              <p className="text-xs text-green-600 dark:text-green-500 mt-2">
                Total savings: $90
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillNegotiationAssistant;