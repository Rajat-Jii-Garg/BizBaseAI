import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  Users, 
  MapPin, 
  Globe, 
  Mail,
  Phone,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  Rocket
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { BUSINESS_UPDATED_EVENT } from '@/components/DashboardHeader';

const BusinessSetup = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    businessUsername: '',
    businessType: '',
    industry: '',
    category: '',
    description: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: ''
  });

  const totalSteps = 3;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const businessTypes = [
    'Sole Proprietorship',
    'Partnership',
    'Private Limited Company',
    'Public Limited Company',
    'Limited Liability Company (LLC)',
    'Limited Liability Partnership (LLP)',
    'Corporation',
    'Trust',
    'Cooperative',
    'Freelancer',
    'Non-Profit Organization',
    'Agency / Firm',
    'Startup (Early-stage)',
    'Other'
  ];

  const industries = [
    'Technology / IT',
    'Software & SaaS',
    'Artificial Intelligence',
    'Healthcare & Medical',
    'Pharmaceuticals',
    'Finance & Banking',
    'FinTech',
    'Insurance',
    'Education',
    'Manufacturing',
    'Industrial & Engineering',
    'Retail & E-commerce',
    'Consulting & Advisory',
    'Legal & Compliance',
    'Real Estate & Construction',
    'Architecture & Interior Design',
    'Marketing, Advertising & PR',
    'Media & Entertainment',
    'Travel & Tourism',
    'Logistics & Supply Chain',
    'Food & Beverages',
    'Transportation',
    'Automobile & Mobility',
    'Energy & Utilities',
    'Renewable Energy',
    'Agriculture & AgriTech',
    'Textile & Fashion',
    'Beauty, Wellness & Fitness',
    'Sports & Gaming',
    'NGO / Social Impact',
    'Government & Public Services',
    'Other'
  ];

  const businessCategories = [
    'Software Development',
    'SaaS Product',
    'Mobile App Development',
    'Web Development',
    'IT Services & Support',
    'AI & Machine Learning Solutions',

    'Consulting Services',
    'Business Advisory',
    'Financial Services',
    'Legal Services',
    'Compliance & Accounting',

    'Marketing Services',
    'Digital Marketing',
    'SEO / SEM Services',
    'Social Media Management',
    'Content Creation',

    'Design Services',
    'UI/UX Design',
    'Graphic Design',
    'Branding & Identity',

    'Education & Training',
    'Coaching & Mentorship',
    'Online Courses',

    'E-commerce Store',
    'Retail Store',
    'Wholesale Supplier',

    'Manufacturing',
    'Product Manufacturing',
    'OEM / ODM',

    'Healthcare Services',
    'Fitness & Wellness Services',

    'Logistics & Delivery',
    'Transportation Services',

    'Food & Beverage Services',
    'Restaurant / Cloud Kitchen',

    'Real Estate Services',
    'Property Management',

    'Recruitment & HR Services',
    'Staffing & Talent Solutions',

    'Freelancer / Independent Services',
    'Other'
  ];

  // Check username availability with debounce
  const checkUsernameAvailability = async (username) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    
    setCheckingUsername(true);
    try {
      const { data, error } = await supabase.rpc('is_username_available', { 
        check_username: username 
      });
      
      if (error) throw error;
      setUsernameAvailable(data);
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Check username when it changes
    if (field === 'businessUsername') {
      const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
      setFormData(prev => ({ ...prev, businessUsername: sanitized }));
      checkUsernameAvailability(sanitized);
    }
  };

  const handleNext = () => {
    if (!validateStep()) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields before continuing.",
        variant: "destructive"
      });
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please login to register your business",
        variant: "destructive"
      });
      return;
    }

    if (usernameAvailable === false) {
      toast({
        title: "Username Not Available",
        description: "Please choose a different username for your business.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('businesses')
        .insert({
          owner_id: user.id,
          name: formData.businessName,
          username: formData.businessUsername,
          business_type: formData.businessType,
          industry: formData.industry,
          category: formData.category,
          description: formData.description,
          website: formData.website,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        // Handle specific errors
        if (error.message.includes('businesses_email_unique') || error.message.includes('duplicate key') && error.message.includes('email')) {
          throw new Error('This email is already registered with another business.');
        }
        if (error.message.includes('businesses_phone_unique') || error.message.includes('duplicate key') && error.message.includes('phone')) {
          throw new Error('This phone number is already registered with another business.');
        }
        if (error.message.includes('businesses_username_unique') || error.message.includes('Username already taken')) {
          throw new Error('This username is already taken. Please choose another.');
        }
        throw error;
      }

      toast({
        title: "Business Registered Successfully 🎉",
        description: "Welcome to your business dashboard!"
      });

      // Dispatch custom event to notify header components
      console.log('BusinessSetup: Dispatching business update event');
      window.dispatchEvent(new CustomEvent(BUSINESS_UPDATED_EVENT));

      // Small delay to ensure event is processed, then redirect
      setTimeout(() => {
        navigate(`/business/${data.username}/dashboard`);
      }, 100);

    } catch (error) {
      console.error(error);
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Business Information -</h2>
              <p className="text-gray-600">Fill up basic business details to get started.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  placeholder="Enter your Business name"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                />
              </div>
              
              {/* Business Username Field */}
              <div className="space-y-2">
                <Label htmlFor="businessUsername">Business Username *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                  <Input
                    id="businessUsername"
                    placeholder="yourbusiness"
                    value={formData.businessUsername}
                    onChange={(e) => handleInputChange('businessUsername', e.target.value)}
                    className={`pl-8 ${
                      usernameAvailable === true ? 'border-green-500 focus:border-green-500' : 
                      usernameAvailable === false ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                  />
                  {checkingUsername && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      Checking...
                    </span>
                  )}
                  {!checkingUsername && usernameAvailable === true && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                  {!checkingUsername && usernameAvailable === false && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-sm">
                      Taken
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Your business URL: bizbase.com/@{formData.businessUsername || 'yourbusiness'}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="businessType">Business-Type *</Label>
                <select
                  id="businessType"
                  className="w-full border rounded-lg px-3 py-2"
                  value={formData.businessType}
                  onChange={(e) => handleInputChange('businessType', e.target.value)}
                >
                  <option value="">Select business type</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <select
                  id="industry"
                  className="w-full border rounded-lg px-3 py-2"
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                >
                  <option value="">Select industry</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  className="w-full border rounded-lg px-3 py-2"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  <option value="">Select category</option>
                  {businessCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Business Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what your business does, your mission, and what makes you unique..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Contact Information -</h2>
              <p className="text-gray-600">How your customers and partners reach you?</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="website">Website URL :</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://yourbusiness.com/"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Business Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="hello@yourbusiness.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Business Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 (123) 456-7890"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="New York"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  placeholder="United States"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Business Address *</Label>
                <Textarea
                  id="address"
                  placeholder="123 Business Street, Suite 100"
                  rows={3}
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify & Submit -</h2>
              <p className="text-gray-600">Verify your Business Details carefully and Submit Registration!</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Business Details :</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Business Name :</span>
                    <p className="text-gray-600">{formData.businessName || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Username :</span>
                    <p className="text-gray-600">@{formData.businessUsername || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Industry :</span>
                    <p className="text-gray-600">{formData.industry || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Category :</span>
                    <p className="text-gray-600">{formData.category || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Business-Type :</span>
                    <p className="text-gray-600">{formData.businessType || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Email :</span>
                    <p className="text-gray-600">{formData.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Phone :</span>
                    <p className="text-gray-600">{formData.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="font-medium">City :</span>
                    <p className="text-gray-600">{formData.city || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Country :</span>
                    <p className="text-gray-600">{formData.country || 'Not provided'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium">Business Address :</span>
                    <p className="text-gray-600">{formData.address || 'Not provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const validateStep = () => {
    if (currentStep === 1) {
      return (
        formData.businessName.trim() &&
        formData.businessUsername.trim() &&
        formData.businessUsername.length >= 3 &&
        usernameAvailable === true &&
        formData.businessType &&
        formData.industry &&
        formData.category &&
        formData.description.trim()
      );
    }

    if (currentStep === 2) {
      return (
        formData.email.trim() &&
        formData.phone.trim() &&
        formData.address.trim() && 
        formData.city.trim() && 
        formData.country.trim()
      );
    }

    return true;
  };


  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">          
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            Register Your Business
          </h1>
          <p className="text-gray-600 mt-2">Join thousands of Businesses Growing Network with BizBase!</p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm font-medium text-gray-700">{Math.round(progressPercentage)}% complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </CardContent>
        </Card>

        {/* Form Content */}
        <Card>
          <CardContent className="p-8">
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
          
          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!validateStep()}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Registering...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  Submit Registration
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BusinessSetup;