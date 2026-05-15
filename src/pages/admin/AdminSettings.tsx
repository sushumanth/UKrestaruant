import { useEffect, useState } from 'react';
import { Save, Store, Clock, PoundSterling, Bell, Shield } from 'lucide-react';
import { useSettingsStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { updateRestaurantSettings } from '@/frontendapis';

export const AdminSettings = () => {
  const { settings, setSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

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
    setSaveMessage('');
  };

  useEffect(() => {
    if (!settings) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      restaurantName: settings.name,
      address: settings.address,
      phone: settings.phone,
      email: settings.email,
      openingTime: settings.openingTime,
      closingTime: settings.closingTime,
      timeSlotInterval: settings.timeSlotInterval,
      depositAmount: settings.defaultDepositAmount,
      cancellationHours: settings.cancellationDeadlineHours,
      autoReleaseMinutes: settings.autoReleaseMinutes,
    }));
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      if (!settings?.id) {
        setSaveMessage('Settings are not loaded yet.');
        return;
      }

      const updated = await updateRestaurantSettings({
        id: settings.id,
        name: formData.restaurantName,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
        timeSlotInterval: Number(formData.timeSlotInterval),
        defaultDepositAmount: Number(formData.depositAmount),
        cancellationDeadlineHours: Number(formData.cancellationHours),
        autoReleaseMinutes: Number(formData.autoReleaseMinutes),
      });

      setSettings(updated);
      setSaveMessage('Settings saved to backend successfully.');
    } catch (error) {
      console.warn('Failed to save settings:', error);
      setSaveMessage('Unable to save settings. Please check role access and try again.');
    } finally {
      setIsSaving(false);
    }
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
        <h1 className="font-serif text-3xl text-amber-900 mb-2">Settings</h1>
        <p className="text-amber-700/60">Manage your restaurant configuration.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-amber-200/30 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                : 'text-amber-700/60 hover:bg-amber-50 hover:text-amber-700'
            }`}
          >
            <tab.icon size={18} />
            <span className="text-sm">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-amber-200/50 p-8 shadow-lg">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl text-amber-900 mb-6">General Information</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="restaurantName" className="text-amber-700/60 mb-2 block">
                  Restaurant Name
                </Label>
                <Input
                  id="restaurantName"
                  name="restaurantName"
                  value={formData.restaurantName}
                  onChange={handleInputChange}
                  className="border border-amber-200 bg-white text-amber-900 placeholder:text-amber-700/50 px-4 py-2 rounded-lg"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-amber-700/60 mb-2 block">
                  Contact Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="border border-amber-200 bg-white text-amber-900 placeholder:text-amber-700/50 px-4 py-2 rounded-lg"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="address" className="text-amber-700/60 mb-2 block">
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="border border-amber-200 bg-white text-amber-900 placeholder:text-amber-700/50 px-4 py-2 rounded-lg"
                />
              </div>
              
              <div>
                <Label htmlFor="phone" className="text-amber-700/60 mb-2 block">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="border border-amber-200 bg-white text-amber-900 placeholder:text-amber-700/50 px-4 py-2 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Hours & Slots */}
        {activeTab === 'hours' && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl text-amber-900 mb-6">Operating Hours & Time Slots</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="openingTime" className="text-amber-700/60 mb-2 block">
                  Opening Time
                </Label>
                <Input
                  id="openingTime"
                  name="openingTime"
                  type="time"
                  value={formData.openingTime}
                  onChange={handleInputChange}
                  className="border border-amber-200 bg-white text-amber-900 placeholder:text-amber-700/50 px-4 py-2 rounded-lg"
                />
              </div>
              
              <div>
                <Label htmlFor="closingTime" className="text-amber-700/60 mb-2 block">
                  Closing Time
                </Label>
                <Input
                  id="closingTime"
                  name="closingTime"
                  type="time"
                  value={formData.closingTime}
                  onChange={handleInputChange}
                  className="border border-amber-200 bg-white text-amber-900 placeholder:text-amber-700/50 px-4 py-2 rounded-lg"
                />
              </div>
              
              <div>
                <Label htmlFor="timeSlotInterval" className="text-amber-700/60 mb-2 block">
                  Time Slot Interval (minutes)
                </Label>
                <select
                  id="timeSlotInterval"
                  name="timeSlotInterval"
                  value={formData.timeSlotInterval}
                  onChange={handleInputChange}
                  className="border border-amber-200 bg-white text-amber-900 px-4 py-2 rounded-lg w-full"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="autoReleaseMinutes" className="text-amber-700/60 mb-2 block">
                  Auto-release Table (minutes after no-show)
                </Label>
                <Input
                  id="autoReleaseMinutes"
                  name="autoReleaseMinutes"
                  type="number"
                  value={formData.autoReleaseMinutes}
                  onChange={handleInputChange}
                  className="border border-amber-200 bg-white text-amber-900 placeholder:text-amber-700/50 px-4 py-2 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Payments */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl text-amber-900 mb-6">Payment Settings</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="depositAmount" className="text-amber-700/60 mb-2 block">
                  Default Deposit Amount (£)
                </Label>
                <Input
                  id="depositAmount"
                  name="depositAmount"
                  type="number"
                  min={0}
                  value={formData.depositAmount}
                  onChange={handleInputChange}
                  className="border border-amber-200 bg-white text-amber-900 placeholder:text-amber-700/50 px-4 py-2 rounded-lg"
                />
              </div>
              
              <div>
                <Label htmlFor="cancellationHours" className="text-amber-700/60 mb-2 block">
                  Cancellation Deadline (hours before)
                </Label>
                <Input
                  id="cancellationHours"
                  name="cancellationHours"
                  type="number"
                  min={0}
                  value={formData.cancellationHours}
                  onChange={handleInputChange}
                  className="border border-amber-200 bg-white text-amber-900 placeholder:text-amber-700/50 px-4 py-2 rounded-lg"
                />
              </div>
            </div>
            
            <div className="p-4 bg-amber-100 border border-amber-200 rounded-lg">
              <p className="text-amber-900 font-medium mb-2">Stripe Integration</p>
              <p className="text-amber-700/60 text-sm">
                Connected to Stripe account. Deposits are processed automatically.
              </p>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl text-amber-900 mb-6">Notification Preferences</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-amber-200/30 rounded-lg">
                <div>
                  <p className="text-amber-900 font-medium">Email Notifications</p>
                  <p className="text-amber-700/60 text-sm">Send booking confirmations and reminders via email</p>
                </div>
                <Switch
                  checked={formData.emailNotifications}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, emailNotifications: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border border-amber-200/30 rounded-lg">
                <div>
                  <p className="text-amber-900 font-medium">SMS Notifications</p>
                  <p className="text-amber-700/60 text-sm">Send booking reminders via SMS</p>
                </div>
                <Switch
                  checked={formData.smsNotifications}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, smsNotifications: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border border-amber-200/30 rounded-lg">
                <div>
                  <p className="text-amber-900 font-medium">Auto-confirm Bookings</p>
                  <p className="text-amber-700/60 text-sm">Automatically confirm bookings after payment</p>
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
            <h3 className="font-serif text-xl text-amber-900 mb-6">Security Settings</h3>
            
            <div className="space-y-4">
              <div className="p-4 border border-amber-200/30 rounded-lg">
                <p className="text-amber-900 font-medium mb-2">Change Password</p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <Input
                    type="password"
                    placeholder="Current password"
                    className="border border-amber-200 bg-white text-amber-900 placeholder:text-amber-700/50 px-4 py-2 rounded-lg"
                  />
                  <Input
                    type="password"
                    placeholder="New password"
                    className="border border-amber-200 bg-white text-amber-900 placeholder:text-amber-700/50 px-4 py-2 rounded-lg"
                  />
                </div>
                <Button className="bg-amber-700 hover:bg-amber-800 text-white mt-4">Update Password</Button>
              </div>
              
              <div className="p-4 border border-amber-200/30 rounded-lg">
                <p className="text-amber-900 font-medium mb-2">Two-Factor Authentication</p>
                <p className="text-amber-700/60 text-sm mb-4">
                  Add an extra layer of security to your account
                </p>
                <Button className="border border-amber-700 text-amber-700 hover:bg-amber-50">Enable 2FA</Button>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-amber-200/30 flex justify-end">
          {saveMessage && (
            <p className="mr-auto self-center text-sm text-amber-700/60">{saveMessage}</p>
          )}
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-amber-700 hover:bg-amber-800 text-white flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
