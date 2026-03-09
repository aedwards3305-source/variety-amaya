"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface BeforeAfterVideo {
  before: string;
  after: string;
}

interface BeforeAfterPhoto {
  before: string;
  after: string | string[];
}

interface ServiceData {
  name: string;
  image: string;
  description: string;
  workPhotos: string[];
  workVideos: string[];
  orderedMedia?: string[];
  beforeAfterVideos?: BeforeAfterVideo[];
  beforeAfterPhotos?: BeforeAfterPhoto[];
}

function isVideoFile(path: string): boolean {
  return /\.(mp4|webm|mov)$/i.test(path);
}

function getFileName(path: string): string {
  return path.split("/").pop() || path;
}

export default function AdminPage() {
  // Auth
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Data
  const [services, setServices] = useState<Record<string, ServiceData>>({});
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [editData, setEditData] = useState<ServiceData | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // UI
  const [activeTab, setActiveTab] = useState<"gallery" | "beforeAfter">("gallery");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const baBeforeInputRef = useRef<HTMLInputElement>(null);
  const baAfterInputRef = useRef<HTMLInputElement>(null);
  const [pendingBAPair, setPendingBAPair] = useState<{
    before: string | null;
    afterList: string[];
  } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const authHeaders = useCallback(() => {
    const saved = sessionStorage.getItem("adminPwd");
    return { "x-admin-password": saved || password };
  }, [password]);

  const fetchServices = useCallback(async (pwd?: string) => {
    try {
      const res = await fetch("/api/admin/services", {
        headers: { "x-admin-password": pwd || sessionStorage.getItem("adminPwd") || password },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setServices(data);
    } catch {
      showToast("Failed to load services", "error");
    }
  }, [password, showToast]);

  useEffect(() => {
    const saved = sessionStorage.getItem("adminPwd");
    if (saved) {
      setPassword(saved);
      setIsLoggedIn(true);
      fetchServices(saved);
    }
  }, [fetchServices]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        sessionStorage.setItem("adminPwd", password);
        setIsLoggedIn(true);
        fetchServices(password);
      } else {
        const data = await res.json();
        setLoginError(data.error || "Invalid password");
      }
    } catch {
      setLoginError("Connection error. Make sure the dev server is running.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminPwd");
    setIsLoggedIn(false);
    setPassword("");
    setServices({});
    setSelectedSlug(null);
    setEditData(null);
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to change password");
      }
      sessionStorage.setItem("adminPwd", newPassword);
      setPassword(newPassword);
      setShowPasswordModal(false);
      setNewPassword("");
      setConfirmPassword("");
      showToast("Password changed successfully", "success");
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const selectService = (slug: string) => {
    if (hasChanges) {
      if (!confirm("You have unsaved changes. Discard them?")) return;
    }
    setSelectedSlug(slug);
    setEditData(JSON.parse(JSON.stringify(services[slug])));
    setHasChanges(false);
    setActiveTab("gallery");
    setPendingBAPair(null);
  };

  const handleSave = async () => {
    if (!selectedSlug || !editData) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/services", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ slug: selectedSlug, data: editData }),
      });
      if (!res.ok) throw new Error("Save failed");
      setServices((prev) => ({ ...prev, [selectedSlug]: JSON.parse(JSON.stringify(editData)) }));
      setHasChanges(false);
      showToast("Changes saved successfully!", "success");
    } catch {
      showToast("Failed to save changes", "error");
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!selectedSlug) return null;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("slug", selectedSlug);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }
      const data = await res.json();
      showToast(`Uploaded ${file.name}`, "success");
      return data.path;
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed", "error");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !editData) return;
    const files = Array.from(e.target.files);
    for (const file of files) {
      const filePath = await uploadFile(file);
      if (filePath) {
        setEditData((prev) => {
          if (!prev) return prev;
          const updated = { ...prev };
          if (updated.orderedMedia) {
            updated.orderedMedia = [...updated.orderedMedia, filePath];
          } else if (isVideoFile(filePath)) {
            updated.workVideos = [...updated.workVideos, filePath];
          } else {
            updated.workPhotos = [...updated.workPhotos, filePath];
          }
          return updated;
        });
        setHasChanges(true);
      }
    }
    e.target.value = "";
  };

  const handleDeleteGalleryItem = async (path: string) => {
    if (!editData || !confirm(`Delete ${getFileName(path)}?`)) return;
    await fetch("/api/admin/delete-media", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ filePath: path }),
    });
    setEditData((prev) => {
      if (!prev) return prev;
      const updated = { ...prev };
      updated.workPhotos = updated.workPhotos.filter((p) => p !== path);
      updated.workVideos = updated.workVideos.filter((v) => v !== path);
      if (updated.orderedMedia) {
        updated.orderedMedia = updated.orderedMedia.filter((m) => m !== path);
      }
      return updated;
    });
    setHasChanges(true);
    showToast("Media deleted", "success");
  };

  const moveGalleryItem = (path: string, direction: "up" | "down") => {
    if (!editData) return;
    setEditData((prev) => {
      if (!prev) return prev;
      const updated = { ...prev };
      const moveInArray = (arr: string[]) => {
        const idx = arr.indexOf(path);
        if (idx === -1) return arr;
        const newArr = [...arr];
        const targetIdx = direction === "up" ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= arr.length) return arr;
        [newArr[idx], newArr[targetIdx]] = [newArr[targetIdx], newArr[idx]];
        return newArr;
      };
      if (updated.orderedMedia && updated.orderedMedia.includes(path)) {
        updated.orderedMedia = moveInArray(updated.orderedMedia);
      } else if (updated.workPhotos.includes(path)) {
        updated.workPhotos = moveInArray(updated.workPhotos);
      } else if (updated.workVideos.includes(path)) {
        updated.workVideos = moveInArray(updated.workVideos);
      }
      return updated;
    });
    setHasChanges(true);
  };

  const handleBABeforeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const filePath = await uploadFile(e.target.files[0]);
    if (filePath) {
      setPendingBAPair((prev) => ({
        before: filePath,
        afterList: prev?.afterList || [],
      }));
    }
    e.target.value = "";
  };

  const handleBAAfterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    for (const file of files) {
      const filePath = await uploadFile(file);
      if (filePath) {
        setPendingBAPair((prev) => ({
          before: prev?.before || null,
          afterList: [...(prev?.afterList || []), filePath],
        }));
      }
    }
    e.target.value = "";
  };

  const saveBAPair = () => {
    if (!editData || !pendingBAPair?.before || pendingBAPair.afterList.length === 0) return;
    setEditData((prev) => {
      if (!prev) return prev;
      const updated = { ...prev };
      const isVideo = isVideoFile(pendingBAPair.before!);
      if (isVideo) {
        const pair: BeforeAfterVideo = {
          before: pendingBAPair.before!,
          after: pendingBAPair.afterList[0],
        };
        updated.beforeAfterVideos = [...(updated.beforeAfterVideos || []), pair];
      } else {
        const pair: BeforeAfterPhoto = {
          before: pendingBAPair.before!,
          after: pendingBAPair.afterList.length === 1 ? pendingBAPair.afterList[0] : pendingBAPair.afterList,
        };
        updated.beforeAfterPhotos = [...(updated.beforeAfterPhotos || []), pair];
      }
      return updated;
    });
    setPendingBAPair(null);
    setHasChanges(true);
    showToast("Before & After pair added", "success");
  };

  const deletePhotoBAPair = (index: number) => {
    if (!editData || !confirm("Delete this Before & After pair?")) return;
    setEditData((prev) => {
      if (!prev) return prev;
      const updated = { ...prev };
      updated.beforeAfterPhotos = (updated.beforeAfterPhotos || []).filter((_, i) => i !== index);
      if (updated.beforeAfterPhotos.length === 0) delete updated.beforeAfterPhotos;
      return updated;
    });
    setHasChanges(true);
  };

  const deleteVideoBAPair = (index: number) => {
    if (!editData || !confirm("Delete this Before & After pair?")) return;
    setEditData((prev) => {
      if (!prev) return prev;
      const updated = { ...prev };
      updated.beforeAfterVideos = (updated.beforeAfterVideos || []).filter((_, i) => i !== index);
      if (updated.beforeAfterVideos.length === 0) delete updated.beforeAfterVideos;
      return updated;
    });
    setHasChanges(true);
  };

  const enableOrderedMedia = () => {
    if (!editData) return;
    setEditData((prev) => {
      if (!prev) return prev;
      const allMedia = [...prev.workPhotos, ...prev.workVideos];
      return { ...prev, orderedMedia: allMedia, workPhotos: [], workVideos: [] };
    });
    setHasChanges(true);
  };

  const disableOrderedMedia = () => {
    if (!editData || !editData.orderedMedia) return;
    setEditData((prev) => {
      if (!prev || !prev.orderedMedia) return prev;
      const photos: string[] = [];
      const videos: string[] = [];
      for (const m of prev.orderedMedia) {
        if (isVideoFile(m)) videos.push(m);
        else photos.push(m);
      }
      const updated = { ...prev, workPhotos: photos, workVideos: videos };
      delete updated.orderedMedia;
      return updated;
    });
    setHasChanges(true);
  };

  // Get all gallery items for display
  const getGalleryItems = (): string[] => {
    if (!editData) return [];
    if (editData.orderedMedia) return editData.orderedMedia;
    return [...editData.workVideos, ...editData.workPhotos];
  };

  const getMediaCount = (data: ServiceData): number => {
    let count = data.workPhotos.length + data.workVideos.length;
    if (data.orderedMedia) count += data.orderedMedia.length;
    if (data.beforeAfterPhotos) count += data.beforeAfterPhotos.length;
    if (data.beforeAfterVideos) count += data.beforeAfterVideos.length;
    return count;
  };

  const filteredServices = Object.entries(services).filter(([, data]) =>
    data.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ──── LOGIN SCREEN ────
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <Image src="/va-logo.png" alt="Variety Amaya" fill className="object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-gray-500 mt-1">Manage your service media</p>
          </div>
          <form onSubmit={handleLogin} className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none"
              placeholder="Enter admin password"
              autoFocus
            />
            {loginError && (
              <p className="text-red-400 text-sm mt-2">{loginError}</p>
            )}
            <button
              type="submit"
              className="w-full mt-4 bg-[#D4AF37] hover:bg-[#B8960C] text-black font-semibold py-3 rounded-lg transition-colors"
            >
              Log In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ──── MAIN ADMIN PANEL ────
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-lg shadow-xl text-sm font-medium transition-all ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-gray-800 h-16 flex items-center px-4 lg:px-6">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden mr-3 text-gray-400 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <Image src="/va-logo.png" alt="VA" fill className="object-contain" />
          </div>
          <h1 className="text-lg font-bold">
            <span className="text-[#D4AF37]">Variety Amaya</span> Admin
          </h1>
        </div>
        <nav className="ml-8 hidden sm:flex items-center gap-1">
          <span className="px-3 py-1.5 rounded-md text-sm bg-[#D4AF37]/10 text-[#D4AF37] font-medium">
            Media
          </span>
          <Link href="/admin/contracts" className="px-3 py-1.5 rounded-md text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            Contracts
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          {hasChanges && (
            <span className="text-xs bg-yellow-600/20 text-yellow-400 px-3 py-1 rounded-full">
              Unsaved changes
            </span>
          )}
          <button
            onClick={() => { setShowPasswordModal(true); setNewPassword(""); setConfirmPassword(""); setPasswordError(""); }}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Change Password
          </button>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-sm border border-gray-800 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Change Password</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-[#D4AF37] focus:border-transparent outline-none"
                  placeholder="Min 6 characters"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-[#D4AF37] focus:border-transparent outline-none"
                  placeholder="Re-enter password"
                />
              </div>
              {passwordError && <p className="text-red-400 text-sm">{passwordError}</p>}
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="flex-1 py-2.5 bg-[#D4AF37] hover:bg-[#B8960C] text-black font-semibold rounded-lg text-sm transition-colors"
              >
                {changingPassword ? "Saving..." : "Update Password"}
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              Note: For production, also update ADMIN_PASSWORD in Vercel environment variables and redeploy.
            </p>
          </div>
        </div>
      )}

      <div className="pt-16 flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-72 bg-gray-900 border-r border-gray-800 overflow-hidden flex flex-col transition-transform lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4 border-b border-gray-800">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-1 focus:ring-[#D4AF37] focus:border-transparent outline-none"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredServices.map(([slug, data]) => {
              const mediaCount = getMediaCount(data);
              return (
                <button
                  key={slug}
                  onClick={() => {
                    selectService(slug);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-gray-800/50 ${
                    selectedSlug === slug
                      ? "bg-[#D4AF37]/10 border-l-2 border-l-[#D4AF37]"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <div className="relative w-8 h-8 flex-shrink-0 rounded overflow-hidden bg-gray-800">
                    <Image src={data.image} alt={data.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${selectedSlug === slug ? "text-[#D4AF37]" : "text-gray-300"}`}>
                      {data.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {mediaCount} media item{mediaCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Sidebar overlay on mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)] lg:ml-0">
          {!selectedSlug ? (
            <div className="flex items-center justify-center h-full min-h-[60vh]">
              <div className="text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg">Select a service from the sidebar</p>
                <p className="text-sm mt-1">to manage its photos and videos</p>
              </div>
            </div>
          ) : editData ? (
            <div className="max-w-5xl mx-auto p-6">
              {/* Service Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-800">
                  <Image src={editData.image} alt={editData.name} fill className="object-cover" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{editData.name}</h2>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-1">{editData.description}</p>
                </div>
                <div className="ml-auto">
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                    className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                      hasChanges
                        ? "bg-[#D4AF37] hover:bg-[#B8960C] text-black"
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-6 bg-gray-900 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab("gallery")}
                  className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "gallery"
                      ? "bg-[#D4AF37] text-black"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Gallery Media
                </button>
                <button
                  onClick={() => setActiveTab("beforeAfter")}
                  className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "beforeAfter"
                      ? "bg-[#D4AF37] text-black"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Before & After
                </button>
              </div>

              {/* ──── GALLERY TAB ──── */}
              {activeTab === "gallery" && (
                <div>
                  {/* Ordered Media toggle */}
                  <div className="flex items-center justify-between mb-4 bg-gray-900 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Ordered Media Mode</p>
                      <p className="text-xs text-gray-500">
                        {editData.orderedMedia
                          ? "Photos and videos display in exact order"
                          : "Photos and videos display in separate sections"}
                      </p>
                    </div>
                    <button
                      onClick={editData.orderedMedia ? disableOrderedMedia : enableOrderedMedia}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        editData.orderedMedia ? "bg-[#D4AF37]" : "bg-gray-700"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                          editData.orderedMedia ? "left-6" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Media Grid */}
                  {getGalleryItems().length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      {getGalleryItems().map((item, index) => (
                        <div
                          key={`${item}-${index}`}
                          className="relative group bg-gray-900 rounded-xl overflow-hidden border border-gray-800"
                        >
                          {isVideoFile(item) ? (
                            <video
                              src={item}
                              className="w-full aspect-[4/3] object-cover"
                              muted
                              playsInline
                              onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                              onMouseOut={(e) => {
                                const vid = e.target as HTMLVideoElement;
                                vid.pause();
                                vid.currentTime = 0;
                              }}
                            />
                          ) : (
                            <img
                              src={item}
                              alt={`${editData.name} media`}
                              className="w-full aspect-[4/3] object-cover"
                            />
                          )}

                          {/* Type badge */}
                          <span
                            className={`absolute top-2 left-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              isVideoFile(item)
                                ? "bg-blue-600 text-white"
                                : "bg-green-600 text-white"
                            }`}
                          >
                            {isVideoFile(item) ? "Video" : "Photo"}
                          </span>

                          {/* Controls overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            <button
                              onClick={() => moveGalleryItem(item, "up")}
                              className="p-2 bg-gray-800/90 rounded-lg hover:bg-gray-700 text-white"
                              title="Move up"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteGalleryItem(item)}
                              className="p-2 bg-red-600/90 rounded-lg hover:bg-red-500 text-white"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                            <button
                              onClick={() => moveGalleryItem(item, "down")}
                              className="p-2 bg-gray-800/90 rounded-lg hover:bg-gray-700 text-white"
                              title="Move down"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>

                          {/* Filename */}
                          <div className="px-3 py-2 bg-gray-900">
                            <p className="text-xs text-gray-400 truncate">{getFileName(item)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-900/50 rounded-xl border border-dashed border-gray-700 mb-6">
                      <svg className="w-12 h-12 mx-auto text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-500">No gallery media yet</p>
                      <p className="text-gray-600 text-sm">Upload photos and videos below</p>
                    </div>
                  )}

                  {/* Upload Button */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleGalleryUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full py-4 border-2 border-dashed border-gray-700 hover:border-[#D4AF37] rounded-xl text-gray-400 hover:text-[#D4AF37] transition-colors flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Upload Photos or Videos
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* ──── BEFORE & AFTER TAB ──── */}
              {activeTab === "beforeAfter" && (
                <div>
                  {/* Existing Video B&A Pairs */}
                  {editData.beforeAfterVideos && editData.beforeAfterVideos.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                        Video Comparisons
                      </h3>
                      {editData.beforeAfterVideos.map((pair, idx) => (
                        <div key={`video-ba-${idx}`} className="bg-gray-900 rounded-xl p-4 mb-4 border border-gray-800">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-medium text-gray-300">Pair {idx + 1}</span>
                            <button
                              onClick={() => deleteVideoBAPair(idx)}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              Delete Pair
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-2 uppercase font-semibold">Before</p>
                              <video src={pair.before} className="w-full rounded-lg aspect-video object-cover" muted playsInline controls />
                              <p className="text-xs text-gray-500 mt-1 truncate">{getFileName(pair.before)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-2 uppercase font-semibold">After</p>
                              <video src={pair.after} className="w-full rounded-lg aspect-video object-cover" muted playsInline controls />
                              <p className="text-xs text-gray-500 mt-1 truncate">{getFileName(pair.after)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Existing Photo B&A Pairs */}
                  {editData.beforeAfterPhotos && editData.beforeAfterPhotos.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                        Photo Comparisons
                      </h3>
                      {editData.beforeAfterPhotos.map((pair, idx) => {
                        const afterPhotos = Array.isArray(pair.after) ? pair.after : [pair.after];
                        return (
                          <div key={`photo-ba-${idx}`} className="bg-gray-900 rounded-xl p-4 mb-4 border border-gray-800">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-sm font-medium text-gray-300">Pair {idx + 1}</span>
                              <button
                                onClick={() => deletePhotoBAPair(idx)}
                                className="text-red-400 hover:text-red-300 text-sm"
                              >
                                Delete Pair
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-gray-500 mb-2 uppercase font-semibold">Before</p>
                                <img src={pair.before} alt="Before" className="w-full rounded-lg aspect-[4/3] object-cover" />
                                <p className="text-xs text-gray-500 mt-1 truncate">{getFileName(pair.before)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-2 uppercase font-semibold">After ({afterPhotos.length})</p>
                                <div className={`grid ${afterPhotos.length > 1 ? "grid-cols-2" : "grid-cols-1"} gap-2`}>
                                  {afterPhotos.map((photo, pi) => (
                                    <div key={pi}>
                                      <img src={photo} alt={`After ${pi + 1}`} className="w-full rounded-lg aspect-[4/3] object-cover" />
                                      <p className="text-xs text-gray-500 mt-1 truncate">{getFileName(photo)}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* No pairs message */}
                  {!editData.beforeAfterVideos?.length && !editData.beforeAfterPhotos?.length && !pendingBAPair && (
                    <div className="text-center py-12 bg-gray-900/50 rounded-xl border border-dashed border-gray-700 mb-6">
                      <svg className="w-12 h-12 mx-auto text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      <p className="text-gray-500">No before & after comparisons yet</p>
                    </div>
                  )}

                  {/* Add New Pair Form */}
                  {pendingBAPair ? (
                    <div className="bg-gray-900 rounded-xl p-6 border-2 border-[#D4AF37]/30">
                      <h3 className="text-lg font-semibold text-[#D4AF37] mb-4">New Before & After Pair</h3>
                      <div className="grid grid-cols-2 gap-6">
                        {/* Before */}
                        <div>
                          <p className="text-sm font-medium text-gray-400 mb-2">Before</p>
                          {pendingBAPair.before ? (
                            <div className="relative">
                              {isVideoFile(pendingBAPair.before) ? (
                                <video src={pendingBAPair.before} className="w-full rounded-lg aspect-[4/3] object-cover" muted playsInline controls />
                              ) : (
                                <img src={pendingBAPair.before} alt="Before" className="w-full rounded-lg aspect-[4/3] object-cover" />
                              )}
                              <p className="text-xs text-gray-500 mt-1 truncate">{getFileName(pendingBAPair.before)}</p>
                            </div>
                          ) : (
                            <>
                              <input ref={baBeforeInputRef} type="file" accept="image/*,video/*" onChange={handleBABeforeUpload} className="hidden" />
                              <button
                                onClick={() => baBeforeInputRef.current?.click()}
                                disabled={uploading}
                                className="w-full aspect-[4/3] border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
                              >
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="text-sm">Upload Before</span>
                              </button>
                            </>
                          )}
                        </div>

                        {/* After */}
                        <div>
                          <p className="text-sm font-medium text-gray-400 mb-2">
                            After {pendingBAPair.afterList.length > 0 && `(${pendingBAPair.afterList.length})`}
                          </p>
                          {pendingBAPair.afterList.length > 0 && (
                            <div className={`grid ${pendingBAPair.afterList.length > 1 ? "grid-cols-2" : "grid-cols-1"} gap-2 mb-2`}>
                              {pendingBAPair.afterList.map((item, i) => (
                                <div key={i}>
                                  {isVideoFile(item) ? (
                                    <video src={item} className="w-full rounded-lg aspect-[4/3] object-cover" muted playsInline controls />
                                  ) : (
                                    <img src={item} alt={`After ${i + 1}`} className="w-full rounded-lg aspect-[4/3] object-cover" />
                                  )}
                                  <p className="text-xs text-gray-500 mt-1 truncate">{getFileName(item)}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          <input ref={baAfterInputRef} type="file" accept="image/*,video/*" multiple onChange={handleBAAfterUpload} className="hidden" />
                          <button
                            onClick={() => baAfterInputRef.current?.click()}
                            disabled={uploading}
                            className={`w-full ${
                              pendingBAPair.afterList.length === 0 ? "aspect-[4/3]" : "py-3"
                            } border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors`}
                          >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="text-sm">
                              {pendingBAPair.afterList.length === 0 ? "Upload After" : "Add More After"}
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={saveBAPair}
                          disabled={!pendingBAPair.before || pendingBAPair.afterList.length === 0}
                          className="flex-1 py-2.5 bg-[#D4AF37] hover:bg-[#B8960C] disabled:bg-gray-700 disabled:text-gray-500 text-black font-semibold rounded-lg transition-colors"
                        >
                          Add Pair
                        </button>
                        <button
                          onClick={() => setPendingBAPair(null)}
                          className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setPendingBAPair({ before: null, afterList: [] })}
                      className="w-full py-4 border-2 border-dashed border-gray-700 hover:border-[#D4AF37] rounded-xl text-gray-400 hover:text-[#D4AF37] transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Before & After Pair
                    </button>
                  )}
                </div>
              )}

              {/* Bottom Save Bar (sticky) */}
              {hasChanges && (
                <div className="fixed bottom-0 left-0 lg:left-72 right-0 bg-gray-900/95 backdrop-blur border-t border-gray-800 px-6 py-4 flex items-center justify-between z-30">
                  <p className="text-sm text-yellow-400">You have unsaved changes</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        if (selectedSlug && services[selectedSlug]) {
                          setEditData(JSON.parse(JSON.stringify(services[selectedSlug])));
                          setHasChanges(false);
                        }
                      }}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 text-sm transition-colors"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2 bg-[#D4AF37] hover:bg-[#B8960C] text-black font-semibold rounded-lg text-sm transition-colors"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
