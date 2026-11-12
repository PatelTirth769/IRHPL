import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { passService } from '../services/pass.service';
import toast from 'react-hot-toast';
import { AlertCircle, FileText } from 'lucide-react';

const PassApplicationForm = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      passType: '',
      applicantType: 'internal-employee',
      applicantName: '',
      applicantAddress: '',
      hasWorkedAtAirportBefore: false,
      taepDaysConsumedPreviously: 0,
      hasValidPrereqsForForwarding: false
    }
  });

  const passType = watch('passType');
  const hasWorked = watch('hasWorkedAtAirportBefore');
  const taepDays = watch('taepDaysConsumedPreviously');
  const address = watch('applicantAddress');
  const hasPrereqs = watch('hasValidPrereqsForForwarding');
  const applicantType = watch('applicantType');

  const onSubmit = async (data) => {
    try {
      // Client-side validations mapping to server rules
      if (data.passType === 'taep-fresh-30' && data.hasWorkedAtAirportBefore) {
        toast.error('Applicant has worked at airport before. Cannot apply for Fresh TAEP.');
        return;
      }
      if (data.passType === 'taep-forwarding-60' && data.applicantType === 'external-personnel') {
        toast.error('External personnel are only eligible for Fresh TAEP (30 days) and are not eligible for TAEP Forwarding.');
        return;
      }
      if (data.taepDaysConsumedPreviously >= 90 && data.passType !== 'baep') {
        toast.error('Applicant has consumed >= 90 TAEP days. Must apply for BAEP.');
        return;
      }
      if (data.passType === 'taep-forwarding-60' && !data.hasValidPrereqsForForwarding) {
        toast.error('Applicant must have valid AVSEC, C&A, and past TAEP Receiving proof to apply for Forwarding.');
        return;
      }

      await passService.createPass(data);
      toast.success('Pass application submitted successfully!');
      navigate('/dashboard/pass-management');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting application');
    }
  };

  const getDocumentChecklist = () => {
    switch (passType) {
      case '4-hour':
      case '1-3-day':
        return ['2 ID Proofs', 'Passport Photo (White BG)', 'Company ID', 'Official Email (Purpose)', 'Pass Surrender Copy (if TAEP held)'];
      case 'taep-fresh-30':
        return ['Passport + Aadhaar + PAN Card', 'Passport Photo (White BG)', 'C&A Application Proof (Day 1)', 'AVSEC Application Proof (Day 1)'];
      case 'taep-forwarding-60':
        return ['AVSEC Certificate (Valid)', 'C&A Verification (Valid)', 'TAEP Receiving Proof'];
      case 'baep':
        return ['AVSEC Certificate (Complete)', 'C&A Verification (Complete)', 'BAEP/TAEP Receiving Proof'];
      default:
        return [];
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">New Pass Application</h1>
        <p className="text-sm text-gray-500 mt-1">Submit a new airport pass application.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Applicant Name *</label>
              <input 
                {...register('applicantName', { required: 'Name is required' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
                placeholder="Full Name"
              />
              {errors.applicantName && <p className="text-xs text-red-500">{errors.applicantName.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Applicant Type *</label>
              <select 
                {...register('applicantType', { required: true })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
              >
                <option value="internal-employee">Internal Employee</option>
                <option value="external-personnel">External Personnel</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Address *</label>
              <textarea 
                {...register('applicantAddress', { required: 'Address is required' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
                placeholder="Full Address"
                rows="2"
              />
              {address?.toLowerCase().includes('delhi') && (
                <div className="mt-2 flex items-start p-3 bg-blue-50 rounded-lg text-blue-700 text-sm">
                  <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <p>Delhi address detected. The C&A document must be submitted <strong>in-person to BCAS</strong> instead of via postal service.</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Pass Type *</label>
              <select 
                {...register('passType', { required: 'Pass type is required' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
              >
                <option value="">Select Pass Type...</option>
                <option value="4-hour">4-Hour Pass (2 Days TAT)</option>
                <option value="1-3-day">1-3 Day Pass (2-3 Days TAT)</option>
                <option value="taep-fresh-30" disabled={hasWorked}>TAEP Fresh-30 (30 Days)</option>
                <option value="taep-forwarding-60" disabled={taepDays >= 90 || applicantType === 'external-personnel'}>TAEP Forwarding-60 (60 Days)</option>
                <option value="baep">BAEP (35 Days TAT)</option>
              </select>
              {hasWorked && passType === 'taep-fresh-30' && <p className="text-xs text-red-500">Not eligible: has worked at airport before.</p>}
              {taepDays >= 90 && passType === 'taep-forwarding-60' && <p className="text-xs text-red-500">Not eligible: consumed &gt;= 90 TAEP days.</p>}
              {applicantType === 'external-personnel' && passType === 'taep-forwarding-60' && <p className="text-xs text-red-500">Not eligible: External personnel cannot apply for Forwarding.</p>}
            </div>

            <div className="space-y-4 md:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="text-sm font-semibold text-gray-900">Eligibility Questionnaire</h3>
              
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  {...register('hasWorkedAtAirportBefore')}
                  id="hasWorked"
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="hasWorked" className="text-sm text-gray-700">Has the applicant worked at the airport before?</label>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-700 block">If yes, how many TAEP days were consumed previously?</label>
                <input 
                  type="number" 
                  {...register('taepDaysConsumedPreviously', { valueAsNumber: true })}
                  className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900 disabled:bg-slate-100 disabled:text-gray-500"
                  disabled={!hasWorked}
                  min="0"
                />
              </div>

              {passType === 'taep-forwarding-60' && (
                <div className="flex items-start space-x-3 mt-4 pt-4 border-t border-slate-200">
                  <input 
                    type="checkbox" 
                    {...register('hasValidPrereqsForForwarding')}
                    id="hasPrereqs"
                    className="w-4 h-4 mt-0.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="hasPrereqs" className="text-sm text-gray-700">
                    I confirm the applicant possesses a valid AVSEC certificate, valid C&A verification, and valid TAEP Receiving proof from their past company.
                  </label>
                </div>
              )}
            </div>
          </div>

          {passType && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Required Document Checklist
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {getDocumentChecklist().map((item, i) => (
                  <li key={i} className="flex items-center text-sm text-gray-600 bg-slate-50 px-3 py-2 rounded-md border border-slate-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-6 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button 
              type="button"
              onClick={() => navigate('/dashboard/pass-management')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PassApplicationForm;
