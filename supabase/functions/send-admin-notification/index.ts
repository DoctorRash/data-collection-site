import { serve } from "https://deno.land/std/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

// For Deno, ensure you run with --allow-env, otherwise for Node.js use process.env
const resend = new Resend(
  typeof Deno !== "undefined"
    ? Deno.env.get("RESEND_API_KEY")
    : process.env.RESEND_API_KEY
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FormSubmissionRequest {
  firstName: string;
  middleName?: string;
  surname: string;
  gender: string;
  dateOfBirth: string;
  academicQualifications?: string;
  professionalQualifications?: string;
  skillsSet?: string;
  primarySchool?: string;
  secondarySchool?: string;
  college?: string;
  socialGroupMembership?: string;
  relationshipStatus: string;
  stateOfOrigin: string;
  localGovernment: string;
  residentialAddress?: string;
  employmentStatus: string;
  phoneNumber: string;
  email: string;
  socialMediaPages?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData: FormSubmissionRequest = await req.json();
    
    console.log("Received form submission:", formData);

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Insert form submission into database
    const { data: submission, error: dbError } = await supabase
      .from('form_submissions')
      .insert({
        first_name: formData.firstName,
        middle_name: formData.middleName || null,
        surname: formData.surname,
        gender: formData.gender,
        date_of_birth: formData.dateOfBirth,
        academic_qualifications: formData.academicQualifications || null,
        professional_qualifications: formData.professionalQualifications || null,
        skills_set: formData.skillsSet || null,
        primary_school: formData.primarySchool || null,
        secondary_school: formData.secondarySchool || null,
        college: formData.college || null,
        social_group_membership: formData.socialGroupMembership || null,
        relationship_status: formData.relationshipStatus,
        state_of_origin: formData.stateOfOrigin,
        local_government: formData.localGovernment,
        residential_address: formData.residentialAddress || null,
        employment_status: formData.employmentStatus,
        phone_number: formData.phoneNumber,
        email: formData.email,
        social_media_pages: formData.socialMediaPages || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error(`Failed to save form submission: ${dbError.message}`);
    }

    console.log("Form submission saved to database:", submission);

    // Auto-sync to Google Sheets if URL is configured
    try {
      const googleSheetsUrl = Deno.env.get('GOOGLE_SHEETS_URL');
      if (googleSheetsUrl) {
        console.log('Auto-syncing to Google Sheets...');
        
        const syncResponse = await fetch(googleSheetsUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            submission: {
              id: submission.id,
              firstName: formData.firstName,
              middleName: formData.middleName || '',
              surname: formData.surname,
              gender: formData.gender,
              dateOfBirth: formData.dateOfBirth,
              email: formData.email,
              phoneNumber: formData.phoneNumber,
              employmentStatus: formData.employmentStatus,
              stateOfOrigin: formData.stateOfOrigin,
              academicQualifications: formData.academicQualifications || '',
              professionalQualifications: formData.professionalQualifications || '',
              skillsSet: formData.skillsSet || '',
              primarySchool: formData.primarySchool || '',
              secondarySchool: formData.secondarySchool || '',
              college: formData.college || '',
              socialGroupMembership: formData.socialGroupMembership || '',
              relationshipStatus: formData.relationshipStatus,
              localGovernment: formData.localGovernment,
              residentialAddress: formData.residentialAddress || '',
              socialMediaPages: formData.socialMediaPages || '',
              submittedAt: submission.created_at
            }
          })
        });
        
        if (syncResponse.ok) {
          console.log('Google Sheets sync successful');
        } else {
          console.log('Google Sheets sync failed:', await syncResponse.text());
        }
      }
    } catch (syncError) {
      console.error('Google Sheets sync error (non-blocking):', syncError);
      // Don't fail the main request if Google Sheets sync fails
    }

    // Send email notification to admin
    const emailResponse = await resend.emails.send({
      from: "Form Notifications <onboarding@resend.dev>",
      to: ["rasheedahdada@gmail.com"], // Replace with actual admin email
      subject: "New Form Submission Received",
      html: `
        <h2>New Form Submission</h2>
        <p>A new form submission has been received with the following details:</p>
        
        <h3>Personal Information</h3>
        <ul>
          <li><strong>Name:</strong> ${formData.firstName} ${formData.middleName || ''} ${formData.surname}</li>
          <li><strong>Gender:</strong> ${formData.gender}</li>
          <li><strong>Date of Birth:</strong> ${formData.dateOfBirth}</li>
          <li><strong>Email:</strong> ${formData.email}</li>
          <li><strong>Phone:</strong> ${formData.phoneNumber}</li>
        </ul>

        <h3>Location Information</h3>
        <ul>
          <li><strong>State of Origin:</strong> ${formData.stateOfOrigin}</li>
          <li><strong>Local Government:</strong> ${formData.localGovernment}</li>
          <li><strong>Residential Address:</strong> ${formData.residentialAddress || 'Not provided'}</li>
        </ul>

        <h3>Employment & Education</h3>
        <ul>
          <li><strong>Employment Status:</strong> ${formData.employmentStatus}</li>
          <li><strong>Relationship Status:</strong> ${formData.relationshipStatus}</li>
          <li><strong>Academic Qualifications:</strong> ${formData.academicQualifications || 'Not provided'}</li>
          <li><strong>Professional Qualifications:</strong> ${formData.professionalQualifications || 'Not provided'}</li>
          <li><strong>Skills:</strong> ${formData.skillsSet || 'Not provided'}</li>
        </ul>

        <h3>Schools Attended</h3>
        <ul>
          <li><strong>Primary School:</strong> ${formData.primarySchool || 'Not provided'}</li>
          <li><strong>Secondary School:</strong> ${formData.secondarySchool || 'Not provided'}</li>
          <li><strong>College/University:</strong> ${formData.college || 'Not provided'}</li>
        </ul>

        <p><strong>Submission ID:</strong> ${submission.id}</p>
        <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      submissionId: submission.id,
      emailResponse 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-admin-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);