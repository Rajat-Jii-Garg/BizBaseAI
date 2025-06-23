
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Users, Headphones } from 'lucide-react';

const Contact = () => {
  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email within 2 hours",
      contact: "support@bizbase.com",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Talk to our experts directly",
      contact: "+1 (555) 123-4567",
      color: "from-green-500 to-green-600"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with us in real-time",
      contact: "Available 24/7",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Users,
      title: "Enterprise Sales",
      description: "Custom solutions for large teams",
      contact: "enterprise@bizbase.com",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const offices = [
    {
      city: "San Francisco",
      address: "123 Tech Street, CA 94105",
      phone: "+1 (555) 123-4567",
      timezone: "PST"
    },
    {
      city: "New York",
      address: "456 Business Ave, NY 10001",
      phone: "+1 (555) 987-6543",
      timezone: "EST"
    },
    {
      city: "London",
      address: "789 Innovation Road, EC1A 1BB",
      phone: "+44 20 1234 5678",
      timezone: "GMT"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30">
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                Get in Touch
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Have questions? We're here to help you build your business empire
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            {/* Contact Form */}
            <Card className="p-8 shadow-xl border-0">
              <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <Input placeholder="Enter your first name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <Input placeholder="Enter your last name" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input type="email" placeholder="Enter your email" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Company</label>
                  <Input placeholder="Enter your company name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <Input placeholder="What's this about?" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <Textarea 
                    placeholder="Tell us how we can help you..."
                    className="min-h-[120px]"
                  />
                </div>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </Card>

            {/* Contact Methods */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Other Ways to Reach Us</h2>
              {contactMethods.map((method, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${method.color} rounded-lg flex items-center justify-center`}>
                      <method.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{method.title}</h3>
                      <p className="text-slate-600 text-sm mb-2">{method.description}</p>
                      <p className="font-medium text-blue-600">{method.contact}</p>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Business Hours */}
              <Card className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">Business Hours</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Monday - Friday:</span> 9:00 AM - 6:00 PM PST</p>
                      <p><span className="font-medium">Saturday:</span> 10:00 AM - 4:00 PM PST</p>
                      <p><span className="font-medium">Sunday:</span> Closed</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Office Locations */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">Our Offices</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {offices.map((office, index) => (
                <Card key={index} className="p-6 text-center hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">{office.city}</h3>
                  <p className="text-slate-600 text-sm mb-2">{office.address}</p>
                  <p className="text-blue-600 font-medium text-sm mb-1">{office.phone}</p>
                  <p className="text-slate-500 text-xs">{office.timezone}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-slate-600 mb-6">
              Check out our comprehensive FAQ section or schedule a live demo with our team
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" className="px-6 py-3">
                <Headphones className="w-4 h-4 mr-2" />
                View FAQ
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3">
                Schedule Demo
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Contact;
