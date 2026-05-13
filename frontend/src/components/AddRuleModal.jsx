import { useState } from 'react';
import { HiOutlineX, HiOutlineChat, HiOutlineChatAlt2 } from 'react-icons/hi';

/**
 * Add Rule Modal Component
 * Modal for creating or editing auto-reply rules
 */
export default function AddRuleModal({ isOpen, onClose, onSave, editRule = null }) {
  const [type, setType] = useState(editRule?.type || 'comment');
  const [keyword, setKeyword] = useState(editRule?.keyword || '');
  const [replyText, setReplyText] = useState(editRule?.replyText || '');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  /**
   * Validate form inputs
   */
  const validate = () => {
    const newErrors = {};

    if (!keyword.trim()) {
      newErrors.keyword = 'Keyword is required';
    }
    if (!replyText.trim()) {
      newErrors.replyText = 'Reply text is required';
    }
    if (keyword.length > 100) {
      newErrors.keyword = 'Keyword must be less than 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setSaving(true);
      await onSave({
        type,
        keyword: keyword.trim(),
        replyText: replyText.trim()
      });
      onClose();
    } catch (error) {
      alert('Failed to save rule: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {editRule ? 'Edit Rule' : 'Add New Rule'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Configure when and how to auto-reply
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          >
            <HiOutlineX className="text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Rule Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Trigger Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('comment')}
                className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  type === 'comment'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <HiOutlineChatAlt2 className="text-xl" />
                <span className="font-medium text-sm">Comments</span>
              </button>
              <button
                type="button"
                onClick={() => setType('dm')}
                className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  type === 'dm'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <HiOutlineChat className="text-xl" />
                <span className="font-medium text-sm">Direct Messages</span>
              </button>
            </div>
          </div>

          {/* Keyword Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keyword <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g., price, hello, help"
              className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${
                errors.keyword ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            />
            {errors.keyword && (
              <p className="mt-1 text-sm text-red-500">{errors.keyword}</p>
            )}
            <p className="mt-1 text-xs text-gray-400">
              Auto-reply triggers when message contains this keyword (case-insensitive)
            </p>
          </div>

          {/* Reply Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reply Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="e.g., Hey 👋 Check your DM for details."
              rows={3}
              className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none ${
                errors.replyText ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            />
            {errors.replyText && (
              <p className="mt-1 text-sm text-red-500">{errors.replyText}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl shadow-sm disabled:opacity-50 transition-all"
            >
              {saving ? 'Saving...' : editRule ? 'Update Rule' : 'Create Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
