import React, { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../lib/ToastContext';
import api from '../../api';

const CompanyProfile = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    websiteUrl: '',
    logoUrl: '',
    addressLine1: '',
    city: '',
    country: '',
    subscriptionStatus: '',
  });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await api.get('/company/me');
        const data = response.data;
        
        let addressLine1 = '';
        let city = '';
        let country = '';
        
        if (data.address) {
          try {
            const parsed = JSON.parse(data.address);
            addressLine1 = parsed.addressLine1 || '';
            city = parsed.city || '';
            country = parsed.country || '';
          } catch (e) {
            // Fallback for legacy plain text address
            addressLine1 = data.address;
          }
        }

        setFormData({
          name: data.name || '',
          industry: data.industry || '',
          websiteUrl: data.websiteUrl || '',
          logoUrl: data.logoUrl || '',
          addressLine1,
          city,
          country,
          subscriptionStatus: data.subscriptionStatus || 'Active',
        });
      } catch (error) {
        showToast('Failed to load company profile.', 'danger');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompany();
  }, [showToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const addressJson = JSON.stringify({
        addressLine1: formData.addressLine1,
        city: formData.city,
        country: formData.country
      });

      await api.put('/company/me', {
        name: formData.name,
        industry: formData.industry,
        websiteUrl: formData.websiteUrl,
        logoUrl: formData.logoUrl,
        address: addressJson
      });
      
      showToast('Company profile updated successfully.', 'success');
    } catch (error) {
      showToast('Failed to update company profile.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" className="text-primary-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-h3 font-bold text-secondary-900 dark:text-white flex items-center gap-3">
          Company Profile
          <Badge variant={formData.subscriptionStatus === 'Active' ? 'success' : 'warning'}>
            {formData.subscriptionStatus}
          </Badge>
        </h3>
        <p className="text-secondary-500 dark:text-secondary-400 text-body-sm mt-1">
          Manage your company details and location.
        </p>
      </div>

      <div className="bg-white dark:bg-secondary-800 p-6 rounded-xl border border-secondary-200 dark:border-secondary-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Company Name" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
            <Input 
              label="Industry" 
              name="industry" 
              value={formData.industry} 
              onChange={handleChange} 
            />
            <Input 
              label="Website URL" 
              name="websiteUrl" 
              type="url"
              value={formData.websiteUrl} 
              onChange={handleChange} 
            />
            <Input 
              label="Logo URL" 
              name="logoUrl" 
              type="url"
              value={formData.logoUrl} 
              onChange={handleChange} 
            />
          </div>

          <div className="border-t border-secondary-200 dark:border-secondary-700 pt-6">
            <h4 className="text-body-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-4">Location</h4>
            <div className="space-y-6">
              <Input 
                label="Address Line 1" 
                name="addressLine1" 
                value={formData.addressLine1} 
                onChange={handleChange} 
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  label="City" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleChange} 
                />
                <Input 
                  label="Country" 
                  name="country" 
                  value={formData.country} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button variant="primary" type="submit" isLoading={saving}>
              Save Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyProfile;
