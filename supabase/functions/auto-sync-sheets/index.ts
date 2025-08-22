import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { formData, googleSheetsUrl } = await req.json()

    if (!googleSheetsUrl) {
      return new Response(
        JSON.stringify({ error: 'Google Sheets URL not configured' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Send data to Google Sheets
    const response = await fetch(googleSheetsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        submission: {
          id: crypto.randomUUID(),
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
          submittedAt: new Date().toISOString()
        }
      })
    })

    console.log('Google Sheets sync response:', response.status)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Data synced to Google Sheets successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Auto sync error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to sync to Google Sheets',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})