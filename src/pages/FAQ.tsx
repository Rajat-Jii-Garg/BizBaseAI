import React from 'react';
import AppSidebar from "@/components/AppSidebar";

const FAQ = () => {
  return (
    <div className="flex">
      <AppSidebar isCollapsed={false} />
      {/* FAQ content here */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-4">Frequently Asked Questions</h1>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">General Questions</h2>
          <ul className="list-disc pl-5">
            <li>
              <p><strong>What is BizBase?</strong></p>
              <p>BizBase is an all-in-one AI-powered business operating system designed to streamline your CRM, HR, project management, finance, sales, and AI tools into one powerful platform.</p>
            </li>
            <li>
              <p><strong>Who is BizBase for?</strong></p>
              <p>BizBase is perfect for individuals, teams, freelancers, SMBs, and large enterprises looking to enhance their business operations with AI.</p>
            </li>
            <li>
              <p><strong>How does BizBase use AI?</strong></p>
              <p>BizBase uses AI to provide smart insights, automate tasks, improve decision-making, and streamline workflows across various business functions.</p>
            </li>
          </ul>
        </div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Account & Billing</h2>
          <ul className="list-disc pl-5">
            <li>
              <p><strong>How do I create an account?</strong></p>
              <p>You can create an account by visiting our signup page and following the instructions.</p>
            </li>
            <li>
              <p><strong>What payment methods do you accept?</strong></p>
              <p>We accept major credit cards, debit cards, and PayPal.</p>
            </li>
            <li>
              <p><strong>How do I update my billing information?</strong></p>
              <p>You can update your billing information in the account settings section of your dashboard.</p>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Technical Support</h2>
          <ul className="list-disc pl-5">
            <li>
              <p><strong>How do I contact technical support?</strong></p>
              <p>You can contact our technical support team via email or through the support portal on our website.</p>
            </li>
            <li>
              <p><strong>What is the typical response time for support requests?</strong></p>
              <p>Our typical response time is within 24 hours, but we strive to respond as quickly as possible.</p>
            </li>
            <li>
              <p><strong>Do you offer phone support?</strong></p>
              <p>Phone support is available for enterprise clients with dedicated success managers.</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
