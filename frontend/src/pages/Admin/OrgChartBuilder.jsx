import React, { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../lib/ToastContext';
import api from '../../api';
import { Plus, Edit2, Trash2, ChevronRight, Building2, Users, TrendingUp, Code2, Server, Rocket, Megaphone, DollarSign, Scale, Headphones, Package } from 'lucide-react';
import DepartmentDetailModal from './DepartmentDetailModal';

// Icon mapping is visual only — there's no icon field in the data model yet.
const ICON_RULES = [
  [/hr|people|human/i, Users],
  [/sales|revenue/i, TrendingUp],
  [/eng|dev|tech|platform/i, Code2],
  [/infra|server|ops/i, Server],
  [/release|launch/i, Rocket],
  [/market/i, Megaphone],
  [/financ|account/i, DollarSign],
  [/legal/i, Scale],
  [/support|help|customer/i, Headphones]
];
const iconForDept = (name = '') => {
  const hit = ICON_RULES.find(([re]) => re.test(name));
  return hit ? hit[1] : Package;
};

// Cycles by sibling position (not depth), applied only to nodes that have children.
const PALETTE = [
  { iconTint: 'text-emerald-500', iconBgLight: 'bg-emerald-500/10', solidBg: 'bg-emerald-600 hover:bg-emerald-600', solidBgDark: 'dark:bg-emerald-600 dark:hover:bg-emerald-600' },
  { iconTint: 'text-violet-500', iconBgLight: 'bg-violet-500/10', solidBg: 'bg-violet-600 hover:bg-violet-600', solidBgDark: 'dark:bg-violet-600 dark:hover:bg-violet-600' },
  { iconTint: 'text-amber-500', iconBgLight: 'bg-amber-500/10', solidBg: 'bg-amber-600 hover:bg-amber-600', solidBgDark: 'dark:bg-amber-600 dark:hover:bg-amber-600' }
];

const buildTree = (flatList, parentId = null) => {
  return flatList
    .filter(d => d.parentId === parentId)
    .map(d => ({
      ...d,
      children: buildTree(flatList, d.id)
    }));
};

const DepartmentNode = ({ node, depth, colorIndex, onNodeClick, onAdd, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const palette = PALETTE[colorIndex % PALETTE.length];
  const Icon = iconForDept(node.name);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onNodeClick(node);
    }
  };

  const actionBtnClass = 'text-secondary-400 hover:text-primary-700 dark:text-secondary-500 dark:hover:text-primary-400';

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="group flex items-center gap-2.5 py-2 pr-2 pl-2 rounded-xl cursor-pointer select-none transition-colors hover:bg-secondary-50 dark:hover:bg-secondary-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
        onClick={() => onNodeClick(node)}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setExpanded(v => !v); }}
            className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded transition-transform text-secondary-400 hover:text-secondary-600 dark:text-secondary-500 dark:hover:text-secondary-300 ${expanded ? 'rotate-90' : ''}`}
            title={expanded ? 'Collapse' : 'Expand'}
          >
            <ChevronRight size={14} />
          </button>
        ) : (
          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-400 dark:bg-secondary-500" />
          </span>
        )}

        {hasChildren && (
          <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${palette.iconBgLight} ${palette.iconTint}`}>
            <Icon size={15} />
          </span>
        )}

        <span className={`truncate text-body-md ${hasChildren ? 'font-medium text-secondary-800 dark:text-secondary-100' : 'font-normal text-secondary-600 dark:text-secondary-300'}`}>
          {node.name}
        </span>

        <span className="flex-1" />

        {hasChildren && (
          <span className="flex-shrink-0 min-w-[22px] text-center text-xs font-medium px-1.5 py-0.5 rounded-full bg-secondary-100 text-secondary-500 dark:bg-secondary-800 dark:text-secondary-400">
            {node.children.length}
          </span>
        )}

        <div
          className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity ${hasChildren ? 'ml-1' : ''}`}
          onClick={e => e.stopPropagation()}
        >
          <Button size="sm" variant="ghost" title="Add sub-department" onClick={() => onAdd(node.id)} className={actionBtnClass}>
            <Plus size={15} />
          </Button>
          <Button size="sm" variant="ghost" title="Rename" onClick={() => onEdit(node)} className={actionBtnClass}>
            <Edit2 size={14} />
          </Button>
          <Button size="sm" variant="ghost" title="Delete" onClick={() => onDelete(node.id)} className="text-secondary-400 hover:text-red-600 dark:text-secondary-500 dark:hover:text-red-400">
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="ml-3 pl-5 border-l-2 border-secondary-300 dark:border-secondary-600">
          {node.children.map((child, i) => (
            <div key={child.id} className="relative">
              <span className="absolute -left-5 top-[18px] w-5 h-0.5 bg-secondary-300 dark:bg-secondary-600" />
              <DepartmentNode
                node={child}
                depth={depth + 1}
                colorIndex={i % 3}
                onNodeClick={onNodeClick}
                onAdd={onAdd}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const OrgChartBuilder = () => {
  const { showToast } = useToast();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'add',
    id: null,
    parentId: null,
    name: ''
  });
  const [saving, setSaving] = useState(false);

  const [selectedDeptForDetail, setSelectedDeptForDetail] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/departments');
      setDepartments(response.data);
    } catch (error) {
      showToast('Failed to load departments.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = (parentId = null) => {
    setModalState({
      isOpen: true,
      mode: 'add',
      id: null,
      parentId,
      name: ''
    });
  };

  const handleOpenEdit = (dept) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      id: dept.id,
      parentId: dept.parentId,
      name: dept.name
    });
  };

  const handleCloseModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!modalState.name.trim()) return;

    setSaving(true);
    try {
      if (modalState.mode === 'add') {
        const payload = { name: modalState.name };
        if (modalState.parentId) payload.parentId = modalState.parentId;

        await api.post('/departments', payload);
        showToast('Department added successfully.', 'success');
      } else {
        await api.put(`/departments/${modalState.id}`, {
          name: modalState.name,
          parentId: modalState.parentId
        });
        showToast('Department updated successfully.', 'success');
      }

      handleCloseModal();
      fetchDepartments();
    } catch (error) {
      showToast(error.response?.data?.message || error.response?.data || 'Failed to save department.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;

    try {
      await api.delete(`/departments/${id}`);
      showToast('Department deleted successfully.', 'success');
      fetchDepartments();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data || 'Failed to delete department.';
      const displayMsg = typeof errorMsg === 'string' ? errorMsg : 'Failed to delete department.';
      showToast(displayMsg, 'danger');
    }
  };

  const handleNodeClick = (dept) => {
    setSelectedDeptForDetail(dept);
  };

  const tree = buildTree(departments);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-h3 font-bold text-secondary-900 dark:text-white">Org Chart Builder</h3>
          <p className="text-secondary-500 dark:text-secondary-400 text-body-sm mt-1">
            Build your company's organization chart and manage departments.
          </p>
        </div>
        <Button variant="primary" onClick={() => handleOpenAdd(null)} className="flex items-center gap-2">
          <Plus size={16} /> Add Top-Level Department
        </Button>
      </div>

      <div className="bg-white dark:bg-secondary-900/50 p-5 rounded-xl border border-secondary-200 dark:border-secondary-800 min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" className="text-primary-700" />
          </div>
        ) : departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mb-4">
              <Building2 size={24} className="text-secondary-400" />
            </div>
            <h4 className="text-body-lg font-medium text-secondary-900 dark:text-secondary-100 mb-1">No Departments Yet</h4>
            <p className="text-secondary-500 dark:text-secondary-400 mb-6 max-w-sm">
              Get started by creating your first top-level department to build your org chart.
            </p>
            <Button variant="primary" onClick={() => handleOpenAdd(null)}>
              Add Department
            </Button>
          </div>
        ) : (
          <div>
            {tree.map((node, i) => (
              <DepartmentNode
                key={node.id}
                node={node}
                depth={0}
                colorIndex={i % 3}
                onNodeClick={handleNodeClick}
                onAdd={handleOpenAdd}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        title={modalState.mode === 'add' ? 'Add Department' : 'Edit Department'}
      >
        <form onSubmit={handleSave} className="space-y-6 pt-4">
          <Input
            label="Department Name"
            value={modalState.name}
            onChange={(e) => setModalState(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Engineering, Sales, HR"
            autoFocus
            required
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={handleCloseModal} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={saving}>
              {modalState.mode === 'add' ? 'Add' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      <DepartmentDetailModal
        isOpen={!!selectedDeptForDetail}
        onClose={() => setSelectedDeptForDetail(null)}
        department={selectedDeptForDetail}
        allDepartments={departments}
      />
    </div>
  );
};

export default OrgChartBuilder;