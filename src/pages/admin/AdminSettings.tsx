import { useState } from 'react';
import { Save, Store, Clock, PoundSterling, Bell, Shield } from 'lucide-react';
import { useSettingsStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export const AdminSettings = () => {
  const { settings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    restaurantName: settings?.name || 'LuxeReserve',
    address: settings?.address || '12 Royal Exchange, Manchester M2 7EA',
    phone: settings?.phone || '+44 (0)161 123 4567',
    email: settings?.email || 'hello@luxereserve.co',
    openingTime: settings?.openingTime || '17:00',
    closingTime: settings?.closingTime || '23:00',
    timeSlotInterval: settings?.timeSlotInterval || 30,
    depositAmount: settings?.defaultDepositAmount || 5,
    cancellationHours: settings?.cancellationDeadlineHours || 24,
    autoReleaseMinutes: settings?.autoReleaseMinutes || 15,
    emailNotifications: true,
    smsNotifications: false,
    autoConfirm: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Store },
    { id: 'hours', label: 'Hours & Slots', icon: Clock },
    { id: 'payments', label: 'Payments', icon: PoundSterling },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-[#F4F6FA] mb-2">Settings</h1>
        <p className="text-[#A9B1BE]">Manage your restaurant configuration.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[rgba(244,246,250,0.08)] pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-[#D4A23A]/20 text-[#D4A23A]'
                : 'text-[#A9B1BE] hover:bg-[rgba(244,246,250,0.05)] hover:text-[#F4F6FA]'
            }`}
          >
            <tab.icon size={18} />
            <span className="text-sm">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="glass-card p-8">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl text-[#F4F6FA] mb-6">General Information</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="restaurantName" className="text-[#A9B1BE] mb-2 block">
                  Restaurant Name
                </Label>
                <Input
                  id="restaurantName"
                  name="restaurantName"
                  value={formData.restaurantName}
                  onChange={handleInputChange}
                  className="input-luxury"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-[#A9B1BE] mb-2 block">
                  Contact Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-luxury"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="address" className="text-[#A9B1BE] mb-2 block">
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="input-luxury"
                />
              </div>
              
              <div>
                <Label htmlFor="phone" className="text-[#A9B1BE] mb-2 block">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input-luxury"
                />
              </div>
            </div>
          </div>
        )}

        {/* Hours & Slots */}
        {activeTab === 'hours' && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl text-[#F4F6FA] mb-6">Operating Hours & Time Slots</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="openingTime" className="text-[#A9B1BE] mb-2 block">
                  Opening Time
                </Label>
                <Input
                  id="openingTime"
                  name="openingTime"
                  type="time"
                  value={formData.openingTime}
                  onChange={handleInputChange}
                  className="input-luxury"
                />
              </div>
              
              <div>
                <Label htmlFor="closingTime" className="text-[#A9B1BE] mb-2 block">
                  Closing Time
                </Label>
                <Input
                  id="closingTime"
                  name="closingTime"
                  type="time"
                  value={formData.closingTime}
                  onChange={handleInputChange}
                  className="input-luxury"
                />
              </div>
              
              <div>
                <Label htmlFor="timeSlotInterval" className="text-[#A9B1BE] mb-2 block">
                  Time Slot Interval (minutes)
                </Label>
                <select
                  id="timeSlotInterval"
                  name="timeSlotInterval"
                  value={formData.timeSlotInterval}
                  onChange={handleInputChange}
                  className="input-luxury w-full"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="autoReleaseMinutes" className="text-[#A9B1BE] mb-2 block">
                  Auto-release Table (minutes after no-show)
                </Label>
                <Input
                  id="autoReleaseMinutes"
                  name="autoReleaseMinutes"
                  type="number"
                  value={formData.autoReleaseMinutes}
                  onChange={handleInputChange}
                  className="input-luxury"
                />
              </div>
            </div>
          </div>
        )}

        {/* Payments */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl text-[#F4F6FA] mb-6">Payment Settings</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="depositAmount" className="text-[#A9B1BE] mb-2 block">
                  Default Deposit Amount (£)
                </Label>
                <Input
                  id="depositAmount"
                  name="depositAmount"
                  type="number"
                  min={0}
                  value={formData.depositAmount}
                  onChange={handleInputChange}
                  className="input-luxury"
                />
              </div>
              
              <div>
                <Label htmlFor="cancellationHours" className="text-[#A9B1BE] mb-2 block">
                  Cancellation Deadline (hours before)
                </Label>
                <Input
                  id="cancellationHours"
                  name="cancellationHours"
                  type="number"
                  min={0}
                  value={formData.cancellationHours}
                  onChange={handleInputChange}
                  className="input-luxury"
                />
              </div>
            </div>
            
            <div className="p-4 bg-[#D4A23A]/10 border border-[#D4A23A]/20 rounded-lg">
              <p className="text-[#F4F6FA] font-medium mb-2">Stripe Integration</p>
              <p className="text-[#A9B1BE] text-sm">
                Connected to Stripe account. Deposits are processed automatically.
              </p>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl text-[#F4F6FA] mb-6">Notification Preferences</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-[rgba(244,246,250,0.08)] rounded-lg">
                <div>
                  <p className="text-[#F4F6FA] font-medium">Email Notifications</p>
                  <p className="text-[#A9B1BE] text-sm">Send booking confirmations and reminders via email</p>
                </div>
                <Switch
                  checked={formData.emailNotifications}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, emailNotifications: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border border-[rgba(244,246,250,0.08)] rounded-lg">
                <div>
                  <p className="text-[#F4F6FA] font-medium">SMS Notifications</p>
                  <p className="text-[#A9B1BE] text-sm">Send booking reminders via SMS</p>
                </div>
                <Switch
                  checked={formData.smsNotifications}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, smsNotifications: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border border-[rgba(244,246,250,0.08)] rounded-lg">
                <div>
                  <p className="text-[#F4F6FA] font-medium">Auto-confirm Bookings</p>
                  <p className="text-[#A9B1BE] text-sm">Automatically confirm bookings after payment</p>
                </div>
                <Switch
                  checked={formData.autoConfirm}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, autoConfirm: checked }))
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Security */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl text-[#F4F6FA] mb-6">Security Settings</h3>
            
            <div className="space-y-4">
              <div className="p-4 border border-[rgba(244,246,250,0.08)] rounded-lg">
                <p className="text-[#F4F6FA] font-medium mb-2">Change Password</p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <Input
                    type="password"
                    placeholder="Current password"
                    className="input-luxury"
                  />
                  <Input
                    type="password"
                    placeholder="New password"
                    className="input-luxury"
                  />
                </div>
                <Button className="btn-gold mt-4">Update Password</Button>
              </div>
              
              <div className="p-4 border border-[rgba(244,246,250,0.08)] rounded-lg">
                <p className="text-[#F4F6FA] font-medium mb-2">Two-Factor Authentication</p>
                <p className="text-[#A9B1BE] text-sm mb-4">
                  Add an extra layer of security to your account
                </p>
                <Button className="btn-gold-outline">Enable 2FA</Button>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-[rgba(244,246,250,0.08)] flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="btn-gold flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-[#0B0C0F] border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
