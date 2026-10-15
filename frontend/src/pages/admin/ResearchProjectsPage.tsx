import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { adminProjectService } from '../../services/adminProjectService';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { AdminProject } from '../../types/admin.types';

export const ResearchProjectsPage: React.FC = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [researchType, setResearchType] = useState<'Thesis' | 'Research Paper' | 'Dissertation'>('Thesis');
  const [expectedDate, setExpectedDate] = useState('28 September 2026');

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['adminProjectsList'],
    queryFn: () => adminProjectService.getProjects(),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      adminProjectService.createProject({
        customer_id: `cust-${Date.now()}`,
        customer_name: customerName,
        customer_email: `${customerName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        topic,
        research_type: researchType,
        status: 'In Progress',
        overall_progress: 10,
        started_at: 'Today',
        expected_completion: expectedDate,
        chapter_count: 4,
        description: 'New research thesis project initiated by administrator.',
      }),
    onSuccess: (newProj: AdminProject) => {
      queryClient.invalidateQueries({ queryKey: ['adminProjectsList'] });
      showToast(`Created project "${newProj.topic}" for ${newProj.customer_name}`, 'success');
      setModalOpen(false);
      setTopic('');
      setCustomerName('');
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
            Manage all active customer thesis and research contracts.
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

      {isLoading ? (
        <div className="p-12 text-center text-xs text-editorial-muted">
          Loading projects...
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
                  <span className="text-[11px] font-semibold text-[#266C44]">
                    ● {proj.status}
                  </span>
                </div>

                <h3 className="font-serif text-base font-bold text-editorial-dark mb-1">
                  {proj.topic}
                </h3>
                <p className="text-xs text-editorial-muted mb-4">
                  Customer: <span className="font-medium text-editorial-dark">{proj.customer_name}</span>
                </p>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-editorial-dark mb-1">
                    <span>Progress</span>
                    <span className="font-mono">{proj.overall_progress}%</span>
                  </div>
                  <ProgressBar
                    progress={proj.overall_progress}
                    height="h-2"
                    colorClass="bg-[#263A33]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border/70 text-xs text-editorial-muted flex items-center justify-between">
                <span>{proj.chapter_count} Chapters</span>
                <span className="font-mono">Est. {proj.expected_completion}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Research Project Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Research Project"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-editorial-muted font-medium mb-1">
              Customer Full Name
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Sanya Mirza"
              className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary text-xs"
            />
          </div>

          <div>
            <label className="block text-editorial-muted font-medium mb-1">
              Research Topic / Title
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
              className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary text-xs"
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
              type="text"
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
              disabled={!topic || !customerName}
              onClick={() => createMutation.mutate()}
              className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold disabled:opacity-50"
            >
              Create Project
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
