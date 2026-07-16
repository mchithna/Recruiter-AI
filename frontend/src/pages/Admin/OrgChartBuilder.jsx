import React, { useCallback, useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../lib/ToastContext';
import api from '../../api';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import DepartmentDetailModal from './DepartmentDetailModal';

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

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/departments');
      setDepartments(response.data);
    } catch {
      showToast('Failed to load departments.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

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
      // Backend surfaces exact error message as a plain string in BadRequest sometimes
      const errorMsg = error.response?.data?.message || error.response?.data || 'Failed to delete department.';
      // Ensure we display the string if it's returned directly
      const displayMsg = typeof errorMsg === 'string' ? errorMsg : 'Failed to delete department.';
      showToast(displayMsg, 'danger');
    }
  };

  const handleNodeClick = (dept) => {
    setSelectedDeptForDetail(dept);
  };

  const buildTree = (flatList, parentId = null) => {
    return flatList
      .filter(d => d.parentId === parentId)
      .map(d => ({
        ...d,
        children: buildTree(flatList, d.id)
      }));
  };

  const DepartmentNode = ({ node }) => {
    return (
      <div className="ml-6 mt-4 border-l-2 border-secondary-200 dark:border-secondary-700 pl-6 relative">
        <div className="absolute w-6 h-0.5 bg-secondary-200 dark:bg-secondary-700 -left-0.5 top-7" />
        
        <div 
          className="bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 p-4 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:border-primary-400 dark:hover:border-primary-500 transition-colors group relative z-10"
          onClick={() => handleNodeClick(node)}
        >
          <span className="font-semibold text-secondary-800 dark:text-secondary-100 text-body-lg">
            {node.name}
          </span>
          
          <div className="flex gap-2" onClick={e => e.stopPropagation()}>
            <Button size="sm" variant="secondary" onClick={() => handleOpenAdd(node.id)} className="flex items-center gap-1.5">
              <Plus size={14} /> <span className="hidden sm:inline">Add Sub</span>
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(node)} className="text-secondary-500 hover:text-primary-700 dark:text-secondary-400 dark:hover:text-primary-400">
              <Edit2 size={16} />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleDelete(node.id)} className="text-secondary-400 hover:text-red-600 dark:text-secondary-500 dark:hover:text-red-400">
              <Trash2 size={16} />
            </Button>
          </div>
        </div>

        {node.children && node.children.length > 0 && (
          <div className="mt-2">
            {node.children.map(child => (
              <DepartmentNode key={child.id} node={child} />
            ))}
          </div>
        )}
      </div>
    );
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

      <div className="bg-secondary-50 dark:bg-secondary-900/50 p-6 rounded-xl border border-secondary-200 dark:border-secondary-800 min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" className="text-primary-700" />
          </div>
        ) : departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mb-4">
              <Plus size={24} className="text-secondary-400" />
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
          <div className="-ml-6">
            {tree.map(node => (
              <DepartmentNode key={node.id} node={node} />
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
