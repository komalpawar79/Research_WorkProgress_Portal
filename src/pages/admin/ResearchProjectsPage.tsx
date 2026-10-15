import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, User, Calendar, BookOpen, Layers } from 'lucide-react';
import { adminProjectService } from '../../services/adminProjectService';
import { customerService } from '../../services/customerService';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { AdminProject } from '../../types/admin.types';

export const ResearchProjectsPage: React.FC = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [topic, setTopic] = useState('');
  const [customCustomerName, setCustomCustomerName] = useState('');
  const [researchType, setResearchType] = useState<'Thesis' | 'Research Paper' | 'Dissertation'>('Thesis');
  const [expectedDate, setExpectedDate] = useState('2026-12-15');

  // Real-time projects list from database
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['adminProjectsList'],
    queryFn: () => adminProjectService.getProjects(),
    refetchInterval: 5000,
  });

  // Fetch registered scholars
  const { data: customers = [] } = useQuery({
    queryKey: ['adminCustomerList'],
    queryFn: () => customerService.getCustomers(),
  });

  const createMutation = useMutation({
    mutationFn: () => {
      const existingCustomer = customers.find((c) => c.id === selectedCustomerId);
      const cId = existingCustomer ? existingCustomer.id : `cust-${Date.now()}`;
      const cName = existingCustomer ? existingCustomer.full_name : customCustomerName;
      const cEmail = existingCustomer ? existingCustomer.email : `${customCustomerName.toLowerCase().replace(/\s+/g, '')}@gmail.com`;

      return adminProjectService.createProject({
        customer_id: cId,
        customer_name: cName,
        customer_email: cEmail,
        topic,
        research_type: researchType,
        status: 'In Progress',
        overall_progress: 0,
        started_at: new Date().toISOString().split('T')[0],
        expected_completion: expectedDate,
        chapter_count: 5,
        description: 'New research thesis project initiated by administrator.',
      });
    },
    onSuccess: (newProj: AdminProject) => {
      queryClient.invalidateQueries({ queryKey: ['adminProjectsList'] });
      queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['adminCustomerList'] });
      showToast(`Created project "${newProj.topic}" for ${newProj.customer_name}`, 'success');
      setModalOpen(false);
      setTopic('');
      setSelectedCustomerId('');
      setCustomCustomerName('');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to create project', 'error');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-dark">
            Research Projects
          </h1>
          <p className="text-xs sm:text-sm text-editorial-muted mt-1">
            Manage all active scholar thesis and research contracts in real time.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="self-start sm:self-center px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Research Project</span>
        </button>
      </div>

      {isLoading && projects.length === 0 ? (
        <div className="p-12 text-center text-xs text-editorial-muted bg-surface rounded-2xl border border-border">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading projects from database...
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center text-xs text-editorial-muted bg-surface rounded-2xl border border-border">
          <BookOpen className="w-8 h-8 text-editorial-muted/50 mx-auto mb-2" />
          No research projects registered yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj: AdminProject) => (
            <div
              key={proj.id}
              className="bg-surface rounded-2xl border border-border p-6 shadow-card flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EAF3EC] text-[#2E473E] border border-[#C4D9CD]">
                    {proj.research_type}
                  </span>
                  <span className="text-[11px] font-semibold text-[#266C44] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#266C44] animate-pulse"></span>
                    {proj.status}
                  </span>
                </div>

                <h3 className="font-serif text-base font-bold text-editorial-dark mb-1 leading-snug">
                  {proj.topic}
                </h3>
                <p className="text-xs text-editorial-muted mb-4 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-editorial-muted" />
                  <span>Scholar:</span>
                  <span className="font-semibold text-editorial-dark">{proj.customer_name}</span>
                </p>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-editorial-dark mb-1">
                    <span>Progress</span>
                    <span className="font-mono">{proj.overall_progress}%</span>
                  </div>
                  <ProgressBar progress={proj.overall_progress} height="h-2" colorClass="bg-primary" />
                </div>
              </div>

              <div className="pt-4 border-t border-border/80 flex items-center justify-between text-xs text-editorial-muted">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  {proj.chapter_count} Chapters
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  {proj.expected_completion}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Project Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Research Project"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-editorial-muted font-medium mb-1">
              Select Registered Scholar
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary text-xs bg-white text-editorial-dark"
            >
              <option value="">-- Or enter new scholar name below --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.email})
                </option>
              ))}
            </select>
          </div>

          {!selectedCustomerId && (
            <div>
              <label className="block text-editorial-muted font-medium mb-1">
                New Scholar Full Name
              </label>
              <input
                type="text"
                value={customCustomerName}
                onChange={(e) => setCustomCustomerName(e.target.value)}
                placeholder="e.g. Sanya Mirza"
                className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary text-xs"
              />
            </div>
          )}

          <div>
            <label className="block text-editorial-muted font-medium mb-1">
              Research Topic / Thesis Title
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Edge AI in Distributed Sensor Networks"
              className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary text-xs"
            />
          </div>

          <div>
            <label className="block text-editorial-muted font-medium mb-1">
              Research Type
            </label>
            <select
              value={researchType}
              onChange={(e) => setResearchType(e.target.value as any)}
              className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary text-xs bg-white text-editorial-dark"
            >
              <option value="Thesis">Thesis</option>
              <option value="Research Paper">Research Paper</option>
              <option value="Dissertation">Dissertation</option>
            </select>
          </div>

          <div>
            <label className="block text-editorial-muted font-medium mb-1">
              Expected Completion Date
            </label>
            <input
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg border border-border text-editorial-muted hover:text-editorial-dark"
            >
              Cancel
            </button>
            <button
              disabled={!topic || (!selectedCustomerId && !customCustomerName) || createMutation.isPending}
              onClick={() => createMutation.mutate()}
              className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
