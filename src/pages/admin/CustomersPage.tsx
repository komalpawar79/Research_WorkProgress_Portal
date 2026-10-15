import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { customerService } from '../../services/customerService';
import { ProgressBar } from '../../components/common/ProgressBar';

export const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', search, paymentFilter, statusFilter, typeFilter],
    queryFn: () =>
      customerService.getCustomers({
        search,
        paymentStatus: paymentFilter,
        projectStatus: statusFilter,
        researchType: typeFilter,
      }),
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-dark">
          Customers
        </h1>
        <p className="text-xs sm:text-sm text-editorial-muted mt-1">
          Manage your customers and their research projects.
        </p>
      </div>

      {/* Search & Filters Bar matching reference Screen 2 */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-card flex flex-col lg:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-editorial-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer..."
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-background/60 focus:bg-white border border-border rounded-xl outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-editorial-dark"
          />
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto">
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-background/60 border border-border rounded-xl outline-none text-editorial-dark font-medium cursor-pointer"
          >
            <option value="All">All Payments</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Pending">Pending</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-background/60 border border-border rounded-xl outline-none text-editorial-dark font-medium cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-background/60 border border-border rounded-xl outline-none text-editorial-dark font-medium cursor-pointer"
          >
            <option value="All">All Types</option>
            <option value="Thesis">Thesis</option>
            <option value="Research Paper">Paper</option>
            <option value="Dissertation">Dissertation</option>
          </select>

          <button
            onClick={() => {
              setSearch('');
              setPaymentFilter('All');
              setStatusFilter('All');
              setTypeFilter('All');
            }}
            className="px-3 py-2 text-xs font-semibold text-editorial-muted hover:text-editorial-dark hover:bg-background rounded-xl border border-border transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-editorial-muted">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading customers...
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-xs text-editorial-muted">
            No customers match your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-[#FAF9F5] text-[11px] uppercase tracking-wider font-mono text-editorial-muted">
                  <th className="py-3.5 px-5 font-semibold">Customer</th>
                  <th className="py-3.5 px-4 font-semibold">Research Topic</th>
                  <th className="py-3.5 px-4 font-semibold">Type</th>
                  <th className="py-3.5 px-4 font-semibold">Progress</th>
                  <th className="py-3.5 px-4 font-semibold">Payment</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs sm:text-sm">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FBF9F4] transition-colors">
                    {/* Customer */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.avatar_url}
                          alt={c.full_name}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-border flex-shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-editorial-dark text-xs sm:text-sm leading-tight">
                            {c.full_name}
                          </p>
                          <p className="text-[11px] text-editorial-muted font-mono mt-0.5">
                            {c.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Topic */}
                    <td className="py-4 px-4 font-medium text-editorial-dark whitespace-nowrap">
                      {c.research_topic}
                    </td>

                    {/* Type */}
                    <td className="py-4 px-4 text-editorial-muted whitespace-nowrap text-xs">
                      {c.project_type}
                    </td>

                    {/* Progress */}
                    <td className="py-4 px-4 whitespace-nowrap min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-editorial-dark w-7 font-mono">
                          {c.progress_percent}%
                        </span>
                        <div className="w-20">
                          <ProgressBar
                            progress={c.progress_percent}
                            height="h-1.5"
                            colorClass={
                              c.progress_percent === 100
                                ? 'bg-[#266C44]'
                                : 'bg-[#B78352]'
                            }
                          />
                        </div>
                      </div>
                    </td>

                    {/* Payment */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          c.payment_status === 'Paid'
                            ? 'bg-[#EAF3EC] text-[#266C44] border border-[#C1E1CB]'
                            : 'bg-[#FBF2E7] text-[#B78352] border border-[#F2D7B7]'
                        }`}
                      >
                        {c.payment_status}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          c.project_status === 'Completed'
                            ? 'bg-[#EAF3EC] text-[#266C44] border border-[#C1E1CB]'
                            : 'bg-[#F0EFEA] text-[#2E473E] border border-[#D7D6CF]'
                        }`}
                      >
                        {c.project_status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/admin/customers/${c.id}`)}
                        className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-semibold text-editorial-dark hover:bg-primary hover:text-white hover:border-primary transition-colors shadow-xs"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination matching reference Screen 2 */}
        <div className="p-4 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-editorial-muted bg-[#FAF9F5]">
          <span>Showing 1 - {customers.length} of 128</span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-border hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                  currentPage === page
                    ? 'bg-primary text-white shadow-xs'
                    : 'hover:bg-white text-editorial-dark'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(5, p + 1))}
              disabled={currentPage === 5}
              className="p-1.5 rounded-lg border border-border hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

