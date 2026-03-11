import React from 'react';
import { Settings as SettingsIcon, Save, Bell, Shield, Database, Mail } from 'lucide-react';

const SystemSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Cài đặt hệ thống</h1>
        <p className="text-gray-400">Quản lý cài đặt và cấu hình hệ thống</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        

        {/* Notification Settings */}
        <div className="glass-card rounded-xl p-6 border border-gray-700">
          <div className="flex items-center mb-6">
            <Bell className="w-6 h-6 text-yellow-400 mr-3" />
            <h2 className="text-xl font-bold text-white">Thông báo</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Email thông báo</h3>
                <p className="text-gray-400 text-sm">Gửi email khi có đặt vé mới</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">SMS thông báo</h3>
                <p className="text-gray-400 text-sm">Gửi SMS xác nhận đặt vé</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Push notification</h3>
                <p className="text-gray-400 text-sm">Thông báo đẩy trên ứng dụng</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="glass-card rounded-xl p-6 border border-gray-700">
          <div className="flex items-center mb-6">
            <Shield className="w-6 h-6 text-green-400 mr-3" />
            <h2 className="text-xl font-bold text-white">Bảo mật</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Xác thực 2 bước</h3>
                <p className="text-gray-400 text-sm">Bảo mật tài khoản admin</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Thời gian timeout session (phút)
              </label>
              <input
                type="number"
                defaultValue="30"
                className="w-full px-4 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Số lần đăng nhập sai tối đa
              </label>
              <input
                type="number"
                defaultValue="5"
                className="w-full px-4 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Database Settings */}
        <div className="glass-card rounded-xl p-6 border border-gray-700">
          <div className="flex items-center mb-6">
            <Database className="w-6 h-6 text-purple-400 mr-3" />
            <h2 className="text-xl font-bold text-white">Cơ sở dữ liệu</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Tự động backup</h3>
                <p className="text-gray-400 text-sm">Sao lưu dữ liệu hàng ngày</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Giờ backup hàng ngày
              </label>
              <input
                type="time"
                defaultValue="02:00"
                className="w-full px-4 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              Backup ngay
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg transition-all duration-200">
          <Save className="w-5 h-5 mr-2" />
          Lưu cài đặt
        </button>
      </div>
    </div>
  );
};

export default SystemSettings;