import React, { useState } from 'react';
import { QrCode, Upload } from 'lucide-react';
import type { RoomFormData } from '../../types/room-creation';
import { supabase } from '../../lib/supabase';

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

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('qr-codes')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('qr-codes')
        .getPublicUrl(fileName);

      onChange({
        paymentDetails: {
          ...data.paymentDetails,
          qrImage: publicUrl
        }
      });
    } catch (error) {
      console.error('Error uploading QR:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleUPIChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const upiId = e.target.value;
    // Basic UPI ID validation
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    const isValid = upiRegex.test(upiId);

    onChange({
      paymentDetails: {
        ...data.paymentDetails,
        upiId,
        isValid
      }
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          UPI ID
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <input
            type="text"
            value={data.paymentDetails?.upiId || ''}
            onChange={handleUPIChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="yourname@upi"
          />
          {data.paymentDetails?.upiId && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {data.paymentDetails.isValid ? (
                <span className="text-green-500">✓</span>
              ) : (
                <span className="text-red-500">✗</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          QR Code Image
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
          {data.paymentDetails?.qrImage ? (
            <div className="relative w-48 h-48 mx-auto">
              <img
                src={data.paymentDetails.qrImage}
                alt="Payment QR"
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => onChange({
                  paymentDetails: {
                    ...data.paymentDetails,
                    qrImage: ''
                  }
                })}
                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="space-y-1 text-center">
              {uploading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              ) : (
                <>
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload QR code</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleQRUpload}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}