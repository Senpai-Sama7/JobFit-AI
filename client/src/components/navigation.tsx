/**
 * JobFit-AI Navigation Bar Component
 * Version: 2025-07-10
 * Maintainer: JobFit-AI Team
 *
 * Notes:
 * - Provides top-level navigation, notifications, and user profile/settings modals.
 */
import { useState } from "react";
import { Bell, FileText, ChevronDown, User, Settings, LogOut, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Activity } from "@shared/schema";

export default function Navigation() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    autoSave: true,
    darkMode: false,
    emailUpdates: true,
  });
  const { toast } = useToast();

  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const recentActivities = activities?.slice(0, 5) || [];
  const unreadCount = recentActivities.length;

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleProfileAction = (action: string) => {
    switch (action) {
      case 'profile':
        setShowProfile(true);
        break;
      case 'settings':
        setShowSettings(true);
        break;
      case 'logout':
        toast({
          title: "Logged Out",
          description: "You have been logged out successfully.",
        });
        break;
    }
  };

  return (
    <>
    <nav className="glass-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/jobfit-ai_1751931220341.png" 
                alt="JobFit AI" 
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="text-xl font-semibold text-grey-900">JobFit AI</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-grey-600 hover:text-grey-900 relative hover:bg-white/20 backdrop-blur-sm rounded-lg"
                  onClick={handleNotificationClick}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 glass-card border-0">
                <div className="p-3 border-b">
                  <h3 className="font-semibold text-grey-900">Recent Activity</h3>
                </div>
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <DropdownMenuItem key={activity.id} className="p-3">
                      <div className="flex flex-col space-y-1">
                        <span className="font-medium text-sm">{activity.title}</span>
                        <span className="text-xs text-grey-600">{activity.description}</span>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-3 text-center text-grey-500 text-sm">
                    No recent activity
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 p-2 hover:bg-white/20 backdrop-blur-sm rounded-lg">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary-100 text-primary-600 text-sm font-medium">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-grey-700 font-medium">John Doe</span>
                  <ChevronDown className="text-grey-400 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card border-0">
                <DropdownMenuItem 
                  onClick={() => handleProfileAction('profile')}
                  className="hover:bg-white/20 cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleProfileAction('settings')}
                  className="hover:bg-white/20 cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleProfileAction('logout')}
                  className="hover:bg-white/20 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>

    {/* Settings Modal */}
    <Dialog open={showSettings} onOpenChange={setShowSettings}>
      <DialogContent className="max-w-2xl glass-card border-0">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-primary-600" />
            <span>Settings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-grey-900 mb-4 flex items-center">
                <Bell className="h-5 w-5 text-primary-600 mr-2" />
                Notifications
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications" className="text-sm font-medium">
                    Push Notifications
                  </Label>
                  <Switch
                    id="notifications"
                    checked={settings.notifications}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, notifications: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-updates" className="text-sm font-medium">
                    Email Updates
                  </Label>
                  <Switch
                    id="email-updates"
                    checked={settings.emailUpdates}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, emailUpdates: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-grey-900 mb-4 flex items-center">
                <Palette className="h-5 w-5 text-primary-600 mr-2" />
                Preferences
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-save" className="text-sm font-medium">
                    Auto-save Changes
                  </Label>
                  <Switch
                    id="auto-save"
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, autoSave: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="dark-mode" className="text-sm font-medium">
                    Dark Mode
                  </Label>
                  <Switch
                    id="dark-mode"
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, darkMode: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-primary-600 text-white hover:bg-primary-700"
              onClick={() => {
                toast({
                  title: "Settings Saved",
                  description: "Your preferences have been updated successfully.",
                });
                setShowSettings(false);
              }}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Profile Modal */}
    <Dialog open={showProfile} onOpenChange={setShowProfile}>
      <DialogContent className="max-w-xl glass-card border-0">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary-600" />
            <span>User Profile</span>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-grey-900">Demo User</h3>
            <p className="text-grey-600">demo@jobfitai.com</p>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-grey-900">Member Since</p>
                <p className="text-grey-600">January 2025</p>
              </div>
              <div>
                <p className="font-medium text-grey-900">Total Resumes</p>
                <p className="text-grey-600">0</p>
              </div>
              <div>
                <p className="font-medium text-grey-900">Avg ATS Score</p>
                <p className="text-grey-600">N/A</p>
              </div>
              <div>
                <p className="font-medium text-grey-900">Plan</p>
                <p className="text-grey-600">Free Trial</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowProfile(false)}>
              Close
            </Button>
            <Button className="bg-primary-600 text-white hover:bg-primary-700">
              Edit Profile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
