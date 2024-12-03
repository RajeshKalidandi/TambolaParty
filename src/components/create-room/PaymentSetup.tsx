import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import type { RoomFormData } from '../../types/room-creation';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { PaymentDetails } from '../../types/payment';

interface PaymentSetupProps {
  data: RoomFormData;
  onChange: (data: Partial<RoomFormData>) => void;
}

export default function PaymentSetup({ data, onChange }: PaymentSetupProps) {
  const [uploading, setUploading] = useState(false);

  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      // File validations
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (PNG or JPG)');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size should be less than 2MB');
        return;
      }

      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('Not authenticated');
      }

      // Create unique filename
      const timestamp = new Date().getTime();
      const randomString = Math.random().toString(36).substring(7);
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
      const fileName = `${userData.user.id}/qr_${timestamp}_${randomString}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('payment-qr-codes')
        .upload(fileName, file, {
          contentType: `image/${fileExt}`,
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('payment-qr-codes')
        .getPublicUrl(fileName);

      if (!urlData.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      // Save to database
      const { error: dbError } = await supabase
        .from('payment_qr_codes')
        .insert({
          user_id: userData.user.id,
          qr_image_url: urlData.publicUrl,
          upi_id: data.paymentDetails?.upiId || ''
        });

      if (dbError) throw dbError;

      // Update form
      onChange({
        paymentDetails: {
          ...data.paymentDetails,
          qrImage: urlData.publicUrl,
          isValid: Boolean(data.paymentDetails?.upiId?.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/))
        }
      });

      toast.success('QR code uploaded successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload QR code');
    } finally {
      setUploading(false);
    }
  };

  const handleUPIChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const upiId = e.target.value;
    const isValid = Boolean(upiId.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/));
    
    onChange({
      paymentDetails: {
        ...data.paymentDetails,
        upiId,
        isValid
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="upiId" className="block text-sm font-medium text-gray-700">
          UPI ID
        </label>
        <input
          type="text"
          id="upiId"
          value={data.paymentDetails?.upiId || ''}
          onChange={handleUPIChange}
          placeholder="example@upi"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Payment QR Code</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            {data.paymentDetails?.qrImage ? (
              <div className="relative">
                <img
                  src={data.paymentDetails.qrImage}
                  alt="Payment QR Code"
                  className="mx-auto h-32 w-32 object-cover"
                />
                <button
                  onClick={() => document.getElementById('qr-upload')?.click()}
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Change QR Code
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="qr-upload"
                    className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Upload QR Code</span>
                    <input
                      id="qr-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleQRUpload}
                      accept="image/*"
                      disabled={uploading}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}