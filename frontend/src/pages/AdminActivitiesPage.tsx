import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboard';

const AdminActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        // For now, reusing the dashboard activities. In a real app, this would be a dedicated endpoint with pagination.
        const dashboardData = await dashboardService.getAdminDashboard();
        setActivities(dashboardData.activities || []);
      } catch (error) {
        console.error("Failed to fetch activities", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActivities();
  }, []);

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] border border-slate-100 p-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Tất cả hoạt động</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {activities.length > 0 ? activities.map((activity, index) => (
            <div key={index} className="flex items-start justify-between group border-b border-slate-50 pb-4 last:border-0">
              <div className="flex items-start gap-4">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activity.user)}&background=random`} alt={activity.user} className="w-12 h-12 rounded-full object-cover shadow-sm border border-slate-100" />
                <div>
                  <p className="text-[14px] text-slate-700 font-medium leading-relaxed">
                    <span className="font-bold text-slate-900">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-[12px] text-slate-400 font-medium mt-1">
                    {new Date(activity.time).toLocaleString('vi-VN')} • {activity.type}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1.5 text-[11px] font-bold rounded-lg uppercase tracking-wider shrink-0 ${activity.statusColor}`}>
                {activity.status}
              </span>
            </div>
          )) : (
            <p className="text-slate-500 text-center py-8">Không có hoạt động nào</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminActivitiesPage;
