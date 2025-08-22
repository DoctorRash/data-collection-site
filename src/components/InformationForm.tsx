import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import FormField from "./FormField";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FormData {
  firstName: string;
  middleName: string;
  surname: string;
  gender: string;
  dateOfBirth: string;
  academicQualifications: string;
  professionalQualifications: string;
  skillsSet: string;
  primarySchool: string;
  secondarySchool: string;
  college: string;
  socialGroupMembership: string;
  relationshipStatus: string;
  stateOfOrigin: string;
  localGovernment: string;
  residentialAddress: string;
  employmentStatus: string;
  phoneNumber: string;
  email: string;
  socialMediaPages: string;
}

const initialFormData: FormData = {
  firstName: "",
  middleName: "",
  surname: "",
  gender: "",
  dateOfBirth: "",
  academicQualifications: "",
  professionalQualifications: "",
  skillsSet: "",
  primarySchool: "",
  secondarySchool: "",
  college: "",
  socialGroupMembership: "",
  relationshipStatus: "",
  stateOfOrigin: "",
  localGovernment: "",
  residentialAddress: "",
  employmentStatus: "",
  phoneNumber: "",
  email: "",
  socialMediaPages: "",
};

const InformationForm = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  const relationshipOptions = [
    { value: "single", label: "Single" },
    { value: "married", label: "Married" },
    { value: "divorced", label: "Divorced" },
    { value: "widowed", label: "Widowed" },
  ];

  const employmentOptions = [
    { value: "employed", label: "Employed" },
    { value: "self-employed", label: "Self-Employed" },
    { value: "unemployed", label: "Unemployed" },
    { value: "student", label: "Student" },
  ];

  const handleInputChange = (name: keyof FormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.surname) newErrors.surname = "Surname is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.relationshipStatus) newErrors.relationshipStatus = "Relationship status is required";
    if (!formData.stateOfOrigin) newErrors.stateOfOrigin = "State of origin is required";
    if (!formData.localGovernment) newErrors.localGovernment = "Local government is required";
    if (!formData.employmentStatus) newErrors.employmentStatus = "Employment status is required";
    if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit using Supabase functions.invoke
      const { data, error } = await supabase.functions.invoke('send-admin-notification', {
        body: {
          firstName: formData.firstName,
          middleName: formData.middleName,
          surname: formData.surname,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          academicQualifications: formData.academicQualifications,
          professionalQualifications: formData.professionalQualifications,
          skillsSet: formData.skillsSet,
          primarySchool: formData.primarySchool,
          secondarySchool: formData.secondarySchool,
          college: formData.college,
          socialGroupMembership: formData.socialGroupMembership,
          relationshipStatus: formData.relationshipStatus,
          stateOfOrigin: formData.stateOfOrigin,
          localGovernment: formData.localGovernment,
          residentialAddress: formData.residentialAddress,
          employmentStatus: formData.employmentStatus,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          socialMediaPages: formData.socialMediaPages,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to submit form');
      }

      console.log('Form submitted successfully:', data);
      
      toast({
        title: "Success!",
        description: "Your information has been submitted successfully and admin has been notified.",
        variant: "default",
      });

      // Clear the form
      setFormData(initialFormData);
      setErrors({});
      
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "There was an error submitting your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-form-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-custom-lg border-0 bg-surface">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold text-foreground">
              Information Collection Form
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Please fill in your details below
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange("firstName")}
                    placeholder="Enter your first name"
                    required
                    error={errors.firstName}
                  />
                  <FormField
                    label="Middle Name"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange("middleName")}
                    placeholder="Enter your middle name"
                  />
                </div>
                <FormField
                  label="Surname"
                  name="surname"
                  value={formData.surname}
                  onChange={handleInputChange("surname")}
                  placeholder="Enter your surname"
                  required
                  error={errors.surname}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Gender"
                    name="gender"
                    type="select"
                    value={formData.gender}
                    onChange={handleInputChange("gender")}
                    placeholder="Select your gender"
                    options={genderOptions}
                    required
                    error={errors.gender}
                  />
                  <FormField
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange("dateOfBirth")}
                    required
                    error={errors.dateOfBirth}
                  />
                </div>
              </div>

              <Separator />

              {/* Education & Skills */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Education & Skills
                </h3>
                <FormField
                  label="Academic Qualifications (including Madrasah)"
                  name="academicQualifications"
                  type="textarea"
                  value={formData.academicQualifications}
                  onChange={handleInputChange("academicQualifications")}
                  placeholder="List your academic qualifications..."
                />
                <FormField
                  label="Professional Qualifications"
                  name="professionalQualifications"
                  type="textarea"
                  value={formData.professionalQualifications}
                  onChange={handleInputChange("professionalQualifications")}
                  placeholder="List your professional qualifications..."
                />
                <FormField
                  label="Skills Set"
                  name="skillsSet"
                  type="textarea"
                  value={formData.skillsSet}
                  onChange={handleInputChange("skillsSet")}
                  placeholder="Describe your skills..."
                />
              </div>

              <Separator />

              {/* Schools Attended */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Schools Attended
                </h3>
                <FormField
                  label="Primary School"
                  name="primarySchool"
                  value={formData.primarySchool}
                  onChange={handleInputChange("primarySchool")}
                  placeholder="Name of primary school attended"
                />
                <FormField
                  label="Secondary School"
                  name="secondarySchool"
                  value={formData.secondarySchool}
                  onChange={handleInputChange("secondarySchool")}
                  placeholder="Name of secondary school attended"
                />
                <FormField
                  label="College/University"
                  name="college"
                  value={formData.college}
                  onChange={handleInputChange("college")}
                  placeholder="Name of college/university attended"
                />
              </div>

              <Separator />

              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Personal Details
                </h3>
                <FormField
                  label="Social Group Membership"
                  name="socialGroupMembership"
                  type="textarea"
                  value={formData.socialGroupMembership}
                  onChange={handleInputChange("socialGroupMembership")}
                  placeholder="List any social groups or organizations you belong to..."
                />
                <FormField
                  label="Relationship Status"
                  name="relationshipStatus"
                  type="select"
                  value={formData.relationshipStatus}
                  onChange={handleInputChange("relationshipStatus")}
                  placeholder="Select your relationship status"
                  options={relationshipOptions}
                  required
                  error={errors.relationshipStatus}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="State of Origin"
                    name="stateOfOrigin"
                    value={formData.stateOfOrigin}
                    onChange={handleInputChange("stateOfOrigin")}
                    placeholder="Enter your state of origin"
                    required
                    error={errors.stateOfOrigin}
                  />
                  <FormField
                    label="Local Government of Origin"
                    name="localGovernment"
                    value={formData.localGovernment}
                    onChange={handleInputChange("localGovernment")}
                    placeholder="Enter your local government"
                    required
                    error={errors.localGovernment}
                  />
                </div>
                <FormField
                  label="Residential Address"
                  name="residentialAddress"
                  type="textarea"
                  value={formData.residentialAddress}
                  onChange={handleInputChange("residentialAddress")}
                  placeholder="Enter your complete residential address"
                />
              </div>

              <Separator />

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Contact Information
                </h3>
                <FormField
                  label="Employment Status"
                  name="employmentStatus"
                  type="select"
                  value={formData.employmentStatus}
                  onChange={handleInputChange("employmentStatus")}
                  placeholder="Select your employment status"
                  options={employmentOptions}
                  required
                  error={errors.employmentStatus}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Phone Number"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleInputChange("phoneNumber")}
                    placeholder="Enter your phone number"
                    required
                    error={errors.phoneNumber}
                  />
                  <FormField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    placeholder="Enter your email address"
                    required
                    error={errors.email}
                  />
                </div>
                <FormField
                  label="Social Media Pages"
                  name="socialMediaPages"
                  type="textarea"
                  value={formData.socialMediaPages}
                  onChange={handleInputChange("socialMediaPages")}
                  placeholder="Enter your social media handles/pages (Facebook, Twitter, LinkedIn, etc.)"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-semibold bg-gradient-primary hover:opacity-90 transition-opacity"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Information"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InformationForm;