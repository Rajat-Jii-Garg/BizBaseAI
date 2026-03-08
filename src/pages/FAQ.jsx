import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import SEOHead from '@/components/SEOHead';

const FAQ = () => {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (index) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const faqData = [
    {
      category: "General Questions",
      questions: [
        {
          question: "What is BizBase?",
          answer: "BizBase is an all-in-one AI-powered business operating system designed to streamline your CRM, HR, project management, finance, sales, and AI tools into one powerful platform."
        },
        {
          question: "Who is BizBase for?",
          answer: "BizBase is perfect for individuals, teams, freelancers, SMBs, and large enterprises looking to enhance their business operations with AI."
        },
        {
          question: "How does BizBase use AI?",
          answer: "BizBase uses AI to provide smart insights, automate tasks, improve decision-making, and streamline workflows across various business functions."
        }
      ]
    },
    {
      category: "Account & Billing",
      questions: [
        {
          question: "How do I create an account?",
          answer: "You can create an account by visiting our signup page and following the instructions."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept major credit cards, debit cards, and PayPal."
        },
        {
          question: "How do I update my billing information?",
          answer: "You can update your billing information in the account settings section of your dashboard."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          question: "How do I contact technical support?",
          answer: "You can contact our technical support team via email or through the support portal on our website."
        },
        {
          question: "What is the typical response time for support requests?",
          answer: "Our typical response time is within 24 hours, but we strive to respond as quickly as possible."
        },
        {
          question: "Do you offer phone support?",
          answer: "Phone support is available for enterprise clients with dedicated success managers."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30">
      <SEOHead title="FAQ - Frequently Asked Questions" description="Find answers to common questions about BizBase AI - professional networking, business management, AI features, pricing, and more." path="/faq" />
      <section className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Find answers to common questions about BizBase and our services
            </p>
          </div>

          <div className="space-y-8">
            {faqData.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-center mb-6">
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {category.questions.map((item, itemIndex) => {
                    const globalIndex = `${categoryIndex}-${itemIndex}`;
                    const isOpen = openItems[globalIndex];
                    
                    return (
                      <div key={itemIndex} className="border border-gray-200 rounded-lg">
                        <Button
                          variant="ghost"
                          className="w-full p-4 justify-between text-left hover:bg-gray-50"
                          onClick={() => toggleItem(globalIndex)}
                        >
                          <span className="font-semibold text-lg">{item.question}</span>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </Button>
                        {isOpen && (
                          <div className="px-4 pb-4 text-gray-600 leading-relaxed">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Section */}
          <Card className="mt-12 text-center p-8 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-white border-0">
            <HelpCircle className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="text-lg mb-6 opacity-90">
              Our support team is here to help you succeed with BizBase
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3">
                Contact Support
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-3">
                Schedule Demo
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
