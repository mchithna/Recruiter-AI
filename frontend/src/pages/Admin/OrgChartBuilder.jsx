import React, { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import { useConfirmDialog } from '../../components/ui';
import { useToast } from '../../lib/ToastContext';
import api from '../../api';
import { Plus, Edit2, Trash2, Network } from 'lucide-react';
import DepartmentDetailModal from './DepartmentDetailModal';

const OrgChartBuilder = () => {
  const { toast } = useToast();
  const { confirm, dialog: confirmDialog } = useConfirmDialog();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'add',
    id: null,
    parentId: null,
    name: '',
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
    } catch {
      try { toast({ title: 'Failed to load departments.', variant: 'danger' }); } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = (parentId = null) => {
    setModalState({ isOpen: true, mode: 'add', id: null, parentId, name: '' });
  };

  const handleOpenEdit = (dept) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      id: dept.id,
      parentId: dept.parentId,
      name: dept.name,
    });
  };

  const handleCloseModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
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
        handleCloseModal();
        fetchDepartments();
        try { toast({ title: 'Department added successfully.', variant: 'success' }); } catch (e) {}
      } else {
        await api.put(`/departments/${modalState.id}`, {
          name: modalState.name,
          parentId: modalState.parentId,
        });
        handleCloseModal();
        fetchDepartments();
        try { toast({ title: 'Department updated successfully.', variant: 'success' }); } catch (e) {}
      }
    } catch (error) {
      try { toast({ title: error.response?.data?.message || error.response?.data || 'Failed to save department.', variant: 'danger' }); } catch (e) {}
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const department = departments.find((item) => item.id === id);
    const confirmed = await confirm({
      title: 'Delete department?',
      description: 'This department will be removed from the organization chart.',
      confirmLabel: 'Delete Department',
      variant: 'danger',
      details: department?.name,
    });
    if (!confirmed) return;

    try {
      await api.delete(`/departments/${id}`);
      fetchDepartments();
      try { toast({ title: 'Department deleted successfully.', variant: 'success' }); } catch (e) {}
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data || 'Failed to delete department.';
      try { toast({ title: typeof errorMsg === 'string' ? errorMsg : 'Failed to delete department.', variant: 'danger' }); } catch (e) {}
    }
  };

  const buildTree = (flatList, parentId = null) =>
    flatList
      .filter((department) => department.parentId === parentId)
      .map((department) => ({
        ...department,
        children: buildTree(flatList, department.id),
      }));

  const DepartmentNode = ({ node, level = 0, isLast = true }) => {
    const hasChildren = node.children?.length > 0;

    return (
      <div className="relative">
        {level > 0 && (
          <>
            <span
              className={[
                'absolute -left-6 top-0 w-px bg-secondary-300 dark:bg-secondary-700',
                isLast ? 'h-8' : 'h-full',
              ].join(' ')}
              aria-hidden="true"
            />
            <span
              className="absolute -left-6 top-8 h-px w-6 bg-secondary-300 dark:bg-secondary-700"
              aria-hidden="true"
            />
          </>
        )}

        <div
          className={[
            'relative rounded-2xl border p-4 shadow-sm transition-all duration-base',
            'bg-white hover:-translate-y-0.5 hover:border-primary-400 hover:shadow-glow-primary',
            'dark:bg-secondary-800 dark:hover:border-primary-500',
            level === 0
              ? 'border-primary-200 dark:border-primary-500/30'
              : 'border-secondary-200 dark:border-secondary-700',
          ].join(' ')}
          onClick={() => setSelectedDeptForDetail(node)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') setSelectedDeptForDetail(node);
          }}
          role="button"
          tabIndex={0}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-3">
                <span
                  className={[
                    'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                    level === 0
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300'
                      : 'bg-secondary-100 text-secondary-600 dark:bg-white/10 dark:text-secondary-300',
                  ].join(' ')}
                >
                  <Network size={16} strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <h4 className="break-words text-body-lg font-semibold leading-snug text-secondary-900 dark:text-white">
                    {node.name}
                  </h4>
                  <p className="mt-1 text-caption font-semibold uppercase tracking-wide text-secondary-500 dark:text-secondary-400">
                    {node.children?.length || 0} sub departments
                  </p>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2" onClick={(event) => event.stopPropagation()}>
              <Button size="sm" variant="secondary" leftIcon={<Plus size={14} />} onClick={() => handleOpenAdd(node.id)}>
                Add Sub
              </Button>
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<Edit2 size={15} />}
                onClick={() => handleOpenEdit(node)}
                className="text-secondary-500 hover:text-primary-700 dark:text-secondary-400 dark:hover:text-primary-400"
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<Trash2 size={15} />}
                onClick={() => handleDelete(node.id)}
                className="text-secondary-400 hover:text-red-600 dark:text-secondary-500 dark:hover:text-red-400"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>

        {hasChildren && (
          <div className="relative ml-6 mt-3 space-y-3 pl-6">
            {node.children.map((child, index) => (
              <DepartmentNode
                key={child.id}
                node={child}
                level={level + 1}
                isLast={index === node.children.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const tree = buildTree(departments);

  return (
    <div className="min-w-full max-w-none space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-h3 font-bold text-secondary-900 dark:text-white">Org Chart Builder</h3>
          <p className="mt-1 text-body-sm text-secondary-500 dark:text-secondary-400">
            Build your company's organization chart and manage departments.
          </p>
        </div>
        <Button variant="primary" onClick={() => handleOpenAdd(null)} leftIcon={<Plus size={16} />}>
          Add Top-Level Department
        </Button>
      </div>

      <div className="min-h-[400px] rounded-2xl border border-secondary-200 bg-secondary-50/80 p-5 dark:border-secondary-800 dark:bg-secondary-900/50 sm:p-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" className="text-primary-700" />
          </div>
        ) : departments.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-100 dark:bg-secondary-800">
              <Plus size={24} className="text-secondary-400" />
            </div>
            <h4 className="mb-1 text-body-lg font-medium text-secondary-900 dark:text-secondary-100">
              No Departments Yet
            </h4>
            <p className="mb-6 max-w-sm text-secondary-500 dark:text-secondary-400">
              Get started by creating your first top-level department to build your org chart.
            </p>
            <Button variant="primary" onClick={() => handleOpenAdd(null)}>
              Add Department
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {tree.map((node, index) => (
              <DepartmentNode key={node.id} node={node} isLast={index === tree.length - 1} />
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
            onChange={(e) => setModalState((prev) => ({ ...prev, name: e.target.value }))}
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
      {confirmDialog}
    </div>
  );
};

export default OrgChartBuilder;
