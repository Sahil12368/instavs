import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSwitchHorizontal, HiOutlineShieldCheck } from 'react-icons/hi';
import { getRules, createRule, updateRule, deleteRule, toggleRule } from '../services/api';
import AddRuleModal from '../components/AddRuleModal';

/**
 * Rules Page
 * Manage auto-reply rules - Add, Edit, Delete, Toggle
 */
export default function Rules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  useEffect(() => {
    fetchRules();
  }, []);

  /**
   * Fetch all rules from backend
   */
  const fetchRules = async () => {
    try {
      const data = await getRules();
      setRules(data);
    } catch (error) {
      console.error('Failed to fetch rules:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle creating a new rule
   */
  const handleCreateRule = async (ruleData) => {
    const newRule = await createRule(ruleData);
    setRules((prev) => [newRule, ...prev]);
  };

  /**
   * Handle updating an existing rule
   */
  const handleUpdateRule = async (ruleData) => {
    const updatedRule = await updateRule(editingRule._id, ruleData);
    setRules((prev) =>
      prev.map((r) => (r._id === updatedRule._id ? updatedRule : r))
    );
  };

  /**
   * Handle deleting a rule
   */
  const handleDeleteRule = async (ruleId) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) {
      return;
    }

    try {
      await deleteRule(ruleId);
      setRules((prev) => prev.filter((r) => r._id !== ruleId));
    } catch (error) {
      alert('Failed to delete rule: ' + error.message);
    }
  };

  /**
   * Handle toggling rule active status
   */
  const handleToggle = async (ruleId) => {
    try {
      const updatedRule = await toggleRule(ruleId);
      setRules((prev) =>
        prev.map((r) => (r._id === updatedRule._id ? updatedRule : r))
      );
    } catch (error) {
      alert('Failed to toggle rule: ' + error.message);
    }
  };

  /**
   * Open modal for editing a rule
   */
  const handleEdit = (rule) => {
    setEditingRule(rule);
    setShowModal(true);
  };

  /**
   * Open modal for creating a new rule
   */
  const handleAdd = () => {
    setEditingRule(null);
    setShowModal(true);
  };

  /**
   * Handle save from modal (create or update)
   */
  const handleSave = async (ruleData) => {
    if (editingRule) {
      await handleUpdateRule(ruleData);
    } else {
      await handleCreateRule(ruleData);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Auto Reply Rules</h1>
          <p className="text-gray-500 mt-1">Create and manage keyword-based auto-reply rules</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
        >
          <HiOutlinePlus className="text-lg" />
          Add Rule
        </button>
      </div>

      {/* Example Rules Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 animate-slideIn">
        <p className="text-sm text-amber-800">
          <strong>💡 Example Rules:</strong> If comment contains "price" → Reply: "Hey 👋 Check your DM for details."
          &nbsp;&nbsp;|&nbsp;&nbsp; If DM contains "hello" → Reply: "Welcome 😊 How can we help you?"
        </p>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-3 flex-1">
                  <div className="h-5 w-48 bg-gray-200 rounded" />
                  <div className="h-4 w-96 bg-gray-100 rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="w-20 h-10 bg-gray-100 rounded-xl" />
                </div>
              </div>
            </div>
          ))
        ) : rules.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <HiOutlineShieldCheck className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No rules yet</h3>
            <p className="text-gray-400 text-sm mb-4">
              Create your first auto-reply rule to start automating responses
            </p>
            <button
              onClick={handleAdd}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-sm hover:shadow-md transition-all inline-flex items-center gap-2"
            >
              <HiOutlinePlus className="text-lg" />
              Create First Rule
            </button>
          </div>
        ) : (
          rules.map((rule, index) => (
            <div
              key={rule._id}
              className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 animate-fadeIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Rule Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-800">
                      Contains "{rule.keyword}"
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      rule.type === 'comment'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {rule.type === 'comment' ? '💬 Comments' : '✉️ DMs'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Reply: "{rule.replyText}"
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Toggle Active/Inactive */}
                  <button
                    onClick={() => handleToggle(rule._id)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      rule.isActive
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${rule.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => handleEdit(rule)}
                    className="p-2 rounded-xl text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all"
                    title="Edit rule"
                  >
                    <HiOutlinePencil className="text-lg" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteRule(rule._id)}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                    title="Delete rule"
                  >
                    <HiOutlineTrash className="text-lg" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Rule Modal */}
      <AddRuleModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingRule(null);
        }}
        onSave={handleSave}
        editRule={editingRule}
      />
    </div>
  );
}
