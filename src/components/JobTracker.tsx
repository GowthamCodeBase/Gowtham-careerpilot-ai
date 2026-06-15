import React, { useState } from "react";
import { JobApplication } from "../types.ts";
import {
  Briefcase,
  Calendar,
  DollarSign,
  MapPin,
  Plus,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Edit2,
  Trash2,
  X,
  FileText
} from "lucide-react";

interface JobTrackerProps {
  applications: JobApplication[];
  onCreate: (app: any) => Promise<void>;
  onUpdate: (id: string, app: Partial<JobApplication>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function JobTracker({ applications, onCreate, onUpdate, onDelete }: JobTrackerProps) {
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Edit/Create modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);

  // Form states
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [appliedDate, setAppliedDate] = useState("");
  const [status, setStatus] = useState<"Applied" | "Interview" | "Rejected" | "Offer">("Applied");
  const [salary, setSalary] = useState("");
  const [location, setLocation] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter application list
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.location && app.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "All" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openCreateModal = () => {
    setEditingApp(null);
    setCompany("");
    setRole("");
    setAppliedDate(new Date().toISOString().split("T")[0]);
    setStatus("Applied");
    setSalary("");
    setLocation("");
    setJobDescription("");
    setNotes("");
    setIsModalOpen(true);
  };

  const openEditModal = (app: JobApplication) => {
    setEditingApp(app);
    setCompany(app.company);
    setRole(app.role);
    setAppliedDate(app.appliedDate);
    setStatus(app.status);
    setSalary(app.salary || "");
    setLocation(app.location || "");
    setJobDescription(app.jobDescription || "");
    setNotes(app.notes || "");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !role || !appliedDate) return;

    setIsSubmitting(true);
    try {
      const payload = {
        company,
        role,
        appliedDate,
        status,
        salary,
        location,
        jobDescription,
        notes,
      };

      if (editingApp) {
        await onUpdate(editingApp.id, payload);
      } else {
        await onCreate(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Applied":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-950">
            <Clock className="w-3 h-3" />
            Applied
          </span>
        );
      case "Interview":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full border border-amber-100 dark:border-amber-950 animate-pulse">
            <Calendar className="w-3 h-3" />
            Interview
          </span>
        );
      case "Offer":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-950">
            <CheckCircle className="w-3 h-3" />
            Offer
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-full border border-rose-100 dark:border-rose-950">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white dark:font-semibold">Application Tracker</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Organize, review, and track individual progress stages.</p>
        </div>
        <button
          id="btn-add-application"
          onClick={openCreateModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Application</span>
        </button>
      </div>

      {/* Filter and Search Bar row */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            id="tracker-search-bar"
            type="text"
            placeholder="Search by company, title, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition shadow-sm"
          />
        </div>

        {/* Status filters selection */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none shrink-0 text-xs">
          {["All", "Applied", "Interview", "Offer", "Rejected"].map((statusOption) => (
            <button
              key={statusOption}
              onClick={() => setStatusFilter(statusOption)}
              className={`px-3.5 py-2 rounded-xl border font-semibold transition shrink-0 cursor-pointer ${
                statusFilter === statusOption
                  ? "bg-indigo-600 text-white border-transparent"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:bg-slate-50"
              }`}
            >
              {statusOption}
            </button>
          ))}
        </div>
      </div>

      {/* Database application cards List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {filteredApps.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Briefcase className="w-12 h-12 mx-auto text-slate-200 dark:text-slate-700/60 mb-3" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-base">No Applications Found</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
              Get started by adding a target job title or searching with a different status tier.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {/* Desktop Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/35">
              <div className="col-span-3">Company & Role</div>
              <div className="col-span-2">Date Applied</div>
              <div className="col-span-2">Location</div>
              <div className="col-span-2">Stage Status</div>
              <div className="col-span-1.5">Salary</div>
              <div className="col-span-1.5 text-right">Actions</div>
            </div>

            {/* Application records */}
            {filteredApps.map((app) => (
              <div
                key={app.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3.5 md:gap-4 p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/20 transition-all items-center"
              >
                {/* Company & Role */}
                <div className="col-span-1 md:col-span-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 flex items-center justify-center shrink-0">
                    <span className="font-bold text-slate-700 dark:text-slate-300 capitalize text-sm">
                      {app.company.substring(0, 2)}
                    </span>
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-semibold text-slate-800 dark:text-white text-sm truncate">{app.role}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs truncate font-medium mt-0.5">{app.company}</p>
                  </div>
                </div>

                {/* Date */}
                <div className="col-span-1 md:col-span-2 flex items-center gap-1 text-slate-600 dark:text-slate-400 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 block md:hidden" />
                  <span className="font-mono">{new Date(app.appliedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>

                {/* Location */}
                <div className="col-span-1 md:col-span-2 flex items-center gap-1 text-slate-600 dark:text-slate-400 text-xs truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 block md:hidden" />
                  <span className="truncate">{app.location || "Not Spec."}</span>
                </div>

                {/* Status */}
                <div className="col-span-1 md:col-span-2 flex items-center">
                  {getStatusBadge(app.status)}
                </div>

                {/* Salary */}
                <div className="col-span-1 md:col-span-1.5 flex items-center gap-0.5 text-slate-700 dark:text-slate-400 font-semibold text-xs">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400 block md:hidden" />
                  <span>{app.salary || "N/A"}</span>
                </div>

                {/* Actions */}
                <div className="col-span-1 md:col-span-1.5 flex justify-start md:justify-end gap-2 shrink-0">
                  <button
                    onClick={() => openEditModal(app)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition cursor-pointer"
                    title="Edit entry"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(app.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-450 rounded-lg hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition cursor-pointer"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Optional Expanded Notes on Row */}
                {(app.notes || app.jobDescription) && (
                  <div className="col-span-1 md:col-span-12 md:mt-2 bg-slate-50/50 dark:bg-slate-800/10 border border-slate-100 dark:border-slate-800/40 p-3 rounded-xl gap-4 flex flex-col sm:flex-row text-xs">
                    {app.jobDescription && (
                      <div className="flex-1">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">Job Description Requirements</span>
                        <p className="text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">{app.jobDescription}</p>
                      </div>
                    )}
                    {app.notes && (
                      <div className="flex-1">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">Follow-up Notes</span>
                        <p className="text-slate-600 dark:text-slate-350 italic font-medium leading-relaxed">{app.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Overlay for Add/Edit Applications */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-930 border border-slate-100 dark:border-slate-850 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingApp ? "Modify Application Track" : "Add Target Application"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto overflow-x-hidden flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Company Name</label>
                  <input
                    id="form-company"
                    type="text"
                    required
                    placeholder="e.g. Google"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-705 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Job Role Title</label>
                  <input
                    id="form-role"
                    type="text"
                    required
                    placeholder="e.g. Software Engineer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-705 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Applied Date</label>
                  <input
                    id="form-date"
                    type="date"
                    required
                    value={appliedDate}
                    onChange={(e) => setAppliedDate(e.target.value)}
                    className="w-full px-3.5 py-1.5 font-mono bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-705 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Current Stage</label>
                  <select
                    id="form-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-705 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Salary / compensation</label>
                  <input
                    id="form-salary"
                    type="text"
                    placeholder="e.g. $145,000"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="w-full px-3.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-705 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Work Location / Class</label>
                  <input
                    id="form-location"
                    type="text"
                    placeholder="e.g. San Francisco (Hybrid)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-705 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Job Description requirements</label>
                <textarea
                  id="form-job-description"
                  rows={2}
                  placeholder="Paste core requirements, tags, or keys found inside post..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full px-3.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-705 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Your Action Notes</label>
                <textarea
                  id="form-notes"
                  rows={2}
                  placeholder="Need to finish technical loop, reached out to recruiter Spencer..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-705 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 shrink-0 border-t border-slate-55 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-400 hover:bg-slate-50 rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="border-2 border-white/20 border-t-white w-4 h-4 rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>{editingApp ? "Save Changes" : "Create Entry"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
