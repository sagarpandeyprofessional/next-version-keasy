const uploadImage = async (file, guideTitle, createdAt) => {
    try {
      const fileExt = file.name.split(".").pop();
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      
      // Create folder structure: user_id/guide_title_created_at/timestamp_random.ext
      const sanitizedTitle = guideTitle.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
      const folderName = `${sanitizedTitle}_${createdAt}`;

      const fileName = `${user.id}/${folderName}/${timestamp}_${randomStr}.${fileExt}`;

      console.log('Uploading to path:', fileName);

      const { error: uploadError } = await supabase.storage
        .from('guides')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from('guides')
        .getPublicUrl(fileName);

      if (urlData?.publicUrl) {
        return urlData.publicUrl;
      }
      
      throw new Error('Failed to get public URL');
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };