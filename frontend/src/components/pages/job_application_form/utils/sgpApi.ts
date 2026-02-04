// src/pages/job_application_form/utils/sgpApi.js
import { supabase } from '@/lib/supabase/client';

export const saveApplication = async (formData: any, contacts: any, userId: string | null = null) => {
  try {
    const { data, error } = await supabase
      .from('sgp_applications')
      .insert({
        user_id: userId,
        name: formData.name,
        gender: formData.gender,
        birth_year: formData.birthYear,
        birth_month: formData.birthMonth,
        birth_day: formData.birthDay,
        grade: formData.grade,
        day_night: formData.dayNight,
        student_id: formData.studentId,
        nationality: formData.nationality,
        major: formData.major,
        address: formData.address,
        phone: contacts.phone,
        email: contacts.email,
        form_data: formData,
        status: 'processing'
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error saving application:', error);
    return { data: null, error };
  }
};

export const saveSNSContacts = async (applicationId: string, contacts: any) => {
  try {
    const { data, error } = await supabase
      .from('sgp_sns_contacts')
      .insert({
        application_id: applicationId,
        email: contacts.email,
        phone: contacts.phone,
        whatsapp: contacts.whatsapp || null,
        instagram: contacts.instagram || null,
        facebook: contacts.facebook || null,
        tiktok: contacts.tiktok || null,
        kakaotalk: contacts.kakaotalk || null
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error saving SNS contacts:', error);
    return { data: null, error };
  }
};

export const updateApplicationStatus = async (
  applicationId: string,
  status: string,
  additionalData: Record<string, unknown> = {}
) => {
  try {
    const updateData: Record<string, unknown> = {
      status,
      ...additionalData
    };

    if (status === 'printed') {
      updateData.printed_at = new Date().toISOString();
    } else if (status === 'downloaded') {
      updateData.downloaded_at = new Date().toISOString();
    } else if (status === 'submitted') {
      updateData.submitted_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('sgp_applications')
      .update(updateData)
      .eq('id', applicationId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating application status:', error);
    return { data: null, error };
  }
};

export const getLatestApplication = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('sgp_applications')
      .select(`
        *,
        sgp_sns_contacts (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching latest application:', error);
    return { data: null, error };
  }
};

export const generatePDF = async (applicationId: string, formData: any, contacts: any) => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-sgp-pdf', {
      body: { 
        applicationId, 
        formData, 
        contacts 
      }
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { data: null, error };
  }
};

export const sendApplicationEmail = async (applicationId: string, formData: any, contacts: any) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-sgp-application', {
      body: { 
        applicationId, 
        formData, 
        contacts 
      }
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error sending application email:', error);
    return { data: null, error };
  }
};

export const uploadPDF = async (applicationId: string, pdfBlob: Blob, userId: string | null) => {
  try {
    const fileName = `${applicationId}/resume.pdf`;
    const filePath = userId ? `${userId}/${fileName}` : fileName;

    const { data, error } = await supabase.storage
      .from('sgp-applications')
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('sgp-applications')
      .getPublicUrl(filePath);

    return { data: { ...data, publicUrl: urlData.publicUrl }, error: null };
  } catch (error) {
    console.error('Error uploading PDF:', error);
    return { data: null, error };
  }
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const openPDFForPrint = (blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
      printWindow.onafterprint = () => {
        URL.revokeObjectURL(url);
      };
    };
  } else {
    alert('Please allow popups to print the PDF');
    URL.revokeObjectURL(url);
  }
};
